import React, { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import axios from "../../api/axios";
import Swal from "sweetalert2";

function NotasForm({ open, onClose, onNotaGuardada }) {
  const [busqueda, setBusqueda] = useState("");
  const [matriculas, setMatriculas] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    matricula: "",
    nota: "",
    comentario: "",
  });

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      obtenerMatriculas();
    }
  }, [open]);

  const obtenerMatriculas = async () => {
  try {
    const response = await axios.get("/calendario/");

    const datos = Array.isArray(response.data)
      ? response.data
      : response.data.results || [];

    const matriculasUnicas = [];

    datos.forEach((clase) => {
      const yaExiste = matriculasUnicas.some(
        (m) => m.id === clase.matricula
      );

      if (!yaExiste) {
        matriculasUnicas.push({
          id: clase.matricula,
          estudiante_nombre: clase.estudiante_nombre,
          estudiante_cedula: clase.estudiante_cedula,
          tipo_curso: clase.tipo_curso,
          modalidad: clase.modalidad,
          horario: clase.horario,
          estudiante_id: clase.estudiante_id,
        });
      }
    });

    setMatriculas(matriculasUnicas);
  } catch (err) {
    console.log("ERROR CARGANDO ESTUDIANTES ASIGNADOS:", err);
    setError("No se pudieron cargar los estudiantes asignados.");
  }
};

  const estudiantesFiltrados = useMemo(() => {
    return matriculas.filter((m) => {
      const texto = `
        ${m.estudiante_nombre || ""}
        ${m.estudiante_cedula || ""}
      `.toLowerCase();

      return texto.includes(busqueda.toLowerCase());
    });
  }, [matriculas, busqueda]);

  // Función para verificar si el plan de estudio está completo
  const verificarPlanCompleto = async (estudianteId) => {
    try {
      // Mostrar loading mientras se verifica
      Swal.fire({
        title: 'Verificando plan de estudio...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Usar el endpoint que ya tienes
      const response = await axios.get(`/dashboard-plan/estudiante-progreso/`);
      
      Swal.close();
      
      // Buscar el progreso del estudiante específico
      const progresoEstudiante = response.data.find(
        progreso => progreso.estudiante_id === estudianteId || 
                    progreso.estudiante_nombre?.includes(seleccionado?.estudiante_nombre)
      );
      
      // Si no encontramos el estudiante en el progreso
      if (!progresoEstudiante) {
        await Swal.fire({
          title: 'Plan de estudio incompleto',
          text: 'El estudiante no ha completado todo el plan de estudio. Debe finalizar todos los módulos antes de registrar la nota del examen práctico.',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f59e0b',
        });
        return false;
      }
      
      // Verificar si puede presentar el examen según tu API
      if (!progresoEstudiante.puede_presentar_examen) {
        await Swal.fire({
          title: 'Plan de estudio incompleto',
          text: 'El estudiante no ha completado todo el plan de estudio. Debe finalizar todos los módulos antes de registrar la nota del examen práctico.',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f59e0b',
        });
        return false;
      }
      
      // Todo está completo
      return true;
      
    } catch (error) {
      console.error("Error verificando progreso:", error);
      Swal.close();
      
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo verificar el progreso del plan de estudio. Por favor, intenta de nuevo.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#ef4444',
      });
      
      return false;
    }
  };

  const seleccionarEstudiante = (m) => {
    setSeleccionado(m);

    setFormData({
      ...formData,
      matricula: m.id,
    });

    setBusqueda(
      `${m.estudiante_nombre || ""} - ${m.estudiante_cedula || ""}`
    );
  };

  const guardarNota = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.matricula) {
      setError("Debe seleccionar un estudiante.");
      return;
    }

    if (!formData.nota) {
      setError("Debe ingresar una nota.");
      return;
    }

    // Verificar si el plan de estudio está completo ANTES de guardar
    const planCompleto = await verificarPlanCompleto(seleccionado?.estudiante_id);
    
    if (!planCompleto) {
      // Si el plan no está completo, no continuar con el guardado
      return;
    }

    try {
      setGuardando(true);

      await axios.post("/notas/", {
        matricula: formData.matricula,
        nota: formData.nota,
        comentario: formData.comentario,
      });

      // SweetAlert de éxito
      await Swal.fire({
        title: '¡Nota registrada!',
        text: 'La nota del examen práctico ha sido registrada exitosamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true,
      });

      if (onNotaGuardada) {
        onNotaGuardada();
      }

      setFormData({
        matricula: "",
        nota: "",
        comentario: "",
      });

      setBusqueda("");
      setSeleccionado(null);

      onClose();

    } catch (err) {
      if (err.response?.data) {
        const errores = Object.values(err.response.data)
          .flat()
          .join(" ");

        setError(errores);
        
        await Swal.fire({
          title: 'Error al guardar',
          text: errores || 'Ocurrió un error al registrar la nota.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Cerrar'
        });
      } else {
        setError("Error registrando la nota.");
        
        await Swal.fire({
          title: 'Error',
          text: 'Error al conectar con el servidor.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Cerrar'
        });
      }
    } finally {
      setGuardando(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Registrar nota práctica
            </h2>

            <p className="text-slate-500 mt-1 text-sm">
              Registro del examen práctico del estudiante.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={guardarNota} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Buscar estudiante
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setSeleccionado(null);

                  setFormData({
                    ...formData,
                    matricula: "",
                  });
                }}
                placeholder="Nombre o cédula..."
                className="w-full h-12 border border-slate-300 rounded-xl pl-11 pr-4 outline-none"
              />
            </div>

            {busqueda && !seleccionado && (
              <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                {estudiantesFiltrados.length === 0 && (
                  <div className="p-4 text-sm text-slate-500">
                    No se encontraron estudiantes.
                  </div>
                )}

                {estudiantesFiltrados.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => seleccionarEstudiante(m)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="font-semibold text-slate-800">
                      {m.estudiante_nombre}
                    </div>

                    <div className="text-sm text-slate-500">
                      {m.estudiante_cedula}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {seleccionado && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Curso
                </p>

                <p className="font-semibold text-slate-800">
                  {seleccionado.tipo_curso}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Modalidad
                </p>

                <p className="font-semibold text-slate-800">
                  {seleccionado.modalidad}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Horario
                </p>

                <p className="font-semibold text-slate-800">
                  {seleccionado.horario}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nota práctica
            </label>

            <input
              type="number"
              min="0"
              max="100"
              value={formData.nota}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nota: e.target.value,
                })
              }
              placeholder="0 - 100"
              className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Comentario
            </label>

            <textarea
              value={formData.comentario}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  comentario: e.target.value,
                })
              }
              rows="4"
              placeholder="Comentario del instructor..."
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar nota"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NotasForm;
