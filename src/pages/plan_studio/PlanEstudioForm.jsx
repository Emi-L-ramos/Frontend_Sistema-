import { useEffect, useState } from "react";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/axios";
import Swal from "sweetalert2";

function PlanEstudioForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editando = Boolean(id);

  const [tiposCurso, setTiposCurso] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargandoPlan, setCargandoPlan] = useState(editando);

  const [formData, setFormData] = useState({
    nombre: "",
    tipo_curso: "",
    activo: true,
    temas: [
      {
        titulo: "",
        activo: true,
        subtemas: [
          {
            titulo: "",
            activo: true,
          },
        ],
      },
    ],
  });

  useEffect(() => {
    obtenerTiposCurso();
  }, []);

  useEffect(() => {
    if (editando) {
      obtenerPlan();
    }
  }, [id]);

  const obtenerTiposCurso = async () => {
    try {
      const response = await axios.get("/plan-estudio/tipos-curso/");
      setTiposCurso(response.data);
    } catch (error) {
      console.error("Error cargando tipos de curso:", error);

      setTiposCurso([
        { value: "Principiante", label: "Principiante" },
        { value: "Intermedio", label: "Intermedio" },
        { value: "Avanzado", label: "Avanzado" },
      ]);
    }
  };

  const obtenerPlan = async () => {
    try {
      setCargandoPlan(true);

      const response = await axios.get(`/plan-estudio/${id}/`);
      const plan = response.data;

      setFormData({
        nombre: plan.nombre || "",
        tipo_curso: plan.tipo_curso || "",
        activo: plan.activo ?? true,
        temas:
          plan.temas && plan.temas.length > 0
            ? plan.temas.map((tema) => ({
                titulo: tema.titulo || "",
                activo: tema.activo ?? true,
                subtemas:
                  tema.subtemas && tema.subtemas.length > 0
                    ? tema.subtemas.map((subtema) => ({
                        titulo: subtema.titulo || "",
                        activo: subtema.activo ?? true,
                      }))
                    : [
                        {
                          titulo: "",
                          activo: true,
                        },
                      ],
              }))
            : [
                {
                  titulo: "",
                  activo: true,
                  subtemas: [
                    {
                      titulo: "",
                      activo: true,
                    },
                  ],
                },
              ],
      });
    } catch (error) {
      console.error("Error cargando plan:", error.response?.data || error);
      setError("No se pudo cargar el plan de estudio.");
    } finally {
      setCargandoPlan(false);
    }
  };

  const handlePlanChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleTemaChange = (indexTema, e) => {
    const nuevosTemas = [...formData.temas];

    nuevosTemas[indexTema][e.target.name] = e.target.value;

    setFormData({
      ...formData,
      temas: nuevosTemas,
    });
  };

  const handleSubtemaChange = (indexTema, indexSubtema, e) => {
    const nuevosTemas = [...formData.temas];

    nuevosTemas[indexTema].subtemas[indexSubtema][e.target.name] =
      e.target.value;

    setFormData({
      ...formData,
      temas: nuevosTemas,
    });
  };

  const agregarTema = () => {
    setFormData({
      ...formData,
      temas: [
        ...formData.temas,
        {
          titulo: "",
          activo: true,
          subtemas: [
            {
              titulo: "",
              activo: true,
            },
          ],
        },
      ],
    });
  };

  const eliminarTema = (indexTema) => {
    const nuevosTemas = formData.temas.filter(
      (_, index) => index !== indexTema
    );

    setFormData({
      ...formData,
      temas: nuevosTemas,
    });
  };

  const agregarSubtema = (indexTema) => {
    const nuevosTemas = [...formData.temas];

    nuevosTemas[indexTema].subtemas.push({
      titulo: "",
      activo: true,
    });

    setFormData({
      ...formData,
      temas: nuevosTemas,
    });
  };

  const eliminarSubtema = (indexTema, indexSubtema) => {
    const nuevosTemas = [...formData.temas];

    nuevosTemas[indexTema].subtemas = nuevosTemas[
      indexTema
    ].subtemas.filter((_, index) => index !== indexSubtema);

    setFormData({
      ...formData,
      temas: nuevosTemas,
    });
  };

  const limpiarFormulario = () => {
    setFormData({
      nombre: "",
      tipo_curso: "",
      activo: true,
      temas: [
        {
          titulo: "",
          activo: true,
          subtemas: [
            {
              titulo: "",
              activo: true,
            },
          ],
        },
      ],
    });
  };

  const guardarPlan = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!formData.nombre.trim()) {
      setError("Debe ingresar el nombre del plan de estudio.");
      return;
    }

    if (!formData.tipo_curso) {
      setError("Debe seleccionar el nivel del curso.");
      return;
    }

    if (formData.temas.length === 0) {
      setError("Debe agregar al menos un tema.");
      return;
    }

    const temasValidos = formData.temas.every((tema) => tema.titulo.trim());

    if (!temasValidos) {
      setError("Todos los temas deben tener un título.");
      return;
    }

    const subtemasValidos = formData.temas.every((tema) =>
      tema.subtemas.every((subtema) => subtema.titulo.trim())
    );

    if (!subtemasValidos) {
      setError("Todos los subtemas deben tener un título.");
      return;
    }

    const payload = {
      ...formData,
      temas: formData.temas.map((tema, indexTema) => ({
        titulo: tema.titulo.trim(),
        orden: indexTema + 1,
        activo: tema.activo ?? true,
        subtemas: tema.subtemas.map((subtema, indexSubtema) => ({
          titulo: subtema.titulo.trim(),
          orden: indexSubtema + 1,
          activo: subtema.activo ?? true,
        })),
      })),
    };

    try {
      setGuardando(true);

      if (editando) {
        await axios.put(`/plan-estudio/${id}/`, payload);

        await Swal.fire({
          icon: "success",
          title: "Plan actualizado",
          text: "El plan de estudio fue actualizado correctamente.",
          confirmButtonColor: "#16a34a",

        });
        navigate("/dashboard/plan-estudio/ver");
      } else {
        await axios.post("/plan-estudio/", payload);

        setMensaje("Plan de estudio registrado correctamente.");
        await Swal.fire({
          icon: "success",
          title: "Plan Registrado",
          text: "El plan de estudio Registrado correctamente.",
          confirmButtonColor: "#16a34a",
        });
        limpiarFormulario();
        navigate("/dashboard/plan-estudio/ver");
      }
    } catch (error) {
      console.error("Error guardando plan:", error.response?.data || error);

      if (error.response?.data) {
        setError(JSON.stringify(error.response.data));
      } else {
        setError("No se pudo guardar el plan de estudio.");
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cargandoPlan) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 text-slate-500">
          Cargando plan de estudio...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {editando ? "Editar Plan de Estudio" : "Nuevo Plan de Estudio"}
            </h1>

            <p className="text-slate-500 mt-2">
              {editando
                ? "Modifica el plan, sus temas y subtemas."
                : "Registra el plan según el nivel del curso, agregando temas y subtemas."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard/plan-estudio/ver")}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft size={18} />
            Volver
          </button>
        </div>

        <form onSubmit={guardarPlan} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nombre del plan
              </label>

              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handlePlanChange}
                placeholder="Ej: Plan de estudio principiante"
                className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nivel del curso
              </label>

              <select
                name="tipo_curso"
                value={formData.tipo_curso}
                onChange={handlePlanChange}
                className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                <option value="">Seleccione un nivel</option>

                {tiposCurso.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800">
                Temas del plan
              </h2>

              <button
                type="button"
                onClick={agregarTema}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold"
              >
                <Plus size={18} />
                Agregar tema
              </button>
            </div>

            <div className="space-y-5">
              {formData.temas.map((tema, indexTema) => (
                <div
                  key={indexTema}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800">
                      Tema {indexTema + 1}
                    </h3>

                    {formData.temas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarTema(indexTema)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  <div className="mb-5">
                    <input
                      type="text"
                      name="titulo"
                      value={tema.titulo}
                      onChange={(e) => handleTemaChange(indexTema, e)}
                      placeholder="Título del tema"
                      className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-700">
                        Subtemas
                      </h4>

                      <button
                        type="button"
                        onClick={() => agregarSubtema(indexTema)}
                        className="text-blue-600 font-semibold text-sm"
                      >
                        + Agregar subtema
                      </button>
                    </div>

                    {tema.subtemas.map((subtema, indexSubtema) => (
                      <div
                        key={indexSubtema}
                        className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3"
                      >
                        <input
                          type="text"
                          name="titulo"
                          value={subtema.titulo}
                          onChange={(e) =>
                            handleSubtemaChange(indexTema, indexSubtema, e)
                          }
                          placeholder="Título del subtema"
                          className="h-11 border border-slate-300 rounded-xl px-4 outline-none bg-white"
                        />

                        {tema.subtemas.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              eliminarSubtema(indexTema, indexSubtema)
                            }
                            className="px-3 rounded-xl text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {mensaje && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
              {mensaje}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              <Save size={20} />
              {guardando
                ? editando
                  ? "Actualizando..."
                  : "Guardando..."
                : editando
                ? "Actualizar plan"
                : "Guardar plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PlanEstudioForm;
