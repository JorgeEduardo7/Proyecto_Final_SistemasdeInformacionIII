import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getRoles, createRol, updateRol } from "../services/rolesService";

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [nuevo, setNuevo] = useState({ nombre: "", descripcion: "" });
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getRoles();
      setRoles(data);
    } catch {
      Swal.fire("Error", "No se pudieron obtener los roles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo.nombre) return Swal.fire("Campo requerido", "Ingresa el nombre del rol", "warning");

    try {
      await createRol(nuevo);
      setNuevo({ nombre: "", descripcion: "" });
      cargar();
      Swal.fire("Éxito", "Rol creado correctamente", "success");
    } catch {
      Swal.fire("Error", "No se pudo crear el rol", "error");
    }
  };

  const handleUpdate = async (r: any) => {
    const { value: formValues } = await Swal.fire({
      title: "Editar Rol",
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Nombre</label>
            <input id="swal-nombre" class="swal2-input" style="width: 100%; margin: 0;" value="${r.nombre}" required>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Descripción</label>
            <textarea id="swal-descripcion" class="swal2-textarea" style="width: 100%; margin: 0;" placeholder="Descripción">${r.descripcion || ''}</textarea>
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
        const descripcion = (document.getElementById("swal-descripcion") as HTMLTextAreaElement).value;
        
        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio');
          return false;
        }
        
        return { nombre, descripcion };
      }
    });

    if (formValues) {
      try {
        await updateRol(r.rolId, { ...r, ...formValues });
        Swal.fire("Actualizado", "Rol modificado correctamente", "success");
        cargar();
      } catch {
        Swal.fire("Error", "No se pudo actualizar el rol", "error");
      }
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <h1>🔐 Gestión de Roles</h1>
      </div>

      {/* Contador */}
      {!loading && (
        <div className="results-count">
          <p>Mostrando <strong>{roles.length}</strong> rol(es)</p>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Cargando roles...</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.length > 0 ? (
                  roles.map((r) => (
                    <tr key={r.rolId}>
                      <td><strong>{r.nombre}</strong></td>
                      <td>{r.descripcion || 'Sin descripción'}</td>
                      <td>
                        <button
                          onClick={() => handleUpdate(r)}
                          className="btn btn-primary btn-sm"
                        >
                          ✏️ Editar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <div className="empty-state">
                        <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h3 className="empty-state-title">No hay roles registrados</h3>
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
          <h2 className="card-title">➕ Registrar Nuevo Rol</h2>
        </div>
        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label form-label-required">Nombre</label>
              <input
                type="text"
                placeholder="Nombre del rol"
                value={nuevo.nombre}
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <input
                type="text"
                placeholder="Descripción del rol"
                value={nuevo.descripcion}
                onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-success">
              💾 Guardar Rol
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}