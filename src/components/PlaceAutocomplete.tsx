"use client";

import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import type { GeoapifyPlace } from "@/lib/geoapifyTypes";

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: GeoapifyPlace | null) => void;
  placeholder?: string;
  className?: string;
}

export default function PlaceAutocomplete({
  onPlaceSelect,
  placeholder = "Search for a place",
  className = "",
}: PlaceAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoapifyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'below' | 'above'>('below');

  useEffect(() => {
    const checkPosition = () => {
      const input = document.activeElement as HTMLElement;
      if (input && input === document.querySelector('input')) {
        const rect = input.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const isInLowerHalf = rect.top > viewportHeight / 2;
        setDropdownPosition(isInLowerHalf ? 'above' : 'below');
      }
    };

    window.addEventListener('resize', checkPosition);
    return () => window.removeEventListener('resize', checkPosition);
  }, []);

  const fetchPlaces = useCallback(async (text: string, signal?: AbortSignal): Promise<GeoapifyPlace[]> => {
    const response = await fetch(`/api/geocode/autocomplete?text=${encodeURIComponent(text)}`, {
      signal,
      cache: "no-store",
    });

    const data = (await response.json()) as { results?: GeoapifyPlace[] };
    if (!response.ok) {
      return [];
    }

    return Array.isArray(data.results) ? data.results : [];
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const places = await fetchPlaces(trimmed, controller.signal);
        setResults(places);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query, fetchPlaces]);

  const handleSelect = (place: GeoapifyPlace) => {
    setQuery(place.formatted || place.name);
    setResults([]);
    setIsOpen(false);
    onPlaceSelect(place);
  };

  const selectFirstMatch = useCallback(async () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }

    setIsLoading(true);
    try {
      const places = await fetchPlaces(trimmed);
      setResults(places);
      if (places.length > 0) {
        handleSelect(places[0]);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, fetchPlaces]);

  return (
    <div className="relative w-full">
      <input
        value={query}
        onFocus={() => {
          setIsOpen(true);
          const checkPosition = () => {
            const input = document.activeElement as HTMLElement;
            if (input && input === document.querySelector('input')) {
              const rect = input.getBoundingClientRect();
              const viewportHeight = window.innerHeight;
              const isInLowerHalf = rect.top > viewportHeight / 2;
              setDropdownPosition(isInLowerHalf ? 'above' : 'below');
            }
          };
          checkPosition();
        }}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (results.length > 0) {
              handleSelect(results[0]);
            } else {
              void selectFirstMatch();
            }
          }

          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          setIsOpen(true);
          if (!value.trim()) {
            onPlaceSelect(null);
          }
        }}
        className={className}
        placeholder={placeholder}
        type="text"
        autoComplete="off"
      />

      {isOpen && (isLoading || results.length > 0) && (
        <div className={`absolute left-0 right-0 z-30 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 ${
          dropdownPosition === 'above' ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]'
        }`}>
          {isLoading && <p className="px-3 py-2 text-xs text-slate-500">Searching...</p>}

          {!isLoading &&
            results.map((place) => (
              <button
                key={`${place.lat}-${place.lng}-${place.name}`}
                type="button"
                onMouseDown={() => handleSelect(place)}
                className="w-full border-b border-slate-100 px-3 py-2 text-left text-sm transition-colors last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                <p className="font-semibold text-slate-800 dark:text-slate-100">{place.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{place.formatted}</p>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
