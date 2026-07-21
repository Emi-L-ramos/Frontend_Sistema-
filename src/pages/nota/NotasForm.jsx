import React, { useEffect, useMemo, useState } from "react";
import { Search, X, CheckCircle2 } from "lucide-react";
import axios from "../../api/axios";
import Swal from "sweetalert2";

function NotasForm({ open, onClose, onNotaGuardada }) {
  const [busqueda, setBusqueda] = useState("");
  const [matriculas, setMatriculas] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [verificando, setVerificando] = useState(false);

  const [formData, setFormData] = useState({
    matricula: "",
    nota: "",
    comentario: "",
  });

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

    useEffect(() => {
    if (open) {
      obtenerEstudiantesDisponibles();
    }
  }, [open]);

  const obtenerEstudiantesDisponibles = async () => {
    try {
      setVerificando(true);
      setError("");

      const response = await axios.get(
        "/notas/estudiantes-disponibles/"
      );

      const datos = Array.isArray(response.data)
        ? response.data
        : [];

      setMatriculas(datos);

      if (datos.length === 0) {
        Swal.fire({
          title: "Sin estudiantes disponibles",
          text: (
            "No hay estudiantes asignados pendientes " +
            "de nota práctica."
          ),
          icon: "info",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (err) {

      setError(
        "No se pudieron cargar los estudiantes asignados."
      );

      Swal.fire({
        title: "Error",
        text: (
          "No se pudieron cargar los estudiantes. " +
          "Verifica la conexión."
        ),
        icon: "error",
        confirmButtonText: "Cerrar",
      });
    } finally {
      setVerificando(false);
    }
  };

  const estudiantesFiltrados = useMemo(() => {
    return matriculas.filter((m) => {
      const texto = `
        ${m.estudiante_nombre || ""}
        ${m.estudiante_cedula || ""}
        ${m.plan_nombre || ""}
      `.toLowerCase();

      return texto.includes(busqueda.toLowerCase());
    });
  }, [matriculas, busqueda]);

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

    const notaNum = parseFloat(formData.nota);
    if (notaNum < 0 || notaNum > 100) {
      setError("La nota debe estar entre 0 y 100.");
      return;
    }

    try {
      setGuardando(true);
      // Guardar la nota (el backend actualizará automáticamente el estado de la matrícula)
      await axios.post("/notas/", {
        matricula: formData.matricula,
        nota: formData.nota,
        comentario: formData.comentario,
      });

      await Swal.fire({
        title: "Nota registrada",
        text: (
          `La nota práctica ${formData.nota}/100 ` +
          "fue registrada correctamente. La matrícula " +
          "se finalizará cuando también tenga la nota teórica."
        ),
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#10b981",
      });

      if (onNotaGuardada) {
        onNotaGuardada();
      }

      // Limpiar formulario
      setFormData({
        matricula: "",
        nota: "",
        comentario: "",
      });
      setBusqueda("");
      setSeleccionado(null);
      
      // Recargar la lista
      obtenerEstudiantesDisponibles();
      
      onClose();

    } catch (err) {
      let mensajeError = "Error al registrar la nota.";
      
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          const errores = Object.values(err.response.data).flat();
          mensajeError = errores.join(" ");
        } else {
          mensajeError = err.response.data;
        }
      }
      
      setError(mensajeError);
      
      await Swal.fire({
        title: 'Error al guardar',
        text: mensajeError,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setGuardando(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Registrar nota práctica
            </h2>

            <p className="text-slate-500 mt-1 text-sm">
              Estudiantes asignados pendientes de nota práctica.
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
              Buscar estudiante asignado
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
                className="w-full h-12 border border-slate-300 rounded-xl pl-11 pr-4 outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
              />
            </div>

            {verificando && (
              <div className="mt-2 p-4 text-center text-slate-500">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500 mr-2"></div>
                Cargando estudiantes...
              </div>
            )}

            {busqueda && !seleccionado && !verificando && (
              <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                {estudiantesFiltrados.length === 0 && (
                  <div className="p-4 text-sm text-slate-500">
                    No hay estudiantes pendientes de nota práctica.
                  </div>
                )}

                {estudiantesFiltrados.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => seleccionarEstudiante(m)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">
                          {m.estudiante_nombre}
                        </div>
                        <div className="text-sm text-slate-500">
                          {m.estudiante_cedula}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {m.tipo_curso || "Sin curso"}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Plan: {m.plan_nombre} - {m.tipo_curso}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {seleccionado && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Estudiante
                </p>
                <p className="font-semibold text-slate-800">
                  {seleccionado.estudiante_nombre}
                </p>
                <p className="text-xs text-slate-500">
                  Cédula: {seleccionado.estudiante_cedula}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Curso y plan de estudio
                </p>

                <p className="font-semibold text-blue-700">
                  {seleccionado.tipo_curso || "Sin curso"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {seleccionado.plan_nombre || "Sin plan asignado"}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nota práctica (0 - 100)
            </label>

            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.nota}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nota: e.target.value,
                })
              }
              placeholder="0 - 100"
              className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
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
              placeholder="Observaciones del examen práctico..."
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
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
              className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando || !seleccionado}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 transition"
            >
              {guardando ? "Guardando..." : "Registrar nota práctica"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default NotasForm;

 
