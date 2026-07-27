import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  GraduationCap,
  Layers3,
  ListTree,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import axios from "../../api/axios";

const obtenerEstiloNivel = (tipoCurso) => {
  const nivel = String(tipoCurso || "").trim().toLowerCase();

  if (nivel === "principiante") {
    return {
      icono: "bg-emerald-50 text-emerald-600 ring-emerald-100",
      etiqueta: "bg-emerald-50 text-emerald-700 border-emerald-100",
      borde: "hover:border-emerald-200",
    };
  }

  if (nivel === "intermedio") {
    return {
      icono: "bg-amber-50 text-amber-600 ring-amber-100",
      etiqueta: "bg-amber-50 text-amber-700 border-amber-100",
      borde: "hover:border-amber-200",
    };
  }

  if (nivel === "avanzado") {
    return {
      icono: "bg-violet-50 text-violet-600 ring-violet-100",
      etiqueta: "bg-violet-50 text-violet-700 border-violet-100",
      borde: "hover:border-violet-200",
    };
  }

  return {
    icono: "bg-blue-50 text-blue-600 ring-blue-100",
    etiqueta: "bg-blue-50 text-blue-700 border-blue-100",
    borde: "hover:border-blue-200",
  };
};

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
      console.error(
        "Error cargando planes:",
        error.response?.data || error
      );

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

      setPlanes((prev) =>
        prev.filter((plan) => plan.id !== planId)
      );

      Swal.fire({
        icon: "success",
        title: "Plan eliminado",
        text: "El plan de estudio fue eliminado correctamente.",
        confirmButtonColor: "#16a34a",
      });
    } catch (error) {
      console.error(
        "Error eliminando plan:",
        error.response?.data || error
      );

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el plan de estudio.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const totalTemas = planes.reduce(
    (total, plan) =>
      total + (Array.isArray(plan.temas) ? plan.temas.length : 0),
    0
  );

  const totalSubtemas = planes.reduce(
    (total, plan) =>
      total +
      (Array.isArray(plan.temas)
        ? plan.temas.reduce(
            (subtotal, tema) =>
              subtotal +
              (Array.isArray(tema.subtemas)
                ? tema.subtemas.length
                : 0),
            0
          )
        : 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.45)] backdrop-blur sm:p-7">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-indigo-100/50 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200/70">
                <BookOpen size={27} strokeWidth={2.1} />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    <Sparkles size={13} />
                    Gestión académica
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Planes de Estudio
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Administra los planes registrados y consulta fácilmente sus
                  temas y subtemas.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/dashboard/plan-estudio")}
                className="cursor-pointer inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-100"
              >
                <ArrowLeft size={19} />
                Volver
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard/plan-estudio/nuevo")
                }
                className="cursor-pointer inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 font-bold text-white shadow-lg shadow-blue-200/70 transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <Plus size={19} strokeWidth={2.5} />
                Nuevo plan
              </button>
            </div>
          </div>
        </section>

        {!cargando && planes.length > 0 && (
          <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <article className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <GraduationCap size={22} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">
                  {planes.length}
                </p>
                <p className="text-sm font-medium text-slate-500">
                  Planes registrados
                </p>
              </div>
            </article>

            <article className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Layers3 size={22} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">
                  {totalTemas}
                </p>
                <p className="text-sm font-medium text-slate-500">
                  Temas disponibles
                </p>
              </div>
            </article>

            <article className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ListTree size={22} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">
                  {totalSubtemas}
                </p>
                <p className="text-sm font-medium text-slate-500">
                  Subtemas registrados
                </p>
              </div>
            </article>
          </section>
        )}

        {cargando && (
          <div className="space-y-4" aria-label="Cargando planes de estudio">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-200" />
                  <div className="flex-1">
                    <div className="h-5 w-40 rounded-lg bg-slate-200" />
                    <div className="mt-3 h-4 w-28 rounded-lg bg-slate-100" />
                  </div>
                  <div className="hidden gap-2 sm:flex">
                    <div className="h-10 w-10 rounded-xl bg-slate-100" />
                    <div className="h-10 w-10 rounded-xl bg-slate-100" />
                    <div className="h-10 w-10 rounded-xl bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!cargando && planes.length === 0 && (
          <section className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BookOpen size={30} />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900">
              Aún no hay planes de estudio
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Registra el primer plan para comenzar a organizar los temas y
              subtemas de cada nivel.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard/plan-estudio/nuevo")
              }
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 font-bold text-white shadow-lg shadow-blue-200/60 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <Plus size={19} />
              Crear primer plan
            </button>
          </section>
        )}

        {!cargando && planes.length > 0 && (
          <section className="space-y-4">
            {planes.map((plan, indexPlan) => {
              const abierto = planAbierto === plan.id;
              const temas = Array.isArray(plan.temas)
                ? plan.temas
                : [];
              const cantidadSubtemas = temas.reduce(
                (total, tema) =>
                  total +
                  (Array.isArray(tema.subtemas)
                    ? tema.subtemas.length
                    : 0),
                0
              );
              const estilo = obtenerEstiloNivel(plan.tipo_curso);

              return (
                <article
                  key={plan.id}
                  className={`group overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_12px_35px_-28px_rgba(15,23,42,0.55)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-28px_rgba(37,99,235,0.35)] ${estilo.borde}`}
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <button
                      type="button"
                      onClick={() =>
                        setPlanAbierto(abierto ? null : plan.id)
                      }
                      className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl text-left focus:outline-none focus:ring-4 focus:ring-blue-50"
                      aria-expanded={abierto}
                      aria-label={`${abierto ? "Ocultar" : "Mostrar"} contenido de ${plan.nombre}`}
                    >
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${estilo.icono}`}
                      >
                        <BookOpen size={25} strokeWidth={2.1} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                            Plan {String(indexPlan + 1).padStart(2, "0")}
                          </span>

                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${estilo.etiqueta}`}
                          >
                            {plan.tipo_curso || "Sin nivel"}
                          </span>
                        </div>

                        <h2 className="truncate text-lg font-black text-slate-900 sm:text-xl">
                          {plan.nombre}
                        </h2>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Layers3 size={15} />
                            {temas.length}{" "}
                            {temas.length === 1 ? "tema" : "temas"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <ListTree size={15} />
                            {cantidadSubtemas}{" "}
                            {cantidadSubtemas === 1
                              ? "subtema"
                              : "subtemas"}
                          </span>
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/dashboard/plan-estudio/editar/${plan.id}`
                          )
                        }
                        className="cursor-pointer inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 text-sm font-bold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-50"
                        title="Editar plan"
                        aria-label={`Editar ${plan.nombre}`}
                      >
                        <Pencil size={17} />
                        <span className="hidden md:inline">Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => eliminarPlan(plan.id)}
                        className=" cursor-pointer inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 text-sm font-bold text-red-600 transition hover:border-red-200 hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-50"
                        title="Eliminar plan"
                        aria-label={`Eliminar ${plan.nombre}`}
                      >
                        <Trash2 size={17} />
                        <span className="hidden md:inline">Eliminar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setPlanAbierto(abierto ? null : plan.id)
                        }
                        className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-100"
                        aria-expanded={abierto}
                        aria-label={
                          abierto
                            ? "Contraer contenido"
                            : "Expandir contenido"
                        }
                      >
                        <ChevronDown
                          size={19}
                          className={`transition-transform duration-300 ${
                            abierto ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {abierto && (
                    <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-6">
                      {plan.descripcion && (
                        <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                          {plan.descripcion}
                        </div>
                      )}

                      {temas.length > 0 ? (
                        <div className="space-y-4">
                          {temas.map((tema, indexTema) => {
                            const subtemas = Array.isArray(tema.subtemas)
                              ? tema.subtemas
                              : [];

                            return (
                              <div
                                key={tema.id || indexTema}
                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                                    {indexTema + 1}
                                  </span>

                                  <div className="min-w-0 flex-1">
                                    <h3 className="font-black text-slate-800">
                                      {tema.titulo}
                                    </h3>

                                    {tema.descripcion && (
                                      <p className="mt-1 text-sm leading-6 text-slate-500">
                                        {tema.descripcion}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {subtemas.length > 0 ? (
                                  <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                                    {subtemas.map(
                                      (subtema, indexSubtema) => (
                                        <div
                                          key={
                                            subtema.id || indexSubtema
                                          }
                                          className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                                        >
                                          <span className="mt-0.5 flex h-6 min-w-6 items-center justify-center rounded-lg bg-blue-100 px-1.5 text-xs font-black text-blue-700">
                                            {indexTema + 1}.
                                            {indexSubtema + 1}
                                          </span>

                                          <div>
                                            <p className="text-sm font-bold text-slate-700">
                                              {subtema.titulo}
                                            </p>

                                            {subtema.descripcion && (
                                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                                {subtema.descripcion}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                                    Este tema no tiene subtemas registrados.
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
                          <Layers3
                            className="mx-auto text-slate-300"
                            size={28}
                          />
                          <p className="mt-3 text-sm font-medium text-slate-500">
                            Este plan no tiene temas registrados.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

export default VerPlanEstudio;