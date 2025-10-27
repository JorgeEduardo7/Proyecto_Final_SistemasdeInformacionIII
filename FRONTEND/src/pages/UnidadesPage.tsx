import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getUnidades, createUnidad, updateUnidad, searchUnidades } from "../services/unidadesService";

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState<any[]>([]);
  const [nuevo, setNuevo] = useState({ placa: "", modelo: "", capacidad: 0, estado: "Activo" });
  const [busqueda, setBusqueda] = useState({ placa: "", modelo: "", minCapacidad: "", maxCapacidad: "", estado: "" });
  const [loading, setLoading] = useState(false);

  const estadosUnidad = [
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" }
  ];

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getUnidades();
      setUnidades(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resultados = await searchUnidades({
        placa: busqueda.placa,
        modelo: busqueda.modelo,
        minCapacidad: busqueda.minCapacidad ? parseInt(busqueda.minCapacidad) : undefined,
        maxCapacidad: busqueda.maxCapacidad ? parseInt(busqueda.maxCapacidad) : undefined,
        estado: busqueda.estado
      });
      setUnidades(resultados);
    } catch {}
    finally { setLoading(false); }
  };

  const handleLimpiar = () => {
    setBusqueda({ placa: "", modelo: "", minCapacidad: "", maxCapacidad: "", estado: "" });
    cargar();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo.placa || !nuevo.modelo || !nuevo.capacidad) {
      return Swal.fire("Campos requeridos", "Completa todos los campos obligatorios", "warning");
    }
    try {
      await createUnidad(nuevo);
      setNuevo({ placa: "", modelo: "", capacidad: 0, estado: "Activo" });
      cargar();
      Swal.fire("Éxito", "Unidad creada correctamente", "success");
    } catch {}
  };

  const handleUpdate = async (u: any) => {
    const { value: formValues } = await Swal.fire({
      title: "Editar Unidad",
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Placa</label>
            <input id="swal-placa" class="swal2-input" style="width: 100%; margin: 0;" value="${u.placa}" required>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Modelo</label>
            <input id="swal-modelo" class="swal2-input" style="width: 100%; margin: 0;" value="${u.modelo}" required>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Capacidad</label>
            <input id="swal-capacidad" class="swal2-input" style="width: 100%; margin: 0;" type="number" value="${u.capacidad}" required>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Estado</label>
            <select id="swal-estado" class="swal2-input" style="width: 100%; margin: 0;">
              ${estadosUnidad.map(e => `<option value="${e.value}" ${u.estado===e.value?'selected':''}>${e.label}</option>`).join('')}
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
        const placa = (document.getElementById("swal-placa") as HTMLInputElement).value;
        const modelo = (document.getElementById("swal-modelo") as HTMLInputElement).value;
        const capacidad = parseInt((document.getElementById("swal-capacidad") as HTMLInputElement).value);
        const estado = (document.getElementById("swal-estado") as HTMLSelectElement).value;
        if (!placa || !modelo || !capacidad) {
          Swal.showValidationMessage('Placa, modelo y capacidad son obligatorios');
          return false;
        }
        if (capacidad <= 0) {
          Swal.showValidationMessage('La capacidad debe ser mayor a 0');
          return false;
        }
        return { placa, modelo, capacidad, estado };
      }
    });

    if (formValues) {
      try {
        await updateUnidad(u.unidadId, { ...u, ...formValues });
        Swal.fire("Actualizado", "Unidad modificada correctamente", "success");
        cargar();
      } catch {}
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <h1>🚐 Gestión de Unidades</h1>
      </div>

      {/* Buscador */}
      <div className="search-container">
        <div className="search-header">
          <h2 className="search-title">🔍 Buscar Unidades</h2>
        </div>
        <form onSubmit={handleBuscar}>
          <div className="search-grid">
            <div className="form-group">
              <label className="form-label">Placa</label>
              <input type="text" placeholder="Buscar por placa" value={busqueda.placa} onChange={(e)=>setBusqueda({...busqueda, placa:e.target.value})} className="form-input"/>
            </div>
            <div className="form-group">
              <label className="form-label">Modelo</label>
              <input type="text" placeholder="Buscar por modelo" value={busqueda.modelo} onChange={(e)=>setBusqueda({...busqueda, modelo:e.target.value})} className="form-input"/>
            </div>
            <div className="form-group">
              <label className="form-label">Cap. Mínima</label>
              <input type="number" placeholder="Capacidad mínima" value={busqueda.minCapacidad} onChange={(e)=>setBusqueda({...busqueda, minCapacidad:e.target.value})} className="form-input"/>
            </div>
            <div className="form-group">
              <label className="form-label">Cap. Máxima</label>
              <input type="number" placeholder="Capacidad máxima" value={busqueda.maxCapacidad} onChange={(e)=>setBusqueda({...busqueda, maxCapacidad:e.target.value})} className="form-input"/>
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select value={busqueda.estado} onChange={(e)=>setBusqueda({...busqueda, estado:e.target.value})} className="form-select">
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
          <p>Mostrando <strong>{unidades.length}</strong> unidad(es)</p>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Cargando unidades...</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Modelo</th>
                  <th>Capacidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {unidades.length > 0 ? (
                  unidades.map(u => (
                    <tr key={u.unidadId}>
                      <td><strong>{u.placa}</strong></td>
                      <td>{u.modelo}</td>
                      <td>{u.capacidad} pasajeros</td>
                      <td>
                        <span className={`badge ${u.estado === 'Activo' ? 'badge-success' : 'badge-danger'}`}>
                          {u.estado}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleUpdate(u)} className="btn btn-primary btn-sm">
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="empty-state-title">No hay unidades registradas</h3>
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
          <h2 className="card-title">➕ Registrar Nueva Unidad</h2>
        </div>
        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label form-label-required">Placa</label>
              <input type="text" placeholder="Ej: ABC123" value={nuevo.placa} onChange={(e)=>setNuevo({...nuevo, placa:e.target.value.toUpperCase()})} className="form-input" required style={{fontFamily: 'monospace'}}/>
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Modelo</label>
              <input type="text" placeholder="Ej: Sprinter 2024" value={nuevo.modelo} onChange={(e)=>setNuevo({...nuevo, modelo:e.target.value})} className="form-input" required/>
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Capacidad</label>
              <input type="number" min="1" placeholder="Número de pasajeros" value={nuevo.capacidad} onChange={(e)=>setNuevo({...nuevo, capacidad:parseInt(e.target.value)||0})} className="form-input" required/>
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select value={nuevo.estado} onChange={(e)=>setNuevo({...nuevo, estado:e.target.value})} className="form-select">
                {estadosUnidad.map(e=><option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-success">💾 Guardar Unidad</button>
          </div>
        </form>
      </div>
    </div>
  );
}