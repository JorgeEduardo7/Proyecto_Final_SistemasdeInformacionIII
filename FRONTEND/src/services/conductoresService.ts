import api from "./api";
import Swal from "sweetalert2";

export const getConductores = async () => {
  try {
    const res = await api.get("/api/conductores");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudieron obtener los conductores", "error");
    throw new Error();
  }
};

export const createConductor = async (c: any) => {
  try {
    const res = await api.post("/api/conductores", c);
    Swal.fire("Éxito", "Conductor creado correctamente", "success");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudo crear el conductor", "error");
    throw new Error();
  }
};

export const updateConductor = async (id: string, c: any) => {
  try {
    const res = await api.put(`/api/conductores/${id}`, c);
    Swal.fire("Actualizado", "Conductor actualizado correctamente", "success");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudo actualizar el conductor", "error");
    throw new Error();
  }
};

// 🆕 Nuevo servicio: buscar conductores
export const searchConductores = async (params: {
  nombre?: string;
  cedula?: string;
  licencia?: string;
  estado?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.nombre) queryParams.append("nombre", params.nombre);
    if (params.cedula) queryParams.append("cedula", params.cedula);
    if (params.licencia) queryParams.append("licencia", params.licencia);
    if (params.estado) queryParams.append("estado", params.estado);

    const res = await api.get(`/api/Conductores/buscar?${queryParams.toString()}`);
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudieron buscar los conductores", "error");
    throw new Error();
  }
};
