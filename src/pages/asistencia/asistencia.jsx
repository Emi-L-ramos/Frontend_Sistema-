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
} from "lucide-react";
import {
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
  const [modalJustificar, setModalJustificar] = useState(null);
  const [modalKm, setModalKm] = useState(null);
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

  const handleMarcar = async (
    calendarioId,
    estado,
    km_inicial = null,
    km_final = null
  ) => {
    try {
      await marcarAsistencia({
        clase_id: calendarioId,
        estado,
        km_inicial,
        km_final,
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

  const confirmarAsistenciaConKm = async () => {
    if (!modalKm) return;

    if (kmInicial === "" || kmFinal === "") {
      setError("Debe ingresar km inicial y km final.");
      return;
    }

    const inicial = Number(kmInicial);
    const final = Number(kmFinal);

    if (Number.isNaN(inicial) || Number.isNaN(final)) {
      setError("Los kilómetros deben ser numéricos.");
      return;
    }

    if (final < inicial) {
      setError("El km final no puede ser menor que el km inicial.");
      return;
    }

    await handleMarcar(modalKm.id, "asistio", inicial, final);

    setModalKm(null);
    setKmInicial("");
    setKmFinal("");
  };

  const handleJustificar = async () => {
    if (!motivo.trim() || !modalJustificar?.asistencia_id) return;

    setGuardando(true);

    try {
      await justificarClase(modalJustificar.asistencia_id, motivo);

      setModalJustificar(null);
      setMotivo("");

      await cargar();
      await cargarResumenKm();
    } catch (e) {
      setError(e?.message || "No se pudo justificar la ausencia");
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
      return (
        <td className="px-3 py-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />

            {data.km_recorridos ? (
              <span className="text-[9px] text-blue-600">
                {data.km_recorridos} km
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
                onClick={() =>
                  setModalJustificar({
                    asistencia_id: data.asistencia_id || data.id,
                    numero,
                    fecha: data.fecha,
                  })
                }
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
              onClick={() => {
                setModalKm(data);
                setKmInicial("");
                setKmFinal("");
              }}
              className="hover:scale-110 transition-transform"
            >
              <CheckCircle2 className="w-4 h-4 text-gray-300 hover:text-green-500" />
            </button>

            <button
              type="button"
              title="Marcar ausente"
              onClick={() => handleMarcar(data.id, "falto")}
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

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
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

      {resumenKm.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Resumen de kilometraje
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumenKm.map((item) => (
              <div
                key={`${item.estudiante_id}-${item.instructor_id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <p className="text-xs text-gray-500">Estudiante</p>

                <h3 className="font-bold text-gray-900">
                  {item.estudiante_nombre}
                </h3>

                <p className="text-xs text-gray-500 mt-2">Instructor</p>

                <p className="text-sm text-gray-700">
                  {item.instructor_nombre}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {item.total_clases} clases
                  </span>

                  <span className="text-2xl font-bold text-blue-600">
                    {item.total_km} km
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        {cargando ? (
          <div className="p-12 text-center text-gray-400">
            Cargando asistencia...
          </div>
        ) : (
          <table className="w-full text-sm">
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
                      e === encuentroFiltro ? "text-blue-600" : "text-gray-700"
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
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
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

      {modalKm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2.5 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Registrar kilometraje
                </h3>

                <p className="text-xs text-gray-500">
                  Fecha: {modalKm.fecha || "Sin fecha"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Km inicial</label>

                <input
                  type="number"
                  value={kmInicial}
                  onChange={(e) => setKmInicial(e.target.value)}
                  className="w-full mt-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Ingrese el kilometraje inicial"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Km final</label>

                <input
                  type="number"
                  value={kmFinal}
                  onChange={(e) => setKmFinal(e.target.value)}
                  className="w-full mt-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Ingrese el kilometraje final"
                />
              </div>

              {kmInicial !== "" &&
                kmFinal !== "" &&
                Number(kmFinal) >= Number(kmInicial) && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
                    Recorrido del día:{" "}
                    <strong>
                      {Number(kmFinal) - Number(kmInicial)} km
                    </strong>
                  </div>
                )}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => {
                  setModalKm(null);
                  setKmInicial("");
                  setKmFinal("");
                }}
                className="flex-1 border-2 border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarAsistenciaConKm}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold"
              >
                Guardar asistencia
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
              Esta clase y <strong>todas las siguientes</strong> se
              reprogramarán al siguiente día disponible.
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
                {guardando ? "Guardando..." : "Confirmar y Reprogramar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
