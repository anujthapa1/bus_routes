"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  placeholder?: string;
  className?: string;
}

export default function PlaceAutocomplete({
  onPlaceSelect,
  placeholder = "Search for a place",
  className = ""
}: PlaceAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
      componentRestrictions: { country: 'np' } // Restrict to Nepal
    };

    const autocomplete = new places.Autocomplete(inputRef.current, options);

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      setInputValue(place.formatted_address || place.name || "");
      onPlaceSelect(place);
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [places, onPlaceSelect]);

  return (
    <input
      ref={inputRef}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      className={className}
      placeholder={placeholder}
      type="text"
    />
  );
}
