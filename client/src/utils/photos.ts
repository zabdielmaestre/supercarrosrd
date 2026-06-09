import type { Vehicle, VehiclePhoto } from "../types";

const IMG_BASE = "https://img.supercarros.com/AdsPhotos";

const WMO_TOKEN =
  "da1fb07af0a8f1ac166f343e6a5ee864bd60526d3cac1af2c60a3487705b7fd0b760ca314bfef58a51251593cf523d50d4322926bb4584afc23af4e28ecf23c1";

export function withoutWatermark(url: string): string {
  if (!url || !url.includes("img.supercarros.com")) return url;
  if (url.includes("wmo=")) return url;

  const base = url.split("?")[0];
  return `${base}?wmo=${WMO_TOKEN}`;
}

function photoIdFromUrl(url: string): string | null {
  return url.match(/\/(\d+)\.jpg(?:\?.*)?$/i)?.[1] ?? null;
}

function photoBySize(url: string, size: string): string {
  const id = photoIdFromUrl(url);
  if (!id) return withoutWatermark(url);
  return withoutWatermark(`${IMG_BASE}/${size}/0/${id}.jpg`);
}

export function displayPhoto(photo: VehiclePhoto): string {
  return withoutWatermark(photo.full || photo.large);
}

export function vehicleCardImage(vehicle: Vehicle): string {
  const first = vehicle.photos[0];
  if (first?.full) return withoutWatermark(first.full);
  if (vehicle.thumbnail) return photoBySize(vehicle.thumbnail, "282x188");
  return "";
}

/** @deprecated usar withoutWatermark */
export function cleanPhotoUrl(url: string): string {
  return withoutWatermark(url);
}
