const IMG_BASE = "https://img.supercarros.com/AdsPhotos";

/** Token para ocultar la marca de agua de SuperCarros (?wmo=...) */
export const WMO_TOKEN =
  "da1fb07af0a8f1ac166f343e6a5ee864bd60526d3cac1af2c60a3487705b7fd0b760ca314bfef58a51251593cf523d50d4322926bb4584afc23af4e28ecf23c1";

export function withoutWatermark(url: string): string {
  if (!url || !url.includes("img.supercarros.com")) return url;
  if (url.includes("wmo=")) return url;

  const base = url.split("?")[0];
  return `${base}?wmo=${WMO_TOKEN}`;
}

export function extractPhotoId(url: string): string | null {
  const match = url.match(/\/(\d+)\.jpg(?:\?.*)?$/i);
  return match?.[1] ?? null;
}

export function buildCleanPhotoUrls(id: string) {
  const urls = {
    full: `${IMG_BASE}/1024x768/0/${id}.jpg`,
    large: `${IMG_BASE}/800x600/0/${id}.jpg`,
    thumb: `${IMG_BASE}/188x125/0/${id}.jpg`,
    card: `${IMG_BASE}/282x188/0/${id}.jpg`,
  };

  return {
    full: withoutWatermark(urls.full),
    large: withoutWatermark(urls.large),
    thumb: withoutWatermark(urls.thumb),
    card: withoutWatermark(urls.card),
  };
}

export function toCleanThumbnail(url: string): string {
  const id = extractPhotoId(url);
  if (!id) return withoutWatermark(url);
  return buildCleanPhotoUrls(id).card;
}
