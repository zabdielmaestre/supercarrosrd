import type { Vehicle, VehiclePhoto } from "../types";

/** Fallback por si el JSON en caché aún trae URLs con /5/ */
export function cleanPhotoUrl(url: string): string {
  if (!url) return url;
  return url.replace(/(\/AdsPhotos\/[^/]+\/)5\//, "$10/");
}

export function displayPhoto(photo: VehiclePhoto): string {
  return cleanPhotoUrl(photo.large || photo.full);
}

export function vehicleCardImage(vehicle: Vehicle): string {
  const first = vehicle.photos[0];
  if (first) return displayPhoto(first);
  return cleanPhotoUrl(vehicle.thumbnail);
}
