import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getConductores,
  createConductor,
  updateConductor,
  searchConductores,
} from "../services/conductoresService";

export default function ConductoresPage() {
  const [conductores, setConductores] = useState<any[]>([]);
  const [nuevo, setNuevo] = useState({
    nombre: "",
    cedula: "",
    licencia: "",
    telefono: "",
    direccion: "",
    estado: "Activo",
  });

  const [busqueda, setBusqueda] = useState({
    nombre: "",
    cedula: "",
    licencia: "",
    estado: "",
  });

  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getConductores();
      setConductores(data);
    } catch {
      Swal.fire("Error", "No se pudieron obtener los conductores", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resultados = await searchConductores(busqueda);
      setConductores(resultados);
    } catch {
      Swal.fire("Error", "No se pudo realizar la búsqueda", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setBusqueda({ nombre: "", cedula: "", licencia: "", estado: "" });
    cargar();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo.nombre || !nuevo.cedula || !nuevo.licencia)
      return Swal.fire(
        "Campos requeridos",
        "Nombre, cédula y licencia son obligatorios",
        "warning"
      );

    try {
      await createConductor(nuevo);
      setNuevo({
        nombre: "",
        cedula: "",
        licencia: "",
        telefono: "",
        direccion: "",
        estado: "Activo",
      });
      cargar();
      Swal.fire("Éxito", "Conductor creado correctamente", "success");
    } catch {
      Swal.fire("Error", "No se pudo crear el conductor", "error");
    }
  };

  const handleUpdate = async (c: any) => {
    const { value: formValues } = await Swal.fire({
      title: "Editar Conductor",
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Nombre</label>
            <input id="swal-nombre" class="swal2-input" style="width: 100%; margin: 0;" placeholder="Nombre" value="${c.nombre}">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Teléfono</label>
            <input id="swal-telefono" class="swal2-input" style="width: 100%; margin: 0;" placeholder="Teléfono" value="${c.telefono || ""}">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Dirección</label>
            <input id="swal-direccion" class="swal2-input" style="width: 100%; margin: 0;" placeholder="Dirección" value="${c.direccion || ""}">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Licencia</label>
            <input id="swal-licencia" class="swal2-input" style="width: 100%; margin: 0;" placeholder="Licencia" value="${c.licencia}">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Estado</label>
            <select id="swal-estado" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="Activo" ${c.estado === "Activo" ? "selected" : ""}>Activo</option>
              <option value="Inactivo" ${c.estado === "Inactivo" ? "selected" : ""}>Inactivo</option>
            </select>
          </div>
        </div>
      `,
      width: '600px',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          nombre: (document.getElementById("swal-nombre") as HTMLInputElement).value,
          telefono: (document.getElementById("swal-telefono") as HTMLInputElement).value,
          direccion: (document.getElementById("swal-direccion") as HTMLInputElement).value,
          licencia: (document.getElementById("swal-licencia") as HTMLInputElement).value,
          estado: (document.getElementById("swal-estado") as HTMLSelectElement).value,
        };
      },
    });

    if (formValues) {
      try {
        await updateConductor(c.conductorId, { ...c, ...formValues });
        Swal.fire("Actualizado", "Conductor modificado correctamente", "success");
        cargar();
      } catch {
        Swal.fire("Error", "No se pudo actualizar el conductor", "error");
      }
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <h1>👨‍✈️ Gestión de Conductores</h1>
      </div>

      {/* Buscador */}
      <div className="search-container">
        <div className="search-header">
          <h2 className="search-title">🔍 Buscar Conductores</h2>
        </div>
        <form onSubmit={handleBuscar}>
          <div className="search-grid">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                placeholder="Buscar por nombre"
                value={busqueda.nombre}
                onChange={(e) => setBusqueda({ ...busqueda, nombre: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cédula</label>
              <input
                type="text"
                placeholder="Buscar por cédula"
                value={busqueda.cedula}
                onChange={(e) => setBusqueda({ ...busqueda, cedula: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Licencia</label>
              <input
                type="text"
                placeholder="Buscar por licencia"
                value={busqueda.licencia}
                onChange={(e) => setBusqueda({ ...busqueda, licencia: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                value={busqueda.estado}
                onChange={(e) => setBusqueda({ ...busqueda, estado: e.target.value })}
                className="form-select"
              >
                <option value="">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="search-actions">
            <button type="submit" className="btn btn-primary">
              🔍 Buscar
            </button>
            <button type="button" onClick={handleLimpiar} className="btn btn-outline">
              🗑️ Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Contador */}
      {!loading && (
        <div className="results-count">
          <p>Mostrando <strong>{conductores.length}</strong> conductor(es)</p>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Cargando conductores...</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Teléfono</th>
                  <th>Licencia</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {conductores.length > 0 ? (
                  conductores.map((c) => (
                    <tr key={c.conductorId}>
                      <td>{c.nombre}</td>
                      <td>{c.cedula}</td>
                      <td>{c.telefono || "No especificado"}</td>
                      <td>{c.licencia}</td>
                      <td>
                        <span className={`badge ${
                          c.estado === "Activo" ? "badge-success" : "badge-danger"
                        }`}>
                          {c.estado || "Activo"}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleUpdate(c)}
                          className="btn btn-primary btn-sm"
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h3 className="empty-state-title">No hay conductores registrados</h3>
                        <p className="empty-state-description">
                          Agrega un nuevo conductor usando el formulario
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="form-container">
        <div className="card-header">
          <h2 className="card-title">➕ Registrar Nuevo Conductor</h2>
        </div>
        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label form-label-required">Nombre</label>
              <input
                type="text"
                placeholder="Nombre completo"
                value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Cédula</label>
              <input
                type="text"
                placeholder="Número de cédula"
                value={nuevo.cedula}
                onChange={(e) => setNuevo({ ...nuevo, cedula: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Licencia</label>
              <input
                type="text"
                placeholder="Número de licencia"
                value={nuevo.licencia}
                onChange={(e) => setNuevo({ ...nuevo, licencia: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                placeholder="Número de teléfono"
                value={nuevo.telefono}
                onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group" style={{gridColumn: 'span 2'}}>
              <label className="form-label">Dirección</label>
              <input
                type="text"
                placeholder="Dirección completa"
                value={nuevo.direccion}
                onChange={(e) => setNuevo({ ...nuevo, direccion: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-success">
              💾 Guardar Conductor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}