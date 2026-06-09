const IMG_BASE = "https://img.supercarros.com/AdsPhotos";

export function extractPhotoId(url: string): string | null {
  const match = url.match(/\/(\d+)\.jpg(?:\?.*)?$/i);
  return match?.[1] ?? null;
}

export function extractWmo(url: string): string | null {
  const match = url.match(/[?&]wmo=([a-f0-9]{128})/i);
  return match?.[1] ?? null;
}

export function supercarrosImageUrl(
  photoId: string,
  size: string,
  wmo?: string | null
): string {
  const base = `${IMG_BASE}/${size}/0/${photoId}.jpg`;
  return wmo ? `${base}?wmo=${wmo}` : base;
}

export function proxyImageUrl(
  photoId: string,
  size: string,
  wmo?: string | null
): string {
  const params = new URLSearchParams({ photoId, size });
  if (wmo) params.set("wmo", wmo);
  return `/api/image?${params.toString()}`;
}

export function buildCleanPhotoUrls(id: string, wmo?: string | null) {
  return {
    full: proxyImageUrl(id, "1024x768", wmo),
    large: proxyImageUrl(id, "800x600", wmo),
    thumb: proxyImageUrl(id, "188x125", wmo),
    card: proxyImageUrl(id, "282x188", wmo),
  };
}

export function toCleanThumbnail(url: string, wmo?: string | null): string {
  const id = extractPhotoId(url);
  if (!id) return url;
  return proxyImageUrl(id, "282x188", wmo ?? extractWmo(url));
}
