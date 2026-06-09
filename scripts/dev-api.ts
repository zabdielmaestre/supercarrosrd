import http from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT ?? 3001);
const dataPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
  "vehicles.json"
);

const server = http.createServer(async (req, res) => {
  if (req.url?.startsWith("/api/vehicles")) {
    try {
      const data = await readFile(dataPath, "utf8");
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      });
      res.end(data);
      return;
    } catch {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error:
            "No hay data/vehicles.json. Ejecuta primero: npm run sync",
        })
      );
      return;
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(port, () => {
  console.log(`API local: http://localhost:${port}/api/vehicles`);
});
