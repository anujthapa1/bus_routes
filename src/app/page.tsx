"use client";

import React, { useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import MapComponent from "@/components/MapComponent";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import ZoomControls from "@/components/ZoomControls";
import RouteResults from "@/components/RouteResults";

const POKHARA_CENTER = { lat: 28.2096, lng: 83.9856 };

interface BusRoute {
  id: number;
  name: string;
  stops: string[];
  frequency: string;
  baseFare: number;
  status: string;
  color: string;
  calculatedFare?: number;
}

const ROUTES_DATA: BusRoute[] = [
  {
    id: 1,
    name: "Route 1: Lakeside → Mahendrapul",
    stops: ["Lakeside", "Hallan Chowk", "Sahid Chowk", "Prithvi Chowk", "Hospital Chowk", "Mahendrapul"],
    frequency: "Every 10 mins",
    baseFare: 25,
    status: "Active",
    color: "green"
  },
  {
    id: 4,
    name: "Route 4: Bagar → Chhorepatan",
    stops: ["Bagar", "PN Campus", "Bindhyabasini", "Chipledhunga", "Birauta", "Chhorepatan"],
    frequency: "Every 15 mins",
    baseFare: 30,
    status: "Active",
    color: "green"
  },
  {
    id: 7,
    name: "Route 7: Lamachaur → Sedi",
    stops: ["Lamachaur", "WRC Campus", "Hari Chowk", "Zero KM", "Lakeside North", "Sedi"],
    frequency: "Every 30 mins",
    baseFare: 35,
    status: "Limited",
    color: "amber"
  },
  {
    id: 11,
    name: "Route 11: Malepatan → Lekhnath",
    stops: ["Malepatan", "Parsyang", "Srijana Chowk", "Amarsingh", "Bijayapur", "Talchowk", "Lekhnath"],
    frequency: "Every 20 mins",
    baseFare: 40,
    status: "Active",
    color: "green"
  }
];

export default function Home() {
  const [mapCenter, setMapCenter] = useState(POKHARA_CENTER);
  const [origin, setOrigin] = useState<google.maps.places.PlaceResult | null>(null);
  const [destination, setDestination] = useState<google.maps.places.PlaceResult | null>(null);
  const [searchResults, setSearchResults] = useState<BusRoute[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  React.useEffect(() => {
    handleMyLocation();
  }, []);

  const handleFindRoute = () => {
    if (!origin || !destination) return;

    setIsSearching(true);

    // Mock matching logic:
    // In a real app, this would use a routing engine or check if any route
    // has stops near both origin and destination coordinates.
    // For this demo, we'll return a subset of routes.
    setTimeout(() => {
      const results = ROUTES_DATA.map(route => ({
        ...route,
        calculatedFare: route.baseFare // In real app, calculate based on distance
      })).slice(0, 2);

      setSearchResults(results);
      setIsSearching(false);
    }, 800);
  };

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(pos);
        },
        () => {
          console.error("Error: The Geolocation service failed.");
        }
      );
    } else {
      console.error("Error: Your browser doesn't support geolocation.");
    }
  };

  const originPos = origin?.geometry?.location ? {
    lat: origin.geometry.location.lat(),
    lng: origin.geometry.location.lng()
  } : null;

  const destinationPos = destination?.geometry?.location ? {
    lat: destination.geometry.location.lat(),
    lng: destination.geometry.location.lng()
  } : null;

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark">
        <Header />
        <main className="relative flex flex-1 overflow-hidden">
          <Sidebar />

          <div className="relative flex-1 flex flex-col lg:ml-64">
            {/* Map Area */}
            <div className="relative flex-1 bg-slate-200 dark:bg-slate-900 overflow-hidden">
              {/* Interactive Map */}
              <MapComponent
                center={mapCenter}
                origin={originPos}
                destination={destinationPos}
              />

              {/* Floating Map Controls */}
              <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
                <ZoomControls />
                <button
                  onClick={handleMyLocation}
                  className="flex size-12 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary">my_location</span>
                </button>
              </div>

              {/* Search Floating bar */}
              <div className="absolute top-6 left-6 z-10 w-96 hidden md:flex items-center bg-white dark:bg-background-dark rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2">
                <span className="material-symbols-outlined text-slate-400 ml-2">search</span>
                <PlaceAutocomplete
                  onPlaceSelect={(place) => {
                    if (place?.geometry?.location) {
                      setMapCenter({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                      });
                    }
                  }}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 px-3 outline-none"
                  placeholder="Search for stops or landmarks"
                />
                <button className="p-2 text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined">tune</span>
                </button>
              </div>

              {/* Route Planning Card (Bottom) */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5">
                  <div className="flex items-center justify-center mb-4 md:hidden">
                    <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  </div>
                  <h2 className="text-xl font-bold mb-5 text-slate-900 dark:text-white">Plan Your Journey</h2>
                  <div className="flex flex-col gap-4">
                    <div className="relative flex items-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <span className="material-symbols-outlined text-primary scale-75">radio_button_checked</span>
                        <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-700"></div>
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">From</p>
                        <PlaceAutocomplete
                          onPlaceSelect={(place) => {
                            setOrigin(place);
                            if (place?.geometry?.location) {
                              setMapCenter({
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng()
                              });
                            }
                          }}
                          className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-slate-100 focus:ring-0 placeholder:text-slate-400 font-medium outline-none"
                          placeholder="Enter starting point..."
                        />
                      </div>
                    </div>
                    <div className="relative flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-red-500 scale-75">location_on</span>
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">To</p>
                        <PlaceAutocomplete
                          onPlaceSelect={(place) => {
                            setDestination(place);
                            if (place?.geometry?.location) {
                              setMapCenter({
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng()
                              });
                            }
                          }}
                          className="w-full bg-transparent border-none p-0 text-slate-900 dark:text-slate-100 focus:ring-0 placeholder:text-slate-400 font-medium outline-none"
                          placeholder="Search destination..."
                        />
                      </div>
                      <button className="flex items-center justify-center p-2 rounded-full bg-primary/10 text-primary">
                        <span className="material-symbols-outlined">swap_vert</span>
                      </button>
                    </div>
                    <button
                      onClick={handleFindRoute}
                      disabled={isSearching || !origin || !destination}
                      className="mt-2 w-full bg-primary hover:bg-primary/90 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
                    >
                      {isSearching ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">directions_bus</span>
                          Find Best Route
                        </>
                      )}
                    </button>

                    <RouteResults results={searchResults} />
                  </div>

                  {/* Quick Landmarks */}
                  <div className="flex gap-2 mt-6 overflow-x-auto pb-1 no-scrollbar">
                    <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700/50 rounded-full whitespace-nowrap">
                      <span className="material-symbols-outlined text-sm">home</span>
                      <span className="text-sm font-medium">Home</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700/50 rounded-full whitespace-nowrap">
                      <span className="material-symbols-outlined text-sm">work</span>
                      <span className="text-sm font-medium">Work</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700/50 rounded-full whitespace-nowrap">
                      <span className="material-symbols-outlined text-sm">landscape</span>
                      <span className="text-sm font-medium">Lakeside</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    </APIProvider>
  );
}
