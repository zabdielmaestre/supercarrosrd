import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supercarrosImageUrl } from "../lib/photos.js";
import { stripSupercarrosWatermark } from "../lib/watermark.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const photoId = req.query.photoId as string;
  const size = (req.query.size as string) || "1024x768";
  const wmo = (req.query.wmo as string) || undefined;

  if (!photoId || !/^\d+$/.test(photoId)) {
    return res.status(400).json({ error: "photoId inválido" });
  }

  try {
    const sourceUrl = supercarrosImageUrl(photoId, size, wmo);
    const response = await fetch(sourceUrl, {
      headers: { "User-Agent": "supercarrosrd-image-proxy/1.0" },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Imagen no encontrada" });
    }

    const original = Buffer.from(await response.arrayBuffer());
    const output = wmo
      ? original
      : await stripSupercarrosWatermark(original);

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).send(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return res.status(500).json({ error: message });
  }
}
