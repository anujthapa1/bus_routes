"use client";

import React, { useEffect, useState } from 'react';
import { Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

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
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);

  useEffect(() => {
    if (!routesLibrary || !map || !origin || !destination) {
      return;
    }

    const directionsService = new routesLibrary.DirectionsService();
    const directionsRenderer = new routesLibrary.DirectionsRenderer({ map });

    // Attempt TRANSIT mode first, fallback to DRIVING if not available
    const requestRoute = (mode: google.maps.TravelMode) => {
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: mode,
          provideRouteAlternatives: true
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);
            setRoutes(result.routes);
          } else if (mode === google.maps.TravelMode.TRANSIT) {
            // If TRANSIT fails, try DRIVING as fallback for Pokhara
            console.warn(`Transit directions failed, falling back to Driving...`);
            requestRoute(google.maps.TravelMode.DRIVING);
          } else {
            console.error(`Directions request failed due to ${status}`);
          }
        }
      );
    };

    requestRoute(google.maps.TravelMode.TRANSIT);

    return () => {
      directionsRenderer.setMap(null);
    };
  }, [routesLibrary, map, origin, destination]);

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
        {origin && !routes.length && (
          <Marker
            position={origin}
            label="A"
          />
        )}
        {destination && !routes.length && (
          <Marker
            position={destination}
            label="B"
          />
        )}
      </Map>
    </div>
  );
}
