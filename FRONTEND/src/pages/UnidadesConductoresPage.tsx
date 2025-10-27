import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { 
  getUnidadesConductores, 
  createUnidadConductor, 
  updateUnidadConductor 
} from "../services/unidadesConductoresService";
import { getUnidades } from "../services/unidadesService";
import { getConductores } from "../services/conductoresService";

export default function UnidadesConductoresPage() {
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [conductores, setConductores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filtros, setFiltros] = useState({
    unidadId: "",
    conductorId: "",
    estado: ""
  });

  const [nueva, setNueva] = useState({
    unidadId: "",
    conductorId: "",
    estado: "Activo"
  });

  const cargarDatos = async (filters?: any) => {
    setLoading(true);
    try {
      const [asignacionesData, unidadesData, conductoresData] = await Promise.all([
        getUnidadesConductores(),
        getUnidades(),
        getConductores()
      ]);
      
      let asignacionesFiltradas = asignacionesData;
      if (filters && Object.keys(filters).some(k => filters[k] !== undefined && String(filters[k]).trim() !== '')) {
        const { unidadId, conductorId, estado } = filters;
        asignacionesFiltradas = (asignacionesData || []).filter((a: any) => {
          let ok = true;
          if (unidadId && String(unidadId).trim() !== '') {
            ok = ok && String(a.unidadId) === String(unidadId);
          }
          if (conductorId && String(conductorId).trim() !== '') {
            ok = ok && String(a.conductorId) === String(conductorId);
          }
          if (estado && String(estado).trim() !== '') {
            ok = ok && String((a.estado || 'Activo')).toLowerCase() === String(estado).toLowerCase();
          }
          return ok;
        });
      }
      
      setAsignaciones(asignacionesFiltradas);
      setUnidades(unidadesData);
      setConductores(conductoresData);
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
      unidadId: "",
      conductorId: "",
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

  const unidadTieneConductorActivo = (unidadId: string) => {
    return asignaciones.some(a => 
      a.unidadId === unidadId && a.estado === "Activo"
    );
  };

  const conductorTieneUnidadActiva = (conductorId: string) => {
    return asignaciones.some(a => 
      a.conductorId === conductorId && a.estado === "Activo"
    );
  };

  const obtenerConductorDeUnidad = (unidadId: string) => {
    const asignacion = asignaciones.find(a => 
      a.unidadId === unidadId && a.estado === "Activo"
    );
    return asignacion ? obtenerNombreConductor(asignacion.conductorId) : null;
  };

  const obtenerUnidadDeConductor = (conductorId: string) => {
    const asignacion = asignaciones.find(a => 
      a.conductorId === conductorId && a.estado === "Activo"
    );
    return asignacion ? obtenerNombreUnidad(asignacion.unidadId) : null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nueva.unidadId || !nueva.conductorId)
      return Swal.fire("Campos requeridos", "Selecciona una unidad y un conductor", "warning");

    const unidadOcupada = unidadTieneConductorActivo(nueva.unidadId);
    const conductorOcupado = conductorTieneUnidadActiva(nueva.conductorId);

    if (unidadOcupada && conductorOcupado) {
      const conductorActual = obtenerConductorDeUnidad(nueva.unidadId);
      const unidadActual = obtenerUnidadDeConductor(nueva.conductorId);
      return Swal.fire({
        title: "Ambos ya están asignados",
        html: `La unidad ya está asignada a: <strong>${conductorActual}</strong><br>
               El conductor ya está asignado a: <strong>${unidadActual}</strong>`,
        icon: "warning"
      });
    }

    if (unidadOcupada) {
      const conductorActual = obtenerConductorDeUnidad(nueva.unidadId);
      return Swal.fire({
        title: "Unidad ya asignada",
        html: `Esta unidad ya está asignada a: <strong>${conductorActual}</strong><br>
               ¿Deseas reasignarla?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, reasignar",
        cancelButtonText: "Cancelar"
      }).then(async (result) => {
        if (result.isConfirmed) {
          await crearAsignacion();
        }
      });
    }

    if (conductorOcupado) {
      const unidadActual = obtenerUnidadDeConductor(nueva.conductorId);
      return Swal.fire({
        title: "Conductor ya asignado",
        html: `Este conductor ya está asignado a: <strong>${unidadActual}</strong><br>
               ¿Deseas reasignarlo?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, reasignar",
        cancelButtonText: "Cancelar"
      }).then(async (result) => {
        if (result.isConfirmed) {
          await crearAsignacion();
        }
      });
    }

    await crearAsignacion();
  };

  const crearAsignacion = async () => {
    try {
      const datosParaBackend = {
        unidadId: nueva.unidadId,
        conductorId: nueva.conductorId,
        estado: "Activo"
      };

      await createUnidadConductor(datosParaBackend);
      Swal.fire("Éxito", "Asignación creada correctamente", "success");
      setNueva({
        unidadId: "",
        conductorId: "",
        estado: "Activo"
      });
      cargarDatos(filtros);
    } catch (error) {
      console.error("Error al crear asignación:", error);
      Swal.fire("Error", "No se pudo crear la asignación", "error");
    }
  };

  const handleUpdate = async (asignacion: any) => {
    const { value: nuevoEstado } = await Swal.fire({
      title: "Cambiar Estado de Asignación",
      input: "select",
      inputOptions: {
        "Activo": "Activo",
        "Inactivo": "Inactivo"
      },
      inputValue: asignacion.estado,
      showCancelButton: true,
      confirmButtonText: "Actualizar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) {
          return 'Debes seleccionar un estado';
        }
      }
    });

    if (nuevoEstado) {
      try {
        await updateUnidadConductor(asignacion.unidadConductorId, {
          ...asignacion,
          estado: nuevoEstado
        });
        Swal.fire("Actualizado", "Estado modificado correctamente", "success");
        cargarDatos(filtros);
      } catch (error) {
        console.error("Error al actualizar:", error);
        Swal.fire("Error", "No se pudo actualizar la asignación", "error");
      }
    }
  };

  return (
    <div className="fade-in">
      {/* Header de página */}
      <div className="page-header">
        <h1>🔗 Gestión de Asignaciones Unidad-Conductor</h1>
      </div>

      {/* Sección de Búsqueda */}
      <div className="search-container">
        <div className="search-header">
          <h2 className="search-title">🔍 Buscar Asignaciones</h2>
        </div>
        <div className="search-grid">
          <div className="form-group">
            <label className="form-label">Unidad</label>
            <select
              value={filtros.unidadId}
              onChange={(e) => setFiltros({...filtros, unidadId: e.target.value})}
              className="form-select"
            >
              <option value="">Todas las unidades</option>
              {unidades.map((unidad) => (
                <option key={unidad.unidadId} value={unidad.unidadId}>
                  {unidad.placa} - {unidad.modelo}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Conductor</label>
            <select
              value={filtros.conductorId}
              onChange={(e) => setFiltros({...filtros, conductorId: e.target.value})}
              className="form-select"
            >
              <option value="">Todos los conductores</option>
              {conductores.map((conductor) => (
                <option key={conductor.conductorId} value={conductor.conductorId}>
                  {conductor.nombre}
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
            {(filtros.unidadId || filtros.conductorId || filtros.estado) && 
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
                  <th>Unidad</th>
                  <th>Conductor</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asignaciones.length > 0 ? (
                  asignaciones.map((a) => (
                    <tr key={a.unidadConductorId}>
                      <td>
                        <strong>
                          {a.unidad 
                            ? `${a.unidad.placa} - ${a.unidad.modelo}` 
                            : obtenerNombreUnidad(a.unidadId)}
                        </strong>
                      </td>
                      <td>
                        {a.conductor ? a.conductor.nombre : obtenerNombreConductor(a.conductorId)}
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
                    <td colSpan={4}>
                      <div className="empty-state">
                        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 className="empty-state-title">No hay asignaciones registradas</h3>
                        <p className="empty-state-description">
                          {(filtros.unidadId || filtros.conductorId || filtros.estado) 
                            ? "Intenta con otros criterios de búsqueda" 
                            : "Asigna conductores a las unidades para empezar"}
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
          <h2 className="card-title">➕ Registrar Nueva Asignación</h2>
          <p className="card-subtitle">Asigna un conductor específico a una unidad de transporte</p>
        </div>
        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label form-label-required">Unidad</label>
              <select
                value={nueva.unidadId}
                onChange={(e) => setNueva({ ...nueva, unidadId: e.target.value })}
                className="form-select"
                required
              >
                <option value="">Seleccionar unidad</option>
                {unidades
                  .filter(u => u.estado === "Activo")
                  .map((unidad) => (
                    <option 
                      key={unidad.unidadId} 
                      value={unidad.unidadId}
                    >
                      {unidad.placa} - {unidad.modelo}
                      {unidadTieneConductorActivo(unidad.unidadId) && " (Ya asignada)"}
                    </option>
                  ))
                }
              </select>
              {nueva.unidadId && unidadTieneConductorActivo(nueva.unidadId) && (
                <span className="form-hint" style={{color: '#EC794E'}}>
                  ⚠️ Esta unidad ya tiene conductor: {obtenerConductorDeUnidad(nueva.unidadId)}
                </span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Conductor</label>
              <select
                value={nueva.conductorId}
                onChange={(e) => setNueva({ ...nueva, conductorId: e.target.value })}
                className="form-select"
                required
              >
                <option value="">Seleccionar conductor</option>
                {conductores
                  .filter(c => c.estado === "Activo")
                  .map((conductor) => (
                    <option 
                      key={conductor.conductorId} 
                      value={conductor.conductorId}
                    >
                      {conductor.nombre} - {conductor.cedula}
                      {conductorTieneUnidadActiva(conductor.conductorId) && " (Ya asignado)"}
                    </option>
                  ))
                }
              </select>
              {nueva.conductorId && conductorTieneUnidadActiva(nueva.conductorId) && (
                <span className="form-hint" style={{color: '#EC794E'}}>
                  ⚠️ Este conductor ya tiene unidad: {obtenerUnidadDeConductor(nueva.conductorId)}
                </span>
              )}
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