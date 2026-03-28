import type { MapPoint } from "@/lib/geoapifyTypes";

export type BusRouteColor = "green" | "amber";

export interface BusRouteDefinition {
  id: number;
  name: string;
  stops: string[];
  frequency: string;
  fareLabel: string;
  baseFare: number;
  status: string;
  color: BusRouteColor;
}

export const POKHARA_CENTER: MapPoint = { lat: 28.2096, lng: 83.9856 };

export const STOP_COORDINATES: Record<string, MapPoint> = {
  Kaseri: { lat: 28.247, lng: 83.94 },
  Fulbari: { lat: 28.238, lng: 83.972 },
  Hallanchowk: { lat: 28.212, lng: 83.958 },
  Housing: { lat: 28.246, lng: 83.989 },
  Harichowk: { lat: 28.225, lng: 83.986 },
  Khalteymasina: { lat: 28.192, lng: 83.982 },
  "Zero KM": { lat: 28.209, lng: 83.989 },
  Birauta: { lat: 28.191, lng: 83.994 },
  Chhorepatan: { lat: 28.175, lng: 83.988 },
  Chipledhunga: { lat: 28.209, lng: 83.987 },
  Bagar: { lat: 28.233, lng: 83.989 },
  Gufa: { lat: 28.215, lng: 83.952 },
  Lakeside: { lat: 28.209, lng: 83.959 },
  Fewa: { lat: 28.206, lng: 83.95 },
  "PN Campus": { lat: 28.229, lng: 83.989 },
  Belghari: { lat: 28.256, lng: 84.01 },
  Amarsingh: { lat: 28.208, lng: 83.997 },
  Manipal: { lat: 28.235, lng: 84.005 },
  Lamachour: { lat: 28.272, lng: 83.998 },
  Mahatgauda: { lat: 28.171, lng: 83.942 },
  "Prithvi Chowk": { lat: 28.201, lng: 83.982 },
  Simpani: { lat: 28.227, lng: 84.021 },
  Majheripatan: { lat: 28.191, lng: 84.028 },
  "Srijana Chowk": { lat: 28.197, lng: 83.995 },
};

export const BUS_ROUTES: BusRouteDefinition[] = [
  {
    id: 1,
    name: "Route 1: Kaseri -> Hallanchowk",
    stops: ["Kaseri", "Fulbari", "Hallanchowk"],
    frequency: "Every 12 mins",
    fareLabel: "NPR 25 - 45",
    baseFare: 25,
    status: "Active",
    color: "green",
  },
  {
    id: 2,
    name: "Route 2: Housing -> Khalteymasina",
    stops: ["Housing", "Harichowk", "Khalteymasina"],
    frequency: "Every 15 mins",
    fareLabel: "NPR 25 - 45",
    baseFare: 25,
    status: "Active",
    color: "green",
  },
  {
    id: 3,
    name: "Route 3: Harichowk -> Chhorepatan",
    stops: ["Harichowk", "Zero KM", "Birauta", "Chhorepatan"],
    frequency: "Every 15 mins",
    fareLabel: "NPR 30 - 50",
    baseFare: 30,
    status: "Active",
    color: "green",
  },
  {
    id: 4,
    name: "Route 4: Chhorepatan -> Bagar",
    stops: ["Chhorepatan", "Birauta", "Chipledhunga", "Bagar"],
    frequency: "Every 15 mins",
    fareLabel: "NPR 30 - 50",
    baseFare: 30,
    status: "Active",
    color: "amber",
  },
  {
    id: 5,
    name: "Route 5: Gufa -> Fewa",
    stops: ["Gufa", "Lakeside", "Fewa"],
    frequency: "Every 18 mins",
    fareLabel: "NPR 25 - 45",
    baseFare: 25,
    status: "Active",
    color: "green",
  },
  {
    id: 6,
    name: "Route 6: Bagar -> Fewa",
    stops: ["Bagar", "PN Campus", "Lakeside", "Fewa"],
    frequency: "Every 18 mins",
    fareLabel: "NPR 30 - 50",
    baseFare: 30,
    status: "Active",
    color: "green",
  },
  {
    id: 7,
    name: "Route 7: Belghari -> Manipal",
    stops: ["Belghari", "Amarsingh", "Manipal"],
    frequency: "Every 20 mins",
    fareLabel: "NPR 30 - 55",
    baseFare: 35,
    status: "Active",
    color: "green",
  },
  {
    id: 8,
    name: "Route 8: Chhorepatan -> Lamachour",
    stops: ["Chhorepatan", "Birauta", "Chipledhunga", "Lamachour"],
    frequency: "Every 20 mins",
    fareLabel: "NPR 35 - 60",
    baseFare: 40,
    status: "Active",
    color: "green",
  },
  {
    id: 9,
    name: "Route 9: Mahatgauda -> Simpani",
    stops: ["Mahatgauda", "Prithvi Chowk", "Simpani"],
    frequency: "Every 20 mins",
    fareLabel: "NPR 30 - 55",
    baseFare: 35,
    status: "Active",
    color: "green",
  },
  {
    id: 10,
    name: "Route 10: Majheripatan -> Harichowk",
    stops: ["Majheripatan", "Srijana Chowk", "Harichowk"],
    frequency: "Every 20 mins",
    fareLabel: "NPR 30 - 55",
    baseFare: 35,
    status: "Active",
    color: "green",
  },
];

const NORMALIZED_STOP_ALIASES: Record<string, string> = {
  bagar: "Bagar",
  bagr: "Bagar",
  chipledhunga: "Chipledhunga",
  "zero km": "Zero KM",
  "prithvi chowk": "Prithvi Chowk",
  "srijana chowk": "Srijana Chowk",
};

function normalizeStopText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function resolveStopName(stopName: string): string | null {
  const normalizedInput = normalizeStopText(stopName);
  if (!normalizedInput) {
    return null;
  }

  if (NORMALIZED_STOP_ALIASES[normalizedInput]) {
    return NORMALIZED_STOP_ALIASES[normalizedInput];
  }

  const knownStops = Object.keys(STOP_COORDINATES);

  const exactMatch = knownStops.find((knownStop) => normalizeStopText(knownStop) === normalizedInput);
  if (exactMatch) {
    return exactMatch;
  }

  const aliasTokenMatch = Object.entries(NORMALIZED_STOP_ALIASES).find(([alias]) =>
    normalizedInput.includes(alias),
  );
  if (aliasTokenMatch) {
    return aliasTokenMatch[1];
  }

  const stopTokenMatch = knownStops.find((knownStop) =>
    normalizedInput.includes(normalizeStopText(knownStop)),
  );
  if (stopTokenMatch) {
    return stopTokenMatch;
  }

  return null;
}

export function getStopPoint(stopName: string): MapPoint {
  const resolvedStopName = resolveStopName(stopName);
  if (resolvedStopName) {
    return STOP_COORDINATES[resolvedStopName];
  }

  return STOP_COORDINATES[stopName] ?? POKHARA_CENTER;
}
