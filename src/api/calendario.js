// src/api/calendario.js
const API_URL = "http://127.0.0.1:8000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Authorization": `Token ${token}`,
    "Content-Type": "application/json"
  };
};

// ============ INSTRUCTORES ============
export const listarInstructores = async () => {
  try {
    const response = await fetch(`${API_URL}/instructores/`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error("Error al cargar instructores");
    }
    
    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error("Error en listar Instructores:", error);
    return [];
  }
};

// ============ MATRÍCULAS (Estudiantes aprobados para calendario) ============
export const listarMatriculas = async () => {
  try {
    const response = await fetch(`${API_URL}/matricula/?estado=matriculado`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error("Error al cargar Matrículas");
    }
    
    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error("Error en listar Matrículas:", error);
    return [];
  }
};

// ============ CITAS / CALENDARIO ============
export const listarCitas = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.mes) queryParams.append('mes', params.mes);
    if (params.instructor && params.instructor !== "all") {
      queryParams.append('instructor', params.instructor);
    }
    
    const url = `${API_URL}/calendario/${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error("Error en listarCitas:", error);
    return [];
  }
};

// Citas de hoy
export const citasDeHoy = async () => {
  try {
    const response = await fetch(`${API_URL}/calendario/hoy/`, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error("Error al cargar citas de hoy");
    }
    
    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error("Error en citas De Hoy:", error);
    return [];
  }
};

// Crear bloque de 8 clases
export const crearBloqueCitas = async (data) => {
  try {
    const response = await fetch(`${API_URL}/calendario/crear-bloque/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        instructor_id: parseInt(data.instructor_id),
        matricula_id: parseInt(data.matricula_id),
        fecha_inicio: data.fecha_inicio,
        horas_por_dia: parseInt(data.horas_por_dia || 2)
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      const msg = error.error 
        || error.non_field_errors?.[0] 
        || error.detail 
        || JSON.stringify(error);
      throw new Error(msg);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error en crear Bloque de Citas:", error);
    throw error;
  }
};
// Eliminar cita
export const eliminarCita = async (id) => {
  try {
    const response = await fetch(`${API_URL}/calendario/${id}/`, {
      method: "DELETE",
      headers: getHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al eliminar");
    }
    
    return true;
  } catch (error) {
    console.error("Error en eliminar Cita:", error);
    throw error;
  }
};

// Actualizar cita
export const actualizarCita = async (id, data) => {
  try {
    const response = await fetch(`${API_URL}/calendario/${id}/`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al actualizar la cita");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error en actualizar Cita:", error);
    throw error;
  }
};
// src/api/calendario.js

export const crearExamenManual = async (data) => {
  try {
    // ✅ Usa 'crear-examen' con guión, no 'crear_examen'
    const response = await fetch(`${API_URL}/calendario/crear-examen/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        instructor_id: parseInt(data.instructor_id),
        matricula_id: parseInt(data.matricula_id),
        fecha: data.fecha,
        hora_inicio: data.hora_inicio,
        hora_fin: data.hora_fin
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al crear el examen manual");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error en crear Examen Manual:", error);
    throw error;
  }
};
