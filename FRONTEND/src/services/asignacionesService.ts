import api from "./api";
import Swal from "sweetalert2";

export const getAsignaciones = async () => {
  try {
    const res = await api.get("/api/asignacionesrutas");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudieron obtener las asignaciones", "error");
    throw new Error();
  }
};

export const createAsignacion = async (a: any) => {
  try {
    console.log("Creando asignación con datos:", a);
    const res = await api.post("/api/asignacionesrutas", a);
    Swal.fire("Éxito", "Asignación creada correctamente", "success");
    return res.data;
  } catch (error: any) {
    console.error("Error al crear asignación:", error);
    const errorMessage = error.response?.data?.message || "No se pudo crear la asignación";
    Swal.fire("Error", errorMessage, "error");
    throw new Error();
  }
};

// Agrega esta función si necesitas actualizar
export const updateAsignacion = async (id: string, asignacion: any) => {
  try {
    const res = await api.put(`/api/asignacionesrutas/${id}`, asignacion);
    Swal.fire("Actualizado", "Asignación actualizada correctamente", "success");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudo actualizar la asignación", "error");
    throw new Error();
  }
};