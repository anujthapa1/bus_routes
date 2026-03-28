"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import MapComponent from "@/components/MapComponent";
import {
  getGeoapifyPublicApiKey,
  getGeoapifyConfigError,
  GEOAPIFY_SETUP_HINT,
} from "@/lib/geoapifyConfig";
import type { GeoapifyRouteResponse, MapPoint } from "@/lib/geoapifyTypes";
import { BUS_ROUTES, getStopPoint } from "@/lib/busRoutes";
import { useSearchParams } from "next/navigation";

const POKHARA_CENTER: MapPoint = { lat: 28.2096, lng: 83.9856 };
const REFERENCE_DISTANCE_KM = 7.6;
const REFERENCE_FARE_NPR = 45;
const SHORT_TRIP_MAX_DISTANCE_KM = 0.5;
const SHORT_TRIP_FARE_NPR = 25;
const MINIMUM_FARE_NPR = SHORT_TRIP_FARE_NPR;
const FARE_PER_KM_AFTER_SHORT_TRIP =
  (REFERENCE_FARE_NPR - SHORT_TRIP_FARE_NPR) / (REFERENCE_DISTANCE_KM - SHORT_TRIP_MAX_DISTANCE_KM);
const SIMPANI_INFORMATICS_BIKE_FARE_NPR = 130;
const SIMPANI_INFORMATICS_CAR_FARE_NPR = 420;
const SIMPANI_INFORMATICS_BUS_FARE_NPR = 45;

type FareOption = {
  id: string;
  label: string;
  note: string;
  type: "discount" | "surcharge";
  value: number;
};

type NoRouteGuide = {
  boardingStop: string;
  dropOffStop: string;
  transferStop?: string;
  busesNeeded: number;
  estimatedFareNpr: number;
  routeNames: string[];
  walkToBoardKm: number;
  walkFromDropKm: number;
  guidance?: string;
};

const FARE_OPTIONS: FareOption[] = [
  {
    id: "student",
    label: "Student Discount",
    note: "45% off with student ID",
    type: "discount",
    value: 0.45,
  },
  {
    id: "senior",
    label: "Senior Citizen",
    note: "50% off for 60+ passengers",
    type: "discount",
    value: 0.5,
  },
  {
    id: "disability",
    label: "Disability Card",
    note: "50% off with valid card",
    type: "discount",
    value: 0.5,
  },
  {
    id: "express",
    label: "Express Bus",
    note: "NPR 12 surcharge",
    type: "surcharge",
    value: 12,
  },
  {
    id: "luggage",
    label: "Extra Luggage",
    note: "NPR 8 surcharge",
    type: "surcharge",
    value: 8,
  },
];

function toNumber(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

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

function estimateDurationMin(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    return 1;
  }

  const averageCitySpeedKmh = 18;
  const minutes = (distanceKm / averageCitySpeedKmh) * 60;
  return Math.max(1, Math.round(minutes));
}

function estimatePathDistanceKm(path: MapPoint[]): number {
  if (path.length < 2) {
    return SHORT_TRIP_MAX_DISTANCE_KM;
  }

  let totalKm = 0;
  for (let index = 1; index < path.length; index += 1) {
    totalKm += distanceKmBetween(path[index - 1], path[index]);
  }

  return Math.max(SHORT_TRIP_MAX_DISTANCE_KM, totalKm);
}

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isSimpaniInformaticsTripByNames(originName: string, destinationName: string): boolean {
  const originText = normalizeSearchText(originName);
  const destinationText = normalizeSearchText(destinationName);

  const originHasSimpani = originText.includes("simpani");
  const destinationHasInformatics =
    (destinationText.includes("informatics") && destinationText.includes("college")) ||
    (destinationText.includes("informatics") && destinationText.includes("pokhara"));
  const destinationHasShalomMarg = destinationText.includes("shalom marg");

  return originHasSimpani && (destinationHasInformatics || destinationHasShalomMarg);
}

function isGeoapifyRouteResponse(value: unknown): value is GeoapifyRouteResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeRoute = value as Record<string, unknown>;
  return (
    typeof maybeRoute.distanceMeters === "number" &&
    typeof maybeRoute.durationSeconds === "number" &&
    Array.isArray(maybeRoute.path)
  );
}

function FarePageContent() {
  const searchParams = useSearchParams();
  const geoapifyApiKey = getGeoapifyPublicApiKey();
  const mapsConfigError = getGeoapifyConfigError(geoapifyApiKey);

  const noRouteGuide = useMemo<NoRouteGuide | null>(() => {
    if (searchParams.get("noRoute") !== "1") {
      return null;
    }

    const boardingStop = searchParams.get("boardingStop")?.trim() ?? "";
    const dropOffStop = searchParams.get("dropOffStop")?.trim() ?? "";

    if (!boardingStop || !dropOffStop) {
      return null;
    }

    const routeNamesRaw = searchParams.get("routeNames") ?? "";
    const routeNames = routeNamesRaw
      .split("||")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    return {
      boardingStop,
      dropOffStop,
      transferStop: searchParams.get("transferStop")?.trim() || undefined,
      busesNeeded: Math.max(1, Math.round(toNumber(searchParams.get("busesNeeded")) ?? 1)),
      estimatedFareNpr: Math.max(0, Math.round(toNumber(searchParams.get("estimatedFare")) ?? 0)),
      routeNames,
      walkToBoardKm: Math.max(0, toNumber(searchParams.get("walkToBoardKm")) ?? 0),
      walkFromDropKm: Math.max(0, toNumber(searchParams.get("walkFromDropKm")) ?? 0),
      guidance: searchParams.get("guidance")?.trim() || undefined,
    };
  }, [searchParams]);

  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routePath, setRoutePath] = useState<MapPoint[]>([]);
  const [distanceKm, setDistanceKm] = useState<number>(toNumber(searchParams.get("distanceKm")) ?? 0);
  const [durationMin, setDurationMin] = useState<number>(toNumber(searchParams.get("durationMin")) ?? 0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const queryDistanceKm = useMemo(() => toNumber(searchParams.get("distanceKm")), [searchParams]);
  const queryDurationMin = useMemo(() => toNumber(searchParams.get("durationMin")), [searchParams]);

  const origin = useMemo<MapPoint | null>(() => {
    const lat = toNumber(searchParams.get("originLat"));
    const lng = toNumber(searchParams.get("originLng"));

    if (lat === null || lng === null) {
      return null;
    }

    return { lat, lng };
  }, [searchParams]);

  const destination = useMemo<MapPoint | null>(() => {
    const lat = toNumber(searchParams.get("destinationLat"));
    const lng = toNumber(searchParams.get("destinationLng"));

    if (lat === null || lng === null) {
      return null;
    }

    return { lat, lng };
  }, [searchParams]);

  const originName = searchParams.get("originName")?.trim() || "Current location";
  const destinationName = searchParams.get("destinationName")?.trim() || "Destination";
  const isMatchedSimpaniInformatics = useMemo(
    () => isSimpaniInformaticsTripByNames(originName, destinationName),
    [originName, destinationName],
  );
  const selectedRoute = useMemo(() => {
    const routeId = toNumber(searchParams.get("routeId"));
    if (routeId === null) {
      return null;
    }

    return BUS_ROUTES.find((route) => route.id === Math.round(routeId)) ?? null;
  }, [searchParams]);

  useEffect(() => {
    if (!noRouteGuide || !origin || !destination) {
      return;
    }

    if (distanceKm > 0 && durationMin > 0) {
      return;
    }

    const fallbackDistanceKm = Math.max(0.1, distanceKmBetween(origin, destination));
    setDistanceKm(fallbackDistanceKm);
    setDurationMin(estimateDurationMin(fallbackDistanceKm));
  }, [
    noRouteGuide,
    origin?.lat,
    origin?.lng,
    destination?.lat,
    destination?.lng,
    origin,
    destination,
    distanceKm,
    durationMin,
  ]);

  useEffect(() => {
    let isCancelled = false;

    const fetchRoute = async () => {
      if (!origin || !destination) {
        setRouteError("Origin or destination is missing. Please search again from the home page.");
        setRoutePath([]);
        return;
      }

      if (noRouteGuide) {
        setRouteError("No direct route found for this trip.");
        setRoutePath([]);
        return;
      }

      if (selectedRoute) {
        const selectedRoutePath = selectedRoute.stops.map((stopName) => getStopPoint(stopName));
        const selectedRouteDistanceKm = queryDistanceKm ?? estimatePathDistanceKm(selectedRoutePath);
        const selectedRouteDurationMin =
          queryDurationMin ?? estimateDurationMin(selectedRouteDistanceKm);

        setRoutePath(selectedRoutePath);
        setRouteError(null);
        setDistanceKm(selectedRouteDistanceKm);
        setDurationMin(selectedRouteDurationMin);

        return;
      }

      setIsLoadingRoute(true);
      setRouteError(null);

      try {
        const response = await fetch("/api/routing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origin,
            destination,
            mode: "drive",
          }),
        });

        const data: unknown = await response.json();
        if (!response.ok) {
          const errorResponse = data as { error?: string };
          throw new Error(errorResponse.error || "Failed to fetch route.");
        }

        if (!isGeoapifyRouteResponse(data) || data.path.length === 0) {
          throw new Error("No route found for this trip.");
        }

        if (!isCancelled) {
          setRoutePath(data.path);
          setDistanceKm(data.distanceMeters / 1000);
          setDurationMin(data.durationSeconds / 60);
        }
      } catch (error) {
        if (!isCancelled) {
          const message = error instanceof Error ? error.message : "Failed to fetch route.";
          setRouteError(message);
          setRoutePath([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingRoute(false);
        }
      }
    };

    void fetchRoute();

    return () => {
      isCancelled = true;
    };
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng, origin, destination, noRouteGuide, selectedRoute, queryDistanceKm, queryDurationMin]);

  const baseFare = useMemo(() => {
    if (isMatchedSimpaniInformatics) {
      return SIMPANI_INFORMATICS_BUS_FARE_NPR;
    }

    if (noRouteGuide) {
      return Math.max(10, noRouteGuide.estimatedFareNpr);
    }

    return estimateFareNpr(distanceKm);
  }, [distanceKm, noRouteGuide, isMatchedSimpaniInformatics]);

  const maxDiscountRate = useMemo(() => {
    const selectedDiscounts = FARE_OPTIONS.filter(
      (option) => option.type === "discount" && selectedOptions.includes(option.id),
    ).map((option) => option.value);

    if (selectedDiscounts.length === 0) {
      return 0;
    }

    return Math.max(...selectedDiscounts);
  }, [selectedOptions]);

  const surchargeTotal = useMemo(() => {
    return FARE_OPTIONS.filter(
      (option) => option.type === "surcharge" && selectedOptions.includes(option.id),
    ).reduce((total, option) => total + option.value, 0);
  }, [selectedOptions]);

  const discountAmount = Math.round(baseFare * maxDiscountRate);
  const totalFare = Math.max(10, Math.round(baseFare - discountAmount + surchargeTotal));

  const mapCenter = useMemo<MapPoint>(() => {
    if (routePath.length > 0) {
      return routePath[Math.floor(routePath.length / 2)];
    }

    if (origin) {
      return origin;
    }

    if (destination) {
      return destination;
    }

    return POKHARA_CENTER;
  }, [routePath, origin, destination]);

  const toggleOption = (optionId: string) => {
    setSelectedOptions((previous) =>
      previous.includes(optionId)
        ? previous.filter((existingId) => existingId !== optionId)
        : [...previous, optionId],
    );
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <Header />
      <main className="flex flex-1 lg:ml-64">
        <Sidebar />

        <div className="flex flex-1 flex-col items-center">
          <div className="w-full max-w-6xl flex flex-col lg:flex-row min-h-full">
            <div className="relative flex-1 min-h-[320px] border-r border-slate-200 dark:border-slate-800">
              <div className="absolute inset-0 overflow-hidden bg-slate-200 dark:bg-slate-900">
                {mapsConfigError ? (
                  <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                    <div className="max-w-md rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-lg dark:border-slate-800 dark:bg-slate-900">
                      <p className="font-semibold text-rose-600 dark:text-rose-400">{mapsConfigError}</p>
                      <p className="mt-2 text-slate-600 dark:text-slate-300">{GEOAPIFY_SETUP_HINT}</p>
                    </div>
                  </div>
                ) : (
                  <MapComponent
                    apiKey={geoapifyApiKey}
                    center={mapCenter}
                    zoom={13}
                    origin={origin}
                    destination={destination}
                    routePath={routePath}
                  />
                )}
              </div>

              <div className="absolute left-4 top-4 z-30 max-w-xs rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900/95">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Route Status
                </p>
                {isLoadingRoute && <p className="mt-1 text-sm font-semibold">Loading route...</p>}
                {!isLoadingRoute && routeError && <p className="mt-1 text-sm text-rose-600">{routeError}</p>}
                {!isLoadingRoute && !routeError && routePath.length > 0 && (
                  <p className="mt-1 text-sm font-semibold text-emerald-600">
                    {selectedRoute ? `${selectedRoute.name} loaded on map` : "Route loaded on map"}
                  </p>
                )}
              </div>
            </div>

            <div className="w-full lg:w-[430px] border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-background-dark">
              <div className="space-y-6 p-6 pb-24 lg:pb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Fare Calculator</h3>
                  <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                    LIVE ROUTE
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Trip
                  </p>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold">From:</span> {originName}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">To:</span> {destinationName}
                    </p>
                    {selectedRoute && (
                      <p className="text-sm">
                        <span className="font-semibold">Route:</span> {selectedRoute.name}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-semibold">Distance:</span> {distanceKm.toFixed(2)} km
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Estimated time:</span> {Math.max(1, Math.round(durationMin))} min
                    </p>
                  </div>
                </div>

                {isMatchedSimpaniInformatics && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-100">
                    <p className="font-bold">Fixed Local Rates (Simpani to Informatics)</p>
                    <p className="mt-1">InDrive Bike: NPR {SIMPANI_INFORMATICS_BIKE_FARE_NPR}</p>
                    <p className="mt-1">InDrive Car: NPR {SIMPANI_INFORMATICS_CAR_FARE_NPR}</p>
                    <p className="mt-1">
                      Bus: Micro bus from Simpani to Gandaki Hospital (NPR {SIMPANI_INFORMATICS_BUS_FARE_NPR}), then
                      walk to Informatics College Pokhara.
                    </p>
                  </div>
                )}

                {noRouteGuide && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-100">
                    <p className="font-bold">No direct route found. Try this bus plan:</p>
                    <p className="mt-1">
                      Board from <span className="font-bold">{noRouteGuide.boardingStop}</span>
                      {noRouteGuide.transferStop ? (
                        <>
                          {" "}
                          and change bus at <span className="font-bold">{noRouteGuide.transferStop}</span>.
                        </>
                      ) : (
                        "."
                      )}
                    </p>
                    <p className="mt-1">
                      Get down near <span className="font-bold">{noRouteGuide.dropOffStop}</span> and walk the rest.
                    </p>
                    <p className="mt-1">
                      Buses needed: <span className="font-bold">{noRouteGuide.busesNeeded}</span>
                    </p>
                    <p className="mt-1">
                      Carry at least: <span className="font-bold">NPR {noRouteGuide.estimatedFareNpr}</span>
                    </p>
                    <p className="mt-1 text-[11px] opacity-90">
                      Suggested line(s): {noRouteGuide.routeNames.join(" + ")}
                    </p>
                    <p className="mt-1 text-[11px] opacity-90">
                      Walk approx: {noRouteGuide.walkToBoardKm.toFixed(1)} km to board,{" "}
                      {noRouteGuide.walkFromDropKm.toFixed(1)} km after drop.
                    </p>
                    {noRouteGuide.guidance && <p className="mt-1 text-[11px] font-medium">{noRouteGuide.guidance}</p>}
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Fare Suggestions (Checkbox)
                  </p>
                  {FARE_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                    >
                      <div>
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{option.note}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => toggleOption(option.id)}
                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                    </label>
                  ))}
                </div>

                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Base Fare</span>
                    <span className="font-medium">NPR {baseFare}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Best Discount</span>
                    <span className="font-medium text-emerald-600">-NPR {discountAmount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Surcharges</span>
                    <span className="font-medium">+NPR {Math.round(surchargeTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
                    <span className="text-base font-bold">Total Payable</span>
                    <span className="text-xl font-bold text-primary">NPR {totalFare}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-900/20">
                  <p className="text-sm font-bold text-rose-700 dark:text-rose-300">No route available now?</p>
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-300/90">
                    Try changing destination or check nearby stops for the next available bus.
                  </p>
                  <button className="mt-3 w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:bg-rose-900/40 dark:text-rose-200 dark:hover:bg-rose-900/60">
                    No route available now
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

export default function FarePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background-light text-sm text-slate-600 dark:bg-background-dark dark:text-slate-300">
          Loading fare page...
        </div>
      }
    >
      <FarePageContent />
    </Suspense>
  );
}
