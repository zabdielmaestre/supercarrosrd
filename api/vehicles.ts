import type { VercelRequest, VercelResponse } from "@vercel/node";
import { loadInventory } from "../lib/storage.js";
import { scrapeDealerInventory } from "../lib/scraper.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const forceRefresh = req.query.refresh === "1";
    const details = req.query.details !== "0";
    const dealerSlug = (req.query.dealer as string) || process.env.DEALER_SLUG || "promovil";

    let data = forceRefresh ? null : await loadInventory();

    if (data && data.dealer.slug !== dealerSlug) {
      data = null;
    }

    if (!data) {
      data = await scrapeDealerInventory(dealerSlug, { includeDetails: details });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
    res.setHeader("CDN-Cache-Control", "no-store");
    res.setHeader("Vercel-CDN-Cache-Control", "no-store");
    return res.status(200).json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return res.status(500).json({ error: message });
  }
}
