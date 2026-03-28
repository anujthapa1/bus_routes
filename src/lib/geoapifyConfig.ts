const LEGACY_INVALID_KEY = "AIzaSyCZV9usZJxPfhkm1xsLURfkY8fndcBH-Bo";

export function getGeoapifyPublicApiKey(): string {
  return (process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? "").trim();
}

export function getGeoapifyServerApiKey(): string {
  return (
    process.env.GEOAPIFY_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY?.trim() ||
    ""
  );
}

export function getGeoapifyConfigError(apiKey: string): string | null {
  if (!apiKey) {
    return "Missing NEXT_PUBLIC_GEOAPIFY_API_KEY.";
  }

  if (apiKey === LEGACY_INVALID_KEY) {
    return "A legacy invalid key is configured. Use a valid Geoapify API key.";
  }

  return null;
}

export const GEOAPIFY_SETUP_HINT =
  "Create a Geoapify key, set NEXT_PUBLIC_GEOAPIFY_API_KEY and GEOAPIFY_API_KEY, then restart npm run dev.";

export function getGeoapifyTileUrl(apiKey: string): string {
  return `https://maps.geoapify.com/v1/tile/dark-matter-brown/{z}/{x}/{y}.png?&apiKey=${encodeURIComponent(apiKey)}`;
}
