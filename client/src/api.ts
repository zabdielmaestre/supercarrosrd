import type { InventoryData } from "./types";

export async function fetchInventory(): Promise<InventoryData> {
  const response = await fetch("/api/vehicles", {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el inventario");
  }

  return (await response.json()) as InventoryData;
}
