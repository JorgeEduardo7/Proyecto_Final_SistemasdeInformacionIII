import api from "./api";
import Swal from "sweetalert2";

export const getRoles = async () => {
  try {
    const res = await api.get("/api/roles");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudieron obtener los roles", "error");
    throw new Error();
  }
};

export const createRol = async (rol: any) => {
  try {
    const res = await api.post("/api/roles", rol);
    Swal.fire("Éxito", "Rol creado correctamente", "success");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudo crear el rol", "error");
    throw new Error();
  }
};

export const updateRol = async (id: string, rol: any) => {
  try {
    const res = await api.put(`/api/roles/${id}`, rol);
    Swal.fire("Actualizado", "Rol actualizado correctamente", "success");
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudo actualizar el rol", "error");
    throw new Error();
  }
};
