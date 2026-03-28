import { NextResponse } from "next/server";
import { getGeoapifyServerApiKey } from "@/lib/geoapifyConfig";

const GEOAPIFY_ROUTEPLANNER_URL = "https://api.geoapify.com/v1/routeplanner";

export async function POST(request: Request) {
  const apiKey = getGeoapifyServerApiKey();

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEOAPIFY_API_KEY or NEXT_PUBLIC_GEOAPIFY_API_KEY in environment." },
      { status: 500 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const endpoint = `${GEOAPIFY_ROUTEPLANNER_URL}?apiKey=${encodeURIComponent(apiKey)}`;

  try {
    const upstreamResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await upstreamResponse.json().catch(() => null);

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          error: "Geoapify route planner request failed.",
          details: data,
        },
        { status: upstreamResponse.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to reach Geoapify route planner.",
        details: message,
      },
      { status: 502 },
    );
  }
}
