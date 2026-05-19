// src/pages/examen_teorico/ExamenTeoricoPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Swal from "sweetalert2";

import {
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  Save,
  Pencil,
  ArrowLeft,
  XCircle,
} from "lucide-react";

function ExamenTeoricoPage() {
  const navigate = useNavigate();

  const [preguntas, setPreguntas] = useState([]);
  const [texto, setTexto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [opciones, setOpciones] = useState([
    { texto: "", es_correcta: false },
    { texto: "", es_correcta: false },
  ]);

  useEffect(() => {
    obtenerPreguntas();
  }, []);

  const obtenerPreguntas = async () => {
    try {
      const response = await axios.get("/preguntas-examen-teorico/");
      setPreguntas(response.data);
    } catch (error) {
      console.error("Error obteniendo preguntas:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las preguntas del examen teórico.",
        confirmButtonColor: "#059669",
      });
    }
  };

  const agregarOpcion = () => {
    setOpciones([
      ...opciones,
      {
        texto: "",
        es_correcta: false,
      },
    ]);
  };

  const eliminarOpcion = (index) => {
    if (opciones.length <= 2) {
      Swal.fire({
        icon: "warning",
        title: "No permitido",
        text: "Cada pregunta debe tener al menos dos opciones.",
        confirmButtonColor: "#059669",
      });
      return;
    }

    const nuevas = opciones.filter((_, i) => i !== index);
    setOpciones(nuevas);
  };

  const actualizarTextoOpcion = (index, valor) => {
    const nuevas = [...opciones];
    nuevas[index].texto = valor;
    setOpciones(nuevas);
  };

  const marcarCorrecta = (index) => {
    const nuevas = opciones.map((opcion, i) => ({
      ...opcion,
      es_correcta: i === index,
    }));

    setOpciones(nuevas);
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setTexto("");
    setOpciones([
      {
        texto: "",
        es_correcta: false,
      },
      {
        texto: "",
        es_correcta: false,
      },
    ]);
  };

  const validarFormulario = () => {
    if (!texto.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Pregunta requerida",
        text: "Debe escribir la pregunta del examen.",
        confirmButtonColor: "#059669",
      });

      return false;
    }

    const opcionesValidas = opciones.filter(
      (opcion) => opcion.texto.trim() !== ""
    );

    if (opcionesValidas.length < 2) {
      Swal.fire({
        icon: "warning",
        title: "Opciones insuficientes",
        text: "Debe agregar al menos dos opciones de respuesta.",
        confirmButtonColor: "#059669",
      });

      return false;
    }

    const tieneCorrecta = opcionesValidas.some(
      (opcion) => opcion.es_correcta
    );

    if (!tieneCorrecta) {
      Swal.fire({
        icon: "warning",
        title: "Respuesta correcta requerida",
        text: "Debe seleccionar cuál opción es la respuesta correcta.",
        confirmButtonColor: "#059669",
      });

      return false;
    }

    return true;
  };

  const guardarPregunta = async () => {
    if (!validarFormulario()) return;

    try {
      setGuardando(true);

      const opcionesValidas = opciones
        .filter((opcion) => opcion.texto.trim() !== "")
        .map((opcion) => ({
          texto: opcion.texto.trim(),
          es_correcta: opcion.es_correcta,
        }));

      const payload = {
        texto: texto.trim(),
        activa: true,
        opciones: opcionesValidas,
      };

      if (editandoId) {
        await axios.put(`/preguntas-examen-teorico/${editandoId}/`, payload);

        Swal.fire({
          icon: "success",
          title: "Pregunta actualizada",
          text: "La pregunta del examen teórico se actualizó correctamente.",
          confirmButtonColor: "#059669",
        });
      } else {
        await axios.post("/preguntas-examen-teorico/", payload);

        Swal.fire({
          icon: "success",
          title: "Pregunta guardada",
          text: "La pregunta del examen teórico se guardó correctamente.",
          confirmButtonColor: "#059669",
        });
      }

      limpiarFormulario();
      obtenerPreguntas();
    } catch (error) {
      console.error("Error guardando pregunta:", error);

      const mensaje =
        error.response?.data?.opciones ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "No se pudo guardar la pregunta.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: Array.isArray(mensaje) ? mensaje.join(" ") : String(mensaje),
        confirmButtonColor: "#059669",
      });
    } finally {
      setGuardando(false);
    }
  };

  const editarPregunta = (pregunta) => {
    setEditandoId(pregunta.id);
    setTexto(pregunta.texto);

    setOpciones(
      pregunta.opciones.map((opcion) => ({
        texto: opcion.texto,
        es_correcta: opcion.es_correcta,
      }))
    );

    Swal.fire({
      icon: "info",
      title: "Modo edición",
      text: "Ahora puedes modificar la pregunta seleccionada.",
      timer: 1600,
      showConfirmButton: false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelarEdicion = () => {
    limpiarFormulario();

    Swal.fire({
      icon: "info",
      title: "Edición cancelada",
      text: "El formulario volvió al modo de creación.",
      timer: 1400,
      showConfirmButton: false,
    });
  };

  const eliminarPregunta = async (id) => {
    const resultado = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar pregunta?",
      text: "Esta acción eliminará la pregunta y sus opciones.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });

    if (!resultado.isConfirmed) return;

    try {
      await axios.delete(`/preguntas-examen-teorico/${id}/`);

      Swal.fire({
        icon: "success",
        title: "Pregunta eliminada",
        text: "La pregunta fue eliminada correctamente.",
        confirmButtonColor: "#059669",
      });

      if (editandoId === id) {
        limpiarFormulario();
      }

      obtenerPreguntas();
    } catch (error) {
      console.error("Error eliminando pregunta:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar la pregunta.",
        confirmButtonColor: "#059669",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-3 rounded-2xl">
            <BookOpen className="w-7 h-7 text-emerald-700" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Constructor de Examen Teórico
            </h1>

            <p className="text-slate-500 mt-1">
              Cree, edite y administre preguntas del examen teórico general.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl transition hover:cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sticky top-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editandoId ? "Editar pregunta" : "Nueva pregunta"}
              </h2>

              {editandoId && (
                <button
                  onClick={cancelarEdicion}
                  className="flex items-center gap-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-xl transition"
                >
                  <XCircle className="w-4 h-4" />
                  Cancelar
                </button>
              )}
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pregunta
                </label>

                <textarea
                  rows={4}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Escriba la pregunta..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Opciones
                  </label>

                  <button
                    type="button"
                    onClick={agregarOpcion}
                    className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition"
                  >
                    <Plus className="w-4 h-4" />
                    Opción
                  </button>
                </div>

                <div className="space-y-3">
                  {opciones.map((opcion, index) => (
                    <div
                      key={index}
                      className={`border rounded-2xl p-4 transition ${
                        opcion.es_correcta
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => marcarCorrecta(index)}
                          className={`mt-1 ${
                            opcion.es_correcta
                              ? "text-emerald-600"
                              : "text-slate-300"
                          }`}
                        >
                          <CheckCircle2 className="w-6 h-6" />
                        </button>

                        <div className="flex-1">
                          <textarea
                            rows={2}
                            value={opcion.texto}
                            onChange={(e) =>
                              actualizarTextoOpcion(index, e.target.value)
                            }
                            placeholder={`Opción ${index + 1}`}
                            className="w-full resize-none outline-none bg-transparent text-slate-700"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => eliminarOpcion(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {opcion.es_correcta && (
                        <p className="text-xs text-emerald-700 font-medium mt-2 ml-9">
                          Respuesta correcta seleccionada
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={guardarPregunta}
                disabled={guardando}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-semibold transition disabled:opacity-60"
              >
                <Save className="w-5 h-5" />

                {guardando
                  ? "Guardando..."
                  : editandoId
                  ? "Actualizar pregunta"
                  : "Guardar pregunta"}
              </button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="space-y-5">
            {preguntas.map((pregunta) => (
              <div
                key={pregunta.id}
                className={`bg-white border rounded-3xl p-6 ${
                  editandoId === pregunta.id
                    ? "border-emerald-500"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1 rounded-full">
                        Examen general
                      </span>

                      <span
                        className={`text-sm font-medium px-4 py-1 rounded-full ${
                          pregunta.activa
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {pregunta.activa ? "Activa" : "Inactiva"}
                      </span>

                      {editandoId === pregunta.id && (
                        <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1 rounded-full">
                          Editando
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-semibold text-slate-800 leading-relaxed">
                      {pregunta.texto}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => editarPregunta(pregunta)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar pregunta"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => eliminarPregunta(pregunta.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar pregunta"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {pregunta.opciones?.map((opcion) => (
                    <div
                      key={opcion.id}
                      className={`border rounded-2xl px-5 py-4 flex items-center gap-3 ${
                        opcion.es_correcta
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          opcion.es_correcta
                            ? "text-emerald-600"
                            : "text-slate-300"
                        }`}
                      />

                      <span className="text-slate-700">{opcion.texto}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {preguntas.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
                No hay preguntas registradas.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamenTeoricoPage;
