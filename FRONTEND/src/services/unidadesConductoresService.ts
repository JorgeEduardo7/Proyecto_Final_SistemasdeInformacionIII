import api from "./api";
import Swal from "sweetalert2";

export const getUnidadesConductores = async () => {
  try {
    const res = await api.get("/api/unidadesconductores");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudieron obtener las asignaciones", "error");
    throw new Error();
  }
};

export const createUnidadConductor = async (asignacion: any) => {
  try {
    console.log("=== DEBUG: Datos que se envían al backend ===");
    console.log("unidadId:", asignacion.unidadId);
    console.log("conductorId:", asignacion.conductorId);
    console.log("estado:", asignacion.estado);
    console.log("Tipo de unidadId:", typeof asignacion.unidadId);
    console.log("Tipo de conductorId:", typeof asignacion.conductorId);
    console.log("=== FIN DEBUG ===");
    
    const res = await api.post("/api/unidadesconductores", asignacion);
    Swal.fire("Éxito", "Asignación creada correctamente", "success");
    return res.data;
  } catch (error: any) {
    console.error("Error completo:", error);
    console.error("Error response data:", error.response?.data);
    const errorMessage = error.response?.data?.message || "No se pudo crear la asignación";
    Swal.fire("Error", errorMessage, "error");
    throw new Error();
  }
};

export const updateUnidadConductor = async (id: string, asignacion: any) => {
  try {
    const res = await api.put(`/api/unidadesconductores/${id}`, asignacion);
    Swal.fire("Actualizado", "Asignación actualizada correctamente", "success");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudo actualizar la asignación", "error");
    throw new Error();
  }
};
// services/unidadesConductoresService.ts - Agrega esto
export const getUnidadesConductoresConRelaciones = async () => {
  try {
    const res = await api.get("/api/unidadesconductores?include=unidad,conductor");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudieron obtener las asignaciones con relaciones", "error");
    throw new Error();
  }
};