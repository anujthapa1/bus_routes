"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { MapPoint } from "@/lib/geoapifyTypes";

const LeafletGeoMap = dynamic(() => import("@/components/LeafletGeoMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
      Loading map...
    </div>
  ),
});

export default function GeoapifyMap({
  apiKey,
  center = { lat: 28.2096, lng: 83.9856 },
  zoom = 14,
}: {
  apiKey: string;
  center?: MapPoint;
  zoom?: number;
}) {
  if (!apiKey.trim()) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
        Geoapify map key is missing.
      </div>
    );
  }

  return <LeafletGeoMap apiKey={apiKey} center={center} zoom={zoom} />;
}
