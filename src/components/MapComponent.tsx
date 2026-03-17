"use client";

import React, { useEffect } from 'react';
import { Map, Marker, useMap } from '@vis.gl/react-google-maps';

interface MapComponentProps {
  center: google.maps.LatLngLiteral;
  zoom?: number;
  origin?: google.maps.LatLngLiteral | null;
  destination?: google.maps.LatLngLiteral | null;
}

const POKHARA_CENTER = { lat: 28.2096, lng: 83.9856 };

function MapHandler({ center }: { center: google.maps.LatLngLiteral }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [map, center]);
  return null;
}

export default function MapComponent({
  center = POKHARA_CENTER,
  zoom = 13,
  origin,
  destination
}: MapComponentProps) {
  return (
    <div className="h-full w-full">
      <Map
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId={'bf51a910020fa1cf'}
      >
        <MapHandler center={center} />
        {origin && (
          <Marker
            position={origin}
            label="A"
          />
        )}
        {destination && (
          <Marker
            position={destination}
            label="B"
          />
        )}
      </Map>
    </div>
  );
}
