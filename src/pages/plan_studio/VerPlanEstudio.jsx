import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Trash2,
  Pencil,
  Plus,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Swal from "sweetalert2";

function VerPlanEstudio() {
  const navigate = useNavigate();

  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [planAbierto, setPlanAbierto] = useState(null);

  useEffect(() => {
    obtenerPlanes();
  }, []);

  const obtenerPlanes = async () => {
    try {
      const response = await axios.get("/plan-estudio/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setPlanes(data);
    } catch (error) {
      console.error("Error cargando planes:", error.response?.data || error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los planes de estudio.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setCargando(false);
    }
  };

  const eliminarPlan = async (planId) => {
    try {
      const confirmar = await Swal.fire({
        title: "¿Eliminar plan?",
        text: "Esta acción eliminará el plan, sus temas y subtemas.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b",
      });

      if (!confirmar.isConfirmed) return;

      await axios.delete(`/plan-estudio/${planId}/`);

      setPlanes((prev) => prev.filter((plan) => plan.id !== planId));

      Swal.fire({
        icon: "success",
        title: "Plan eliminado",
        text: "El plan de estudio fue eliminado correctamente.",
        confirmButtonColor: "#16a34a",
      });
    } catch (error) {
      console.error("Error eliminando plan:", error.response?.data || error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el plan de estudio.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Planes de Estudio
            </h1>

            <p className="text-slate-500 mt-2">
              Visualización de planes registrados con sus temas y subtemas.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
            onClick={() => navigate("/dashboard/plan-estudio")}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            Volver
          </button>

          <button
            onClick={() => navigate("/dashboard/plan-estudio/nuevo")}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Nuevo plan
          </button>


          </div>

          
        </div>

        {cargando && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-500">
            Cargando planes...
          </div>
        )}

        {!cargando && planes.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-500">
            No hay planes de estudio registrados.
          </div>
        )}

        <div className="space-y-5">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden"
            >
             <div className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 gap-4">

                <button
                  type="button"
                  onClick={() =>
                    setPlanAbierto(planAbierto === plan.id ? null : plan.id)
                  }
                  className="flex items-center gap-4 flex-1 text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <BookOpen className="text-blue-700" size={24} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {plan.nombre}
                    </h2>

                    <p className="text-slate-500 mt-1">
                      Nivel: {plan.tipo_curso}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/dashboard/plan-estudio/editar/${plan.id}`)
                    }
                    className="p-2 rounded-xl hover:bg-blue-100 text-blue-600 transition"
                    title="Editar plan"
                  >
                    <Pencil size={20} />
                  </button>

                 <button
                    type="button"
                    onClick={() => eliminarPlan(plan.id)}
                    className="p-2 rounded-xl hover:bg-red-100 text-red-600 transition"
                    title="Eliminar plan"
                  >
                    <Trash2 size={20} />
                  </button>
                 

                  <button
                    type="button"
                    onClick={() =>
                      setPlanAbierto(
                        planAbierto === plan.id
                          ? null
                          : plan.id
                      )
                    }
                    className="p-2 rounded-xl hover:bg-slate-100 transition"
                  >
                    <ChevronDown
                      className={`text-slate-500 transition ${
                        planAbierto === plan.id
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                </div>

              </div>

              {planAbierto === plan.id && (
                <div className="border-t border-slate-200 p-6">
                  {plan.descripcion && (
                    <p className="text-slate-600 mb-6">{plan.descripcion}</p>
                  )}

                  <div className="space-y-5">
                    {plan.temas?.map((tema, indexTema) => (
                      <div
                        key={tema.id || indexTema}
                        className="border border-slate-200 rounded-2xl p-5 bg-slate-50"
                      >
                        <h3 className="font-bold text-slate-800 text-lg mb-2">
                          {indexTema + 1}. {tema.titulo}
                        </h3>

                        {tema.descripcion && (
                          <p className="text-slate-500 mb-4">
                            {tema.descripcion}
                          </p>
                        )}

                        <div className="space-y-2">
                          {tema.subtemas?.map((subtema, indexSubtema) => (
                            <div
                              key={subtema.id || indexSubtema}
                              className="bg-white border border-slate-200 rounded-xl px-4 py-3"
                            >
                              <p className="font-semibold text-slate-700">
                                {indexTema + 1}.{indexSubtema + 1}{" "}
                                {subtema.titulo}
                              </p>

                              {subtema.descripcion && (
                                <p className="text-sm text-slate-500 mt-1">
                                  {subtema.descripcion}
                                </p>
                              )}
                            </div>
                          ))}

                          {(!tema.subtemas || tema.subtemas.length === 0) && (
                            <p className="text-slate-500 text-sm">
                              Este tema no tiene subtemas registrados.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {(!plan.temas || plan.temas.length === 0) && (
                      <p className="text-slate-500">
                        Este plan no tiene temas registrados.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VerPlanEstudio;
