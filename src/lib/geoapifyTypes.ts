export interface MapPoint {
  lat: number;
  lng: number;
}

export interface GeoapifyPlace extends MapPoint {
  name: string;
  formatted: string;
}

export interface GeoapifyRouteResponse {
  distanceMeters: number;
  durationSeconds: number;
  path: MapPoint[];
}
