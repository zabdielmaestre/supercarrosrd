import { Link } from "react-router-dom";
import type { Vehicle } from "../types";
import { vehicleCardImage } from "../utils/photos";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const tags = [
    vehicle.specs.combustible,
    vehicle.specs.transmision,
    vehicle.specs.tipo,
  ].filter(Boolean);

  return (
    <Link to={`/vehiculo/${vehicle.id}`} className="card">
      <div className="card-image-wrap">
        <img
          src={vehicleCardImage(vehicle)}
          alt={vehicle.title}
          className="card-image"
          loading="lazy"
        />
        {vehicle.year && <span className="card-badge">{vehicle.year}</span>}
      </div>
      <div className="card-body">
        <h3 className="card-title">{vehicle.title}</h3>
        <p className="card-meta">
          {vehicle.brand} {vehicle.model}
          {vehicle.specs.uso ? ` · ${vehicle.specs.uso}` : ""}
        </p>
        <p className="card-price">{vehicle.price.formatted}</p>
        {tags.length > 0 && (
          <div className="card-tags">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
