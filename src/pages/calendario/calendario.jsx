import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import { listarCitas, citasDeHoy, listarInstructores } from "../../api/calendario";
import CalendarioForm from "../../components/calendarioForm.jsx";
import ModalExamenManual from "../../components/ModalExamenManual.jsx";

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS = ["Dom","Lun","Mar","Mier","Jue","Vie","Sab"];

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
  const rol = localStorage.getItem("rol");
  const esInstructor = rol === "instructor";

  const hoy = new Date();
  const [vy, setVy] = useState(hoy.getFullYear());
  const [vm, setVm] = useState(hoy.getMonth());
  const [filtroInstructor, setFiltroInstructor] = useState("all");
  const [instructores, setInstructores] = useState([]);
  const [citas, setCitas] = useState([]);
  const [hoyCitas, setHoyCitas] = useState([]);
  const [modalNueva, setModalNueva] = useState(false);
  const [modalExamen, setModalExamen] = useState(false);
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

  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-${String(hoy.getDate()).padStart(2,"0")}`;
  const en7Dias = new Date(hoy);
  en7Dias.setDate(hoy.getDate() + 7);
  const en7DiasStr = en7Dias.toISOString().slice(0, 10);

  const examenesProximos = citas
    .filter((c) => parseInt(c.numero_clase) === 9 && c.fecha >= hoyStr && c.fecha <= en7DiasStr)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  /* ============== VISTA INSTRUCTOR ============== */
  if (esInstructor) {
    return (
      <div className="max-w-[1100px] mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Mi Calendario</h1>

        {examenesProximos.length > 0 && (
          <div className="mb-4 bg-amber-50 border border-amber-300 rounded-xl p-4">
            <h3 className="text-amber-800 font-semibold text-sm mb-2">Exámenes próximos (próximos 7 días)</h3>
            <ul className="space-y-1">
              {examenesProximos.map((ex) => {
                const fechaEx = new Date(ex.fecha + "T00:00:00");
                const esHoy = ex.fecha === hoyStr;
                const etiqueta = esHoy
                  ? "HOY"
                  : fechaEx.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
                return (
                  <li key={ex.id} className="flex items-center gap-3 text-sm text-amber-900">
                    <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${esHoy ? "bg-red-500 text-white" : "bg-amber-200 text-amber-800"}`}>
                      {etiqueta}
                    </span>
                    <span className="font-medium">{ex.estudiante_nombre}</span>
                    <span className="text-amber-600">{ex.hora_inicio?.slice(0,5)} — {ex.hora_fin?.slice(0,5)}</span>
                    <span className="text-amber-500 text-xs">· {ex.instructor_nombre}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{MONTHS[vm]} {vy}</h2>
            <div className="flex gap-1">
              <button type="button" onClick={goPrev} className="p-2 rounded-md hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
              <button type="button" onClick={goNext} className="p-2 rounded-md hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAYS.map((d) => <div key={d} className="text-center text-xs text-gray-500 py-2 font-medium">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((c, idx) => {
              if (!c) return <div key={idx} />;
              const dia = citas.filter((a) => a.fecha === c.dateStr);
              return (
                <div key={idx} className="min-h-[100px] rounded-lg border border-gray-200 bg-white p-2">
                  <div className="text-sm font-medium mb-1.5">{c.day}</div>
                  <div className="space-y-1">
                    {dia.map((a) => (
                      <div
                        key={a.id}
                        className={`rounded px-1.5 py-1 text-[11px] leading-tight ${
                          parseInt(a.numero_clase) === 9
                            ? "bg-orange-300 text-orange-900"
                            : "bg-blue-300 text-blue-900"
                        }`}
                      >
                        <div className="font-medium truncate">{a.estudiante_nombre}</div>
                        <div className="opacity-80">{a.hora_inicio?.slice(0, 5)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6">
          <h3 className="text-base font-semibold mb-4">Clases programadas este mes</h3>
          {clasesMes.length === 0 && <p className="text-sm text-gray-400">No tienes clases este mes.</p>}
          {clasesMes.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-sm">{c.estudiante_nombre}</div>
                  <div className="text-sm text-gray-600 mt-0.5">Clase {c.numero_clase}/8</div>
                  <div className="text-xs text-gray-400 mt-0.5">Horario: {c.horario}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm">{c.fecha}</div>
                <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" />
                  {c.hora_inicio?.slice(0, 5)} — {c.hora_fin?.slice(0, 5)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ============== VISTA ADMIN ============== */
  return (
    <div className="max-w-[1280px] mx-auto px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Calendario de Instructores</h1>
        <p className="text-sm text-gray-500 mt-1">Asignación de horarios y estudiantes</p>
      </div>

      {examenesProximos.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-300 rounded-xl p-4">
          <h3 className="text-amber-800 font-semibold text-sm mb-2">📋 Exámenes próximos (próximos 7 días)</h3>
          <ul className="space-y-1">
            {examenesProximos.map((ex) => {
              const fechaEx = new Date(ex.fecha + "T00:00:00");
              const esHoy = ex.fecha === hoyStr;
              const etiqueta = esHoy
                ? "HOY"
                : fechaEx.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
              return (
                <li key={ex.id} className="flex items-center gap-3 text-sm text-amber-900">
                  <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${esHoy ? "bg-red-500 text-white" : "bg-amber-200 text-amber-800"}`}>
                    {etiqueta}
                  </span>
                  <span className="font-medium">{ex.estudiante_nombre}</span>
                  <span className="text-amber-600">{ex.hora_inicio?.slice(0,5)} — {ex.hora_fin?.slice(0,5)}</span>
                  <span className="text-amber-500 text-xs">· {ex.instructor_nombre}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500">Filtrar por instructor:</label>
          <select
            value={filtroInstructor}
            onChange={(e) => setFiltroInstructor(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm min-w-[200px]"
          >
            <option value="all">Todos los instructores</option>
            {instructores.map((i) => (
              <option key={i.id} value={i.id}>{i.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModalNueva(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Nueva Asignación
          </button>
          <button
            type="button"
            onClick={() => setModalExamen(true)}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Examen Manual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{MONTHS[vm]} {vy}</h2>
            <div className="flex gap-1">
              <button type="button" onClick={goPrev} className="p-2 rounded-md hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
              <button type="button" onClick={goNext} className="p-2 rounded-md hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAYS.map((d) => <div key={d} className="text-center text-sm text-gray-500 py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((c, idx) => {
              if (!c) return <div key={idx} />;
              const dia = citas.filter((a) => a.fecha === c.dateStr);
              const visibles = dia.slice(0, 2);
              const extra = dia.length - visibles.length;
              return (
                <div
                  key={idx}
                  onClick={() => setDiaSeleccionado(c.dateStr)}
                  className={`min-h-[88px] rounded-lg border p-2 cursor-pointer transition-colors ${
                    diaSeleccionado === c.dateStr
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="text-sm font-medium mb-1">{c.day}</div>
                  <div className="space-y-1">
                    {visibles.map((a) => (
                      <div
                        key={a.id}
                        className={`text-[11px] px-1.5 py-0.5 rounded truncate ${
                          parseInt(a.numero_clase) === 9
                            ? "bg-orange-300 text-gre-900"
                            : "bg-blue-300 text-blue-900"
                        }`}
                      >
                        {a.hora_inicio?.slice(0, 5)} Â· {a.estudiante_nombre}
                      </div>
                    ))}
                    {extra > 0 && <div className="text-[11px] text-gray-400">+{extra}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4">
            {diaSeleccionado
              ? `Clases del ${new Date(diaSeleccionado + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}`
              : "Asignaciones de Hoy"}
          </h2>
          <div className="space-y-3">
            {(diaSeleccionado
              ? citas.filter((a) => a.fecha === diaSeleccionado)
              : hoyCitas
            ).length === 0 && (
              <p className="text-sm text-gray-400">No hay clases este día.</p>
            )}
            {(diaSeleccionado
              ? citas.filter((a) => a.fecha === diaSeleccionado)
              : hoyCitas
            ).map((a) => (
              <div key={a.id} className="rounded-lg p-4 border border-emerald-100 bg-emerald-50">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-800 mb-2">
                  
                  <Clock className="w-4 h-4" />
                  {a.hora_inicio?.slice(0, 5)} - {a.hora_fin?.slice(0, 5)}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  {a.estudiante_nombre}
                </div>
                <div className="text-sm text-gray-500 mt-1">Instructor: {a.instructor_nombre}</div>
                <div className={`text-xs mt-1 font-semibold ${parseInt(a.numero_clase) === 9 ? "text-red-500" : "text-gray-400"}`}>
                    {parseInt(a.numero_clase) === 9 ? "ðŸŽ“ EXAMEN" : `Clase ${a.numero_clase}/8`}
                  </div>
              </div>
            ))}
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
    </div>
  );
}