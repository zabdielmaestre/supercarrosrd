import { Link } from "react-router-dom";
import type { DealerInfo } from "../types";

interface HeaderProps {
  dealer: DealerInfo;
  count?: number;
}

export default function Header({ dealer, count }: HeaderProps) {
  return (
    <header className="header">
      <div className="container header-top">
        <Link to="/" className="brand-lockup">
          {dealer.logo && (
            <img src={dealer.logo} alt={dealer.name} className="brand-logo" />
          )}
          <div>
            <p className="brand-name">{dealer.name}</p>
            <p className="brand-sub">Inventario de vehículos</p>
          </div>
        </Link>
        {count !== undefined && (
          <p className="header-meta">{count} vehículos disponibles</p>
        )}
      </div>
    </header>
  );
}
