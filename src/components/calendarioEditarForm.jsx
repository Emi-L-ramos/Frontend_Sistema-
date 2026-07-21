// frontend/src/components/calendarioEditarForm.jsx
import { useEffect, useMemo, useState } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { actualizarCita, listarInstructores } from "../api/calendario";

const MESES = [
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

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const obtenerFechaISO = (fecha) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatearFecha = (fecha) => {
  if (!fecha) return "Seleccionar fecha";

  const [year, month, day] = fecha.split("-");
  return `${day}/${month}/${year}`;
};

export default function CalendarioEditarForm({
  abierto,
  onClose,
  onActualizada,
  cita,
}) {
  const [instructores, setInstructores] = useState([]);

  const [form, setForm] = useState({
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    instructor_id: "",
    aplicar_a: "solo",
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const [mesVisible, setMesVisible] = useState(new Date());

  useEffect(() => {
    if (!abierto || !cita) return;

    const cargarInstructores = async () => {
      const inst = await listarInstructores();
      setInstructores(inst || []);
    };

    cargarInstructores();

    const fechaInicial = cita.fecha || "";

    setForm({
      fecha: fechaInicial,
      hora_inicio: cita.hora_inicio?.slice(0, 5) || "",
      hora_fin: cita.hora_fin?.slice(0, 5) || "",
      instructor_id: cita.instructor || "",
      aplicar_a: "solo",
    });

    if (fechaInicial) {
      setMesVisible(new Date(fechaInicial + "T00:00:00"));
    } else {
      setMesVisible(new Date());
    }

    setError("");
    setCalendarioAbierto(false);
  }, [abierto, cita]);

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

  if (!abierto || !cita) return null;

  const cambiarMes = (cantidad) => {
    const nuevaFecha = new Date(mesVisible);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + cantidad);
    setMesVisible(nuevaFecha);
  };

  const abrirCalendario = () => {
    if (form.fecha) {
      setMesVisible(new Date(form.fecha + "T00:00:00"));
    } else {
      setMesVisible(new Date());
    }

    setCalendarioAbierto(true);
  };

  const seleccionarFecha = (fecha) => {
    const fechaISO = obtenerFechaISO(fecha);

    setForm({
      ...form,
      fecha: fechaISO,
    });

    setCalendarioAbierto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const dataToSend = {
        fecha: form.fecha,
        hora_inicio: form.hora_inicio,
        hora_fin: form.hora_fin,
        aplicar_a: form.aplicar_a,
      };

      if (form.instructor_id) {
        dataToSend.instructor = parseInt(form.instructor_id);
      }

      await actualizarCita(cita.id, dataToSend);

      Swal.fire({
        title: "¡Actualizada!",
        text: "La clase ha sido reprogramada exitosamente",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      onActualizada?.();
      onClose();
    } catch (error) {
      setError(error.message || "Error al actualizar la clase");
      Swal.fire("Error", error.message || "Error al actualizar", "error");
    } finally {
      setCargando(false);
    }
  };

  const hoyISO = obtenerFechaISO(new Date());

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Reprogramar Horario
              </h3>

              <p className="text-sm text-blue-100 mt-1">
                Actualiza la fecha, horario o instructor de la clase seleccionada.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={cargando}
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition disabled:opacity-50"
            >
              <X className="w-5 h-5 cursor-pointer" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">
              Información actual
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Estudiante</p>
                <p className="font-semibold text-gray-800">
                  {cita.estudiante_nombre || "N/A"}
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Instructor</p>
                <p className="font-semibold text-gray-800">
                  {cita.instructor_nombre || "N/A"}
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Clase</p>
                <p className="font-semibold text-gray-800">
                  {cita.numero_clase ? `Clase ${cita.numero_clase}` : "N/A"}
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Horario actual</p>
                <p className="font-semibold text-gray-800">
                  {cita.hora_inicio?.slice(0, 5) || "N/A"} -{" "}
                  {cita.hora_fin?.slice(0, 5) || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Cambiar instructor
              </label>

              <select
                value={form.instructor_id}
                onChange={(e) =>
                  setForm({ ...form, instructor_id: e.target.value })
                }
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                disabled={cargando}
              >
                <option value={cita.instructor}>
                  {cita.instructor_nombre} (actual)
                </option>

                {instructores
                  .filter((i) => i.id !== cita.instructor)
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nombre_completo ||
                        `${i.nombre || ""} ${i.apellido || ""}`.trim() ||
                        i.nombre}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Aplicar cambio
              </label>

              <select
                value={form.aplicar_a}
                onChange={(e) =>
                  setForm({ ...form, aplicar_a: e.target.value })
                }
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                disabled={cargando}
              >
                <option value="solo">Solo esta clase</option>
                <option value="pendientes">Todas las clases pendientes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1 cursor-pointer" />
              Nueva fecha
            </label>

            <div className="flex items-center gap-3 border border-gray-300 rounded-2xl px-4 py-3 bg-white shadow-sm hover:border-blue-400 transition">
              <div>
                <p
                  className={
                    form.fecha
                      ? "text-sm font-semibold text-gray-800"
                      : "text-sm font-semibold text-gray-400"
                  }
                >
                  {formatearFecha(form.fecha)}
                </p>

                <p className="text-xs text-gray-400 mt-0.5">
                  Selecciona la nueva fecha desde el calendario.
                </p>
              </div>

              <button
                type="button"
                onClick={abrirCalendario}
                disabled={cargando}
                className="ml-auto w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition disabled:opacity-50"
              >
                <Calendar className="w-5 h-5 cursor-pointer" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Hora inicio
              </label>

              <input
                type="time"
                required
                value={form.hora_inicio}
                onChange={(e) =>
                  setForm({ ...form, hora_inicio: e.target.value })
                }
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                disabled={cargando}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Hora fin
              </label>

              <input
                type="time"
                required
                value={form.hora_fin}
                onChange={(e) =>
                  setForm({ ...form, hora_fin: e.target.value })
                }
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                disabled={cargando}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Error:</strong> {error}
              </span>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className=" cursor-pointer px-5 py-2.5 text-sm border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 transition"
              disabled={cargando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={cargando}
              className=" cursor-pointer px-5 py-2.5 text-sm bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {cargando ? "Guardando..." : "Reprogramar Clase"}
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
            className="bg-white w-[95vw] sm:w-[520px] md:w-[560px] max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-5 text-white">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => cambiarMes(-1)}
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <p className="text-sm uppercase tracking-[0.25em] text-blue-100">
                    {MESES[mesVisible.getMonth()]}
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

            <div className="p-4 sm:p-5 md:p-6 overflow-y-auto">
              <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3">
                {DIAS.map((dia) => (
                  <div
                    key={dia}
                    className="text-center text-xs font-bold text-gray-500 uppercase"
                  >
                    {dia}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {diasCalendario.map((fecha, index) => {
                  if (!fecha) {
                    return <div key={`empty-${index}`} className="h-10 sm:h-11 md:h-12" />;
                  }

                  const fechaISO = obtenerFechaISO(fecha);
                  const esSeleccionada =
                    fechaISO === form.fecha;
                  const esHoy = fechaISO === hoyISO;

                  return (
                    <button
                      key={fechaISO}
                      type="button"
                      onClick={() => seleccionarFecha(fecha)}
                      className={`hover:cursor-pointer h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 mx-auto rounded-full text-sm md:text-base font-bold transition-all ${
                        esSeleccionada
                          ? "bg-blue-600 text-white shadow-md scale-105"
                          : esHoy
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-blue-50"
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
                  className=" cursor-pointer px-5 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition"
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
