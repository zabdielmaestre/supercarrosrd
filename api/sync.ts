import type { VercelRequest, VercelResponse } from "@vercel/node";
import { scrapeDealerInventory } from "../lib/scraper.js";
import { getPublicInventoryUrl, loadInventory, saveInventory } from "../lib/storage.js";

function isAuthorized(req: VercelRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

  const auth = req.headers.authorization;
  if (auth === `Bearer ${secret}`) return true;

  // Vercel Cron también puede enviar el secreto en este header
  const cronHeader = req.headers["x-vercel-cron-secret"];
  return cronHeader === secret;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const dealerSlug = (req.query.dealer as string) || process.env.DEALER_SLUG || "promovil";
    const previous = await loadInventory();
    const data = await scrapeDealerInventory(dealerSlug, { includeDetails: true });

    const saveResult = await saveInventory(data);
    const blobUrl = await getPublicInventoryUrl();

    return res.status(200).json({
      ok: true,
      dealer: data.dealer.name,
      total: data.total,
      updatedAt: data.updatedAt,
      previousUpdatedAt: previous?.updatedAt ?? null,
      storage: saveResult,
      blobUrl,
      endpoints: {
        vehicles: "/api/vehicles",
        sync: "/api/sync",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return res.status(500).json({ ok: false, error: message });
  }
}
