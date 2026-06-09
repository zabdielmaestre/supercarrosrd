import type { FilterState, SortOption, Vehicle } from "../types";

export function getUniqueBrands(vehicles: Vehicle[]): string[] {
  return [...new Set(vehicles.map((v) => v.brand))].sort((a, b) =>
    a.localeCompare(b, "es")
  );
}

export function getUniqueFuels(vehicles: Vehicle[]): string[] {
  const fuels = vehicles
    .map((v) => v.specs.combustible)
    .filter((f): f is string => Boolean(f));
  return [...new Set(fuels)].sort((a, b) => a.localeCompare(b, "es"));
}

function comparePrice(a: Vehicle, b: Vehicle, direction: "asc" | "desc"): number {
  const amountA = a.price.amount ?? 0;
  const amountB = b.price.amount ?? 0;
  return direction === "asc" ? amountA - amountB : amountB - amountA;
}

function compareYear(a: Vehicle, b: Vehicle, direction: "asc" | "desc"): number {
  const yearA = a.year ?? 0;
  const yearB = b.year ?? 0;
  return direction === "asc" ? yearA - yearB : yearB - yearA;
}

export function sortVehicles(vehicles: Vehicle[], sort: SortOption): Vehicle[] {
  const sorted = [...vehicles];

  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => comparePrice(a, b, "asc"));
    case "price-desc":
      return sorted.sort((a, b) => comparePrice(a, b, "desc"));
    case "year-asc":
      return sorted.sort((a, b) => compareYear(a, b, "asc"));
    case "year-desc":
      return sorted.sort((a, b) => compareYear(a, b, "desc"));
    default:
      return sorted;
  }
}

export function filterVehicles(vehicles: Vehicle[], filters: FilterState): Vehicle[] {
  const query = filters.search.trim().toLowerCase();

  return vehicles.filter((vehicle) => {
    if (filters.brand && vehicle.brand !== filters.brand) return false;
    if (filters.fuel && vehicle.specs.combustible !== filters.fuel) return false;

    if (!query) return true;

    const haystack = [
      vehicle.title,
      vehicle.brand,
      vehicle.model,
      vehicle.specs.tipo,
      vehicle.specs.combustible,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export const defaultFilters: FilterState = {
  search: "",
  brand: "",
  fuel: "",
  sort: "year-desc",
};
