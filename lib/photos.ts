const IMG_BASE = "https://img.supercarros.com/AdsPhotos";

/** SuperCarros usa /5/ con marca de agua y /0/ sin ella. */
export function cleanPhotoUrl(url: string): string {
  if (!url) return url;
  return url.replace(/(\/AdsPhotos\/[^/]+\/)5\//, "$10/");
}

export function extractPhotoId(url: string): string | null {
  const match = url.match(/\/(\d+)\.jpg(?:\?.*)?$/i);
  return match?.[1] ?? null;
}

export function buildCleanPhotoUrls(id: string) {
  return {
    full: `${IMG_BASE}/1024x768/0/${id}.jpg`,
    large: `${IMG_BASE}/800x600/0/${id}.jpg`,
    thumb: `${IMG_BASE}/188x125/0/${id}.jpg`,
    card: `${IMG_BASE}/282x188/0/${id}.jpg`,
  };
}

export function toCleanThumbnail(url: string): string {
  const id = extractPhotoId(url);
  if (!id) return cleanPhotoUrl(url);
  return buildCleanPhotoUrls(id).card;
}
