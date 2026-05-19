import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import {
  BookOpen,
  CheckCircle2,
  Send,
  Clock3,
} from "lucide-react";

function ExamenTeoricoEstudiante() {
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [examenData, setExamenData] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const navigate = useNavigate();

  const obtenerExamen = async () => {

    try {

      setCargando(true);

      const response = await axios.get(
        "/examen-teorico/mi-examen/"
      );

      setExamenData(response.data);

      if (response.data?.preguntas) {
        setPreguntas(response.data.preguntas);
      }

    } catch (error) {

      console.error(
        "Error obteniendo examen:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el examen teórico.",
        confirmButtonColor: "#2563eb",
      });

    } finally {

      setCargando(false);

    }
  };

  useEffect(() => {
    obtenerExamen();
  }, []);

  const seleccionarRespuesta = (
    preguntaId,
    opcionId
  ) => {

    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: opcionId,
    }));

  };

  const enviarExamen = async () => {

    try {

      if (
        Object.keys(respuestas).length !==
        preguntas.length
      ) {

        Swal.fire({
          icon: "warning",
          title: "Preguntas pendientes",
          text: "Debe responder todas las preguntas antes de enviar el examen.",
          confirmButtonColor: "#2563eb",
        });

        return;
      }

      const confirmar = await Swal.fire({
        icon: "question",
        title: "¿Enviar examen?",
        text: "Una vez enviado no podrá modificar sus respuestas.",
        showCancelButton: true,
        confirmButtonText: "Sí, enviar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#64748b",
      });

      if (!confirmar.isConfirmed) return;

      setEnviando(true);

      const payload = {
        respuestas: Object.entries(
          respuestas
        ).map(([preguntaId, opcionId]) => ({
          pregunta_id: Number(preguntaId),
          opcion_id: opcionId,
        })),
      };

      const response = await axios.post(
        `/examen-teorico/${examenData.examen.id}/enviar/`,
        payload
      );

      await Swal.fire({
        icon: "success",
        title: "Examen enviado",
        // html: `
        //   <div style="font-size:15px">
        //     <p><b>Nota:</b> ${response.data.nota}</p>
        //     <p><b>Correctas:</b> ${response.data.correctas}/${response.data.total_preguntas}</p>
        //     <p><b>Resultado:</b> ${response.data.resultado}</p>
        //   </div>
        // `,
        confirmButtonColor: "#16a34a",
      });
      navigate("/dashboard/plan-estudio");

      obtenerExamen();

    } catch (error) {

      console.error(
        "Error enviando examen:",
        error
      );

      const mensaje =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "No se pudo enviar el examen.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: mensaje,
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setEnviando(false);
    }
  };
  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">
            Cargando examen teórico...
          </p>

        </div>
      </div>
    );
  }

  if (!examenData?.disponible) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-10 text-center">
          <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock3 className="w-12 h-12 text-blue-700" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Examen teórico
          </h1>
          <p className="text-slate-500 text-lg">
            {
              examenData?.message ||
              "Todavía no tiene un examen teórico habilitado."
            }
          </p>
        </div>
      </div>
    );
  }
  if (examenData?.realizado) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-10">
          <div className="text-center mb-10">
            <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-700" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Examen realizado
            </h1>
            <p className="text-slate-500 text-lg">
              Ya realizó su examen teórico.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <p className="text-slate-500 text-sm mb-2">
                Estado
              </p>
              <h2 className="text-2xl font-bold text-green-700">
                Finalizado
              </h2>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <p className="text-slate-500 text-sm mb-2">
                Nota obtenida
              </p>
              <h2 className="text-2xl font-bold text-blue-700">
                {examenData.examen?.nota || 0}
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-4 rounded-2xl">
              <BookOpen className="w-8 h-8 text-blue-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Examen Teórico
              </h1>
              <p className="text-slate-500 mt-1">
                Responda cuidadosamente cada pregunta.
              </p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mt-6">
            <p className="text-blue-800 font-medium">
              Total de preguntas: {preguntas.length}
            </p>
          </div>
        </div>
        <div className="space-y-6">
          {preguntas.map((pregunta, index) => (
            <div
              key={pregunta.id}
              className="bg-white border border-slate-200 rounded-3xl p-8"
            >
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-800 leading-relaxed">
                    {pregunta.texto}
                  </h2>
                </div>
              </div>
              <div className="space-y-4">
                {pregunta.opciones.map((opcion) => {
                  const seleccionada =
                    respuestas[pregunta.id] === opcion.id;
                  return (
                    <button
                      key={opcion.id}
                      onClick={() =>
                        seleccionarRespuesta(
                          pregunta.id,
                          opcion.id
                        )
                      }
                      className={`w-full text-left border rounded-2xl px-6 py-5 transition ${
                        seleccionada
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 ${
                            seleccionada
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300"
                          }`}
                        />
                        <span className="text-slate-700 font-medium">
                          {opcion.texto}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-end">
          <button
            onClick={enviarExamen}
            disabled={enviando}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition"
          >
            <Send className="w-6 h-6" />
            {
              enviando
                ? "Enviando examen..."
                : "Enviar examen"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamenTeoricoEstudiante;
