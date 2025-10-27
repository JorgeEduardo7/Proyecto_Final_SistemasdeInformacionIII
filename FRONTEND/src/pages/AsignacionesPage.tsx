import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getAsignaciones, createAsignacion, updateAsignacion } from "../services/asignacionesService";
import { getUnidadesConductores } from "../services/unidadesConductoresService";
import { getRutas } from "../services/rutasService";
import { getUnidades } from "../services/unidadesService";
import { getConductores } from "../services/conductoresService";

export default function AsignacionesPage() {
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [unidadesConductores, setUnidadesConductores] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [conductores, setConductores] = useState<any[]>([]);
  const [rutas, setRutas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filtros, setFiltros] = useState({
    unidadConductorId: "",
    rutaHorarioId: "",
    estado: ""
  });

  const [nueva, setNueva] = useState({
    unidadConductorId: "",
    rutaHorarioId: "",
    fechaAsignacion: new Date().toISOString().split('T')[0],
    estado: "Activo"
  });

  const cargarDatos = async (filters?: any) => {
    setLoading(true);
    try {
      const [asignacionesData, unidadesConductoresData, unidadesData, conductoresData, rutasData] = await Promise.all([
        getAsignaciones(),
        getUnidadesConductores(),
        getUnidades(),
        getConductores(),
        getRutas()
      ]);
      
      let asignacionesFiltradas = asignacionesData;
      if (filters && Object.keys(filters).some(k => filters[k] !== undefined && String(filters[k]).trim() !== '')) {
        const { unidadConductorId, rutaHorarioId, estado } = filters;
        asignacionesFiltradas = (asignacionesData || []).filter((a: any) => {
          let ok = true;
          if (unidadConductorId && String(unidadConductorId).trim() !== '') {
            ok = ok && String(a.unidadConductorId) === String(unidadConductorId);
          }
          if (rutaHorarioId && String(rutaHorarioId).trim() !== '') {
            ok = ok && String(a.rutaHorarioId) === String(rutaHorarioId);
          }
          if (estado && String(estado).trim() !== '') {
            ok = ok && String((a.estado || 'Activo')).toLowerCase() === String(estado).toLowerCase();
          }
          return ok;
        });
      }
      
      setAsignaciones(asignacionesFiltradas);
      setUnidadesConductores(unidadesConductoresData);
      setUnidades(unidadesData);
      setConductores(conductoresData);
      setRutas(rutasData);
      
    } catch (error) {
      console.error("Error cargando datos:", error);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleBuscar = () => {
    cargarDatos(filtros);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      unidadConductorId: "",
      rutaHorarioId: "",
      estado: ""
    });
    cargarDatos();
  };

  const obtenerNombreUnidad = (unidadId: string) => {
    const unidad = unidades.find(u => u.unidadId === unidadId);
    return unidad ? `${unidad.placa} - ${unidad.modelo}` : `Unidad ID: ${unidadId}`;
  };

  const obtenerNombreConductor = (conductorId: string) => {
    const conductor = conductores.find(c => c.conductorId === conductorId);
    return conductor ? conductor.nombre : `Conductor ID: ${conductorId}`;
  };

  const obtenerInfoUnidadConductor = (unidadConductorId: string) => {
    const asignacionUC = unidadesConductores.find(uc => uc.unidadConductorId === unidadConductorId);
    
    if (!asignacionUC) {
      return `Asignación ID: ${unidadConductorId}`;
    }
    
    if (asignacionUC.unidad && asignacionUC.conductor) {
      const unidad = asignacionUC.unidad;
      const conductor = asignacionUC.conductor;
      return `${unidad.placa} - ${unidad.modelo} / ${conductor.nombre}`;
    }
    
    if (asignacionUC.unidadId && asignacionUC.conductorId) {
      const unidadNombre = obtenerNombreUnidad(asignacionUC.unidadId);
      const conductorNombre = obtenerNombreConductor(asignacionUC.conductorId);
      return `${unidadNombre} / ${conductorNombre}`;
    }
    
    return `Asignación ID: ${unidadConductorId}`;
  };

  const obtenerInfoRuta = (rutaHorarioId: string) => {
    const ruta = rutas.find(r => r.rutaHorarioId === rutaHorarioId);
    if (!ruta) return `Ruta ID: ${rutaHorarioId}`;
    
    const origen = ruta.origin || ruta.origen || "Origen no definido";
    const destino = ruta.destino || "Destino no definido";
    
    return `${ruta.nombre} (${origen} → ${destino})`;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nueva.unidadConductorId || !nueva.rutaHorarioId)
      return Swal.fire("Campos requeridos", "Selecciona una asignación y una ruta", "warning");

    try {
      const datosParaBackend = {
        unidadConductorId: nueva.unidadConductorId,
        rutaHorarioId: nueva.rutaHorarioId,
        fechaAsignacion: nueva.fechaAsignacion ? `${nueva.fechaAsignacion}T00:00:00.000Z` : new Date().toISOString(),
        estado: nueva.estado || "Activo"
      };
      
      await createAsignacion(datosParaBackend);
      Swal.fire("Éxito", "Asignación creada correctamente", "success");
      setNueva({
        unidadConductorId: "",
        rutaHorarioId: "",
        fechaAsignacion: new Date().toISOString().split('T')[0],
        estado: "Activo"
      });
      cargarDatos(filtros);
    } catch (error) {
      console.error("Error al crear asignación:", error);
      Swal.fire("Error", "No se pudo crear la asignación", "error");
    }
  };

  const handleUpdate = async (asignacion: any) => {
    const { value: formValues } = await Swal.fire({
      title: "Editar Asignación",
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Fecha de Asignación</label>
            <input id="swal-fecha" class="swal2-input" style="width: 100%; margin: 0;" type="date" value="${asignacion.fechaAsignacion ? asignacion.fechaAsignacion.split('T')[0] : ''}">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Estado</label>
            <select id="swal-estado" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="Activo" ${asignacion.estado === "Activo" ? "selected" : ""}>Activo</option>
              <option value="Inactivo" ${asignacion.estado === "Inactivo" ? "selected" : ""}>Inactivo</option>
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
          fechaAsignacion: (document.getElementById("swal-fecha") as HTMLInputElement).value,
          estado: (document.getElementById("swal-estado") as HTMLSelectElement).value,
        };
      },
    });

    if (formValues) {
      try {
        await updateAsignacion(asignacion.asignacionId, {
          ...asignacion,
          ...formValues,
          fechaAsignacion: `${formValues.fechaAsignacion}T00:00:00.000Z`
        });
        Swal.fire("Actualizado", "Asignación modificada correctamente", "success");
        cargarDatos(filtros);
      } catch (error) {
        console.error("Error al actualizar:", error);
        Swal.fire("Error", "No se pudo actualizar la asignación", "error");
      }
    }
  };

  const obtenerOpcionUnidadConductor = (uc: any) => {
    return obtenerInfoUnidadConductor(uc.unidadConductorId);
  };

  return (
    <div className="fade-in">
      {/* Header de página */}
      <div className="page-header">
        <h1>📋 Gestión de Asignaciones de Rutas</h1>
      </div>

      {/* Sección de Búsqueda */}
      <div className="search-container">
        <div className="search-header">
          <h2 className="search-title">🔍 Buscar Asignaciones</h2>
        </div>
        <div className="search-grid">
          <div className="form-group">
            <label className="form-label">Unidad-Conductor</label>
            <select
              value={filtros.unidadConductorId}
              onChange={(e) => setFiltros({...filtros, unidadConductorId: e.target.value})}
              className="form-select"
            >
              <option value="">Todas las asignaciones</option>
              {unidadesConductores.map((uc) => (
                <option key={uc.unidadConductorId} value={uc.unidadConductorId}>
                  {obtenerOpcionUnidadConductor(uc)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Ruta</label>
            <select
              value={filtros.rutaHorarioId}
              onChange={(e) => setFiltros({...filtros, rutaHorarioId: e.target.value})}
              className="form-select"
            >
              <option value="">Todas las rutas</option>
              {rutas.map((ruta) => (
                <option key={ruta.rutaHorarioId} value={ruta.rutaHorarioId}>
                  {ruta.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              className="form-select"
            >
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>
        <div className="search-actions">
          <button onClick={handleBuscar} className="btn btn-primary">
            🔍 Buscar
          </button>
          <button onClick={handleLimpiarFiltros} className="btn btn-outline">
            🗑️ Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Contador de resultados */}
      {!loading && (
        <div className="results-count">
          <p>
            Mostrando <strong>{asignaciones.length}</strong> asignación(es)
            {(filtros.unidadConductorId || filtros.rutaHorarioId || filtros.estado) && 
             " con filtros aplicados"}
          </p>
        </div>
      )}

      {/* Tabla de Asignaciones */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Cargando asignaciones...</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Unidad - Conductor</th>
                  <th>Ruta</th>
                  <th>Fecha de Asignación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asignaciones.length > 0 ? (
                  asignaciones.map((a) => (
                    <tr key={a.asignacionId}>
                      <td>{obtenerInfoUnidadConductor(a.unidadConductorId)}</td>
                      <td>{obtenerInfoRuta(a.rutaHorarioId)}</td>
                      <td>
                        {a.fechaAsignacion ? new Date(a.fechaAsignacion).toLocaleDateString() : "No especificada"}
                      </td>
                      <td>
                        <span className={`badge ${
                          a.estado === 'Activo' 
                            ? 'badge-success' 
                            : 'badge-danger'
                        }`}>
                          {a.estado || "Activo"}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleUpdate(a)}
                          className="btn btn-primary btn-sm"
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <h3 className="empty-state-title">No hay asignaciones registradas</h3>
                        <p className="empty-state-description">
                          {(filtros.unidadConductorId || filtros.rutaHorarioId || filtros.estado) 
                            ? "Intenta con otros criterios de búsqueda" 
                            : "No hay asignaciones de rutas en el sistema"}
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

      {/* Formulario de Registro */}
      <div className="form-container">
        <div className="card-header">
          <h2 className="card-title">➕ Registrar Nueva Asignación de Ruta</h2>
          <p className="card-subtitle">Asigna una unidad-conductor a una ruta específica</p>
        </div>
        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label form-label-required">Unidad-Conductor</label>
              <select
                value={nueva.unidadConductorId}
                onChange={(e) => setNueva({ ...nueva, unidadConductorId: e.target.value })}
                className="form-select"
                required
              >
                <option value="">Seleccionar asignación</option>
                {unidadesConductores
                  .filter(uc => uc.estado === "Activo")
                  .map((uc) => (
                    <option key={uc.unidadConductorId} value={uc.unidadConductorId}>
                      {obtenerOpcionUnidadConductor(uc)}
                    </option>
                  ))
                }
              </select>
              <span className="form-hint">
                {unidadesConductores.filter(uc => uc.estado === "Activo").length} asignaciones activas disponibles
              </span>
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Ruta</label>
              <select
                value={nueva.rutaHorarioId}
                onChange={(e) => setNueva({ ...nueva, rutaHorarioId: e.target.value })}
                className="form-select"
                required
              >
                <option value="">Seleccionar ruta</option>
                {rutas
                  .filter(r => r.estado === "Activo")
                  .map((ruta) => (
                    <option key={ruta.rutaHorarioId} value={ruta.rutaHorarioId}>
                      {ruta.nombre} ({ruta.origin || ruta.origen} → {ruta.destino})
                    </option>
                  ))
                }
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fecha de Asignación</label>
              <input
                type="date"
                value={nueva.fechaAsignacion}
                onChange={(e) => setNueva({ ...nueva, fechaAsignacion: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                value={nueva.estado}
                onChange={(e) => setNueva({ ...nueva, estado: e.target.value })}
                className="form-select"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-success">
              💾 Guardar Asignación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}