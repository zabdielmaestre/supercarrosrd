const USER_AGENT = "supercarrosrd-sync/1.0";

/** SuperCarros expone el wmo de la foto principal en la versión móvil (og:image). */
export async function fetchPrimaryPhotoWmo(
  vehicleUrl: string
): Promise<string | null> {
  try {
    const mobileUrl = vehicleUrl.replace(
      "https://www.supercarros.com",
      "https://m.supercarros.com"
    );

    const response = await fetch(mobileUrl, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!response.ok) return null;

    const html = await response.text();
    const match = html.match(/[?&]wmo=([a-f0-9]{128})/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function parseWmoFromHtml(html: string): Map<string, string> {
  const map = new Map<string, string>();
  const re =
    /AdsPhotos\/[^/]+\/0\/(\d+)\.jpg\?wmo=([a-f0-9]{128})/gi;
  let match: RegExpExecArray | null;

  while ((match = re.exec(html)) !== null) {
    map.set(match[1], match[2]);
  }

  return map;
}

export async function fetchVehiclePhotoWmos(
  vehicleUrl: string
): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  try {
    const mobileUrl = vehicleUrl.replace(
      "https://www.supercarros.com",
      "https://m.supercarros.com"
    );
    const response = await fetch(mobileUrl, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (response.ok) {
      const html = await response.text();
      for (const [id, wmo] of parseWmoFromHtml(html)) {
        map.set(id, wmo);
      }
    }

    const desktop = await fetch(vehicleUrl, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (desktop.ok) {
      const html = await desktop.text();
      for (const [id, wmo] of parseWmoFromHtml(html)) {
        map.set(id, wmo);
      }
    }
  } catch {
    // ignore
  }

  return map;
}
