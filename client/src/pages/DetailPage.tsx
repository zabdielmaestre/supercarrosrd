import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import PhotoGallery from "../components/PhotoGallery";
import { useInventory } from "../hooks/useInventory";

const specFields: { key: keyof import("../types").VehicleSpecs; label: string }[] = [
  { key: "combustible", label: "Combustible" },
  { key: "transmision", label: "Transmisión" },
  { key: "traccion", label: "Tracción" },
  { key: "motor", label: "Motor" },
  { key: "exterior", label: "Exterior" },
  { key: "interior", label: "Interior" },
  { key: "tipo", label: "Tipo" },
  { key: "uso", label: "Uso" },
  { key: "puertas", label: "Puertas" },
  { key: "pasajeros", label: "Pasajeros" },
];

function whatsappLink(number: string, message: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useInventory();

  if (loading) {
    return <div className="loading">Cargando vehículo...</div>;
  }

  if (error || !data) {
    return <div className="error">{error ?? "Error al cargar datos"}</div>;
  }

  const vehicle = data.vehicles.find((v) => v.id === id);

  if (!vehicle) {
    return (
      <div className="page">
        <Header dealer={data.dealer} />
        <main className="container">
          <Link to="/" className="back-link">
            ← Volver al catálogo
          </Link>
          <div className="empty">Vehículo no encontrado.</div>
        </main>
      </div>
    );
  }

  const specs = specFields
    .map(({ key, label }) => ({
      label,
      value: vehicle.specs[key],
    }))
    .filter((item) => item.value);

  const contactMessage = `Hola, me interesa el ${vehicle.title} (#${vehicle.adNumber})`;

  return (
    <div className="page">
      <Header dealer={data.dealer} />

      <main className="container">
        <Link to="/" className="back-link">
          ← Volver al catálogo
        </Link>

        <div className="detail-layout">
          <section className="detail-panel">
            <PhotoGallery photos={vehicle.photos} title={vehicle.title} />
          </section>

          <section className="detail-panel">
            <h1 className="detail-title">{vehicle.title}</h1>
            <p className="detail-price">{vehicle.price.formatted}</p>
            <p className="detail-sub">
              Anuncio #{vehicle.adNumber}
              {vehicle.views ? ` · ${vehicle.views} visitas` : ""}
            </p>

            {specs.length > 0 && (
              <div className="specs-grid">
                {specs.map((spec) => (
                  <div key={spec.label} className="spec-item">
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {vehicle.accessories.length > 0 && (
              <>
                <h2 className="section-title">Accesorios</h2>
                <div className="chips">
                  {vehicle.accessories.map((item) => (
                    <span key={item} className="chip">
                      {item}
                    </span>
                  ))}
                </div>
              </>
            )}

            {vehicle.description && (
              <>
                <h2 className="section-title">Descripción</h2>
                <p className="description">{vehicle.description}</p>
              </>
            )}

            <div className="contact-actions">
              {data.dealer.whatsapp?.map((number) => (
                <a
                  key={number}
                  href={whatsappLink(number, contactMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                >
                  WhatsApp {number}
                </a>
              ))}
              {data.dealer.phone && (
                <a href={`tel:${data.dealer.phone}`} className="btn btn-secondary">
                  Llamar {data.dealer.phone}
                </a>
              )}
              <a
                href={vehicle.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
              >
                Ver en SuperCarros
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
