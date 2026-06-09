import type { Vehicle, VehiclePhoto } from "../types";

export function displayPhoto(photo: VehiclePhoto): string {
  return photo.large || photo.full;
}

export function vehicleCardImage(vehicle: Vehicle): string {
  const first = vehicle.photos[0];
  if (first?.card) return first.card;
  if (first?.large) return first.large;
  return vehicle.thumbnail;
}
