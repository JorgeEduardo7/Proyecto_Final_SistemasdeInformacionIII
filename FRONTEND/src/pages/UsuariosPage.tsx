import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getUsuarios, createUsuario, updateUsuario, searchUsuarios } from "../services/usuariosService";
import { getRoles } from "../services/rolesService";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [nuevo, setNuevo] = useState({ nombre: "", email: "", contrasena: "", rolId: "" });
  const [loading, setLoading] = useState(false);
  
  const [filtros, setFiltros] = useState({
    nombre: "",
    email: "",
    rolId: "",
    estado: ""
  });

  const cargarUsuarios = async (filters?: any) => {
    setLoading(true);
    try {
      const data = await getUsuarios(filters && Object.keys(filters).some(k => filters[k]) ? filters : undefined);
      
      let usuariosFiltrados = data;
      if (filters && Object.keys(filters).some(k => filters[k] !== undefined && String(filters[k]).trim() !== '')) {
        const { nombre, email, rolId, estado } = filters;
        usuariosFiltrados = (data || []).filter((u: any) => {
          let ok = true;
          if (nombre && String(nombre).trim() !== '') {
            ok = ok && String(u.nombre || '').toLowerCase().includes(String(nombre).toLowerCase());
          }
          if (email && String(email).trim() !== '') {
            ok = ok && String(u.email || '').toLowerCase().includes(String(email).toLowerCase());
          }
          if (rolId && String(rolId).trim() !== '') {
            const uRol = u.rolId ?? u.id ?? u.roleId ?? '';
            ok = ok && String(uRol) === String(rolId);
          }
          if (estado && String(estado).trim() !== '') {
            ok = ok && String((u.estado || 'Activo')).toLowerCase() === String(estado).toLowerCase();
          }
          return ok;
        });
      }
      setUsuarios(usuariosFiltrados);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      Swal.fire("Error", "No se pudo obtener la lista de usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  const cargarRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      console.error("Error cargando roles:", error);
      Swal.fire("Error", "No se pudieron cargar los roles", "error");
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const handleBuscar = async () => {
    try {
      const hayFiltros = Object.values(filtros).some(v => v !== undefined && String(v).trim() !== '');
      if (!hayFiltros) {
        return cargarUsuarios();
      }
      const resultados = await searchUsuarios(filtros);
      setUsuarios(resultados || []);
    } catch (error) {
      console.error('Error en búsqueda de usuarios:', error);
      try {
        const data = await getUsuarios();
        const { nombre, email, rolId, estado } = filtros;
        const usuariosFiltrados = (data || []).filter((u: any) => {
          let ok = true;
          if (nombre && String(nombre).trim() !== '') {
            ok = ok && String(u.nombre || '').toLowerCase().includes(String(nombre).toLowerCase());
          }
          if (email && String(email).trim() !== '') {
            ok = ok && String(u.email || '').toLowerCase().includes(String(email).toLowerCase());
          }
          if (rolId && String(rolId).trim() !== '') {
            const uRol = u.rolId ?? u.id ?? u.roleId ?? '';
            ok = ok && String(uRol) === String(rolId);
          }
          if (estado && String(estado).trim() !== '') {
            ok = ok && String((u.estado || 'Activo')).toLowerCase() === String(estado).toLowerCase();
          }
          return ok;
        });
        setUsuarios(usuariosFiltrados);
      } catch (e) {
        console.error('Error en fallback de búsqueda:', e);
      }
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      nombre: "",
      email: "",
      rolId: "",
      estado: ""
    });
    cargarUsuarios();
  };

  const obtenerNombreRol = (rolId: string) => {
    if (!rolId) return "Sin rol";
    const rol = roles.find(r => 
      r.rolId === rolId || 
      r.rolId === parseInt(rolId) || 
      r.id === rolId ||
      r.id === parseInt(rolId)
    );
    return rol ? rol.nombre : `Rol ID: ${rolId}`;
  };

  const obtenerEstado = (estado: string) => {
    return estado || "Activo";
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo.nombre || !nuevo.email || !nuevo.contrasena || !nuevo.rolId) {
      return Swal.fire("Campos incompletos", "Debes llenar todos los campos", "warning");
    }

    try {
      await createUsuario(nuevo);
      setNuevo({ nombre: "", email: "", contrasena: "", rolId: "" });
      cargarUsuarios(filtros);
      Swal.fire("Éxito", "Usuario creado correctamente", "success");
    } catch (error) {
      console.error("Error creando usuario:", error);
      Swal.fire("Error", "No se pudo registrar el usuario", "error");
    }
  };

  const handleUpdate = async (u: any) => {
    const usuarioId = u.usuarioId || u.id;
    
    if (!usuarioId) {
      console.error("No se pudo obtener el ID del usuario:", u);
      return Swal.fire("Error", "No se pudo identificar el usuario", "error");
    }

    const { value: formValues } = await Swal.fire({
      title: "Editar Usuario",
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Nombre</label>
            <input id="swal-nombre" class="swal2-input" style="width: 100%; margin: 0;" placeholder="Nombre" value="${u.nombre || ''}" required>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Correo electrónico</label>
            <input id="swal-email" class="swal2-input" style="width: 100%; margin: 0;" placeholder="Correo electrónico" type="email" value="${u.email || ''}" required>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Nueva contraseña (opcional)</label>
            <input id="swal-contrasena" class="swal2-input" style="width: 100%; margin: 0;" placeholder="Dejar vacío para mantener actual" type="password">
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Rol</label>
            <select id="swal-rolId" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="">Seleccionar rol</option>
              ${roles.map(rol => 
                `<option value="${rol.rolId || rol.id}" ${(u.rolId === rol.rolId || u.rolId === rol.id) ? 'selected' : ''}>${rol.nombre}</option>`
              ).join('')}
            </select>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Estado</label>
            <select id="swal-estado" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="Activo" ${(u.estado === 'Activo' || !u.estado) ? 'selected' : ''}>Activo</option>
              <option value="Inactivo" ${u.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      width: '600px',
      preConfirm: () => {
        const nombre = (document.getElementById('swal-nombre') as HTMLInputElement).value;
        const email = (document.getElementById('swal-email') as HTMLInputElement).value;
        const contrasena = (document.getElementById('swal-contrasena') as HTMLInputElement).value;
        const rolId = (document.getElementById('swal-rolId') as HTMLSelectElement).value;
        const estado = (document.getElementById('swal-estado') as HTMLSelectElement).value;

        if (!nombre || !email || !rolId || !estado) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          Swal.showValidationMessage('Ingresa un correo electrónico válido');
          return false;
        }

        return {
          nombre,
          email,
          contrasena: contrasena || undefined,
          rolId,
          estado
        };
      }
    });

    if (formValues) {
      try {
        const datosActualizacion: any = {
          nombre: formValues.nombre,
          email: formValues.email,
          rolId: formValues.rolId,
          estado: formValues.estado
        };

        if (formValues.contrasena && formValues.contrasena.trim() !== '') {
          datosActualizacion.contrasena = formValues.contrasena;
        }

        await updateUsuario(usuarioId, datosActualizacion);
        cargarUsuarios(filtros);
      } catch (error) {
        console.error("Error en handleUpdate:", error);
      }
    }
  };

  return (
    <div className="fade-in">
      {/* Header de página */}
      <div className="page-header">
        <h1>👥 Gestión de Usuarios</h1>
      </div>

      {/* Sección de Búsqueda */}
      <div className="search-container">
        <div className="search-header">
          <h2 className="search-title">🔍 Buscar Usuarios</h2>
        </div>
        <div className="search-grid">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              placeholder="Buscar por nombre"
              value={filtros.nombre}
              onChange={(e) => setFiltros({...filtros, nombre: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              placeholder="Buscar por email"
              value={filtros.email}
              onChange={(e) => setFiltros({...filtros, email: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Rol</label>
            <select
              value={filtros.rolId}
              onChange={(e) => setFiltros({...filtros, rolId: e.target.value})}
              className="form-select"
            >
              <option value="">Todos los roles</option>
              {roles.map((rol) => (
                <option key={rol.rolId || rol.id} value={rol.rolId || rol.id}>
                  {rol.nombre}
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
            Mostrando <strong>{usuarios.length}</strong> usuario(s)
            {(filtros.nombre || filtros.email || filtros.rolId || filtros.estado) && 
             " con filtros aplicados"}
          </p>
        </div>
      )}

      {/* Tabla de Usuarios */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Cargando usuarios...</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length > 0 ? (
                  usuarios.map((u) => (
                    <tr key={u.usuarioId || u.id}>
                      <td>{u.nombre}</td>
                      <td>{u.email}</td>
                      <td>{obtenerNombreRol(u.rolId)}</td>
                      <td>
                        <span className={`badge ${
                          (u.estado === 'Activo' || !u.estado) 
                            ? 'badge-success' 
                            : 'badge-danger'
                        }`}>
                          {obtenerEstado(u.estado)}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleUpdate(u)}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <h3 className="empty-state-title">No se encontraron usuarios</h3>
                        <p className="empty-state-description">
                          {(filtros.nombre || filtros.email || filtros.rolId || filtros.estado) 
                            ? "Intenta con otros criterios de búsqueda" 
                            : "No hay usuarios registrados en el sistema"}
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
          <h2 className="card-title">➕ Registrar Nuevo Usuario</h2>
          <p className="card-subtitle">Completa todos los campos para agregar un usuario</p>
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
              <label className="form-label form-label-required">Correo</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={nuevo.email}
                onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Contraseña</label>
              <input
                type="password"
                placeholder="Contraseña segura"
                value={nuevo.contrasena}
                onChange={(e) => setNuevo({ ...nuevo, contrasena: e.target.value })}
                className="form-input"
                required
              />
              <span className="form-hint">Mínimo 8 caracteres</span>
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Rol</label>
              <select
                value={nuevo.rolId}
                onChange={(e) => setNuevo({ ...nuevo, rolId: e.target.value })}
                className="form-select"
                required
              >
                <option value="">Seleccionar rol</option>
                {roles.map((rol) => (
                  <option key={rol.rolId || rol.id} value={rol.rolId || rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-success">
              💾 Guardar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}