import { Outlet, NavLink } from "react-router-dom";
import "../styles.css";

export default function DashboardLayout() {
  const menu = [
    { label: "Inicio", path: "/" },
    { label: "Usuarios", path: "/usuarios" },
    { label: "Roles", path: "/roles" },
    { label: "Conductores", path: "/conductores" },
    { label: "Unidades", path: "/unidades" },
    { label: "Rutas", path: "/rutas" },
    { label: "Asignaciones", path: "/asignaciones" },
    { label: "Incidencias", path: "/incidencias" },
    { label: "Reportes", path: "/reportes" },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>🚍 Empresa de Transporte Doña Chio</h2>
        <nav>
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-content">
        <header className="navbar">
          <h1>Panel de Administración</h1>
          <div className="user">
            <span>Administrador</span>
            <img src="https://i.pravatar.cc/40" alt="avatar" />
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
