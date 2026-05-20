import axios from "./axios";

export const listarAsistencia = async () => {
  const response = await axios.get("/asistencia/");
  return response.data;
};

export const marcarAsistencia = async ({ clase_id, estado, km_inicial, km_final }) => {
  const response = await axios.post("/asistencia/marcar/", {
    clase_id,
    estado,
    km_inicial,
    km_final,
  });

  return response.data;
};

export const justificarClase = async (asistenciaId, observacion) => {
  const response = await axios.post(`/asistencia/${asistenciaId}/justificar/`, {
    observacion,
  });

  return response.data;
};

export const resumenKilometros = async () => {
  const response = await axios.get("/asistencia/resumen-km/");
  return response.data;
};
