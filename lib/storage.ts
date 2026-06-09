import { put, head, list } from "@vercel/blob";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { InventoryData } from "./types.js";

const BLOB_PATH = "inventory/vehicles.json";
const LOCAL_DATA_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
  "vehicles.json"
);

export type SaveResult = {
  stored: boolean;
  method: "blob" | "local" | "none";
  message?: string;
};

export async function saveInventory(data: InventoryData): Promise<SaveResult> {
  const json = JSON.stringify(data, null, 2);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(BLOB_PATH, json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    return { stored: true, method: "blob" };
  }

  if (process.env.VERCEL) {
    return {
      stored: false,
      method: "none",
      message:
        "Sin Vercel Blob configurado. La API usa scrape en vivo con caché CDN de 1 hora.",
    };
  }

  await mkdir(dirname(LOCAL_DATA_PATH), { recursive: true });
  await writeFile(LOCAL_DATA_PATH, json, "utf8");
  return { stored: true, method: "local" };
}

export async function loadInventory(): Promise<InventoryData | null> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blobs = await list({ prefix: BLOB_PATH, limit: 1 });
      const blob = blobs.blobs[0];
      if (!blob) return null;

      const response = await fetch(blob.url, { cache: "no-store" });
      if (!response.ok) return null;
      return (await response.json()) as InventoryData;
    } catch {
      return null;
    }
  }

  try {
    const raw = await readFile(LOCAL_DATA_PATH, "utf8");
    return JSON.parse(raw) as InventoryData;
  } catch {
    return null;
  }
}

export async function getPublicInventoryUrl(): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const meta = await head(BLOB_PATH);
    return meta.url;
  } catch {
    return null;
  }
}
