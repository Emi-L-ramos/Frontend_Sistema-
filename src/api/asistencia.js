const API_BASE = "http://127.0.0.1:8000/api";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Token ${localStorage.getItem("token")}`,
});

export const listarAsistencia = async () => {
  const res = await fetch(`${API_BASE}/asistencia/`, { headers: headers() });
  if (!res.ok) throw new Error("Error al cargar asistencia");
  return res.json();
};

export const marcarAsistencia = async (calendario_id, asistio) => {
  const res = await fetch(`${API_BASE}/asistencia/marcar/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ calendario_id, asistio }),
  });
  if (!res.ok) throw new Error("Error al marcar asistencia");
  return res.json();
};

export const justificarClase = async (calendario_id, motivo) => {
  const res = await fetch(`${API_BASE}/justificar-clase/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ calendario_id, motivo }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al justificar");
  }
  return res.json();
};