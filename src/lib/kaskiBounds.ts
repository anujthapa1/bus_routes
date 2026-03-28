import type { MapPoint } from "@/lib/geoapifyTypes";

// Approximate administrative bounding box for Kaski District, Nepal.
export const KASKI_BOUNDS = {
  south: 27.95,
  north: 28.66,
  west: 83.70,
  east: 84.33,
} as const;

export const KASKI_CENTER: MapPoint = {
  lat: 28.3053,
  lng: 84.0770,
};

export function clampToKaski(point: MapPoint): MapPoint {
  return {
    lat: Math.min(KASKI_BOUNDS.north, Math.max(KASKI_BOUNDS.south, point.lat)),
    lng: Math.min(KASKI_BOUNDS.east, Math.max(KASKI_BOUNDS.west, point.lng)),
  };
}
