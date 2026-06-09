import type { InventoryData } from "./types";

let cache: InventoryData | null = null;

export async function fetchInventory(): Promise<InventoryData> {
  if (cache) return cache;

  const response = await fetch("/api/vehicles");
  if (!response.ok) {
    throw new Error("No se pudo cargar el inventario");
  }

  const data = (await response.json()) as InventoryData;
  cache = data;
  return data;
}
