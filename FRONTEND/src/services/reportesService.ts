import api from "./api";
import Swal from "sweetalert2";

export const getReporteIncidencias = async (params?: any) => {
  try {
    const res = await api.get("/api/incidencias/buscar", { params });
    return res.data;
  } catch {
    Swal.fire("Error", "No se pudo generar el reporte", "error");
    throw new Error();
  }
};
