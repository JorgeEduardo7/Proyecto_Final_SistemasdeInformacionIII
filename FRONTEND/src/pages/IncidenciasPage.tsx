import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getIncidencias, createIncidencia, updateIncidencia } from "../services/incidenciasService";
import { getAsignaciones } from "../services/asignacionesService";

export default function IncidenciasPage() {
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    tipo: "",
    gravedad: "",
    estado: "",
    fechaInicio: "",
    fechaFin: ""
  });

  const [nueva, setNueva] = useState({
    asignacionId: "",
    fecha: new Date().toISOString().split('T')[0],
    tipo: "",
    gravedad: "",
    descripcion: "",
    estado: "Activo"
  });

  const tiposIncidencia = [
    { value: "FalloTecnico", label: "Falla Técnica" },
    { value: "Choque", label: "Choque" },
    { value: "FaltaConductor", label: "Falta de Conductor" },
    { value: "Retraso", label: "Retraso" },
    { value: "Otro", label: "Otro" }
  ];

  const nivelesGravedad = [
    { value: "Alto", label: "Alto" },
    { value: "Medio", label: "Medio" },
    { value: "Bajo", label: "Bajo" }
  ];

  const estadosIncidencia = [
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" },
    { value: "Resuelto", label: "Resuelto" }
  ];

  const cargarDatos = async (filters?: any) => {
    setLoading(true);
    try {
      const [incidenciasData, asignacionesData] = await Promise.all([
        getIncidencias(filters),
        getAsignaciones()
      ]);
      
      let incidenciasFiltradas = incidenciasData;
      if (filters && Object.keys(filters).some(k => filters[k] !== undefined && String(filters[k]).trim() !== '')) {
        const { tipo, gravedad, estado, fechaInicio, fechaFin } = filters;
        incidenciasFiltradas = (incidenciasData || []).filter((i: any) => {
          let ok = true;
          if (tipo && String(tipo).trim() !== '') {
            ok = ok && String(i.tipo || '').toLowerCase() === String(tipo).toLowerCase();
          }
          if (gravedad && String(gravedad).trim() !== '') {
            ok = ok && String(i.gravedad || '').toLowerCase() === String(gravedad).toLowerCase();
          }
          if (estado && String(estado).trim() !== '') {
            ok = ok && String((i.estado || 'Activo')).toLowerCase() === String(estado).toLowerCase();
          }
          if (fechaInicio && String(fechaInicio).trim() !== '') {
            const fechaIncidencia = new Date(i.fecha);
            const fechaInicioDate = new Date(fechaInicio);
            ok = ok && fechaIncidencia >= fechaInicioDate;
          }
          if (fechaFin && String(fechaFin).trim() !== '') {
            const fechaIncidencia = new Date(i.fecha);
            const fechaFinDate = new Date(fechaFin);
            ok = ok && fechaIncidencia <= fechaFinDate;
          }
          return ok;
        });
      }
      
      setIncidencias(incidenciasFiltradas);
      setAsignaciones(asignacionesData);
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

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarDatos(filtros);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      tipo: "",
      gravedad: "",
      estado: "",
      fechaInicio: "",
      fechaFin: ""
    });
    cargarDatos();
  };

  const obtenerInfoAsignacion = (id: string) => {
    const asignacion = asignaciones.find(a => a.asignacionId === id);
    if (!asignacion) return `Asignación ID: ${id}`;
    
    return `Asignación #${asignacion.asignacionId.substring(0, 8)}...`;
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "No especificada";
    return new Date(fecha).toLocaleDateString();
  };

  const obtenerColorGravedad = (gravedad: string) => {
    switch(gravedad) {
      case "Alto": return "badge-danger";
      case "Medio": return "badge-warning";
      case "Bajo": return "badge-info";
      default: return "badge-secondary";
    }
  };

  const obtenerEtiquetaTipo = (tipo: string) => {
    const tipoObj = tiposIncidencia.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nueva.asignacionId || !nueva.tipo || !nueva.gravedad || !nueva.descripcion)
      return Swal.fire("Campos requeridos", "Completa todos los campos obligatorios", "warning");

    try {
      const incidenciaData = {
        ...nueva,
        fecha: `${nueva.fecha}T00:00:00.000Z`
      };
      await createIncidencia(incidenciaData);
      Swal.fire("Éxito", "Incidencia registrada correctamente", "success");
      setNueva({
        asignacionId: "",
        fecha: new Date().toISOString().split('T')[0],
        tipo: "",
        gravedad: "",
        descripcion: "",
        estado: "Activo"
      });
      cargarDatos(filtros);
    } catch (error) {
      console.error("Error al crear incidencia:", error);
      Swal.fire("Error", "No se pudo registrar la incidencia", "error");
    }
  };

  const handleUpdate = async (incidencia: any) => {
    const { value: formValues } = await Swal.fire({
      title: "Editar Incidencia",
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Tipo</label>
            <select id="swal-tipo" class="swal2-input" style="width: 100%; margin: 0;">
              ${tiposIncidencia.map(t => 
                `<option value="${t.value}" ${incidencia.tipo === t.value ? 'selected' : ''}>${t.label}</option>`
              ).join('')}
            </select>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Gravedad</label>
            <select id="swal-gravedad" class="swal2-input" style="width: 100%; margin: 0;">
              ${nivelesGravedad.map(g => 
                `<option value="${g.value}" ${incidencia.gravedad === g.value ? 'selected' : ''}>${g.label}</option>`
              ).join('')}
            </select>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Descripción</label>
            <textarea id="swal-descripcion" class="swal2-textarea" style="width: 100%; margin: 0;" rows="3">${incidencia.descripcion || ''}</textarea>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Estado</label>
            <select id="swal-estado" class="swal2-input" style="width: 100%; margin: 0;">
              ${estadosIncidencia.map(e => 
                `<option value="${e.value}" ${incidencia.estado === e.value ? 'selected' : ''}>${e.label}</option>`
              ).join('')}
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
        const tipo = (document.getElementById("swal-tipo") as HTMLSelectElement).value;
        const gravedad = (document.getElementById("swal-gravedad") as HTMLSelectElement).value;
        const descripcion = (document.getElementById("swal-descripcion") as HTMLTextAreaElement).value;
        const estado = (document.getElementById("swal-estado") as HTMLSelectElement).value;
        
        if (!descripcion) {
          Swal.showValidationMessage('La descripción es obligatoria');
          return false;
        }
        
        return { tipo, gravedad, descripcion, estado };
      }
    });

    if (formValues) {
      try {
        await updateIncidencia(incidencia.incidenciaId, {
          ...incidencia,
          ...formValues
        });
        Swal.fire("Actualizado", "Incidencia modificada correctamente", "success");
        cargarDatos(filtros);
      } catch (error) {
        console.error("Error al actualizar:", error);
        Swal.fire("Error", "No se pudo actualizar la incidencia", "error");
      }
    }
  };

  return (
    <div className="fade-in">
      {/* Header de página */}
      <div className="page-header">
        <h1>⚠️ Gestión de Incidencias</h1>
      </div>

      {/* Sección de Búsqueda */}
      <div className="search-container">
        <div className="search-header">
          <h2 className="search-title">🔍 Buscar Incidencias</h2>
        </div>
        <form onSubmit={handleBuscar}>
          <div className="search-grid">
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                className="form-select"
              >
                <option value="">Todos los tipos</option>
                {tiposIncidencia.map(t => 
                  <option key={t.value} value={t.value}>{t.label}</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Gravedad</label>
              <select
                value={filtros.gravedad}
                onChange={(e) => setFiltros({ ...filtros, gravedad: e.target.value })}
                className="form-select"
              >
                <option value="">Todas las gravedades</option>
                {nivelesGravedad.map(g => 
                  <option key={g.value} value={g.value}>{g.label}</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                className="form-select"
              >
                <option value="">Todos los estados</option>
                {estadosIncidencia.map(e => 
                  <option key={e.value} value={e.value}>{e.label}</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fecha Inicio</label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha Fin</label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
          <div className="search-actions">
            <button type="submit" className="btn btn-primary">
              🔍 Buscar
            </button>
            <button type="button" onClick={handleLimpiarFiltros} className="btn btn-outline">
              🗑️ Limpiar Filtros
            </button>
          </div>
        </form>
      </div>

      {/* Contador de resultados */}
      {!loading && (
        <div className="results-count">
          <p>
            Mostrando <strong>{incidencias.length}</strong> incidencia(s)
            {(filtros.tipo || filtros.gravedad || filtros.estado || filtros.fechaInicio || filtros.fechaFin) && 
             " con filtros aplicados"}
          </p>
        </div>
      )}

      {/* Tabla de Incidencias */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Cargando incidencias...</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Asignación</th>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Gravedad</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {incidencias.length > 0 ? (
                  incidencias.map((i) => (
                    <tr key={i.incidenciaId}>
                      <td>{obtenerInfoAsignacion(i.asignacionId)}</td>
                      <td>{formatearFecha(i.fecha)}</td>
                      <td>{obtenerEtiquetaTipo(i.tipo)}</td>
                      <td>
                        <span className={`badge ${obtenerColorGravedad(i.gravedad)}`}>
                          {i.gravedad}
                        </span>
                      </td>
                      <td style={{maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {i.descripcion}
                      </td>
                      <td>
                        <span className={`badge ${
                          i.estado === 'Activo' 
                            ? 'badge-danger' 
                            : i.estado === 'Resuelto'
                            ? 'badge-success'
                            : 'badge-secondary'
                        }`}>
                          {i.estado || "Activo"}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleUpdate(i)}
                          className="btn btn-primary btn-sm"
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="empty-state-title">No hay incidencias registradas</h3>
                        <p className="empty-state-description">
                          {(filtros.tipo || filtros.gravedad || filtros.estado || filtros.fechaInicio || filtros.fechaFin) 
                            ? "Intenta con otros criterios de búsqueda" 
                            : "No se han reportado incidencias en el sistema"}
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
          <h2 className="card-title">➕ Registrar Nueva Incidencia</h2>
          <p className="card-subtitle">Reporta incidentes o problemas relacionados con las asignaciones</p>
        </div>
        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label form-label-required">Asignación</label>
              <select
                value={nueva.asignacionId}
                onChange={(e) => setNueva({ ...nueva, asignacionId: e.target.value })}
                className="form-select"
                required
              >
                <option value="">Seleccionar asignación</option>
                {asignaciones
                  .filter(a => a.estado === "Activo")
                  .map((asignacion) => (
                    <option key={asignacion.asignacionId} value={asignacion.asignacionId}>
                      {obtenerInfoAsignacion(asignacion.asignacionId)}
                    </option>
                  ))
                }
              </select>
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Fecha</label>
              <input
                type="date"
                value={nueva.fecha}
                onChange={(e) => setNueva({ ...nueva, fecha: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Tipo de Incidencia</label>
              <select
                value={nueva.tipo}
                onChange={(e) => setNueva({ ...nueva, tipo: e.target.value })}
                className="form-select"
                required
              >
                <option value="">Seleccionar tipo</option>
                {tiposIncidencia.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Gravedad</label>
              <select
                value={nueva.gravedad}
                onChange={(e) => setNueva({ ...nueva, gravedad: e.target.value })}
                className="form-select"
                required
              >
                <option value="">Seleccionar gravedad</option>
                {nivelesGravedad.map(nivel => (
                  <option key={nivel.value} value={nivel.value}>
                    {nivel.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{gridColumn: 'span 2'}}>
              <label className="form-label form-label-required">Descripción</label>
              <textarea
                placeholder="Describe detalladamente la incidencia..."
                value={nueva.descripcion}
                onChange={(e) => setNueva({ ...nueva, descripcion: e.target.value })}
                className="form-textarea"
                required
                rows={4}
              />
              <span className="form-hint">Proporciona todos los detalles relevantes</span>
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-success">
              💾 Guardar Incidencia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}