import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaClock as FaClockIcon,
  FaChalkboardTeacher,
  FaPlus,
  FaUserAlt,
  FaGraduationCap,
  FaClipboardList,
  FaFilter,
} from "react-icons/fa";
import { listarCitas, citasDeHoy, listarInstructores } from "../../api/calendario";
import CalendarioForm from "../../components/calendarioForm.jsx";
import CalendarioEditarForm from "../../components/calendarioEditarForm.jsx";
import ModalExamenManual from "../../components/ModalExamenManual.jsx";
import { useAuth } from "../../context/AuthContext";

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS = ["Dom","Lun","Mar","Mier","Jue","Vie","Sab"];
const INSTRUCTOR_COLORS = {
  1: "bg-slate-400 text-white",
  2: "bg-green-400 text-white",
  3: "bg-indigo-400 text-white",
  4: "bg-zinc-400 text-white",
  5: "bg-stone-400 text-white",
  6: "bg-gray-400 text-white",
};

function buildMonthCells(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) {
    cells.push({
      day: d,
      dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

export default function Calendario() {
  const { user } = useAuth();

  const rol = String(user?.rol || "").toLowerCase();
  const esAdmin = rol === "admin";
  const esInstructor = rol === "instructor";
  const esEstudiante = rol === "estudiante";

  const hoy = new Date();
  const [vy, setVy] = useState(hoy.getFullYear());
  const [vm, setVm] = useState(hoy.getMonth());
  const [filtroInstructor, setFiltroInstructor] = useState("all");
  const [instructores, setInstructores] = useState([]);
  const [citas, setCitas] = useState([]);
  const [hoyCitas, setHoyCitas] = useState([]);
  const [modalNueva, setModalNueva] = useState(false);
  const [modalExamen, setModalExamen] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const cargar = async () => {
    const mes = `${vy}-${String(vm + 1).padStart(2, "0")}`;
    try {
      const data = await listarCitas({
        mes,
        instructor: esInstructor ? undefined : filtroInstructor,
      });
      setCitas(data.results || data);
      if (!esInstructor) {
        const hoyData = await citasDeHoy();
        setHoyCitas(hoyData.results || hoyData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { cargar(); }, [vy, vm, filtroInstructor]);

  useEffect(() => {
    if (!esInstructor) {
      listarInstructores()
        .then((d) => setInstructores(d.results || d))
        .catch(() => {});
    }
  }, [esInstructor]);

  const cells = useMemo(() => buildMonthCells(vy, vm), [vy, vm]);

  const goPrev = () => {
    if (vm === 0) {
      setVm(11);
      setVy((y) => y - 1);
    } else {
      setVm((m) => m - 1);
    }
  };

  const goNext = () => {
    if (vm === 11) {
      setVm(0);
      setVy((y) => y + 1);
    } else {
      setVm((m) => m + 1);
    }
  };

  const clasesMes = [...citas].sort((a, b) =>
    a.fecha === b.fecha
      ? (a.hora_inicio || "").localeCompare(b.hora_inicio || "")
      : a.fecha.localeCompare(b.fecha)
  );

  {/*para vista admin*/}
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-${String(hoy.getDate()).padStart(2,"0")}`;
  const en7Dias = new Date(hoy);
  en7Dias.setDate(hoy.getDate() + 7);
  const en7DiasStr = en7Dias.toISOString().slice(0, 10);

  const examenesProximos = citas
    .filter((c) => c.es_examen && c.fecha >= hoyStr && c.fecha <= en7DiasStr)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const citasDelDiaSeleccionado = diaSeleccionado
    ? citas.filter((a) => a.fecha === diaSeleccionado)
    : [];

  const asignacionesPanelAdmin = diaSeleccionado
    ? citasDelDiaSeleccionado
    : hoyCitas;

  const totalAsignacionesMes = citas.length;

  const totalAsignacionesHoy = hoyCitas.length;

  const instructoresConAsignaciones = new Set(
    citas
      .map((c) => c.instructor)
      .filter(Boolean)
  ).size;

  const nombreFechaSeleccionada = diaSeleccionado
    ? new Date(diaSeleccionado + "T00:00:00").toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  {/*para vista instructor*/}
  const hoyCitasDesdeCitas = citas.filter((a) => a.fecha === hoyStr);

  const asignacionesPanelInstructor = diaSeleccionado
    ? citasDelDiaSeleccionado
    : clasesMes;

  const totalAsignacionesHoyInstructor = hoyCitasDesdeCitas.length;

  {/*para vista estudiante*/}
  const asignacionesPanelEstudiante = diaSeleccionado
    ? citasDelDiaSeleccionado
    : clasesMes;

  const totalAsignacionesHoyEstudiante = citas.filter(
    (a) => a.fecha === hoyStr
  ).length;

  const totalExamenesEstudiante = citas.filter(
    (a) => a.es_examen && a.fecha >= hoyStr
  ).length;

  /* ============== VISTA INSTRUCTOR ============== */
  if (esInstructor) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-4 py-5 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                <FaCalendarAlt className="text-3xl" />
              </div>

              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">
                  Mi Calendario
                </h1>

                <p className="mt-2 text-base text-slate-500">
                  Consulta de clases, horarios y exámenes asignados.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalExamen(true)}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-8 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-700 md:w-auto"
            >
              <FaGraduationCap className="text-sm" />
              Examen Policial
            </button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-blue-100 bg-blue-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                    <FaCalendarCheck className="text-4xl" />
                  </div>

                  <div>
                    <p className="text-base font-bold text-slate-600">
                      Clases del mes
                    </p>

                    <p className="mt-2 text-4xl font-black text-blue-600">
                      {citas.length}
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      Clases asignadas en el mes actual
                    </p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -bottom-8 -right-6 text-blue-500 opacity-10">
                <FaCalendarCheck className="text-[125px]" />
              </div>
            </div>

            <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                    <FaClockIcon className="text-4xl" />
                  </div>

                  <div>
                    <p className="text-base font-bold text-slate-600">
                      Clases de hoy
                    </p>

                    <p className="mt-2 text-4xl font-black text-emerald-600">
                      {totalAsignacionesHoyInstructor}
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      Actividades programadas para hoy
                    </p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -bottom-8 -right-6 text-emerald-500 opacity-10">
                <FaClockIcon className="text-[125px]" />
              </div>
            </div>

            <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-violet-100 bg-violet-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:col-span-2 xl:col-span-1">
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-violet-600 shadow-sm ring-1 ring-violet-100">
                    <FaGraduationCap className="text-4xl" />
                  </div>

                  <div>
                    <p className="text-base font-bold text-slate-600">
                      Exámenes próximos
                    </p>

                    <p className="mt-2 text-4xl font-black text-violet-600">
                      {examenesProximos.length}
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      Programados en los próximos 7 días
                    </p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -bottom-8 -right-6 text-violet-500 opacity-10">
                <FaGraduationCap className="text-[125px]" />
              </div>
            </div>
          </div>

          {examenesProximos.length > 0 && (
            <div className="mb-5 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FaGraduationCap className="text-amber-700" />

                <h3 className="text-sm font-black text-amber-800">
                  Exámenes próximos en los siguientes 7 días
                </h3>
              </div>

              <ul className="space-y-2">
                {examenesProximos.map((ex) => {
                  const fechaEx = new Date(ex.fecha + "T00:00:00");
                  const esHoy = ex.fecha === hoyStr;

                  const etiqueta = esHoy
                    ? "HOY"
                    : fechaEx.toLocaleDateString("es-ES", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      });

                  return (
                    <li
                      key={ex.id}
                      className="flex flex-wrap items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100"
                    >
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          esHoy
                            ? "bg-red-500 text-white"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {etiqueta}
                      </span>

                      <span className="font-black">
                        {ex.estudiante_nombre}
                      </span>

                      <span className="font-semibold text-amber-700">
                        {ex.hora_inicio?.slice(0, 5)} — {ex.hora_fin?.slice(0, 5)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-6">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {MONTHS[vm]} {vy}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Vista mensual de tus clases asignadas
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVy(hoy.getFullYear());
                      setVm(hoy.getMonth());
                      setDiaSeleccionado(hoyStr);
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
                  >
                    Hoy
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <div className="grid grid-cols-7 gap-2 md:gap-3">
                  {DAYS.map((d) => (
                    <div
                      key={d}
                      className="py-2 text-center text-xs font-black uppercase tracking-wide text-slate-500"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 place-items-center gap-2 sm:place-items-stretch md:gap-3">
                  {cells.map((c, idx) => {
                    if (!c) {
                      return (
                        <div
                          key={idx}
                          className="h-10 w-10 sm:h-auto sm:min-h-[95px] sm:w-full lg:min-h-[112px]"
                        />
                      );
                    }

                    const dia = citas.filter((a) => a.fecha === c.dateStr);
                    const visibles = dia.slice(0, 2);
                    const extra = dia.length - visibles.length;
                    const esHoy = c.dateStr === hoyStr;

                    return (
                      <div
                        key={idx}
                        onClick={() => setDiaSeleccionado(c.dateStr)}
                        className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all duration-200 sm:block sm:h-auto sm:min-h-[95px] sm:w-full sm:rounded-2xl sm:border sm:p-2 lg:min-h-[112px] ${
                          diaSeleccionado === c.dateStr
                            ? "sm:scale-[1.02] sm:border-blue-400 sm:bg-blue-50 sm:shadow-sm"
                            : "sm:border-slate-200 sm:bg-white sm:hover:border-blue-200 sm:hover:bg-blue-50/30"
                        }`}
                      >
                        {dia.length > 0 && (
                          <span className="absolute -right-1 -top-2 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-md sm:-right-2 sm:-top-2 sm:h-6 sm:min-w-6 sm:px-1.5 sm:text-[11px]">
                            {dia.length}
                          </span>
                        )}
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black sm:mb-2 ${
                            diaSeleccionado === c.dateStr
                              ? "border-blue-600 bg-blue-600 text-white"
                              : esHoy
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-800"
                          }`}
                        >
                          {c.day}
                        </div>

                        <div className="hidden space-y-1 sm:block">
                          {visibles.map((a) => (
                            <div
                              key={a.id}
                              className={`truncate rounded-lg px-2 py-1 text-[11px] font-bold leading-tight ${
                                a.es_examen
                                  ? "bg-amber-600 text-white"
                                  : INSTRUCTOR_COLORS[a.instructor] ||
                                    "bg-slate-700 text-white"
                              }`}
                              title={`${a.hora_inicio?.slice(0, 5)} ${a.estudiante_nombre}`}
                            >
                              {a.hora_inicio?.slice(0, 5)} {a.estudiante_nombre}
                            </div>
                          ))}

                          {extra > 0 && (
                            <div className="text-[11px] font-black text-slate-400">
                              +{extra} más
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="h-fit overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <FaClipboardList className="text-xl" />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      {diaSeleccionado
                        ? `Clases del ${new Date(diaSeleccionado + "T00:00:00").toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}`
                        : "Clases programadas este mes"}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {asignacionesPanelInstructor.length} actividad(es)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-5">
                {asignacionesPanelInstructor.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-400">
                    No hay clases para mostrar.
                  </div>
                )}

                {asignacionesPanelInstructor.map((a) => {
                  const totalClasesMatricula = citas.filter(
                    (x) => x.matricula === a.matricula && !x.es_examen
                  ).length;

                  return (
                    <div
                      key={a.id}
                      className={`w-full rounded-2xl border p-4 text-left ${
                        a.es_examen
                          ? "border-amber-200 bg-amber-50"
                          : "border-blue-100 bg-blue-50/60"
                      }`}
                    >
                      <div
                        className={`mb-3 flex items-center gap-2 text-sm font-black ${
                          a.es_examen ? "text-amber-700" : "text-blue-700"
                        }`}
                      >
                        {a.es_examen ? (
                          <FaGraduationCap className="text-sm" />
                        ) : (
                          <FaClockIcon className="text-sm" />
                        )}

                        {a.hora_inicio?.slice(0, 5)} - {a.hora_fin?.slice(0, 5)}
                      </div>

                      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                        <FaUserAlt className="text-slate-400" />
                        {a.estudiante_nombre}
                      </div>

                      <div className="text-xs font-black text-slate-500">
                        {a.es_examen
                          ? "EXAMEN POLICIAL"
                          : `Clase ${a.numero_clase}/${totalClasesMatricula}`}
                      </div>

                      {a.horario && (
                        <div className="mt-2 text-xs font-semibold text-slate-400">
                          Horario: {a.horario}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <ModalExamenManual
            abierto={modalExamen}
            onClose={() => setModalExamen(false)}
            onCreada={cargar}
          />
        </div>
      </div>
    );
  }

  /* ============== VISTA ESTUDIANTE ============== */
  if (esEstudiante) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-4 py-5 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                <FaCalendarAlt className="text-3xl" />
              </div>

              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">
                  Mi Calendario
                </h1>

                <p className="mt-2 text-base text-slate-500">
                  Consulta tus clases, horarios asignados y actividades programadas.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-blue-100 bg-blue-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                    <FaCalendarCheck className="text-4xl" />
                  </div>

                  <div>
                    <p className="text-base font-bold text-slate-600">
                      Clases del mes
                    </p>

                    <p className="mt-2 text-4xl font-black text-blue-600">
                      {citas.length}
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      Actividades programadas en el mes actual
                    </p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -bottom-8 -right-6 text-blue-500 opacity-10">
                <FaCalendarCheck className="text-[125px]" />
              </div>
            </div>

            <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                    <FaClockIcon className="text-4xl" />
                  </div>

                  <div>
                    <p className="text-base font-bold text-slate-600">
                      Clases de hoy
                    </p>

                    <p className="mt-2 text-4xl font-black text-emerald-600">
                      {totalAsignacionesHoyEstudiante}
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      Actividades programadas para hoy
                    </p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -bottom-8 -right-6 text-emerald-500 opacity-10">
                <FaClockIcon className="text-[125px]" />
              </div>
            </div>

            <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-violet-100 bg-violet-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:col-span-2 xl:col-span-1">
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-violet-600 shadow-sm ring-1 ring-violet-100">
                    <FaGraduationCap className="text-4xl" />
                  </div>

                  <div>
                    <p className="text-base font-bold text-slate-600">
                      Exámenes programados
                    </p>

                    <p className="mt-2 text-4xl font-black text-violet-600">
                      {totalExamenesEstudiante}
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      Exámenes pendientes o próximos
                    </p>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -bottom-8 -right-6 text-violet-500 opacity-10">
                <FaGraduationCap className="text-[125px]" />
              </div>
            </div>
          </div>

          {examenesProximos.length > 0 && (
            <div className="mb-5 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FaGraduationCap className="text-amber-700" />

                <h3 className="text-sm font-black text-amber-800">
                  Exámenes próximos en los siguientes 7 días
                </h3>
              </div>

              <ul className="space-y-2">
                {examenesProximos.map((ex) => {
                  const fechaEx = new Date(ex.fecha + "T00:00:00");
                  const esHoy = ex.fecha === hoyStr;

                  const etiqueta = esHoy
                    ? "HOY"
                    : fechaEx.toLocaleDateString("es-ES", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      });

                  return (
                    <li
                      key={ex.id}
                      className="flex flex-wrap items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100"
                    >
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          esHoy
                            ? "bg-red-500 text-white"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {etiqueta}
                      </span>

                      <span className="font-black">
                        {ex.estudiante_nombre || "Examen Policial"}
                      </span>

                      <span className="font-semibold text-amber-700">
                        {ex.hora_inicio?.slice(0, 5)} — {ex.hora_fin?.slice(0, 5)}
                      </span>

                      <span className="text-xs font-medium text-amber-600">
                        Instructor: {ex.instructor_nombre || "Sin instructor"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-6">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {MONTHS[vm]} {vy}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Vista mensual de tus actividades
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVy(hoy.getFullYear());
                      setVm(hoy.getMonth());
                      setDiaSeleccionado(hoyStr);
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
                  >
                    Hoy
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <div className="grid grid-cols-7 gap-2 md:gap-3">
                  {DAYS.map((d) => (
                    <div
                      key={d}
                      className="py-2 text-center text-xs font-black uppercase tracking-wide text-slate-500"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 place-items-center gap-2 sm:place-items-stretch md:gap-3">
                  {cells.map((c, idx) => {
                    if (!c) {
                      return (
                        <div
                          key={idx}
                          className="h-10 w-10 sm:h-auto sm:min-h-[95px] sm:w-full lg:min-h-[112px]"
                        />
                      );
                    }

                    const dia = citas.filter((a) => a.fecha === c.dateStr);
                    const visibles = dia.slice(0, 2);
                    const extra = dia.length - visibles.length;
                    const esHoy = c.dateStr === hoyStr;

                    return (
                      <div
                        key={idx}
                        onClick={() => setDiaSeleccionado(c.dateStr)}
                        className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all duration-200 sm:block sm:h-auto sm:min-h-[95px] sm:w-full sm:rounded-2xl sm:border sm:p-2 lg:min-h-[112px] ${
                          diaSeleccionado === c.dateStr
                            ? "sm:scale-[1.02] sm:border-blue-400 sm:bg-blue-50 sm:shadow-sm"
                            : "sm:border-slate-200 sm:bg-white sm:hover:border-blue-200 sm:hover:bg-blue-50/30"
                        }`}
                      >
                        {dia.length > 0 && (
                          <span className="absolute -right-1 -top-2 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-md sm:-right-2 sm:-top-2 sm:h-6 sm:min-w-6 sm:px-1.5 sm:text-[11px]">
                            {dia.length}
                          </span>
                        )}

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black sm:mb-2 ${
                            diaSeleccionado === c.dateStr
                              ? "border-blue-600 bg-blue-600 text-white"
                              : esHoy
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-800"
                          }`}
                        >
                          {c.day}
                        </div>

                        <div className="hidden space-y-1 sm:block">
                          {visibles.map((a) => (
                            <div
                              key={a.id}
                              className={`truncate rounded-lg px-2 py-1 text-[11px] font-bold leading-tight ${
                                a.es_examen
                                  ? "bg-amber-600 text-white"
                                  : INSTRUCTOR_COLORS[a.instructor] ||
                                    "bg-slate-700 text-white"
                              }`}
                              title={`${a.hora_inicio?.slice(0, 5)} ${
                                a.es_examen ? "Examen Policial" : `Clase ${a.numero_clase}`
                              }`}
                            >
                              {a.es_examen
                                ? `Examen · ${a.hora_inicio?.slice(0, 5)}`
                                : `Clase ${a.numero_clase} · ${a.hora_inicio?.slice(0, 5)}`}
                            </div>
                          ))}

                          {extra > 0 && (
                            <div className="text-[11px] font-black text-slate-400">
                              +{extra} más
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="h-fit overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <FaClipboardList className="text-xl" />
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      {diaSeleccionado
                        ? `Actividades del ${new Date(diaSeleccionado + "T00:00:00").toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}`
                        : "Mis próximas actividades"}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {asignacionesPanelEstudiante.length} actividad(es)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-5">
                {asignacionesPanelEstudiante.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-400">
                    No tienes actividades programadas.
                  </div>
                )}

                {asignacionesPanelEstudiante.map((a) => {
                  const totalClasesMatricula = citas.filter(
                    (x) => x.matricula === a.matricula && !x.es_examen
                  ).length;

                  return (
                    <div
                      key={a.id}
                      className={`w-full rounded-2xl border p-4 text-left ${
                        a.es_examen
                          ? "border-amber-200 bg-amber-50"
                          : "border-blue-100 bg-blue-50/60"
                      }`}
                    >
                      <div
                        className={`mb-3 flex items-center gap-2 text-sm font-black ${
                          a.es_examen ? "text-amber-700" : "text-blue-700"
                        }`}
                      >
                        {a.es_examen ? (
                          <FaGraduationCap className="text-sm" />
                        ) : (
                          <FaClockIcon className="text-sm" />
                        )}

                        {a.hora_inicio?.slice(0, 5)} - {a.hora_fin?.slice(0, 5)}
                      </div>

                      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                        <FaUserAlt className="text-slate-400" />
                        {a.es_examen
                          ? "Examen Policial"
                          : `Clase ${a.numero_clase}/${totalClasesMatricula}`}
                      </div>

                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                        <FaChalkboardTeacher className="text-slate-400" />
                        Instructor: {a.instructor_nombre || "Sin instructor"}
                      </div>

                      {a.horario && (
                        <div className="mt-2 text-xs font-semibold text-slate-400">
                          Horario: {a.horario}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  /* ============== VISTA ADMIN ============== */
  return (
    <div className="min-h-screen bg-[#f6f8fc] px-4 py-5 md:px-8 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
              <FaCalendarAlt className="text-3xl" />
            </div>

            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                Calendario
              </h1>

              <p className="mt-2 text-base text-slate-500">
                Asignación de horarios y estudiantes
              </p>
            </div>
          </div>

          {esAdmin && (
            <button
              type="button"
              onClick={() => setModalNueva(true)}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-600/35 md:w-auto"
            >
              <FaPlus className="text-sm transition-transform duration-300 group-hover:rotate-90" />
              Nueva Asignación
            </button>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-blue-100 bg-blue-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                  <FaCalendarCheck className="text-4xl" />
                </div>

                <div>
                  <p className="text-base font-bold text-slate-600">
                    Asignaciones totales
                  </p>

                  <p className="mt-2 text-4xl font-black text-blue-600">
                    {totalAsignacionesMes}
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Total de asignaciones en el mes
                  </p>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-8 -right-6 text-blue-500 opacity-10">
              <FaCalendarCheck className="text-[125px]" />
            </div>
          </div>

          <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                  <FaClockIcon className="text-4xl" />
                </div>

                <div>
                  <p className="text-base font-bold text-slate-600">
                    Asignaciones de hoy
                  </p>

                  <p className="mt-2 text-4xl font-black text-emerald-600">
                    {totalAsignacionesHoy}
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Clases programadas para hoy
                  </p>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-8 -right-6 text-emerald-500 opacity-10">
              <FaClockIcon className="text-[125px]" />
            </div>
          </div>

          <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-violet-100 bg-violet-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:col-span-2 xl:col-span-1">
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-violet-600 shadow-sm ring-1 ring-violet-100">
                  <FaChalkboardTeacher className="text-4xl" />
                </div>

                <div>
                  <p className="text-base font-bold text-slate-600">
                    Instructores asignados
                  </p>

                  <p className="mt-2 text-4xl font-black text-violet-600">
                    {instructoresConAsignaciones}
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-500">
                    Instructores con clases este mes
                  </p>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-8 -right-6 text-violet-500 opacity-10">
              <FaChalkboardTeacher className="text-[125px]" />
            </div>
          </div>
        </div>

        {examenesProximos.length > 0 && (
          <div className="mb-5 rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <FaGraduationCap className="text-amber-700" />

              <h3 className="text-sm font-black text-amber-800">
                Exámenes próximos en los siguientes 7 días
              </h3>
            </div>

            <ul className="space-y-2">
              {examenesProximos.map((ex) => {
                const fechaEx = new Date(ex.fecha + "T00:00:00");
                const esHoy = ex.fecha === hoyStr;

                const etiqueta = esHoy
                  ? "HOY"
                  : fechaEx.toLocaleDateString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    });

                return (
                  <li
                    key={ex.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100"
                  >
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        esHoy
                          ? "bg-red-500 text-white"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {etiqueta}
                    </span>

                    <span className="font-black">
                      {ex.estudiante_nombre}
                    </span>

                    <span className="font-semibold text-amber-700">
                      {ex.hora_inicio?.slice(0, 5)} — {ex.hora_fin?.slice(0, 5)}
                    </span>

                    <span className="text-xs font-medium text-amber-600">
                      Instructor: {ex.instructor_nombre || "Sin instructor"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-500">
              <FaFilter className="text-blue-500" />
              Filtrar por instructor
            </label>

            <select
              value={filtroInstructor}
              onChange={(e) => setFiltroInstructor(e.target.value)}
              className="h-12 min-w-[280px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">Todos los instructores</option>

              {instructores.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombre_completo ||
                    `${i.nombre || ""} ${i.apellido || ""}`.trim() ||
                    `Instructor ${i.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-6">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {MONTHS[vm]} {vy}
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Vista mensual de clases y asignaciones
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVy(hoy.getFullYear());
                    setVm(hoy.getMonth());
                    setDiaSeleccionado(hoyStr);
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  Hoy
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6">
              <div className="grid grid-cols-7 gap-2 md:gap-3">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="py-2 text-center text-xs font-black uppercase tracking-wide text-slate-500"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 place-items-center gap-2 sm:place-items-stretch md:gap-3">
                {cells.map((c, idx) => {
                  if (!c) {
                    return (
                      <div
                        key={idx}
                        className="h-10 w-10 sm:h-auto sm:min-h-[95px] sm:w-full lg:min-h-[112px]"
                      />
                    );
                  }
                  const dia = citas.filter((a) => a.fecha === c.dateStr);
                  const visibles = dia.slice(0, 2);
                  const extra = dia.length - visibles.length;
                  const esHoy = c.dateStr === hoyStr;

                  return (
                    <div
                      key={idx}
                      onClick={() => setDiaSeleccionado(c.dateStr)}
                      className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all duration-200 sm:block sm:h-auto sm:min-h-[95px] sm:w-full sm:rounded-2xl sm:border sm:p-2 lg:min-h-[112px] ${
                        diaSeleccionado === c.dateStr
                          ? "sm:scale-[1.02] sm:border-blue-400 sm:bg-blue-50 sm:shadow-sm"
                          : "sm:border-slate-200 sm:bg-white sm:hover:border-blue-200 sm:hover:bg-blue-50/30"
                      }`}
                    >
                      {dia.length > 0 && (
                        <span className="absolute -right-1 -top-2 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-md sm:-right-2 sm:-top-2 sm:h-6 sm:min-w-6 sm:px-1.5 sm:text-[11px]">
                          {dia.length}
                        </span>
                      )}

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black sm:mb-2 ${
                          diaSeleccionado === c.dateStr
                            ? "border-blue-600 bg-blue-600 text-white"
                            : esHoy
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        {c.day}
                      </div>

                      <div className="hidden space-y-1 sm:block">
                        {visibles.map((a) => (
                          <div
                            key={a.id}
                            className={`truncate rounded-lg px-2 py-1 text-[11px] font-bold leading-tight ${
                              a.es_examen
                                ? "bg-amber-600 text-white"
                                : INSTRUCTOR_COLORS[a.instructor] ||
                                  "bg-slate-700 text-white"
                            }`}
                            title={`${a.hora_inicio?.slice(0, 5)} ${a.estudiante_nombre}`}
                          >
                            {a.hora_inicio?.slice(0, 5)} {a.estudiante_nombre}
                          </div>
                        ))}

                        {extra > 0 && (
                          <div className="text-[11px] font-black text-slate-400">
                            +{extra} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {instructores.length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <h3 className="mb-3 text-sm font-black text-slate-700">
                    Leyenda de instructores
                  </h3>

                  <div className="flex flex-wrap gap-3">
                    {instructores.map((inst) => (
                      <div
                        key={inst.id}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-100"
                      >
                        <span
                          className={`h-3.5 w-3.5 rounded-full ${
                            INSTRUCTOR_COLORS[inst.id] || "bg-slate-700"
                          }`}
                        />

                        {inst.nombre_completo ||
                          `${inst.nombre || ""} ${inst.apellido || ""}`.trim() ||
                          `Instructor ${inst.id}`}
                      </div>
                    ))}

                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 ring-1 ring-amber-100">
                      <span className="h-3.5 w-3.5 rounded-full bg-amber-600" />
                      Examen Policial
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-fit overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <FaClipboardList className="text-xl" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {diaSeleccionado
                      ? `Clases del ${nombreFechaSeleccionada}`
                      : "Asignaciones de Hoy"}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {asignacionesPanelAdmin.length} asignación(es)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-5">
              {asignacionesPanelAdmin.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-400">
                  No hay clases para mostrar.
                </div>
              )}

              {asignacionesPanelAdmin.map((a) => {
                const totalClasesMatricula = citas.filter(
                  (x) => x.matricula === a.matricula && !x.es_examen
                ).length;

                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setCitaSeleccionada(a);
                      setModalEditar(true);
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                      a.es_examen
                        ? "border-amber-200 bg-amber-50"
                        : "border-blue-100 bg-blue-50/60"
                    }`}
                  >
                    <div
                      className={`mb-3 flex items-center gap-2 text-sm font-black ${
                        a.es_examen ? "text-amber-700" : "text-blue-700"
                      }`}
                    >
                      {a.es_examen ? (
                        <FaGraduationCap className="text-sm" />
                      ) : (
                        <FaClockIcon className="text-sm" />
                      )}

                      {a.hora_inicio?.slice(0, 5)} - {a.hora_fin?.slice(0, 5)}
                    </div>

                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                      <FaUserAlt className="text-slate-400" />
                      {a.estudiante_nombre}
                    </div>

                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                      <FaChalkboardTeacher className="text-slate-400" />
                      Instructor: {a.instructor_nombre || "Sin instructor"}
                    </div>

                    <div className="text-xs font-black text-slate-500">
                      {a.es_examen
                        ? "EXAMEN POLICIAL"
                        : `Clase ${a.numero_clase}/${totalClasesMatricula}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <CalendarioForm
        abierto={modalNueva}
        onClose={() => setModalNueva(false)}
        onCreada={cargar}
      />

      <ModalExamenManual
        abierto={modalExamen}
        onClose={() => setModalExamen(false)}
        onCreada={cargar}
      />

      <CalendarioEditarForm
        abierto={modalEditar}
        onClose={() => setModalEditar(false)}
        onActualizada={cargar}
        cita={citaSeleccionada}
      />
    </div>
  );
}
