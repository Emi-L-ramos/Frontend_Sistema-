import { useEffect, useMemo, useState } from "react";
import {
  X,
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  User,
} from "lucide-react";
import {
  crearExamenManual,
  listarInstructores,
  listarMatriculasInstructor,
} from "../api/calendario";

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

const obtenerFechaISO = (fecha) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatearFechaVista = (fecha) => {
  if (!fecha) return "Seleccionar fecha";

  const [year, month, day] = fecha.split("-");
  return `${day}/${month}/${year}`;
};

export default function ModalExamenManual({ abierto, onClose, onCreada }) {
  const [instructores, setInstructores] = useState([]);
  const [matriculas, setMatriculas] = useState([]);

 const [form, setForm] = useState({
  matricula_id: "",
  fecha: "",
  horario_examen: "14_16",
});

  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const [mesVisible, setMesVisible] = useState(new Date());

  useEffect(() => {
    if (!abierto) return;

    listarInstructores().then(setInstructores).catch(() => {});
    listarMatriculasInstructor().then(setMatriculas).catch(() => {});

   setForm({
    matricula_id: "",
    fecha: "",
    horario_examen: "14_16",
  });

    setBusqueda("");
    setError("");
    setCalendarioAbierto(false);
    setMesVisible(new Date());
  }, [abierto]);

  const diasCalendario = useMemo(() => {
    const year = mesVisible.getFullYear();
    const month = mesVisible.getMonth();

    const primerDia = new Date(year, month, 1).getDay();
    const totalDias = new Date(year, month + 1, 0).getDate();

    const dias = [];

    for (let i = 0; i < primerDia; i++) {
      dias.push(null);
    }

    for (let dia = 1; dia <= totalDias; dia++) {
      dias.push(new Date(year, month, dia));
    }

    while (dias.length % 7 !== 0) {
      dias.push(null);
    }

    return dias;
  }, [mesVisible]);

  if (!abierto) return null;

  const cambiarMes = (cantidad) => {
    const nuevaFecha = new Date(mesVisible);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + cantidad);
    setMesVisible(nuevaFecha);
  };

  const seleccionarFecha = (fecha) => {
    const fechaISO = obtenerFechaISO(fecha);

    setForm({
      ...form,
      fecha: fechaISO,
    });

    setCalendarioAbierto(false);
  };

  const abrirCalendario = () => {
    if (form.fecha) {
      setMesVisible(new Date(form.fecha + "T00:00:00"));
    } else {
      setMesVisible(new Date());
    }

    setCalendarioAbierto(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

   if (!form.matricula_id) {
  return setError(
    "Debe seleccionar un estudiante"
  );
}

if (!form.fecha) {
  return setError(
    "Debe indicar la fecha del examen"
  );
}

if (!form.horario_examen) {
  return setError(
    "Debe seleccionar el horario del examen"
  );
}

    setCargando(true);

    try {
      await crearExamenManual(form);
      onCreada?.();
      onClose();
    } catch (err) {
      setError(err.message || "Error al crear el examen");
    } finally {
      setCargando(false);
    }
  };

  const matriculasFiltradas = matriculas.filter((m) => {
  const tipoCurso = String(
    m.tipo_curso || ""
  ).toLowerCase();

  const esIntermedioOAvanzado =
    tipoCurso === "intermedio" ||
    tipoCurso === "avanzado";

  if (
    esIntermedioOAvanzado &&
    m.incluye_examen_policial !== true
  ) {
    return false;
  }

  const texto = `
    ${m.estudiante_nombre || ""}
    ${m.estudiante_cedula || ""}
  `.toLowerCase();

  return texto.includes(
    busqueda.toLowerCase()
  );
});

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold">
                Examen Policial
              </h3>

              <p className="text-sm text-orange-100 mt-1">
                Programa el examen policial del estudiante seleccionado.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Buscar estudiante
            </label>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="text"
                placeholder="Buscar por nombre o cédula..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full border border-gray-300 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400"
              />
            </div>

            {busqueda.trim() && (
              <div className="mt-2 border border-gray-200 rounded-2xl max-h-48 overflow-y-auto bg-white shadow-sm">
                {matriculasFiltradas.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400 text-center">
                    No se encontraron estudiantes.
                  </div>
                ) : (
                  matriculasFiltradas.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => {
                        setForm({
                          ...form,
                          matricula_id: m.id,
                        });

                        setBusqueda(
                          `${m.estudiante_nombre} - ${m.estudiante_cedula}`
                        );
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-orange-50 border-b last:border-b-0 transition ${
                        Number(form.matricula_id) === m.id
                          ? "bg-orange-100 text-orange-800 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                          <User className="w-4 h-4" />
                        </div>

                        <div>
                        <p className="text-xs text-gray-500">
                          {m.estudiante_cedula}
                        </p>

                        <p className="text-xs text-orange-600 mt-1">
                          {m.tipo_curso || "Curso no definido"}

                          {["Intermedio", "Avanzado"].includes(
                            m.tipo_curso
                          ) && m.incluye_examen_policial
                            ? " · Examen incluido"
                            : ""}
                        </p>


                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha del examen
            </label>

            <div className="flex items-center gap-3 border border-gray-300 rounded-2xl px-4 py-3 bg-white shadow-sm hover:border-orange-400 transition">
              <div>
                <p
                  className={
                    form.fecha
                      ? "text-sm font-semibold text-gray-800"
                      : "text-sm font-semibold text-gray-400"
                  }
                >
                  {formatearFechaVista(form.fecha)}
                </p>

                <p className="text-xs text-gray-400 mt-0.5">
                  Toca el ícono para abrir el calendario
                </p>
              </div>

              <button
                type="button"
                onClick={abrirCalendario}
                className="ml-auto w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 hover:bg-orange-200 flex items-center justify-center transition"
              >
                <CalendarDays className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Horario del examen
            </label>

            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none" />

              <select
                value={form.horario_examen}
                onChange={(e) =>
                  setForm((formAnterior) => ({
                    ...formAnterior,
                    horario_examen: e.target.value,
                  }))
                }
                className="w-full appearance-none border border-gray-300 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400"
              >
                <option value="08_10">
                  8:00 AM - 10:00 AM
                </option>

                <option value="14_16">
                  2:00 PM - 4:00 PM
                </option>
              </select>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Selecciona uno de los horarios disponibles para el examen policial.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className=" cursor-pointer px-5 py-2.5 text-sm border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={cargando}
              className=" cursor-pointer px-5 py-2.5 text-sm bg-orange-600 text-white rounded-2xl hover:bg-orange-700 disabled:opacity-50 transition font-semibold"
            >
              {cargando ? "Creando..." : "Crear examen"}
            </button>
          </div>
        </form>
      </div>

      {calendarioAbierto && (
        <div
          className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setCalendarioAbierto(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-5 text-white">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => cambiarMes(-1)}
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <p className="text-sm uppercase tracking-[0.25em] text-orange-100">
                    {meses[mesVisible.getMonth()]}
                  </p>

                  <h2 className="text-4xl font-bold leading-none mt-1">
                    {mesVisible.getFullYear()}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => cambiarMes(1)}
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-7 gap-2 mb-3">
                {diasSemana.map((dia) => (
                  <div
                    key={dia}
                    className="text-center text-xs font-bold text-gray-500 uppercase"
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

                  const fechaISO = obtenerFechaISO(fecha);
                  const esSeleccionada = fechaISO === form.fecha;
                  const hoyISO = obtenerFechaISO(new Date());
                  const esHoy = fechaISO === hoyISO;

                  return (
                    <button
                      key={fechaISO}
                      type="button"
                      onClick={() => seleccionarFecha(fecha)}
                      className={`h-11 w-11 mx-auto rounded-full text-sm font-bold transition-all ${
                        esSeleccionada
                          ? "bg-orange-600 text-white shadow-md scale-105"
                          : esHoy
                          ? "bg-orange-50 text-orange-700 border border-orange-200"
                          : "text-gray-700 hover:bg-orange-50"
                      }`}
                    >
                      {fecha.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end mt-5">
                <button
                  type="button"
                  onClick={() => setCalendarioAbierto(false)}
                  className="px-5 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
