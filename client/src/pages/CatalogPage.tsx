import { useMemo, useState } from "react";
import Filters from "../components/Filters";
import Header from "../components/Header";
import VehicleCard from "../components/VehicleCard";
import { useInventory } from "../hooks/useInventory";
import {
  defaultFilters,
  filterVehicles,
  getUniqueBrands,
  getUniqueFuels,
  sortVehicles,
} from "../utils/filters";

export default function CatalogPage() {
  const { data, loading, error } = useInventory();
  const [filters, setFilters] = useState(defaultFilters);

  const vehicles = useMemo(() => {
    if (!data) return [];
    const filtered = filterVehicles(data.vehicles, filters);
    return sortVehicles(filtered, filters.sort);
  }, [data, filters]);

  const brands = useMemo(
    () => (data ? getUniqueBrands(data.vehicles) : []),
    [data]
  );

  const fuels = useMemo(
    () => (data ? getUniqueFuels(data.vehicles) : []),
    [data]
  );

  if (loading) {
    return <div className="loading">Cargando inventario...</div>;
  }

  if (error || !data) {
    return <div className="error">{error ?? "Error al cargar datos"}</div>;
  }

  return (
    <div className="page">
      <Header dealer={data.dealer} count={vehicles.length} />

      <main className="container">
        <section className="hero">
          <h2>Encuentra tu próximo vehículo</h2>
          <p>
            Explora el inventario completo con fotos, especificaciones y precios
            actualizados.
          </p>
        </section>

        <Filters
          filters={filters}
          brands={brands}
          fuels={fuels}
          onChange={setFilters}
        />

        <div className="results-bar">
          <span>
            Mostrando <strong>{vehicles.length}</strong> de {data.total}{" "}
            vehículos
          </span>
        </div>

        {vehicles.length === 0 ? (
          <div className="empty">
            No hay vehículos que coincidan con los filtros seleccionados.
          </div>
        ) : (
          <section className="grid">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
