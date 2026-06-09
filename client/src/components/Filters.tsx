import type { FilterState, SortOption } from "../types";

interface FiltersProps {
  filters: FilterState;
  brands: string[];
  fuels: string[];
  onChange: (filters: FilterState) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "year-desc", label: "Año: más reciente" },
  { value: "year-asc", label: "Año: más antiguo" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
];

export default function Filters({ filters, brands, fuels, onChange }: FiltersProps) {
  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <section className="filters">
      <div className="field">
        <label htmlFor="search">Buscar</label>
        <input
          id="search"
          type="search"
          placeholder="Marca, modelo, tipo..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="brand">Marca</label>
        <select
          id="brand"
          value={filters.brand}
          onChange={(e) => update({ brand: e.target.value })}
        >
          <option value="">Todas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="fuel">Combustible</label>
        <select
          id="fuel"
          value={filters.fuel}
          onChange={(e) => update({ fuel: e.target.value })}
        >
          <option value="">Todos</option>
          {fuels.map((fuel) => (
            <option key={fuel} value={fuel}>
              {fuel}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="sort">Ordenar</label>
        <select
          id="sort"
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value as SortOption })}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
