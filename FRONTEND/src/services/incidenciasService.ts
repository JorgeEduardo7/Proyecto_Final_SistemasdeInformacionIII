import api from "./api";
import Swal from "sweetalert2";

// 🔹 Obtener incidencias con filtros opcionales
export const getIncidencias = async (filtros: any = {}) => {
  try {
    const params: any = {};

    if (filtros.tipo) params.tipo = filtros.tipo;
    if (filtros.gravedad) params.gravedad = filtros.gravedad;
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
    if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;

    const res = await api.get("/api/Incidencias/buscar", { params });
    return res.data;
  } catch (error: any) {
    console.error("Error al obtener incidencias:", error);
    Swal.fire("Error", "No se pudieron obtener las incidencias", "error");
    throw error;
  }
};

export const createIncidencia = async (incidencia: any) => {
  try {
    const res = await api.post("/api/Incidencias", incidencia);
    Swal.fire("Éxito", "Incidencia creada correctamente", "success");
    return res.data;
  } catch (error: any) {
    console.error("Error al crear incidencia:", error);
    const mensaje = error.response?.data?.message || "No se pudo crear la incidencia";
    Swal.fire("Error", mensaje, "error");
    throw error;
  }
};

export const updateIncidencia = async (id: string, incidencia: any) => {
  try {
    const res = await api.put(`/api/Incidencias/${id}`, incidencia);
    Swal.fire("Actualizado", "Incidencia actualizada correctamente", "success");
    return res.data;
  } catch (error: any) {
    console.error("Error al actualizar incidencia:", error);
    Swal.fire("Error", "No se pudo actualizar la incidencia", "error");
    throw error;
  }
};
