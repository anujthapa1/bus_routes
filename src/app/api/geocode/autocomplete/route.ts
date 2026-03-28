import { NextResponse } from "next/server";
import { getGeoapifyServerApiKey } from "@/lib/geoapifyConfig";
import type { GeoapifyPlace } from "@/lib/geoapifyTypes";
import { KASKI_BOUNDS, KASKI_CENTER } from "@/lib/kaskiBounds";

const GEOAPIFY_AUTOCOMPLETE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";

interface GeoapifyFeatureProperties {
  lat?: number;
  lon?: number;
  name?: string;
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
}

interface GeoapifyFeature {
  properties?: GeoapifyFeatureProperties;
}

interface GeoapifyAutocompleteResponse {
  features?: GeoapifyFeature[];
}

function toPlace(feature: GeoapifyFeature): GeoapifyPlace | null {
  const properties = feature.properties;
  const lat = Number(properties?.lat);
  const lon = Number(properties?.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  return {
    name: properties?.name || properties?.address_line1 || properties?.formatted || "Unknown place",
    formatted: properties?.formatted || properties?.address_line2 || properties?.name || "",
    lat,
    lng: lon,
  };
}

export async function GET(request: Request) {
  const apiKey = getGeoapifyServerApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEOAPIFY_API_KEY or NEXT_PUBLIC_GEOAPIFY_API_KEY in environment." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text")?.trim() ?? "";

  if (!text) {
    return NextResponse.json({ results: [] as GeoapifyPlace[] }, { status: 200 });
  }

  const kaskiRectFilter = `rect:${KASKI_BOUNDS.west},${KASKI_BOUNDS.south},${KASKI_BOUNDS.east},${KASKI_BOUNDS.north}`;
  const kaskiBias = `proximity:${KASKI_CENTER.lng},${KASKI_CENTER.lat}`;

  const endpoint = `${GEOAPIFY_AUTOCOMPLETE_URL}?text=${encodeURIComponent(text)}&filter=${encodeURIComponent(kaskiRectFilter)}&bias=${encodeURIComponent(kaskiBias)}&limit=6&apiKey=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    const data: unknown = await response.json().catch(() => null);

    if (!response.ok || !data) {
      return NextResponse.json(
        {
          error: "Geoapify autocomplete request failed.",
          details: data,
        },
        { status: response.status || 502 },
      );
    }

    const parsedData = data as GeoapifyAutocompleteResponse;
    const features = Array.isArray(parsedData.features) ? parsedData.features : [];

    const results = features
      .map(toPlace)
      .filter((place): place is GeoapifyPlace => place !== null);

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to reach Geoapify autocomplete API.",
        details: message,
      },
      { status: 502 },
    );
  }
}
