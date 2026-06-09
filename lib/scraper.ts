import * as cheerio from "cheerio";
import type {
  DealerInfo,
  InventoryData,
  Vehicle,
  VehiclePhoto,
  VehiclePrice,
  VehicleSpecs,
  VehicleSummary,
} from "./types.js";

const BASE_URL = "https://www.supercarros.com";
const DEFAULT_DEALER_SLUG = "promovil";
const USER_AGENT =
  "supercarrosrd-sync/1.0 (+https://github.com/supercarrosrd)";

function decodeHtml(text: string): string {
  return cheerio.load(`<div>${text}</div>`)("div").text().trim();
}

function parsePrice(raw: string): VehiclePrice {
  const formatted = decodeHtml(raw).replace(/\s+/g, " ").trim();
  const match = formatted.match(/^(RD\$|US\$)\s*([\d,]+(?:\.\d+)?)/);
  if (!match) {
    return { formatted, amount: null, currency: "RD$" };
  }

  const currency = match[1];
  const amount = Number(match[2].replace(/,/g, ""));
  return { formatted, amount: Number.isFinite(amount) ? amount : null, currency };
}

function parseListingTitle(titleHtml: string): {
  year: number | null;
  brand: string;
  model: string;
  title: string;
} {
  const text = decodeHtml(titleHtml.replace(/<br\s*\/?>/gi, " "));

  const yearFirst = text.match(/^(\d{4})\s+(.+)$/);
  if (yearFirst) {
    const year = Number(yearFirst[1]);
    const rest = yearFirst[2].trim();
    const [brand, ...modelParts] = rest.split(/\s+/);
    const model = modelParts.join(" ");
    return {
      year: Number.isFinite(year) ? year : null,
      brand,
      model,
      title: text,
    };
  }

  const yearLast = text.match(/^(.+?)\s+(\d{4})$/);
  if (yearLast) {
    const year = Number(yearLast[2]);
    const rest = yearLast[1].trim();
    const [brand, ...modelParts] = rest.split(/\s+/);
    const model = modelParts.join(" ");
    return {
      year: Number.isFinite(year) ? year : null,
      brand,
      model,
      title: text,
    };
  }

  return { year: null, brand: text, model: "", title: text };
}

function parseVehicleUrl(path: string): { slug: string; id: string } {
  const clean = path.replace(/\/$/, "");
  const id = clean.split("/").pop() ?? "";
  const slug = clean.split("/").slice(0, -1).pop() ?? "";
  return { slug, id };
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} al obtener ${url}`);
  }

  return response.text();
}

function extractDealerInfo($: cheerio.CheerioAPI, slug: string): DealerInfo {
  const name = decodeHtml($("#detail-right h3").first().text());
  const phone = decodeHtml($("#detail-right li label:contains('Tel:')").first().parent().text().replace(/^Tel:\s*/i, ""));
  const whatsapp = $("#detail-right li label:contains('WhatsApp:')")
    .map((_, el) => decodeHtml($(el).parent().find("a").first().text()))
    .get()
    .filter(Boolean);
  const email = decodeHtml($("#detail-right li label:contains('Email:')").first().parent().find("a").text());
  const address = decodeHtml($("#detail-right li.address").first().text());
  const logo = $("#detail-right .logo img").attr("src");

  return {
    slug,
    name: name || "Dealer",
    phone: phone || undefined,
    whatsapp: whatsapp.length ? [...new Set(whatsapp)] : undefined,
    email: email || undefined,
    address: address || undefined,
    logo: logo || undefined,
    url: `${BASE_URL}/dealers/${slug}/`,
  };
}

function extractListingSummaries($: cheerio.CheerioAPI): VehicleSummary[] {
  const vehicles: VehicleSummary[] = [];

  $(".generic-results-dealer ul > li").each((_, li) => {
    const item = $(li);
    const link = item.find("a").first();
    const href = link.attr("href");
    if (!href) return;

    const { slug, id } = parseVehicleUrl(href);
    const titleHtml = link.find(".title1").html() ?? "";
    const priceRaw = link.find(".title3").text();
    const thumbnail = link.find("img").attr("src") ?? "";
    const parsedTitle = parseListingTitle(titleHtml);

    vehicles.push({
      id,
      slug,
      url: `${BASE_URL}${href.startsWith("/") ? href : `/${href}`}`,
      title: parsedTitle.title,
      year: parsedTitle.year,
      brand: parsedTitle.brand,
      model: parsedTitle.model,
      price: parsePrice(priceRaw),
      thumbnail,
      hasVideo: item.hasClass("video"),
    });
  });

  return vehicles;
}

function extractPhotos($: cheerio.CheerioAPI): VehiclePhoto[] {
  const photos = new Map<string, VehiclePhoto>();

  $("#detail-ad-info-photos a[data-photo]").each((_, el) => {
    const anchor = $(el);
    const id = anchor.attr("data-photo");
    const full = anchor.attr("href");
    if (!id || !full) return;

    const thumb = anchor.find("img").attr("src") ?? "";
    const large = full.replace("/1024x768/", "/800x600/");

    photos.set(id, { id, full, large, thumb });
  });

  return [...photos.values()];
}

function extractSpecsTable($: cheerio.CheerioAPI): VehicleSpecs {
  const specs: VehicleSpecs = {};
  const table = $("#detail-ad-info-specs table").first();

  table.find("tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;

    for (let i = 0; i < cells.length - 1; i += 2) {
      const label = decodeHtml($(cells[i]).find("label").text() || $(cells[i]).text())
        .replace(":", "")
        .trim()
        .toLowerCase();
      const value = decodeHtml($(cells[i + 1]).text());
      if (!label || !value) continue;

      switch (label) {
        case "motor":
          specs.motor = value;
          break;
        case "exterior":
          specs.exterior = value;
          break;
        case "interior":
          specs.interior = value;
          break;
        case "tipo":
          specs.tipo = value;
          break;
        case "uso":
          specs.uso = value;
          break;
        case "combustible":
          specs.combustible = value;
          break;
        case "carga":
          specs.carga = value;
          break;
        case "transmisión":
        case "transmision":
          specs.transmision = value;
          break;
        case "puertas":
          specs.puertas = value;
          break;
        case "tracción":
        case "traccion":
          specs.traccion = value;
          break;
        case "pasajeros":
          specs.pasajeros = value;
          break;
      }
    }
  });

  specs.highlights = $("#detail-ad-info-specs > .detail-ad-info-specs-block")
    .first()
    .find("strong")
    .map((_, el) => decodeHtml($(el).text()))
    .get()
    .filter(Boolean);

  return specs;
}

function extractAccessories($: cheerio.CheerioAPI): string[] {
  return $("h3")
    .filter((_, el) => decodeHtml($(el).text()).toLowerCase() === "accesorios")
    .first()
    .parent()
    .find("ul > li")
    .map((_, el) => decodeHtml($(el).text()))
    .get()
    .filter((item) => item && !item.includes("SuperCarros.com") && !item.includes("."));
}

function extractDescription($: cheerio.CheerioAPI): string {
  const block = $("h3")
    .filter((_, el) => decodeHtml($(el).text()).toLowerCase() === "observaciones")
    .first()
    .parent()
    .find("p")
    .first();

  return decodeHtml(block.html() ?? block.text()).replace(/\s+\n/g, "\n").trim();
}

async function fetchVehicleDetail(summary: VehicleSummary): Promise<Vehicle> {
  const html = await fetchHtml(summary.url);
  const $ = cheerio.load(html);

  const headerTitle = decodeHtml($("#detail-ad-header h1").text());
  const headerPrice = parsePrice($("#detail-ad-header h3").text());
  const adMeta = decodeHtml($("#detail-ad-header div").first().text());
  const adMatch = adMeta.match(/#(\d+)/);
  const viewsMatch = adMeta.match(/(\d+)\s+veces/i);

  const parsedHeader = parseListingTitle(headerTitle);

  return {
    ...summary,
    title: headerTitle || summary.title,
    year: parsedHeader.year ?? summary.year,
    brand: parsedHeader.brand || summary.brand,
    model: parsedHeader.model || summary.model,
    price: headerPrice.formatted ? headerPrice : summary.price,
    adNumber: adMatch?.[1] ?? summary.id,
    views: viewsMatch ? Number(viewsMatch[1]) : null,
    photos: extractPhotos($),
    specs: extractSpecsTable($),
    accessories: extractAccessories($),
    description: extractDescription($),
  };
}

export async function scrapeDealerInventory(
  dealerSlug = process.env.DEALER_SLUG ?? DEFAULT_DEALER_SLUG,
  options?: { includeDetails?: boolean; concurrency?: number }
): Promise<InventoryData> {
  const includeDetails = options?.includeDetails ?? true;
  const concurrency = options?.concurrency ?? 3;

  const firstPageHtml = await fetchHtml(`${BASE_URL}/dealers/${dealerSlug}/`);
  const firstPage = cheerio.load(firstPageHtml);
  const dealer = extractDealerInfo(firstPage, dealerSlug);
  const summaries = extractListingSummaries(firstPage);

  let page = 1;
  while (true) {
    const url = `${BASE_URL}/dealers/${dealerSlug}/?PagingPageSkip=${page}`;
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);
    const pageItems = extractListingSummaries($);
    if (!pageItems.length) break;
    summaries.push(...pageItems);

    const hasNext = $(".generic-results-bar-pages a")
      .toArray()
      .some((el) => ($(el).attr("href") ?? "").includes(`PagingPageSkip=${page + 1}`));

    if (!hasNext) break;
    page += 1;
  }

  const uniqueSummaries = [...new Map(summaries.map((v) => [v.id, v])).values()];

  let vehicles: Vehicle[];

  if (!includeDetails) {
    vehicles = uniqueSummaries.map((summary) => ({
      ...summary,
      adNumber: summary.id,
      views: null,
      photos: summary.thumbnail
        ? [
            {
              id: summary.id,
              full: summary.thumbnail.replace("/282x188/", "/1024x768/"),
              large: summary.thumbnail.replace("/282x188/", "/800x600/"),
              thumb: summary.thumbnail,
            },
          ]
        : [],
      specs: {},
      accessories: [],
      description: "",
    }));
  } else {
    vehicles = [];
    for (let i = 0; i < uniqueSummaries.length; i += concurrency) {
      const batch = uniqueSummaries.slice(i, i + concurrency);
      const details = await Promise.all(batch.map((summary) => fetchVehicleDetail(summary)));
      vehicles.push(...details);
    }
  }

  return {
    dealer,
    updatedAt: new Date().toISOString(),
    total: vehicles.length,
    vehicles,
  };
}
