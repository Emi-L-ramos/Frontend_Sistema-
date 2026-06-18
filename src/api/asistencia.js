import api from "./axios";

export const listarAsistencia = async (fechaInicio, fechaFin = null) => {
  const params = {};

  if (fechaInicio) {
    params.fecha_inicio = fechaInicio;
  }

  if (fechaFin) {
    params.fecha_fin = fechaFin;
  }

  const response = await api.get("/asistencia/", {
    params,
  });

  return response.data;
};

export const marcarAsistencia = async (data) => {
  const response = await api.post("/asistencia/marcar/", data);
  return response.data;
};

export const justificarClase = async (asistenciaId, observacion) => {
  const response = await api.post(`/asistencia/${asistenciaId}/justificar/`, {
    observacion,
  });

  return response.data;
};

export const finalizarKilometraje = async (data) => {
  const response = await api.post("/asistencia/finalizar-km/", data);
  return response.data;
};

export const resumenKilometros = async () => {
  const response = await api.get("/asistencia/resumen-km/");
  return response.data;
};

export const editarKilometraje = async (data) => {
  const response = await api.post("/asistencia/editar-km/", data);
  return response.data;
};