"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import MapComponent from "@/components/MapComponent";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import ZoomControls from "@/components/ZoomControls";
import RouteResults from "@/components/RouteResults";
import {
  getGeoapifyConfigError,
  getGeoapifyPublicApiKey,
  GEOAPIFY_SETUP_HINT,
} from "@/lib/geoapifyConfig";
import { BUS_ROUTES, POKHARA_CENTER, getStopPoint, resolveStopName } from "@/lib/busRoutes";
import type { BusRouteDefinition } from "@/lib/busRoutes";
import type { GeoapifyPlace, GeoapifyRouteResponse, MapPoint } from "@/lib/geoapifyTypes";
const REFERENCE_DISTANCE_KM = 7.6;
const REFERENCE_FARE_NPR = 45;
const SHORT_TRIP_MAX_DISTANCE_KM = 0.5;
const SHORT_TRIP_FARE_NPR = 25;
const MINIMUM_FARE_NPR = SHORT_TRIP_FARE_NPR;
const FARE_PER_KM_AFTER_SHORT_TRIP =
  (REFERENCE_FARE_NPR - SHORT_TRIP_FARE_NPR) / (REFERENCE_DISTANCE_KM - SHORT_TRIP_MAX_DISTANCE_KM);

function estimateFareNpr(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    return SHORT_TRIP_FARE_NPR;
  }

  if (distanceKm <= SHORT_TRIP_MAX_DISTANCE_KM) {
    return SHORT_TRIP_FARE_NPR;
  }

  const adjustedFare =
    SHORT_TRIP_FARE_NPR + (distanceKm - SHORT_TRIP_MAX_DISTANCE_KM) * FARE_PER_KM_AFTER_SHORT_TRIP;

  return Math.max(MINIMUM_FARE_NPR, Math.round(adjustedFare));
}

function estimateDurationMin(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    return 1;
  }

  const averageCitySpeedKmh = 18;
  const minutes = (distanceKm / averageCitySpeedKmh) * 60;
  return Math.max(1, Math.round(minutes));
}

interface RouteRecommendation extends BusRouteDefinition {
  calculatedFare?: number;
}
  
interface NoRouteGuide {
  boardingStop: string;
  dropOffStop: string;
  transferStop?: string;
  busesNeeded: number;
  estimatedFareNpr: number;
  routeNames: string[];
  walkToBoardKm: number;
  walkFromDropKm: number;
  guidance?: string;
}

type LocalVehicleType = "indrive-bike" | "indrive-car" | "bus";

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function distanceKmBetween(a: MapPoint, b: MapPoint): number {
  const earthRadiusKm = 6371;
  const latDiff = toRadians(b.lat - a.lat);
  const lngDiff = toRadians(b.lng - a.lng);
  const latA = toRadians(a.lat);
  const latB = toRadians(b.lat);

  const haversine =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos(latA) * Math.cos(latB) * Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2);

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

function nearestStopOnRoute(
  point: MapPoint,
  route: BusRouteDefinition,
  preferredStopName?: string | null,
): { stop: string; distanceKm: number } {
  if (preferredStopName && route.stops.includes(preferredStopName)) {
    return {
      stop: preferredStopName,
      distanceKm: distanceKmBetween(point, getStopPoint(preferredStopName)),
    };
  }

  const closest = route.stops.reduce<{ stop: string; distanceKm: number } | null>((best, stopName) => {
    const stopDistance = distanceKmBetween(point, getStopPoint(stopName));
    if (!best || stopDistance < best.distanceKm) {
      return { stop: stopName, distanceKm: stopDistance };
    }
    return best;
  }, null);

  return closest ?? { stop: route.stops[0] ?? "Nearest stop", distanceKm: 0 };
}

function isNoRouteError(message: string): boolean {
  return message.toLowerCase().includes("no route");
}

function buildNoRouteGuide(
  originPoint: MapPoint,
  destinationPoint: MapPoint,
  originStopNameHint?: string | null,
  destinationStopNameHint?: string | null,
): NoRouteGuide {
  const rankedDirectCandidates = BUS_ROUTES.map((route) => {
    const boarding = nearestStopOnRoute(originPoint, route, originStopNameHint);
    const dropOff = nearestStopOnRoute(destinationPoint, route, destinationStopNameHint);
    return {
      route,
      boarding,
      dropOff,
      score: boarding.distanceKm + dropOff.distanceKm,
    };
  }).sort((a, b) => a.score - b.score);

  const directCandidate = rankedDirectCandidates[0];

  const nearbyDropCandidates = rankedDirectCandidates.filter(
    (candidate) => candidate.dropOff.distanceKm <= 1.5 && candidate.boarding.distanceKm <= 2.8,
  );

  if (nearbyDropCandidates.length >= 2) {
    const bestNearby = nearbyDropCandidates[0];
    const secondaryNearby = nearbyDropCandidates[1];

    return {
      boardingStop: bestNearby.boarding.stop,
      dropOffStop: bestNearby.dropOff.stop,
      busesNeeded: 1,
      estimatedFareNpr: bestNearby.route.baseFare,
      routeNames: [bestNearby.route.name],
      walkToBoardKm: bestNearby.boarding.distanceKm,
      walkFromDropKm: bestNearby.dropOff.distanceKm,
      guidance: `${secondaryNearby.route.name} also goes nearby. Take off at ${bestNearby.dropOff.stop} and walk the remaining distance.`,
    };
  }

  if (directCandidate && directCandidate.score <= 4.5) {
    return {
      boardingStop: directCandidate.boarding.stop,
      dropOffStop: directCandidate.dropOff.stop,
      busesNeeded: 1,
      estimatedFareNpr: directCandidate.route.baseFare,
      routeNames: [directCandidate.route.name],
      walkToBoardKm: directCandidate.boarding.distanceKm,
      walkFromDropKm: directCandidate.dropOff.distanceKm,
    };
  }

  let transferCandidate:
    | {
        firstRoute: BusRouteDefinition;
        secondRoute: BusRouteDefinition;
        transferStop: string;
        boarding: { stop: string; distanceKm: number };
        dropOff: { stop: string; distanceKm: number };
        score: number;
      }
    | null = null;

  for (const firstRoute of BUS_ROUTES) {
    for (const secondRoute of BUS_ROUTES) {
      if (firstRoute.id === secondRoute.id) {
        continue;
      }

      const sharedStops = firstRoute.stops.filter((stopName) => secondRoute.stops.includes(stopName));
      if (sharedStops.length === 0) {
        continue;
      }

      const boarding = nearestStopOnRoute(originPoint, firstRoute, originStopNameHint);
      const dropOff = nearestStopOnRoute(destinationPoint, secondRoute, destinationStopNameHint);

      for (const transferStop of sharedStops) {
        const transferScore = boarding.distanceKm + dropOff.distanceKm;
        if (!transferCandidate || transferScore < transferCandidate.score) {
          transferCandidate = {
            firstRoute,
            secondRoute,
            transferStop,
            boarding,
            dropOff,
            score: transferScore,
          };
        }
      }
    }
  }

  if (transferCandidate) {
    return {
      boardingStop: transferCandidate.boarding.stop,
      transferStop: transferCandidate.transferStop,
      dropOffStop: transferCandidate.dropOff.stop,
      busesNeeded: 2,
      estimatedFareNpr: transferCandidate.firstRoute.baseFare + transferCandidate.secondRoute.baseFare,
      routeNames: [transferCandidate.firstRoute.name, transferCandidate.secondRoute.name],
      walkToBoardKm: transferCandidate.boarding.distanceKm,
      walkFromDropKm: transferCandidate.dropOff.distanceKm,
    };
  }

  const fallback = directCandidate ?? {
    route: BUS_ROUTES[0],
    boarding: { stop: "Prithvi Chowk", distanceKm: distanceKmBetween(originPoint, getStopPoint("Prithvi Chowk")) },
    dropOff: { stop: "Prithvi Chowk", distanceKm: distanceKmBetween(destinationPoint, getStopPoint("Prithvi Chowk")) },
  };

  return {
    boardingStop: fallback.boarding.stop,
    transferStop: "Prithvi Chowk",
    dropOffStop: fallback.dropOff.stop,
    busesNeeded: 2,
    estimatedFareNpr: Math.max(50, fallback.route.baseFare * 2),
    routeNames: [fallback.route.name],
    walkToBoardKm: fallback.boarding.distanceKm,
    walkFromDropKm: fallback.dropOff.distanceKm,
    guidance: "No single direct bus was found. This is the best nearby transfer plan.",
  };
}

function isGeoapifyRouteResponse(value: unknown): value is GeoapifyRouteResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeRoute = value as Record<string, unknown>;
  return Array.isArray(maybeRoute.path);
}

export default function Home() {
  const router = useRouter();
  const geoapifyApiKey = getGeoapifyPublicApiKey();
  const mapsError = getGeoapifyConfigError(geoapifyApiKey);

  const [mapCenter, setMapCenter] = useState<MapPoint>(POKHARA_CENTER);
  const [mapZoom, setMapZoom] = useState(13);
  const [origin, setOrigin] = useState<GeoapifyPlace | null>(null);
  const [destination, setDestination] = useState<GeoapifyPlace | null>(null);
  const [routePath, setRoutePath] = useState<MapPoint[]>([]);
  const [routeSummary, setRouteSummary] = useState<{
    distanceKm: number;
    durationMin: number;
    estimatedFareNpr: number;
  } | null>(null);
  const [searchResults, setSearchResults] = useState<RouteRecommendation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAutoCalculating, setIsAutoCalculating] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const originPos = origin ? { lat: origin.lat, lng: origin.lng } : null;
  const destinationPos = destination ? { lat: destination.lat, lng: destination.lng } : null;

  const tripDistanceKm = useMemo(() => {
    if (routeSummary?.distanceKm && routeSummary.distanceKm > 0) {
      return routeSummary.distanceKm;
    }

    if (originPos && destinationPos) {
      return Math.max(0.1, distanceKmBetween(originPos, destinationPos));
    }

    return null;
  }, [routeSummary?.distanceKm, originPos?.lat, originPos?.lng, destinationPos?.lat, destinationPos?.lng]);

  useEffect(() => {
    if (originPos && destinationPos) {
      const previewPath = [originPos, destinationPos];
      const previewMidpoint: MapPoint = {
        lat: (originPos.lat + destinationPos.lat) / 2,
        lng: (originPos.lng + destinationPos.lng) / 2,
      };

      setRoutePath(previewPath);
      setMapCenter(previewMidpoint);
      setMapZoom(13);
    } else {
      setRoutePath([]);
    }

    setRouteSummary(null);
    setRouteError(null);
    setSearchResults([]);
  }, [originPos?.lat, originPos?.lng, destinationPos?.lat, destinationPos?.lng]);

  const getRouteEstimate = useCallback(
    async (originPoint: MapPoint, destinationPoint: MapPoint, signal?: AbortSignal, vehicleType: "bus" | "bike" | "car" = "car") => {
      const response = await fetch("/api/routing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: originPoint,
          destination: destinationPoint,
          mode: "drive",
          vehicleType,
        }),
        signal,
      });

      const data: unknown = await response.json();
      if (!response.ok) {
        const errorResponse = data as { error?: string };
        throw new Error(errorResponse.error || "Failed to plan route.");
      }

      if (!isGeoapifyRouteResponse(data) || data.path.length === 0) {
        throw new Error("No route found for this trip.");
      }

      const distanceKm = data.distanceMeters / 1000;
      const durationMin = data.durationSeconds / 60;
      const estimatedFareNpr = estimateFareNpr(distanceKm);

      return {
        path: data.path,
        distanceKm,
        durationMin,
        estimatedFareNpr,
      };
    },
    [],
  );

  const buildRouteRecommendations = useCallback(
    (estimatedFareNpr: number) =>
      BUS_ROUTES.slice(0, 2).map((route, index) => ({
        ...route,
        calculatedFare: estimatedFareNpr + index * 5,
      })),
    [],
  );

  useEffect(() => {
    if (!originPos || !destinationPos) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsAutoCalculating(true);
      setRouteError(null);

      try {
        const routeEstimate = await getRouteEstimate(originPos, destinationPos, controller.signal);
        const adjustedFareNpr = routeEstimate.estimatedFareNpr;
        setRoutePath(routeEstimate.path);
        setRouteSummary({
          distanceKm: routeEstimate.distanceKm,
          durationMin: routeEstimate.durationMin,
          estimatedFareNpr: adjustedFareNpr,
        });
        setSearchResults(buildRouteRecommendations(adjustedFareNpr));

        const midpoint = routeEstimate.path[Math.floor(routeEstimate.path.length / 2)] || originPos;
        setMapCenter(midpoint);
        setMapZoom(13);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        const message = error instanceof Error ? error.message : "Unknown routing error";
        setRoutePath([originPos, destinationPos]);
        setRouteSummary(null);
        setSearchResults([]);
        setRouteError(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsAutoCalculating(false);
        }
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [
    originPos?.lat,
    originPos?.lng,
    destinationPos?.lat,
    destinationPos?.lng,
    getRouteEstimate,
    buildRouteRecommendations,
  ]);

  const handleFindRoute = async () => {
    if (!originPos || !destinationPos) {
      return;
    }

    setIsSearching(true);
    setRouteError(null);

    try {
      const routeEstimateRaw =
        routeSummary && routePath.length > 0
          ? {
              path: routePath,
              distanceKm: routeSummary.distanceKm,
              durationMin: routeSummary.durationMin,
              estimatedFareNpr: routeSummary.estimatedFareNpr,
            }
          : await getRouteEstimate(originPos, destinationPos);
      const routeEstimate = {
        ...routeEstimateRaw,
        estimatedFareNpr: routeEstimateRaw.estimatedFareNpr,
      };

      if (!routeSummary || routePath.length === 0) {
        setRoutePath(routeEstimate.path);
        setRouteSummary({
          distanceKm: routeEstimate.distanceKm,
          durationMin: routeEstimate.durationMin,
          estimatedFareNpr: routeEstimate.estimatedFareNpr,
        });
        setSearchResults(buildRouteRecommendations(routeEstimate.estimatedFareNpr));
      }

      const params = new URLSearchParams({
        originLat: String(originPos.lat),
        originLng: String(originPos.lng),
        destinationLat: String(destinationPos.lat),
        destinationLng: String(destinationPos.lng),
        originName: origin?.formatted || origin?.name || "Current location",
        destinationName: destination?.formatted || destination?.name || "Destination",
        distanceKm: routeEstimate.distanceKm.toFixed(2),
        durationMin: String(Math.round(routeEstimate.durationMin)),
        estimatedFare: String(routeEstimate.estimatedFareNpr),
      });

      router.push(`/fare?${params.toString()}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown routing error";
      if (isNoRouteError(message)) {
        const originStopNameHint = resolveStopName(
          `${origin?.name ?? ""} ${origin?.formatted ?? ""}`.trim(),
        );
        const destinationStopNameHint = resolveStopName(
          `${destination?.name ?? ""} ${destination?.formatted ?? ""}`.trim(),
        );
        const guide = buildNoRouteGuide(originPos, destinationPos, originStopNameHint, destinationStopNameHint);
        const fallbackDistanceKm = Math.max(0.1, distanceKmBetween(originPos, destinationPos));
        const fallbackDurationMin = estimateDurationMin(fallbackDistanceKm);

        const params = new URLSearchParams({
          noRoute: "1",
          originLat: String(originPos.lat),
          originLng: String(originPos.lng),
          destinationLat: String(destinationPos.lat),
          destinationLng: String(destinationPos.lng),
          originName: origin?.formatted || origin?.name || "Current location",
          destinationName: destination?.formatted || destination?.name || "Destination",
          boardingStop: guide.boardingStop,
          dropOffStop: guide.dropOffStop,
          busesNeeded: String(guide.busesNeeded),
          estimatedFare: String(guide.estimatedFareNpr),
          routeNames: guide.routeNames.join("||"),
          walkToBoardKm: guide.walkToBoardKm.toFixed(1),
          walkFromDropKm: guide.walkFromDropKm.toFixed(1),
          distanceKm: fallbackDistanceKm.toFixed(2),
          durationMin: String(fallbackDurationMin),
        });

        if (guide.transferStop) {
          params.set("transferStop", guide.transferStop);
        }

        if (guide.guidance) {
          params.set("guidance", guide.guidance);
        }

        router.push(`/fare?${params.toString()}`);
        return;
      } else {
        setRouteError(message);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      setRouteError("Your browser does not support geolocation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocationPlace: GeoapifyPlace = {
          name: "Current location",
          formatted: "Detected from your device",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setMapZoom(15);
        setOrigin(currentLocationPlace);
      },
      () => {
        setRouteError("Unable to fetch your current location.");
      },
    );
  };

  const updateCenterFromPlace = (place: GeoapifyPlace | null) => {
    if (!place) {
      return;
    }

    setMapCenter({ lat: place.lat, lng: place.lng });
    setMapZoom(15);
  };

  if (mapsError) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
        <Header />
        <main className="relative flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 items-center justify-center p-6 lg:ml-64">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Geoapify Setup Required</h2>
              <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{mapsError}</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{GEOAPIFY_SETUP_HINT}</p>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
NEXT_PUBLIC_GEOAPIFY_API_KEY=your_key_here
GEOAPIFY_API_KEY=your_key_here
              </pre>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                After updating `.env`, restart `npm run dev`.
              </p>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      <Header />
      <main className="relative flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="relative flex flex-1 flex-col lg:ml-64">
          <div className="relative flex-1 overflow-hidden bg-slate-200 dark:bg-slate-900">
            <MapComponent
              apiKey={geoapifyApiKey}
              center={mapCenter}
              zoom={mapZoom}
              origin={originPos}
              destination={destinationPos}
              routePath={routePath}
            />

            <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
              <ZoomControls
                onZoomIn={() => setMapZoom((previousZoom) => Math.min(previousZoom + 1, 19))}
                onZoomOut={() => setMapZoom((previousZoom) => Math.max(previousZoom - 1, 3))}
              />
              <button
                onClick={handleMyLocation}
                className="flex size-12 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-lg transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined text-primary">my_location</span>
              </button>
            </div>

            <div className="absolute left-6 top-6 z-[1000] hidden w-96 items-center rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-background-dark md:flex">
              <span className="material-symbols-outlined ml-2 text-slate-400">search</span>
              <PlaceAutocomplete
                onPlaceSelect={updateCenterFromPlace}
                className="flex-1 border-none bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-slate-100"
                placeholder="Search for stops or landmarks"
              />
              <button className="p-2 text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">tune</span>
              </button>
            </div>

            <div className="absolute bottom-4 left-0 right-0 z-[1000] p-4 md:bottom-0">
              <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-800 max-h-[80vh] overflow-y-auto md:max-h-none md:overflow-visible">
                <div className="mb-4 flex items-center justify-center md:hidden">
                  <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                </div>

                <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">Plan Your Journey</h2>

                <div className="flex flex-col gap-4">
                  <div className="relative flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined scale-75 text-primary">
                        radio_button_checked
                      </span>
                      <div className="h-8 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                    </div>

                    <div className="flex-1 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        From
                      </p>
                      <PlaceAutocomplete
                        onPlaceSelect={(place) => {
                          setOrigin(place);
                          updateCenterFromPlace(place);
                        }}
                        className="w-full border-none bg-transparent p-0 font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-slate-100"
                        placeholder="Current location"
                      />
                    </div>
                  </div>

                  <div className="relative flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined scale-75 text-red-500">location_on</span>
                    </div>

                    <div className="flex-1 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        To
                      </p>
                      <PlaceAutocomplete
                        onPlaceSelect={(place) => {
                          setDestination(place);
                          updateCenterFromPlace(place);
                        }}
                        className="w-full border-none bg-transparent p-0 font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-slate-100"
                        placeholder="Search destination..."
                      />
                    </div>

                    <button className="flex items-center justify-center rounded-full bg-primary/10 p-2 text-primary">
                      <span className="material-symbols-outlined">swap_vert</span>
                    </button>
                  </div>

                  <button
                    onClick={handleFindRoute}
                    disabled={isSearching || !origin || !destination}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:bg-slate-300"
                  >
                    {isSearching ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">directions_bus</span>
                        Find Best Route
                      </>
                    )}
                  </button>

                  {isAutoCalculating && (
                    <p className="rounded-lg border border-sky-200 bg-sky-50 p-2 text-xs text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/20 dark:text-sky-300">
                      Calculating approximate distance and fare...
                    </p>
                  )}

                  {routeSummary && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-slate-700 dark:text-slate-200">
                      <p>
                        Distance: <span className="font-bold">{routeSummary.distanceKm.toFixed(2)} km</span>
                      </p>
                      <p>
                        Estimated travel time: <span className="font-bold">{Math.round(routeSummary.durationMin)} mins</span>
                      </p>
                      <p>
                        Estimated fare: <span className="font-bold">NPR {routeSummary.estimatedFareNpr}</span>
                      </p>
                    </div>
                  )}

                  {routeError && (
                    <p className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-600 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-300">
                      {routeError}
                    </p>
                  )}

                  <RouteResults results={searchResults} />
                </div>

                <div className="mt-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  <button className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-700/50">
                    <span className="material-symbols-outlined text-sm">home</span>
                    <span className="ml-2 text-sm font-medium">Home</span>
                  </button>
                  <button className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-700/50">
                    <span className="material-symbols-outlined text-sm">work</span>
                    <span className="ml-2 text-sm font-medium">Work</span>
                  </button>
                  <button className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-700/50">
                    <span className="material-symbols-outlined text-sm">landscape</span>
                    <span className="ml-2 text-sm font-medium">Lakeside</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
