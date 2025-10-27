import api from "./api";
import Swal from "sweetalert2";

export const getUsuarios = async (filters?: {
  nombre?: string;
  email?: string;
  rolId?: string;
  estado?: string;
}) => {
  try {
    // Construir los parámetros de consulta
    const params: any = {};
    
    if (filters?.nombre && filters.nombre.trim() !== '') {
      params.nombre = filters.nombre;
    }
    if (filters?.email && filters.email.trim() !== '') {
      params.email = filters.email;
    }
    if (filters?.rolId && filters.rolId !== '') {
      params.rolId = filters.rolId;
    }
    if (filters?.estado && filters.estado !== '') {
      params.estado = filters.estado;
    }

    console.log("Parámetros de búsqueda:", params);

    const res = await api.get("/api/usuarios", { params });
    return res.data;
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    Swal.fire("Error", "No se pudieron obtener los usuarios", "error");
    throw error;
  }
};

// Servicio de búsqueda que construye query string similar a otros servicios (p. ej. conductores)
export const searchUsuarios = async (params: {
  nombre?: string;
  email?: string;
  rolId?: string;
  estado?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.nombre) queryParams.append('nombre', params.nombre);
    if (params.email) queryParams.append('email', params.email);
    if (params.rolId) queryParams.append('rolId', params.rolId);
    if (params.estado) queryParams.append('estado', params.estado);

    const res = await api.get(`/api/Usuarios/buscar?${queryParams.toString()}`);
    return res.data;
  } catch (error) {
    console.error('Error buscando usuarios:', error);
    Swal.fire('Error', 'No se pudieron buscar los usuarios', 'error');
    throw error;
  }
};

export const createUsuario = async (usuario: any) => {
  try {
    const res = await api.post("/api/usuarios", usuario);
    Swal.fire("Éxito", "Usuario creado correctamente", "success");
    return res.data;
  } catch (error) {
    console.error("Error creando usuario:", error);
    Swal.fire("Error", "No se pudo crear el usuario", "error");
    throw error;
  }
};

export const updateUsuario = async (id: string, usuario: any) => {
  try {
    console.log("=== DEBUG UPDATE USUARIO ===");
    console.log("ID del usuario:", id);
    console.log("Datos a actualizar:", JSON.stringify(usuario, null, 2));
    console.log("Preparando payload y endpoints para actualizar usuario");
    // Asegurarnos de que el cuerpo incluya el ID esperado por la API
    const payload = { ...usuario, usuarioId: usuario.usuarioId || id };

    // Intentar endpoints en orden preferente (coincidir con la API que especificaste)
    const endpoints = [`/api/Usuarios/${id}`, `/api/usuarios/${id}`, `/api/users/${id}`, `/api/user/${id}`];

    let response;
    let lastError: any = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`Intentando PUT ${endpoint} con payload:`, payload);
        response = await api.put(endpoint, payload);
        console.log(`✅ Éxito con endpoint: ${endpoint}`);
        break;
      } catch (err: any) {
        lastError = err;
        console.log(`❌ Falló endpoint ${endpoint}:`, err?.response?.data || err.message);
      }
    }

    if (response) {
      console.log("Respuesta exitosa:", response.data);
      Swal.fire("Actualizado", "Usuario actualizado correctamente", "success");
      return response.data;
    }
    throw lastError;

  } catch (error: any) {
    console.error("=== ERROR COMPLETO UPDATE USUARIO ===");
    console.error("Error:", error);
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Headers:", error.response?.headers);
    console.error("=== FIN ERROR ===");
    
    // Mensaje de error más específico
    let errorMessage = "No se pudo actualizar el usuario";
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.title) {
        errorMessage = error.response.data.title;
      } else if (error.response.data.errors) {
        // Si hay errores de validación, mostrarlos
        const validationErrors = Object.values(error.response.data.errors).flat();
        errorMessage = validationErrors.join(', ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    Swal.fire("Error", errorMessage, "error");
    throw error;
  }
};