import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { BUS_ROUTES, getStopPoint } from "@/lib/busRoutes";
import type { BusRouteDefinition } from "@/lib/busRoutes";
import type { MapPoint } from "@/lib/geoapifyTypes";
const REFERENCE_DISTANCE_KM = 7.6;
const REFERENCE_FARE_NPR = 45;
const SHORT_TRIP_MAX_DISTANCE_KM = 0.5;
const SHORT_TRIP_FARE_NPR = 25;
const FARE_PER_KM_AFTER_SHORT_TRIP =
  (REFERENCE_FARE_NPR - SHORT_TRIP_FARE_NPR) / (REFERENCE_DISTANCE_KM - SHORT_TRIP_MAX_DISTANCE_KM);

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

function estimateFareNpr(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0 || distanceKm <= SHORT_TRIP_MAX_DISTANCE_KM) {
    return SHORT_TRIP_FARE_NPR;
  }

  const adjustedFare =
    SHORT_TRIP_FARE_NPR + (distanceKm - SHORT_TRIP_MAX_DISTANCE_KM) * FARE_PER_KM_AFTER_SHORT_TRIP;

  return Math.max(SHORT_TRIP_FARE_NPR, Math.round(adjustedFare));
}

function estimateRouteDistanceKm(stops: string[]): number {
  if (stops.length < 2) {
    return SHORT_TRIP_MAX_DISTANCE_KM;
  }

  let totalKm = 0;
  for (let index = 1; index < stops.length; index += 1) {
    totalKm += distanceKmBetween(getStopPoint(stops[index - 1]), getStopPoint(stops[index]));
  }

  return Math.max(SHORT_TRIP_MAX_DISTANCE_KM, totalKm);
}

function estimateDurationMin(distanceKm: number): number {
  const averageCitySpeedKmh = 18;
  const minutes = (distanceKm / averageCitySpeedKmh) * 60;
  return Math.max(3, Math.round(minutes));
}

function buildRouteDetailsHref(route: BusRouteDefinition): string {
  const stops = route.stops;
  const originName = stops[0] ?? "Route start";
  const destinationName = stops[stops.length - 1] ?? "Route end";

  const origin = getStopPoint(originName);
  const destination = getStopPoint(destinationName);
  const distanceKm = estimateRouteDistanceKm(route.stops);
  const estimatedFareNpr = estimateFareNpr(distanceKm);
  const durationMin = estimateDurationMin(distanceKm);

  const params = new URLSearchParams({
    routeId: String(route.id),
    originLat: String(origin.lat),
    originLng: String(origin.lng),
    destinationLat: String(destination.lat),
    destinationLng: String(destination.lng),
    originName,
    destinationName,
    distanceKm: distanceKm.toFixed(2),
    durationMin: String(durationMin),
    estimatedFare: String(estimatedFareNpr),
  });

  return `/fare?${params.toString()}`;
}

export default function RoutesPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <Header />
      <main className="flex flex-1 lg:ml-64">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center py-6 px-4 md:px-10 lg:px-20">
          <div className="w-full max-w-4xl flex flex-col gap-6">
            {/* Search Section */}
            <div className="flex flex-col gap-4">
              <div className="relative">
                <div className="flex w-full items-stretch rounded-xl h-14 shadow-sm">
                  <div className="text-slate-400 flex bg-white dark:bg-slate-900 items-center justify-center pl-4 rounded-l-xl">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    className="flex-1 rounded-r-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary border-none bg-white dark:bg-slate-900 h-full placeholder:text-slate-400 px-4 pl-2 text-base font-normal outline-none"
                    placeholder="Search by route name, stop, or destination..."
                  />
                </div>
              </div>

              {/* Tab Filters */}
              <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                <button className="whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold bg-primary text-white">
                  All Routes
                </button>
                <button className="whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  City Bus
                </button>
                <button className="whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Micro Bus
                </button>
                <button className="whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Tourist Bus
                </button>
              </div>
            </div>

            {/* Routes List */}
            <div className="flex flex-col gap-3">
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest px-2">
                Available Routes ({BUS_ROUTES.length})
              </h3>

              {BUS_ROUTES.map((route) => (
                <div key={route.id} className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all shadow-sm group cursor-pointer">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 size-14 group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-3xl">route</span>
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <p className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight">{route.name}</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            route.color === "green"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {route.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-slate-400 text-sm">location_on</span>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal truncate">
                          {route.stops.join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {route.frequency}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          <span className="material-symbols-outlined text-xs">payments</span>
                          {route.fareLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end md:justify-center shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-6">
                    <Link
                      href={buildRouteDetailsHref(route)}
                      className="flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                    >
                      View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
