import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import Home from "../pages/Home";
import UsuariosPage from "../pages/UsuariosPage";
import RolesPage from "../pages/RolesPage";
import ConductoresPage from "../pages/ConductoresPage";
import UnidadesPage from "../pages/UnidadesPage";
import RutasPage from "../pages/RutasPage";
import AsignacionesPage from "../pages/AsignacionesPage";
import IncidenciasPage from "../pages/IncidenciasPage";
import UnidadesConductoresPage from "../pages/UnidadesConductoresPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="conductores" element={<ConductoresPage />} />
          <Route path="unidades" element={<UnidadesPage />} />
          <Route path="rutas" element={<RutasPage />} />
          <Route path="asignaciones" element={<AsignacionesPage />} />
          <Route path="incidencias" element={<IncidenciasPage />} />
          <Route path="asignaciones" element={<UnidadesConductoresPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
