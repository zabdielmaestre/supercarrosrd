import type { Vehicle, VehiclePhoto } from "../types";

const IMG_BASE = "https://img.supercarros.com/AdsPhotos";

/** SuperCarros: /5/ = con logo, /0/ = sin logo */
export function cleanPhotoUrl(url: string): string {
  if (!url) return url;
  return url.replace(/(\/AdsPhotos\/[^/]+\/)\d+\//, "$10/");
}

function photoIdFromUrl(url: string): string | null {
  return url.match(/\/(\d+)\.jpg(?:\?.*)?$/i)?.[1] ?? null;
}

function cleanById(url: string, size: string): string {
  const id = photoIdFromUrl(url);
  if (!id) return cleanPhotoUrl(url);
  return `${IMG_BASE}/${size}/0/${id}.jpg`;
}

export function displayPhoto(photo: VehiclePhoto): string {
  return cleanPhotoUrl(photo.full || photo.large);
}

export function vehicleCardImage(vehicle: Vehicle): string {
  const first = vehicle.photos[0];
  if (first?.full) return cleanPhotoUrl(first.full);
  if (vehicle.thumbnail) return cleanById(vehicle.thumbnail, "282x188");
  return "";
}
