import { NextResponse } from "next/server";
import { getGeoapifyServerApiKey } from "@/lib/geoapifyConfig";
import type { GeoapifyRouteResponse, MapPoint } from "@/lib/geoapifyTypes";

const GEOAPIFY_ROUTING_URL = "https://api.geoapify.com/v1/routing";

interface RoutingRequestBody {
  origin?: MapPoint;
  destination?: MapPoint;
  mode?: string;
}

function isMapPoint(value: unknown): value is MapPoint {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybePoint = value as Record<string, unknown>;
  return typeof maybePoint.lat === "number" && typeof maybePoint.lng === "number";
}

export async function POST(request: Request) {
  const apiKey = getGeoapifyServerApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEOAPIFY_API_KEY or NEXT_PUBLIC_GEOAPIFY_API_KEY in environment." },
      { status: 500 },
    );
  }

  let payload: RoutingRequestBody;
  try {
    payload = (await request.json()) as RoutingRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isMapPoint(payload.origin) || !isMapPoint(payload.destination)) {
    return NextResponse.json(
      { error: "origin and destination are required and must be { lat, lng } numbers." },
      { status: 400 },
    );
  }

  const mode = payload.mode ?? "drive";
  const waypoints = `${payload.origin.lat},${payload.origin.lng}|${payload.destination.lat},${payload.destination.lng}`;
  const endpoint = `${GEOAPIFY_ROUTING_URL}?waypoints=${encodeURIComponent(waypoints)}&mode=${encodeURIComponent(mode)}&details=route_details&apiKey=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      return NextResponse.json(
        {
          error: "Geoapify routing request failed.",
          details: data,
        },
        { status: response.status || 502 },
      );
    }

    const firstFeature = Array.isArray(data.features) ? data.features[0] : null;
    const properties = firstFeature?.properties as Record<string, unknown> | undefined;
    const geometry = firstFeature?.geometry as { coordinates?: unknown[] } | undefined;

    const rawCoordinates = Array.isArray(geometry?.coordinates) ? geometry.coordinates : [];
    const path: MapPoint[] = rawCoordinates
      .map((coordinate) => {
        if (!Array.isArray(coordinate) || coordinate.length < 2) {
          return null;
        }

        const lon = Number(coordinate[0]);
        const lat = Number(coordinate[1]);

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          return null;
        }

        return { lat, lng: lon };
      })
      .filter((point): point is MapPoint => point !== null);

    const result: GeoapifyRouteResponse = {
      distanceMeters: typeof properties?.distance === "number" ? properties.distance : 0,
      durationSeconds: typeof properties?.time === "number" ? properties.time : 0,
      path,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to reach Geoapify routing API.",
        details: message,
      },
      { status: 502 },
    );
  }
}
