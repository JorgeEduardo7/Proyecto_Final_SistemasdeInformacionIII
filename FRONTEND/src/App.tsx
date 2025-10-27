import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import UsuariosPage from "./pages/UsuariosPage";
import RolesPage from "./pages/RolesPage";
import ConductoresPage from "./pages/ConductoresPage";
import UnidadesPage from "./pages/UnidadesPage";
import RutasPage from "./pages/RutasPage";
import AsignacionesPage from "./pages/AsignacionesPage";
import IncidenciasPage from "./pages/IncidenciasPage";
import UnidadesConductoresPage from "./pages/UnidadesConductoresPage";
import Home from "./pages/Home";
import { isAuthenticated, getCurrentUser, logout } from "./services/authService";

// Componente para proteger rutas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Componente del Layout Principal
function MainLayout() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setUsuario(user);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">🚐 TRANSPORTES DOÑA CHIO</h2>
        <nav className="menu">
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            🏠 Inicio
          </NavLink>
          <NavLink to="/usuarios" className={({ isActive }) => (isActive ? "active" : "")}>
            👥 Usuarios
          </NavLink>
          <NavLink to="/roles" className={({ isActive }) => (isActive ? "active" : "")}>
            🔐 Roles
          </NavLink>
          <NavLink to="/conductores" className={({ isActive }) => (isActive ? "active" : "")}>
            👨‍✈️ Conductores
          </NavLink>
          <NavLink to="/unidades" className={({ isActive }) => (isActive ? "active" : "")}>
            🚐 Unidades
          </NavLink>
          <NavLink to="/rutas" className={({ isActive }) => (isActive ? "active" : "")}>
            🗺️ Rutas
          </NavLink>
          <NavLink to="/unidadesconductores" className={({ isActive }) => (isActive ? "active" : "")}>
            🔗 Asignaciones U-C
          </NavLink>
          <NavLink to="/asignaciones" className={({ isActive }) => (isActive ? "active" : "")}>
            📋 Asignaciones Rutas
          </NavLink>
          <NavLink to="/incidencias" className={({ isActive }) => (isActive ? "active" : "")}>
            ⚠️ Incidencias
          </NavLink>
        </nav>

        {/* Botón de cerrar sesión en el sidebar */}
        <div style={{ 
          marginTop: 'auto', 
          padding: '1rem', 
          borderTop: '1px solid rgba(255,255,255,0.1)' 
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(232, 123, 133, 0.2)',
              border: '1px solid rgba(232, 123, 133, 0.4)',
              borderRadius: '0.5rem',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(232, 123, 133, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(232, 123, 133, 0.2)';
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        <header className="navbar">
          <h1 className="app-title">Sistema de Monitoreo de Flota</h1>
          <div className="user-info">
            <span>{usuario?.nombre || "Usuario"}</span>
            <span style={{
              fontSize: '0.75rem',
              background: 'var(--color-primary)',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontWeight: '600'
            }}>
              {usuario?.rolNombre || "Admin"}
            </span>
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(usuario?.nombre || 'U')}&background=004E89&color=fff`} 
              alt="Avatar del usuario" 
            />
          </div>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/conductores" element={<ConductoresPage />} />
            <Route path="/unidades" element={<UnidadesPage />} />
            <Route path="/rutas" element={<RutasPage />} />
            <Route path="/asignaciones" element={<AsignacionesPage />} />
            <Route path="/incidencias" element={<IncidenciasPage />} />
            <Route path="/unidadesconductores" element={<UnidadesConductoresPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública de Login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}