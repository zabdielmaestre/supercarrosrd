# SuperCarros RD — API de inventario

Sincroniza el inventario de un dealer de [SuperCarros.com](https://www.supercarros.com) y lo expone como JSON vía API en Vercel.

**Dealer por defecto:** [Kelvyn Parra Auto Import](https://www.supercarros.com/dealers/parraautoimport/)

## Endpoints

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/vehicles` | Devuelve el JSON con todos los vehículos |
| `GET /api/vehicles?refresh=1` | Fuerza scrape en vivo (sin usar caché guardada) |
| `GET /api/vehicles?details=0` | Solo listado básico, sin entrar a cada anuncio |
| `GET /api/sync` | Sincroniza y guarda el JSON (protegido con `CRON_SECRET`) |

## Estructura del JSON

```json
{
  "dealer": {
    "slug": "parraautoimport",
    "name": "Kelvyn Parra Auto Import",
    "phone": "809-536-2015",
    "url": "https://www.supercarros.com/dealers/parraautoimport/"
  },
  "updatedAt": "2026-06-09T12:00:00.000Z",
  "total": 30,
  "vehicles": [
    {
      "id": "1610459",
      "title": "Toyota FJ Cruiser 2007",
      "year": 2007,
      "brand": "Toyota",
      "model": "FJ Cruiser",
      "price": { "formatted": "RD$ 980,000", "amount": 980000, "currency": "RD$" },
      "thumbnail": "https://img.supercarros.com/AdsPhotos/282x188/5/14512351.jpg",
      "photos": [
        {
          "id": "14512351",
          "full": "https://img.supercarros.com/AdsPhotos/1024x768/0/14512351.jpg",
          "large": "https://img.supercarros.com/AdsPhotos/800x600/5/14512351.jpg",
          "thumb": "https://img.supercarros.com/AdsPhotos/188x125/5/14512351.jpg"
        }
      ],
      "specs": { "combustible": "Gasolina", "transmision": "Automática" },
      "accessories": ["Aire acondicionado", "..."],
      "description": "..."
    }
  ]
}
```

## Uso local

```bash
npm install
cp .env.example .env
npm run sync          # genera data/vehicles.json
npm run dev           # levanta API en http://localhost:3000
```

Luego abre: `http://localhost:3000/api/vehicles`

## Deploy en Vercel

1. Sube el repo a GitHub y conéctalo en [vercel.com](https://vercel.com)
2. En **Settings → Environment Variables** agrega:
   - `DEALER_SLUG` = `parraautoimport`
   - `CRON_SECRET` = un string aleatorio largo
3. (Recomendado) Conecta **Vercel Blob** en el proyecto para que el JSON persista entre invocaciones
4. Deploy

El cron en `vercel.json` ejecuta `/api/sync` una vez al día (8:00 UTC). En el plan Hobby de Vercel solo se permite un cron diario.

### Sincronización manual

```bash
curl -H "Authorization: Bearer TU_CRON_SECRET" https://tu-proyecto.vercel.app/api/sync
```

## Notas importantes

- SuperCarros **no tiene API pública**. Este proyecto hace scraping del HTML público del dealer.
- Respeta los términos de uso del sitio y no abuses de la frecuencia de sincronización.
- Las fotos se referencian desde `img.supercarros.com` (no se descargan localmente).
- Si no configuras Vercel Blob, `/api/vehicles` hará scrape en cada request cache miss.
