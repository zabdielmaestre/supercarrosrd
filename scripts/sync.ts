import { scrapeDealerInventory } from "../lib/scraper.js";
import { saveInventory } from "../lib/storage.js";

const dealerSlug = process.env.DEALER_SLUG ?? "parraautoimport";

console.log(`Sincronizando inventario de ${dealerSlug}...`);

const data = await scrapeDealerInventory(dealerSlug, { includeDetails: true });
const saveResult = await saveInventory(data);

console.log(`Listo: ${data.total} vehículos procesados.`);
if (saveResult.stored) {
  console.log(`Guardado via: ${saveResult.method}`);
} else {
  console.log(saveResult.message ?? "No se pudo persistir el JSON.");
}
console.log(`Actualizado: ${data.updatedAt}`);
console.log(`Dealer: ${data.dealer.name}`);
