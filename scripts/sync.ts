import { scrapeDealerInventory } from "../lib/scraper.js";
import { saveInventory } from "../lib/storage.js";

const dealerSlug = process.env.DEALER_SLUG ?? "parraautoimport";

console.log(`Sincronizando inventario de ${dealerSlug}...`);

const data = await scrapeDealerInventory(dealerSlug, { includeDetails: true });
await saveInventory(data);

console.log(`Listo: ${data.total} vehículos guardados.`);
console.log(`Actualizado: ${data.updatedAt}`);
console.log(`Dealer: ${data.dealer.name}`);
