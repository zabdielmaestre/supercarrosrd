import sharp from "sharp";

/** Oculta la marca de agua de SuperCarros en la esquina inferior derecha. */
export async function stripSupercarrosWatermark(input: Buffer): Promise<Buffer> {
  const image = sharp(input);
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  if (!width || !height) return input;

  const wmW = Math.max(72, Math.round(width * 0.24));
  const wmH = Math.max(48, Math.round(height * 0.16));
  const left = width - wmW;
  const top = height - wmH;

  const patch = await sharp(input)
    .extract({
      left: Math.max(0, left - wmW),
      top: Math.max(0, top - Math.round(wmH * 0.6)),
      width: wmW,
      height: wmH,
    })
    .blur(5)
    .toBuffer();

  return sharp(input)
    .composite([{ input: patch, left, top }])
    .jpeg({ quality: 90 })
    .toBuffer();
}
