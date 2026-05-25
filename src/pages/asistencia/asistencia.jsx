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
} from "lucide-react";
import {
  finalizarKilometraje,
  justificarClase,
  listarAsistencia,
  marcarAsistencia,
  resumenKilometros,
} from "../../api/asistencia";

export default function Asistencia({ userRole }) {
  const rol = userRole?.toLowerCase();

  const [datos, setDatos] = useState([]);
  const [resumenKm, setResumenKm] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [encuentroFiltro, setEncuentroFiltro] = useState(1);

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

    try {
      const res = await listarAsistencia();
      setDatos(Array.isArray(res) ? res : []);
    } catch {
      setError("Error al cargar asistencia");
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
  }, []);

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
    const a = d.asistencias?.[String(encuentroFiltro)];
    return a && a.estado === "falto" && !a.justificado_por_admin;
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
        return (
          item.km_inicial !== null ||
          item.km_final !== null ||
          item.km_recorridos !== null
        );
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
                {data.km_recorridos} km
              </span>
            ) : kmPendiente && rol === "instructor" ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalKmFinal(data);
                  setKmFinal("");
                }}
                className="text-[9px] text-blue-600 hover:underline"
              >
                Finalizar km
              </button>
            ) : kmPendiente ? (
              <span className="text-[9px] text-orange-500">
                Km pendiente
              </span>
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
                className="text-[9px] text-orange-500 hover:underline leading-tight"
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
        {rol === "instructor" ? (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              title="Marcar presente"
              onClick={(e) => {
                e.stopPropagation();
                setModalKmInicio(data);
                setKmInicial("");
              }}
              className="hover:scale-110 transition-transform"
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
              className="hover:scale-110 transition-transform"
            >
              <XCircle className="w-4 h-4 text-gray-300 hover:text-red-500" />
            </button>
          </div>
        ) : (
          <Circle className="w-5 h-5 text-gray-200 mx-auto" />
        )}
      </td>
    );
  };

  const resumenSeleccionado = buscarResumenKmEstudiante(modalDetalleEstudiante);

  const detalleKmSeleccionado = obtenerDetalleKilometraje(
    modalDetalleEstudiante
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Control de Asistencia
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Registro de asistencia de los encuentros
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-md">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Users className="w-4 h-4" />
            Total Estudiantes
          </div>

          <p className="text-3xl font-bold text-gray-900">
            {totalEstudiantes}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <UserX className="w-4 h-4" />
            Ausentes
          </div>

          <p className="text-3xl font-bold text-red-600">{ausentes}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />

          {error}

          <button onClick={() => setError("")} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar estudiante..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>
{/* 
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Encuentro:</label>

          <select
            value={encuentroFiltro}
            onChange={(e) => setEncuentroFiltro(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {encuentrosDisponibles.map((e) => (
              <option key={e} value={e}>
                Encuentro {e}
              </option>
            ))}
          </select>
        </div> */}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        {cargando ? (
          <div className="p-12 text-center text-gray-400">
            Cargando asistencia...
          </div>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Estudiante
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Cédula
                </th>

                {encuentrosDisponibles.map((e) => (
                  <th
                    key={e}
                    className={`px-3 py-3 text-center font-semibold ${
                      e === encuentroFiltro
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    E{e}
                  </th>
                ))}

                <th className="px-4 py-3 text-center font-semibold text-gray-700">
                  Asistencia
                </th>
              </tr>
            </thead>

            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td
                    colSpan={encuentrosDisponibles.length + 3}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No se encontraron estudiantes
                  </td>
                </tr>
              )}

              {filtrados.map((est) => {
                const color =
                  est.porcentaje === 100
                    ? "text-green-600"
                    : est.porcentaje >= 75
                    ? "text-yellow-600"
                    : "text-red-600";

                return (
                  <tr
                    key={est.matricula_id}
                    onClick={() => setModalDetalleEstudiante(est)}
                    className="border-b border-gray-50 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {est.nombre}
                    </td>

                    <td className="px-4 py-4 text-gray-500">{est.cedula}</td>

                    {encuentrosDisponibles.map((num) => (
                      <CeldaAsistencia
                        key={num}
                        data={est.asistencias?.[String(num)]}
                        numero={num}
                      />
                    ))}

                    <td
                      className={`px-4 py-4 text-center font-bold text-base ${color}`}
                    >
                      {est.porcentaje}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Presente
        </div>

        <div className="flex items-center gap-1.5">
          <XCircle className="w-4 h-4 text-red-500" />
          Ausente
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">J</span>
          </div>

          Justificada
        </div>

        <div className="flex items-center gap-1.5">
          <Circle className="w-4 h-4 text-gray-200" />
          Sin marcar
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
                  {resumenSeleccionado?.instructor_nombre || "No asignado"}
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
                  {resumenSeleccionado?.total_km || 0} km
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <CalendarDays className="w-4 h-4" />
                  Clases con km
                </div>

                <p className="text-3xl font-bold text-gray-900">
                  {resumenSeleccionado?.total_clases || 0}
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
                          key={`${item.numero}-${item.asistencia_id || item.id}`}
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
                            {item.km_recorridos ?? 0} km
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
              Esta ausencia será justificada y el sistema agregará un nuevo encuentro al final del calendario para recuperar la clase perdida. No se saltarán temas del plan de estudio.
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
