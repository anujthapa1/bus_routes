"use client";

import "leaflet/dist/leaflet.css";

import React, { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { getGeoapifyTileUrl } from "@/lib/geoapifyConfig";
import type { MapPoint } from "@/lib/geoapifyTypes";
import { KASKI_BOUNDS, clampToKaski } from "@/lib/kaskiBounds";

interface LeafletGeoMapProps {
  apiKey: string;
  center: MapPoint;
  zoom: number;
  origin?: MapPoint | null;
  destination?: MapPoint | null;
  routePath?: MapPoint[];
}

const KASKI_MAX_BOUNDS: LatLngBoundsExpression = [
  [KASKI_BOUNDS.south, KASKI_BOUNDS.west],
  [KASKI_BOUNDS.north, KASKI_BOUNDS.east],
];

function MapViewUpdater({ center, zoom }: { center: MapPoint; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    const clampedCenter = clampToKaski(center);
    map.setView([clampedCenter.lat, clampedCenter.lng], zoom, {
      animate: true,
      duration: 0.5,
    });
  }, [map, center, zoom]);

  return null;
}

function RouteBoundsUpdater({ routePath }: { routePath: MapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (routePath.length < 2) {
      return;
    }

    const bounds = latLngBounds(routePath.map((point) => [point.lat, point.lng]));
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 16,
      animate: true,
      duration: 0.5,
    });

    map.panInsideBounds(KASKI_MAX_BOUNDS, { animate: true, duration: 0.3 });
  }, [map, routePath]);

  return null;
}

export default function LeafletGeoMap({
  apiKey,
  center,
  zoom,
  origin,
  destination,
  routePath = [],
}: LeafletGeoMapProps) {
  const routeLatLngs = useMemo<LatLngExpression[]>(
    () => routePath.map((point) => [point.lat, point.lng]),
    [routePath],
  );

  const clampedCenter = clampToKaski(center);

  return (
    <MapContainer
      center={[clampedCenter.lat, clampedCenter.lng]}
      zoom={zoom}
      minZoom={10}
      zoomControl={false}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      touchZoom={true}
      dragging={true}
      maxBounds={KASKI_MAX_BOUNDS}
      maxBoundsViscosity={1.0}
      attributionControl={true}
      className="relative z-0 h-full w-full"
    >
      <MapViewUpdater center={center} zoom={zoom} />
      <RouteBoundsUpdater routePath={routePath} />

      <TileLayer
        url={getGeoapifyTileUrl(apiKey)}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | &copy; <a href="https://www.geoapify.com/">Geoapify</a>'
      />

      {routeLatLngs.length > 1 && (
        <Polyline
          positions={routeLatLngs}
          pathOptions={{
            color: "#13b6ec",
            weight: 5,
            opacity: 0.9,
          }}
        />
      )}

      {origin && (
        <CircleMarker
          center={[origin.lat, origin.lng]}
          radius={8}
          pathOptions={{ color: "#13b6ec", fillColor: "#13b6ec", fillOpacity: 1 }}
        />
      )}

      {destination && (
        <CircleMarker
          center={[destination.lat, destination.lng]}
          radius={8}
          pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 1 }}
        />
      )}
    </MapContainer>
  );
}
