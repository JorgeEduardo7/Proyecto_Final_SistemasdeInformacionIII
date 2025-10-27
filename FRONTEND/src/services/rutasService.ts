import api from "./api";
import Swal from "sweetalert2";

export const getRutas = async () => {
  try {
    const res = await api.get("/api/rutashorarios");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudieron obtener las rutas", "error");
    throw new Error();
  }
};

export const createRuta = async (r: any) => {
  try {
    const res = await api.post("/api/rutashorarios", r);
    Swal.fire("Éxito", "Ruta creada correctamente", "success");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudo crear la ruta", "error");
    throw new Error();
  }
};

export const updateRuta = async (id: string, ruta: any) => {
  try {
    // Asegurar que el body incluya el ID esperado por la API
    const payload = { ...ruta, rutaHorarioId: ruta.rutaHorarioId || id };

    // Probar endpoint con mayúscula (coincidente con la especificación) y una variante en minúscula
    const endpoints = [`/api/RutasHorarios/${id}`, `/api/rutashorarios/${id}`];
    let res;
    let lastError: any = null;

    for (const endpoint of endpoints) {
      try {
        res = await api.put(endpoint, payload);
        break;
      } catch (err: any) {
        lastError = err;
        console.log(`Falló PUT ${endpoint}:`, err?.response?.data || err.message);
      }
    }

    if (!res) {
      Swal.fire("Error", "No se pudo actualizar la ruta", "error");
      throw lastError || new Error('Error actualizando ruta');
    }

    Swal.fire("Actualizado", "Ruta actualizada correctamente", "success");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudo actualizar la ruta", "error");
    throw new Error();
  }
};

// 🔍 Nuevo servicio de búsqueda
export const searchRutas = async (params: {
  nombre?: string;
  origen?: string;
  destino?: string;
  dias?: string;
  estado?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.nombre) queryParams.append("nombre", params.nombre);
    if (params.origen) queryParams.append("origen", params.origen);
    if (params.destino) queryParams.append("destino", params.destino);
    if (params.dias) queryParams.append("dias", params.dias);
    if (params.estado) queryParams.append("estado", params.estado);

    const res = await api.get(`/api/RutasHorarios/buscar?${queryParams.toString()}`);
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudieron buscar las rutas", "error");
    throw new Error();
  }
};
