import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getRutas, createRuta, updateRuta, searchRutas } from "../services/rutasService";

export default function RutasPage() {
  const [rutas, setRutas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nueva, setNueva] = useState({
    nombre: "",
    origen: "",
    destino: "",
    dias: "",
    horaSalida: "",
    horaLlegada: "",
    distancia: 0,
    estado: "Activo",
  });

  const [busqueda, setBusqueda] = useState({
    nombre: "",
    origen: "",
    destino: "",
    dias: "",
    estado: "",
  });

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getRutas();
      setRutas(data);
    } catch {
      Swal.fire("Error", "No se pudieron obtener las rutas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const convertirHoraADateTime = (horaString: string) => {
    if (!horaString) return null;
    const hoy = new Date().toISOString().split("T")[0];
    return `${hoy}T${horaString}:00.000Z`;
  };

  const extraerHoraDeDateTime = (fechaString: string) => {
    if (!fechaString) return "";
    try {
      const fecha = new Date(fechaString);
      return fecha.toTimeString().slice(0, 5);
    } catch {
      return "";
    }
  };

  const formatearHora = (fechaString: string) => {
    if (!fechaString) return "N/A";
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "N/A";
    }
  };

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resultados = await searchRutas(busqueda);
      setRutas(resultados);
    } catch {
      Swal.fire("Error", "No se pudo realizar la búsqueda", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setBusqueda({ nombre: "", origen: "", destino: "", dias: "", estado: "" });
    cargar();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nueva.nombre || !nueva.origen || !nueva.destino)
      return Swal.fire("Campos requeridos", "Completa los campos obligatorios", "warning");

    try {
      const datosParaBackend = {
        nombre: nueva.nombre,
        origen: nueva.origen,
        destino: nueva.destino,
        distancia: nueva.distancia || 0,
        horaSalida: convertirHoraADateTime(nueva.horaSalida) || new Date().toISOString(),
        horaLlegada: convertirHoraADateTime(nueva.horaLlegada) || new Date().toISOString(),
        dias: nueva.dias || "",
        estado: nueva.estado || "Activo",
      };

      await createRuta(datosParaBackend);
      setNueva({
        nombre: "",
        origen: "",
        destino: "",
        dias: "",
        horaSalida: "",
        horaLlegada: "",
        distancia: 0,
        estado: "Activo",
      });
      cargar();
      Swal.fire("Éxito", "Ruta creada correctamente", "success");
    } catch {
      Swal.fire("Error", "No se pudo registrar la ruta", "error");
    }
  };

  const handleUpdate = async (ruta: any) => {
    const { value: formValues } = await Swal.fire({
      title: "Editar Ruta",
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Nombre</label>
            <input id="swal-nombre" class="swal2-input" style="width: 100%; margin: 0;" placeholder="Nombre" value="${ruta.nombre}" required>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Origen</label>
            <input id="swal-origen" class="swal2-input" style="width: 100%; margin: 0;" placeholder="Origen" value="${ruta.origen || ''}" required>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Destino</label>
            <input id="swal-destino" class="swal2-input" style="width: 100%; margin: 0;" placeholder="Destino" value="${ruta.destino || ''}" required>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Distancia (km)</label>
            <input id="swal-distancia" class="swal2-input" style="width: 100%; margin: 0;" placeholder="Distancia" type="number" value="${ruta.distancia || 0}">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Hora Salida</label>
            <input id="swal-horaSalida" class="swal2-input" style="width: 100%; margin: 0;" type="time" value="${extraerHoraDeDateTime(ruta.horaSalida)}">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Hora Llegada</label>
            <input id="swal-horaLlegada" class="swal2-input" style="width: 100%; margin: 0;" type="time" value="${extraerHoraDeDateTime(ruta.horaLlegada)}">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Días</label>
            <input id="swal-dias" class="swal2-input" style="width: 100%; margin: 0;" placeholder="Días" value="${ruta.dias || ''}">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Estado</label>
            <select id="swal-estado" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="Activo" ${ruta.estado === "Activo" ? "selected" : ""}>Activo</option>
              <option value="Inactivo" ${ruta.estado === "Inactivo" ? "selected" : ""}>Inactivo</option>
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
        const nombre = (document.getElementById("swal-nombre") as HTMLInputElement).value;
        const origen = (document.getElementById("swal-origen") as HTMLInputElement).value;
        const destino = (document.getElementById("swal-destino") as HTMLInputElement).value;
        
        if (!nombre || !origen || !destino) {
          Swal.showValidationMessage("Nombre, origen y destino son obligatorios");
          return false;
        }

        return {
          nombre,
          origen,
          destino,
          distancia: parseInt((document.getElementById("swal-distancia") as HTMLInputElement).value) || 0,
          horaSalida: convertirHoraADateTime((document.getElementById("swal-horaSalida") as HTMLInputElement).value),
          horaLlegada: convertirHoraADateTime((document.getElementById("swal-horaLlegada") as HTMLInputElement).value),
          dias: (document.getElementById("swal-dias") as HTMLInputElement).value,
          estado: (document.getElementById("swal-estado") as HTMLSelectElement).value,
        };
      },
    });

    if (formValues) {
      try {
        const datosActualizacion = {
          ...ruta,
          ...formValues
        };
        await updateRuta(ruta.rutaHorarioId, datosActualizacion);
        Swal.fire("Actualizado", "Ruta modificada correctamente", "success");
        cargar();
      } catch (error) {
        console.error("Error en handleUpdate:", error);
      }
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <h1>🗺️ Gestión de Rutas y Horarios</h1>
      </div>

      {/* Buscador */}
      <div className="search-container">
        <div className="search-header">
          <h2 className="search-title">🔍 Buscar Rutas</h2>
        </div>
        <form onSubmit={handleBuscar}>
          <div className="search-grid">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input type="text" placeholder="Nombre" value={busqueda.nombre}
                onChange={(e) => setBusqueda({ ...busqueda, nombre: e.target.value })}
                className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Origen</label>
              <input type="text" placeholder="Origen" value={busqueda.origen}
                onChange={(e) => setBusqueda({ ...busqueda, origen: e.target.value })}
                className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Destino</label>
              <input type="text" placeholder="Destino" value={busqueda.destino}
                onChange={(e) => setBusqueda({ ...busqueda, destino: e.target.value })}
                className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Días</label>
              <input type="text" placeholder="Días" value={busqueda.dias}
                onChange={(e) => setBusqueda({ ...busqueda, dias: e.target.value })}
                className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select value={busqueda.estado}
                onChange={(e) => setBusqueda({ ...busqueda, estado: e.target.value })}
                className="form-select">
                <option value="">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="search-actions">
            <button type="submit" className="btn btn-primary">🔍 Buscar</button>
            <button type="button" onClick={handleLimpiar} className="btn btn-outline">🗑️ Limpiar</button>
          </div>
        </form>
      </div>

      {/* Contador */}
      {!loading && (
        <div className="results-count">
          <p>Mostrando <strong>{rutas.length}</strong> ruta(s)</p>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Cargando rutas...</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Distancia</th>
                  <th>Horario</th>
                  <th>Días</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rutas.length > 0 ? (
                  rutas.map((r) => (
                    <tr key={r.rutaHorarioId}>
                      <td><strong>{r.nombre}</strong></td>
                      <td>{r.origen}</td>
                      <td>{r.destino}</td>
                      <td>{r.distancia || 0} km</td>
                      <td>{formatearHora(r.horaSalida)} - {formatearHora(r.horaLlegada)}</td>
                      <td>{r.dias || "No especificado"}</td>
                      <td>
                        <span className={`badge ${r.estado === "Activo" ? "badge-success" : "badge-danger"}`}>
                          {r.estado}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleUpdate(r)} className="btn btn-primary btn-sm">
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state">
                        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <h3 className="empty-state-title">No hay rutas registradas</h3>
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
          <h2 className="card-title">➕ Registrar Nueva Ruta</h2>
        </div>
        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label form-label-required">Nombre</label>
              <input type="text" placeholder="Nombre" required value={nueva.nombre} 
                onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })}
                className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Origen</label>
              <input type="text" placeholder="Origen" required value={nueva.origen} 
                onChange={(e) => setNueva({ ...nueva, origen: e.target.value })}
                className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Destino</label>
              <input type="text" placeholder="Destino" required value={nueva.destino} 
                onChange={(e) => setNueva({ ...nueva, destino: e.target.value })}
                className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Distancia (km)</label>
              <input type="number" placeholder="Distancia" value={nueva.distancia} 
                onChange={(e) => setNueva({ ...nueva, distancia: parseInt(e.target.value) || 0 })}
                className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Hora Salida</label>
              <input type="time" value={nueva.horaSalida}
                onChange={(e) => setNueva({ ...nueva, horaSalida: e.target.value })}
                className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Hora Llegada</label>
              <input type="time" value={nueva.horaLlegada}
                onChange={(e) => setNueva({ ...nueva, horaLlegada: e.target.value })}
                className="form-input" />
            </div>
            <div className="form-group" style={{gridColumn: 'span 2'}}>
              <label className="form-label">Días de operación</label>
              <input type="text" placeholder="Ej: Lunes a Viernes" value={nueva.dias} 
                onChange={(e) => setNueva({ ...nueva, dias: e.target.value })}
                className="form-input" />
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-success">💾 Guardar Ruta</button>
          </div>
        </form>
      </div>
    </div>
  );
}