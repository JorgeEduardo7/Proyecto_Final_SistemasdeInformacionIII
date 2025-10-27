import api from "./api";
import Swal from "sweetalert2";

export const getUnidades = async () => {
  try {
    const res = await api.get("/api/unidades");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudieron obtener las unidades", "error");
    throw new Error();
  }
};

export const createUnidad = async (u: any) => {
  try {
    const res = await api.post("/api/unidades", u);
    Swal.fire("Éxito", "Unidad creada correctamente", "success");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudo crear la unidad", "error");
    throw new Error();
  }
};

export const updateUnidad = async (id: string, u: any) => {
  try {
    const res = await api.put(`/api/unidades/${id}`, u);
    Swal.fire("Actualizado", "Unidad actualizada correctamente", "success");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudo actualizar la unidad", "error");
    throw new Error();
  }
};

// 🔍 Nuevo servicio de búsqueda de unidades
export const searchUnidades = async (params: {
  placa?: string;
  modelo?: string;
  minCapacidad?: number;
  maxCapacidad?: number;
  estado?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.placa) queryParams.append("placa", params.placa);
    if (params.modelo) queryParams.append("modelo", params.modelo);
    if (params.minCapacidad) queryParams.append("minCapacidad", params.minCapacidad.toString());
    if (params.maxCapacidad) queryParams.append("maxCapacidad", params.maxCapacidad.toString());
    if (params.estado) queryParams.append("estado", params.estado);

    const res = await api.get(`/api/unidades/buscar?${queryParams.toString()}`);
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudieron buscar las unidades", "error");
    throw new Error();
  }
};
