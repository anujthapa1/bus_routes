"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

export default function GoogleMap({
  apiKey,
  center = { lat: 28.2096, lng: 83.9856 }, // Pokhara center
  zoom = 14
}: {
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number
}) {
  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
      >
        <Marker position={center} />
      </Map>
    </APIProvider>
  );
}
