import { Route, Routes } from "react-router-dom";
import CatalogPage from "./pages/CatalogPage";
import DetailPage from "./pages/DetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/vehiculo/:id" element={<DetailPage />} />
    </Routes>
  );
}
