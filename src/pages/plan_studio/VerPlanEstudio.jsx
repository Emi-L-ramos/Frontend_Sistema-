import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

function VerPlanEstudio({ onClose }) {  // ← Corregido: añade las llaves
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
      console.log("RESPUESTA COMPLETA:", JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.length > 0) {
        console.log("Primer plan:", response.data[0]);
        console.log("¿El primer plan tiene 'temas'?", response.data[0].hasOwnProperty('temas'));
        console.log("Contenido de 'temas':", response.data[0].temas);
        console.log("¿Es un array?", Array.isArray(response.data[0].temas));
        console.log("Longitud del array temas:", response.data[0].temas?.length);
        
        const primerPlan = response.data[0];
        console.log("Primer plan detalles:", {
          id: primerPlan.id,
          nombre: primerPlan.nombre,
          tieneTemas: !!primerPlan.temas,
          cantidadTemas: primerPlan.temas?.length || 0,
          temas: primerPlan.temas
        });
        
        if (primerPlan.temas && primerPlan.temas.length > 0) {
          console.log("Primer tema:", primerPlan.temas[0]);
          console.log("Subtemas del primer tema:", primerPlan.temas[0].subtemas);
        }
      }

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setPlanes(data);
    } catch (error) {
      console.error("Error cargando planes:", error.response?.data || error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Planes de Estudio
            </h1>
            <p className="text-slate-500 mt-2">
              Visualización de planes registrados con sus temas y subtemas.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard/plan-estudio")}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            Volver
          </button>
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
          {planes.map((plan) => {
            // ← Este log ahora está DENTRO del map
            console.log("Renderizando plan:", {
              id: plan.id,
              nombre: plan.nombre,
              tipo_curso: plan.tipo_curso,
              temas: plan.temas,
              temasExiste: !!plan.temas,
              temasLongitud: plan.temas?.length
            });
            
            return (
              <div
                key={plan.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setPlanAbierto(planAbierto === plan.id ? null : plan.id)
                  }
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
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
                  </div>

                  <ChevronDown
                    className={`text-slate-500 transition ${
                      planAbierto === plan.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {planAbierto === plan.id && (
                  <div className="border-t border-slate-200 p-6">
                    {plan.descripcion && (
                      <p className="text-slate-600 mb-6">{plan.descripcion}</p>
                    )}

                    <div className="space-y-5">
                      {plan.temas?.map((tema, indexTema) => {
                        console.log("Renderizando tema:", {
                          id: tema.id,
                          titulo: tema.titulo,
                          subtemas: tema.subtemas,
                          subtemasLength: tema.subtemas?.length
                        });
                        
                        return (
                          <div
                            key={tema.id}
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
                                  key={subtema.id}
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
                        );
                      })}

                      {(!plan.temas || plan.temas.length === 0) && (
                        <p className="text-slate-500">
                          Este plan no tiene temas registrados.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VerPlanEstudio;
