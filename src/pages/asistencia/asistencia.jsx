import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Search,
  UserX,
  Users,
  X,
  XCircle,
  Gauge,
  User,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  finalizarKilometraje,
  justificarClase,
  listarAsistencia,
  marcarAsistencia,
  resumenKilometros,
} from "../../api/asistencia";

import {
  FaClipboardCheck,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaClock,
  FaSearch,
  FaCalendarAlt,
} from "react-icons/fa";

const obtenerFechaHoy = () => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const convertirFechaLocal = (fechaTexto) => {
  const [year, month, day] = fechaTexto.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatearFechaISO = (fecha) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function CalendarioRangoAsistencia({
  fechaInicio,
  fechaFin,
  setFechaInicio,
  setFechaFin,
}) {
  const fechaBase = convertirFechaLocal(fechaInicio);

  const [abierto, setAbierto] = useState(false);
  const [mesVisible, setMesVisible] = useState(fechaBase.getMonth());
  const [anioVisible, setAnioVisible] = useState(fechaBase.getFullYear());
  const [seleccionandoRango, setSeleccionandoRango] = useState(false);

  useEffect(() => {
    const fecha = convertirFechaLocal(fechaInicio);
    setMesVisible(fecha.getMonth());
    setAnioVisible(fecha.getFullYear());
  }, [fechaInicio]);

  const cambiarMes = (cantidad) => {
    const nuevaFecha = new Date(anioVisible, mesVisible + cantidad, 1);
    setMesVisible(nuevaFecha.getMonth());
    setAnioVisible(nuevaFecha.getFullYear());
  };

  const cerrarCalendario = () => {
    setAbierto(false);
    setSeleccionandoRango(false);
  };

  const seleccionarDia = (fechaISO) => {
    if (!seleccionandoRango) {
      setFechaInicio(fechaISO);
      setFechaFin(fechaISO);
      setSeleccionandoRango(true);
      return;
    }

    if (fechaISO < fechaInicio) {
      setFechaFin(fechaInicio);
      setFechaInicio(fechaISO);
    } else {
      setFechaFin(fechaISO);
    }

    setSeleccionandoRango(false);
    setAbierto(false);
  };

  const diasCalendario = useMemo(() => {
    const primerDiaMes = new Date(anioVisible, mesVisible, 1);
    const ultimoDiaMes = new Date(anioVisible, mesVisible + 1, 0);

    const totalDiasMes = ultimoDiaMes.getDate();
    const diaSemanaInicio = primerDiaMes.getDay();

    const celdas = [];

    for (let i = 0; i < diaSemanaInicio; i++) {
      celdas.push(null);
    }

    for (let dia = 1; dia <= totalDiasMes; dia++) {
      celdas.push(new Date(anioVisible, mesVisible, dia));
    }

    while (celdas.length % 7 !== 0) {
      celdas.push(null);
    }

    return celdas;
  }, [anioVisible, mesVisible]);

  const hoyISO = obtenerFechaHoy();

  const fechaInicioTexto = convertirFechaLocal(fechaInicio).toLocaleDateString(
    "es-NI",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  const fechaFinTexto = convertirFechaLocal(fechaFin).toLocaleDateString(
    "es-NI",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  const textoBoton =
    fechaInicio === fechaFin
      ? fechaInicioTexto
      : `${fechaInicioTexto} - ${fechaFinTexto}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        title="Seleccionar fecha o rango"
        className="h-11 px-3 rounded-xl border bg-white border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 flex items-center gap-2 transition shadow-sm cursor-pointer"
      >
        <CalendarDays className="w-5 h-5" />

        <span className="hidden sm:inline text-sm font-medium">
          {textoBoton}
        </span>
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={cerrarCalendario}
        >
          <div
            className="w-[330px] sm:w-[370px] bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white px-5 py-5">
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => cambiarMes(-1)}
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <p className="text-sm uppercase tracking-[0.35em] text-white/80">
                    {meses[mesVisible]}
                  </p>

                  <h2 className="text-4xl font-bold leading-none mt-1">
                    {anioVisible}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => cambiarMes(1)}
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-5 py-5">
              <div className="grid grid-cols-7 gap-2 mb-3">
                {diasSemana.map((dia, index) => (
                  <div
                    key={dia}
                    className={`text-center text-xs font-bold uppercase ${
                      index === 0 ? "text-red-500" : "text-slate-500"
                    }`}
                  >
                    {dia}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {diasCalendario.map((fecha, index) => {
                  if (!fecha) {
                    return <div key={`empty-${index}`} className="h-11" />;
                  }

                  const fechaISO = formatearFechaISO(fecha);
                  const estaEnRango =
                    fechaISO >= fechaInicio && fechaISO <= fechaFin;
                  const esInicio = fechaISO === fechaInicio;
                  const esFin = fechaISO === fechaFin;
                  const esHoy = fechaISO === hoyISO;
                  const esDomingo = fecha.getDay() === 0;

                  return (
                    <button
                      key={fechaISO}
                      type="button"
                      onClick={() => seleccionarDia(fechaISO)}
                      className={`h-11 w-11 mx-auto rounded-full text-sm font-semibold transition-all relative cursor-pointer ${
                        estaEnRango
                          ? "bg-yellow-600 text-white shadow-md hover:bg-yellow-700"
                          : esHoy
                          ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                          : esDomingo
                          ? "text-red-500 hover:bg-red-50"
                          : "text-slate-700 hover:bg-slate-100"
                      } ${
                        esInicio || esFin
                          ? "scale-105 ring-2 ring-red-200"
                          : ""
                      }`}
                    >
                      {fecha.getDate()}

                      {estaEnRango && (
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-1 w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Asistencia({ userRole }) {
  const rol = userRole?.toLowerCase();

  const [datos, setDatos] = useState([]);
  const [resumenKm, setResumenKm] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [encuentroFiltro, setEncuentroFiltro] = useState(1);

  const [fechaInicio, setFechaInicio] = useState(obtenerFechaHoy());
  const [fechaFin, setFechaFin] = useState(obtenerFechaHoy());

  const [modalDetalleEstudiante, setModalDetalleEstudiante] = useState(null);
  const [modalJustificar, setModalJustificar] = useState(null);
  const [modalKmInicio, setModalKmInicio] = useState(null);
  const [modalKmFinal, setModalKmFinal] = useState(null);

  const [motivo, setMotivo] = useState("");
  const [kmInicial, setKmInicial] = useState("");
  const [kmFinal, setKmFinal] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cargar = async () => {
    setCargando(true);
    setError("");

    try {
      const res = await listarAsistencia(fechaInicio, fechaFin);
      setDatos(Array.isArray(res) ? res : []);
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.message ||
          "Error al cargar asistencia"
      );
    } finally {
      setCargando(false);
    }
  };

  const cargarResumenKm = async () => {
    try {
      const res = await resumenKilometros();
      setResumenKm(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error("Error cargando resumen de kilómetros:", e);
    }
  };

  useEffect(() => {
    cargar();
    cargarResumenKm();
  }, [fechaInicio, fechaFin]);

  const encuentrosDisponibles = useMemo(() => {
    const numeros = new Set();

    datos.forEach((est) => {
      Object.keys(est.asistencias || {}).forEach((num) => {
        numeros.add(Number(num));
      });
    });

    const resultado = Array.from(numeros).sort((a, b) => a - b);

    return resultado.length > 0 ? resultado : [1];
  }, [datos]);

  useEffect(() => {
    if (
      encuentrosDisponibles.length > 0 &&
      !encuentrosDisponibles.includes(encuentroFiltro)
    ) {
      setEncuentroFiltro(encuentrosDisponibles[0]);
    }
  }, [encuentrosDisponibles, encuentroFiltro]);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return datos;

    const b = busqueda.toLowerCase();

    return datos.filter((d) => {
      return (
        d.nombre?.toLowerCase().includes(b) ||
        d.cedula?.toLowerCase().includes(b)
      );
    });
  }, [datos, busqueda]);

  const totalEstudiantes = datos.length;

  const ausentes = datos.filter((d) => {
    const asistencias = Object.values(d.asistencias || {});

    return asistencias.some(
      (a) => a && a.estado === "falto" && !a.justificado_por_admin
    );
  }).length;

  const presentes = datos.filter((d) => {
    const asistencias = Object.values(d.asistencias || {});

    return asistencias.some((a) => a && a.estado === "asistio");
  }).length;

  const pendientes = datos.filter((d) => {
    const asistencias = Object.values(d.asistencias || {});

    return asistencias.some((a) => a && a.estado === "pendiente");
  }).length;

  const buscarResumenKmEstudiante = (estudiante) => {
    if (!estudiante) return null;

    return resumenKm.find((item) => {
      return (
        item.estudiante_id === estudiante.estudiante_id ||
        item.matricula_id === estudiante.matricula_id ||
        item.estudiante_nombre === estudiante.nombre
      );
    });
  };

const obtenerDetalleKilometraje = (estudiante) => {
  if (!estudiante?.asistencias) return [];

  return Object.entries(estudiante.asistencias)
    .map(([numero, asistencia]) => ({
      numero,
      ...asistencia,
    }))
    .filter((item) => {
      const tieneKmInicial =
        item.km_inicial !== null &&
        item.km_inicial !== undefined &&
        item.km_inicial !== "";

      const tieneKmFinal =
        item.km_final !== null &&
        item.km_final !== undefined &&
        item.km_final !== "";

      const tieneKmRecorrido =
        item.km_recorridos !== null &&
        item.km_recorridos !== undefined &&
        Number(item.km_recorridos) > 0;

      return tieneKmInicial || tieneKmFinal || tieneKmRecorrido;
    })
    .sort((a, b) => Number(a.numero) - Number(b.numero));
};
  const textoEstado = (data) => {
    if (!data) return "Sin marcar";

    if (data.estado === "justificado" || data.justificado_por_admin) {
      return "Justificada";
    }

    if (data.estado === "asistio") {
      return "Presente";
    }

    if (data.estado === "falto") {
      return "Ausente";
    }

    return "Sin marcar";
  };

  const handleMarcar = async (calendarioId, estado, km_inicial = null) => {
    setError("");

    try {
      await marcarAsistencia({
        clase_id: calendarioId,
        estado,
        km_inicial,
      });

      await cargar();
      await cargarResumenKm();
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.message ||
          "No se pudo marcar la asistencia"
      );
    }
  };

  const confirmarKmInicial = async () => {
    if (!modalKmInicio) return;

    if (kmInicial === "") {
      setError("Debe ingresar el km inicial.");
      return;
    }

    const inicial = Number(kmInicial);

    if (Number.isNaN(inicial)) {
      setError("El km inicial debe ser numérico.");
      return;
    }

    await handleMarcar(modalKmInicio.id, "asistio", inicial);

    setModalKmInicio(null);
    setKmInicial("");
  };

  const confirmarKmFinal = async () => {
    if (!modalKmFinal) return;

    if (kmFinal === "") {
      setError("Debe ingresar el km final.");
      return;
    }

    const final = Number(kmFinal);

    if (Number.isNaN(final)) {
      setError("El km final debe ser numérico.");
      return;
    }

    try {
      await finalizarKilometraje({
        asistencia_id: modalKmFinal.asistencia_id,
        km_final: final,
      });

      await cargar();
      await cargarResumenKm();

      setModalKmFinal(null);
      setKmFinal("");
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.message ||
          "No se pudo finalizar el kilometraje"
      );
    }
  };

  const handleJustificar = async () => {
    if (!motivo.trim() || !modalJustificar?.asistencia_id) return;

    setGuardando(true);
    setError("");

    try {
      await justificarClase(modalJustificar.asistencia_id, motivo);

      setModalJustificar(null);
      setMotivo("");

      await cargar();
      await cargarResumenKm();
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.message ||
          "No se pudo justificar la ausencia"
      );
    } finally {
      setGuardando(false);
    }
  };

  const CeldaAsistencia = ({ data, numero }) => {
    if (!data) {
      return (
        <td className="px-3 py-4 text-center">
          <Circle className="w-5 h-5 text-gray-200 mx-auto" />
        </td>
      );
    }

    if (data.estado === "justificado" || data.justificado_por_admin) {
      return (
        <td className="px-3 py-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center mx-auto">
              <span className="text-white text-[9px] font-bold">J</span>
            </div>

            <span className="text-[9px] text-yellow-600">Justificada</span>
          </div>
        </td>
      );
    }

    if (data.estado === "asistio") {
      const tieneKmInicial =
        data.km_inicial !== null && data.km_inicial !== undefined;

      const tieneKmFinal =
        data.km_final !== null && data.km_final !== undefined;

      const kmPendiente = tieneKmInicial && !tieneKmFinal;

      return (
        <td className="px-3 py-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />

            {tieneKmFinal ? (
              <span className="text-[9px] text-blue-600">
                {calcularKmRecorrido(data)} km
              </span>
            ) : kmPendiente && rol === "instructor" ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalKmFinal(data);
                  setKmFinal("");
                }}
                className="text-[9px] text-blue-600 hover:underline cursor-pointer"
              >
                Finalizar km
              </button>
            ) : kmPendiente ? (
              <span className="text-[9px] text-orange-500">Km pendiente</span>
            ) : null}
          </div>
        </td>
      );
    }

    if (data.estado === "falto") {
      return (
        <td className="px-3 py-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <XCircle className="w-5 h-5 text-red-500" />

            {rol === "admin" || rol === "administrador" ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalJustificar({
                    asistencia_id: data.asistencia_id || data.id,
                    numero,
                    fecha: data.fecha,
                  });
                }}
                className="text-[9px] text-orange-500 hover:underline leading-tight cursor-pointer"
              >
                Justificar
              </button>
            ) : null}
          </div>
        </td>
      );
    }

    return (
      <td className="px-3 py-4 text-center">
        {rol === "instructor" && data.puede_marcar ? (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              title="Marcar presente"
              onClick={(e) => {
                e.stopPropagation();
                setModalKmInicio(data);
                setKmInicial("");
              }}
              className="hover:scale-110 transition-transform cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-gray-300 hover:text-green-500" />
            </button>

            <button
              type="button"
              title="Marcar ausente"
              onClick={(e) => {
                e.stopPropagation();
                handleMarcar(data.id, "falto");
              }}
              className="hover:scale-110 transition-transform cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-gray-300 hover:text-red-500" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Circle className="w-5 h-5 text-gray-200 mx-auto" />

            {data.es_futuro && (
              <span className="text-[9px] text-gray-300">Próxima</span>
            )}

            {data.es_pasado && data.estado === "pendiente" && (
              <span className="text-[9px] text-gray-400">Sin marcar</span>
            )}

            {data.es_hoy && !data.puede_marcar && (
              <span className="text-[9px] text-gray-400">Bloqueada</span>
            )}
          </div>
        )}
      </td>
    );
  };

 const resumenSeleccionado = buscarResumenKmEstudiante(modalDetalleEstudiante);

const detalleKmSeleccionado = obtenerDetalleKilometraje(
  modalDetalleEstudiante
);

const instructorNombreSeleccionado =
  modalDetalleEstudiante?.instructor_nombre ||
  modalDetalleEstudiante?.conductor ||
  detalleKmSeleccionado.find((item) => item.instructor_nombre)?.instructor_nombre ||
  resumenSeleccionado?.instructor_nombre ||
  "No asignado";

const calcularKmRecorrido = (item) => {
  const tieneKmInicial =
    item.km_inicial !== null &&
    item.km_inicial !== undefined &&
    item.km_inicial !== "";

  const tieneKmFinal =
    item.km_final !== null &&
    item.km_final !== undefined &&
    item.km_final !== "";

  if (tieneKmInicial && tieneKmFinal) {
    const inicial = Number(item.km_inicial);
    const final = Number(item.km_final);

    if (!Number.isNaN(inicial) && !Number.isNaN(final)) {
      return final - inicial;
    }
  }

  return Number(item.km_recorridos || 0);
};

const totalKmSeleccionado = detalleKmSeleccionado.reduce((total, item) => {
  return total + calcularKmRecorrido(item);
}, 0);
console.log("ESTUDIANTE MODAL:", modalDetalleEstudiante);
console.log("DETALLE KM:", detalleKmSeleccionado);
console.log("TOTAL KM:", totalKmSeleccionado);

const totalClasesKmSeleccionado = detalleKmSeleccionado.filter((item) => {
  const tieneKmInicial =
    item.km_inicial !== null &&
    item.km_inicial !== undefined &&
    item.km_inicial !== "";

  const tieneKmFinal =
    item.km_final !== null &&
    item.km_final !== undefined &&
    item.km_final !== "";

  return tieneKmInicial && tieneKmFinal;
}).length;

  const fechaInicioTexto = convertirFechaLocal(fechaInicio).toLocaleDateString(
    "es-NI",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const fechaFinTexto = convertirFechaLocal(fechaFin).toLocaleDateString(
    "es-NI",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const textoRango =
    fechaInicio === fechaFin
      ? fechaInicioTexto
      : `${fechaInicioTexto} al ${fechaFinTexto}`;

  const obtenerIniciales = (nombre = "") => {
    const partes = String(nombre).trim().split(/\s+/).filter(Boolean);

    if (partes.length === 0) return "E";

    return partes
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-4 py-5 md:px-8 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
              <FaClipboardCheck className="text-3xl" />
            </div>

            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                Control de Asistencia
              </h1>

              <p className="mt-2 text-base text-slate-500">
                Registro de asistencia de los encuentros — {textoRango}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-blue-100 bg-blue-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                <FaUsers className="text-4xl" />
              </div>

              <div>
                <p className="text-base font-bold text-slate-600">
                  Total estudiantes
                </p>

                <p className="mt-2 text-4xl font-black text-blue-600">
                  {totalEstudiantes}
                </p>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  Estudiantes registrados
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-8 -right-6 text-blue-500 opacity-10">
              <FaUsers className="text-[125px]" />
            </div>
          </div>

          <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                <FaUserCheck className="text-4xl" />
              </div>

              <div>
                <p className="text-base font-bold text-slate-600">
                  Presentes
                </p>

                <p className="mt-2 text-4xl font-black text-emerald-600">
                  {presentes}
                </p>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  Estudiantes presentes
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-8 -right-6 text-emerald-500 opacity-10">
              <FaUserCheck className="text-[125px]" />
            </div>
          </div>

          <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-red-100 bg-red-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-red-600 shadow-sm ring-1 ring-red-100">
                <FaUserTimes className="text-4xl" />
              </div>

              <div>
                <p className="text-base font-bold text-slate-600">
                  Ausentes
                </p>

                <p className="mt-2 text-4xl font-black text-red-600">
                  {ausentes}
                </p>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  Estudiantes ausentes
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-8 -right-6 text-red-500 opacity-10">
              <FaUserTimes className="text-[125px]" />
            </div>
          </div>

          <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-orange-100 bg-orange-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-orange-600 shadow-sm ring-1 ring-orange-100">
                <FaClock className="text-4xl" />
              </div>

              <div>
                <p className="text-base font-bold text-slate-600">
                  Pendientes
                </p>

                <p className="mt-2 text-4xl font-black text-orange-600">
                  {pendientes}
                </p>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  Sin marcar
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-8 -right-6 text-orange-500 opacity-10">
              <FaClock className="text-[125px]" />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertTriangle className="h-5 w-5 shrink-0" />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar estudiante..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <CalendarioRangoAsistencia
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            setFechaInicio={setFechaInicio}
            setFechaFin={setFechaFin}
          />
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Registro de asistencia
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Control diario por estudiante y encuentro
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 ring-1 ring-emerald-100">
                <CheckCircle2 className="h-4 w-4" />
                Presente
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-red-700 ring-1 ring-red-100">
                <XCircle className="h-4 w-4" />
                Ausente
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-2 text-yellow-700 ring-1 ring-yellow-100">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[8px] font-black text-white">
                  J
                </span>
                Justificada
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-slate-500 ring-1 ring-slate-100">
                <Circle className="h-4 w-4 text-slate-300" />
                Sin marcar / bloqueada
              </div>
            </div>
          </div>

          {cargando ? (
            <div className="p-12 text-center text-sm font-semibold text-slate-400">
              Cargando asistencia...
            </div>
          ) : (
            <div className="w-full overflow-x-auto overflow-y-auto max-h-[650px]">
              <table className="w-full min-w-[1150px] table-fixed text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="w-[260px] px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                      Estudiante
                    </th>

                    <th className="w-[170px] px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                      Cédula
                    </th>

                    {encuentrosDisponibles.map((e) => (
                      <th
                        key={e}
                        className={`w-[85px] px-3 py-4 text-center text-xs font-black uppercase tracking-wide ${
                          e === encuentroFiltro
                            ? "text-blue-600"
                            : "text-slate-500"
                        }`}
                      >
                        E{e}
                      </th>
                    ))}

                    <th className="w-[130px] px-4 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-500">
                      Asistencia
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtrados.length === 0 && (
                    <tr>
                      <td
                        colSpan={encuentrosDisponibles.length + 3}
                        className="px-4 py-10 text-center text-sm font-semibold text-slate-400"
                      >
                        No hay estudiantes programados para esta fecha o rango.
                      </td>
                    </tr>
                  )}

                  {filtrados.map((est) => {
                    const color =
                      est.porcentaje === 100
                        ? "text-emerald-600"
                        : est.porcentaje >= 75
                        ? "text-yellow-600"
                        : "text-red-600";

                    return (
                      <tr
                        key={est.matricula_id}
                        onClick={() => setModalDetalleEstudiante(est)}
                        className="group border-b border-slate-100 transition hover:bg-blue-50/40 cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-600 ring-1 ring-blue-100">
                              {obtenerIniciales(est.nombre)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-base font-black text-slate-900">
                                {est.nombre}
                              </p>

                              <p className="mt-1 text-xs font-semibold text-slate-400">
                                Matrícula #{est.matricula_id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-5 text-sm font-semibold text-slate-500">
                          {est.cedula}
                        </td>

                        {encuentrosDisponibles.map((num) => (
                          <CeldaAsistencia
                            key={num}
                            data={est.asistencias?.[String(num)]}
                            numero={num}
                          />
                        ))}

                        <td className="px-4 py-5 text-center">
                          <span
                            className={`inline-flex min-w-[72px] items-center justify-center rounded-full px-3 py-2 text-base font-black ${color}`}
                          >
                            {est.porcentaje}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>  
    </div>

      {modalDetalleEstudiante && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={() => setModalDetalleEstudiante(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Detalle de kilometraje
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Información del estudiante seleccionado
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalDetalleEstudiante(null)}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 shrink-0"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <User className="w-4 h-4" />
                  Estudiante
                </div>

                <p className="font-bold text-gray-900">
                  {modalDetalleEstudiante.nombre}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {modalDetalleEstudiante.cedula || "Sin cédula"}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <User className="w-4 h-4" />
                  Conductor
                </div>

                <p className="font-bold text-gray-900">
                  {instructorNombreSeleccionado}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Instructor del recorrido
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-600 text-xs mb-1">
                  <Gauge className="w-4 h-4" />
                  Kilómetros totales
                </div>

                <p className="text-3xl font-bold text-blue-700">
                  {totalKmSeleccionado} km
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <CalendarDays className="w-4 h-4" />
                  Clases con km
                </div>

                <p className="text-3xl font-bold text-gray-900">
                  {totalClasesKmSeleccionado}
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="font-semibold text-sm text-gray-800">
                  Registro por encuentro
                </h4>
              </div>

              {detalleKmSeleccionado.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">
                  Este estudiante todavía no tiene kilometraje registrado.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-white border-b border-gray-100">
                        <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                          Encuentro
                        </th>

                        <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                          Fecha
                        </th>

                        <th className="px-4 py-3 text-left text-gray-600 font-semibold">
                          Estado
                        </th>

                        <th className="px-4 py-3 text-right text-gray-600 font-semibold">
                          Km inicial
                        </th>

                        <th className="px-4 py-3 text-right text-gray-600 font-semibold">
                          Km final
                        </th>

                        <th className="px-4 py-3 text-right text-gray-600 font-semibold">
                          Recorrido
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {detalleKmSeleccionado.map((item) => (
                        <tr
                          key={`${item.numero}-${
                            item.asistencia_id || item.id
                          }`}
                          className="border-b border-gray-50"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            E{item.numero}
                          </td>

                          <td className="px-4 py-3 text-gray-500">
                            {item.fecha || "Sin fecha"}
                          </td>

                          <td className="px-4 py-3 text-gray-500">
                            {textoEstado(item)}
                          </td>

                          <td className="px-4 py-3 text-right text-gray-700">
                            {item.km_inicial ?? "-"}
                          </td>

                          <td className="px-4 py-3 text-right text-gray-700">
                            {item.km_final ?? "-"}
                          </td>

                          <td className="px-4 py-3 text-right font-bold text-blue-600">
                             {calcularKmRecorrido(item)} km
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={() => setModalDetalleEstudiante(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalKmInicio && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Registrar km inicial
            </h3>

            <p className="text-xs text-gray-500 mb-4">
              Fecha: {modalKmInicio.fecha || "Sin fecha"}
            </p>

            <label className="text-sm text-gray-600">Km inicial</label>

            <input
              type="number"
              value={kmInicial}
              onChange={(e) => setKmInicial(e.target.value)}
              className="w-full mt-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
              placeholder="Ingrese el kilometraje inicial"
            />

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => {
                  setModalKmInicio(null);
                  setKmInicial("");
                }}
                className="flex-1 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarKmInicial}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold"
              >
                Guardar inicio
              </button>
            </div>
          </div>
        </div>
      )}

      {modalKmFinal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Finalizar kilometraje
            </h3>

            <p className="text-xs text-gray-500 mb-4">
              Km inicial: {modalKmFinal.km_inicial}
            </p>

            <label className="text-sm text-gray-600">Km final</label>

            <input
              type="number"
              value={kmFinal}
              onChange={(e) => setKmFinal(e.target.value)}
              className="w-full mt-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
              placeholder="Ingrese el kilometraje final"
            />

            {kmFinal !== "" &&
              Number(kmFinal) >= Number(modalKmFinal.km_inicial) && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700 mt-4">
                  Recorrido:{" "}
                  <strong>
                    {Number(kmFinal) - Number(modalKmFinal.km_inicial)} km
                  </strong>
                </div>
              )}

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => {
                  setModalKmFinal(null);
                  setKmFinal("");
                }}
                className="flex-1 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarKmFinal}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold"
              >
                Guardar final
              </button>
            </div>
          </div>
        </div>
      )}

      {modalJustificar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-2.5 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Justificar Ausencia
                </h3>

                <p className="text-xs text-gray-500">
                  Encuentro {modalJustificar.numero} —{" "}
                  {modalJustificar.fecha || "Sin fecha"}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 bg-orange-50 border border-orange-100 rounded-xl p-3">
              Esta ausencia será justificada y el sistema agregará un nuevo
              encuentro al final del calendario para recuperar la clase perdida.
              No se saltarán temas del plan de estudio.
            </p>

            <textarea
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none"
              rows={3}
              placeholder="Motivo de la justificación..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              autoFocus
            />

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setModalJustificar(null);
                  setMotivo("");
                }}
                className="flex-1 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleJustificar}
                disabled={!motivo.trim() || guardando}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                {guardando ? "Guardando..." : "Justificar y agregar día"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}