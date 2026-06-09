export interface DealerInfo {
  slug: string;
  name: string;
  phone?: string;
  whatsapp?: string[];
  email?: string;
  address?: string;
  logo?: string;
  url: string;
}

export interface VehiclePrice {
  formatted: string;
  amount: number | null;
  currency: "RD$" | "US$" | string;
}

export interface VehiclePhoto {
  id: string;
  full: string;
  large: string;
  thumb: string;
}

export interface VehicleSpecs {
  motor?: string;
  exterior?: string;
  interior?: string;
  tipo?: string;
  uso?: string;
  combustible?: string;
  carga?: string;
  transmision?: string;
  puertas?: string;
  traccion?: string;
  pasajeros?: string;
  highlights?: string[];
}

export interface VehicleSummary {
  id: string;
  slug: string;
  url: string;
  title: string;
  year: number | null;
  brand: string;
  model: string;
  price: VehiclePrice;
  thumbnail: string;
  hasVideo: boolean;
}

export interface Vehicle extends VehicleSummary {
  adNumber: string;
  views: number | null;
  photos: VehiclePhoto[];
  specs: VehicleSpecs;
  accessories: string[];
  description: string;
}

export interface InventoryData {
  dealer: DealerInfo;
  updatedAt: string;
  total: number;
  vehicles: Vehicle[];
}
