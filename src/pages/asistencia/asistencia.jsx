import { useEffect, useState, useMemo } from "react";
import { CheckCircle2, XCircle, Circle, Search, AlertTriangle, X, Users, UserX } from "lucide-react";
import { listarAsistencia, marcarAsistencia, justificarClase } from "../../api/asistencia";

const ENCUENTROS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Asistencia() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [encuentroFiltro, setEncuentroFiltro] = useState(1);
  const [modalJustificar, setModalJustificar] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await listarAsistencia();
      setDatos(res);
    } catch (e) {
      setError("Error al cargar asistencia");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return datos;
    const b = busqueda.toLowerCase();
    return datos.filter(
      (d) =>
        d.nombre.toLowerCase().includes(b) ||
        d.cedula?.includes(b)
    );
  }, [datos, busqueda]);

  const totalEstudiantes = datos.length;
  const ausentes = datos.filter((d) => {
    const a = d.asistencias[String(encuentroFiltro)];
    return a && a.asistio === false && !a.justificada;
  }).length;

  const handleMarcar = async (calendario_id, asistio) => {
    try {
      await marcarAsistencia(calendario_id, asistio);
      await cargar();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleJustificar = async () => {
    if (!motivo.trim()) return;
    setGuardando(true);
    try {
      await justificarClase(modalJustificar.id, motivo);
      setModalJustificar(null);
      setMotivo("");
      await cargar();
    } catch (e) {
      setError(e.message);
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

    if (data.justificada) {
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

    if (data.asistio === true) {
      return (
        <td className="px-3 py-4 text-center">
          <button
            type="button"
            title="Presente â€” click para cambiar"
            onClick={() => handleMarcar(data.id, false)}
            className="mx-auto block hover:opacity-70 transition-opacity"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </button>
        </td>
      );
    }

    if (data.asistio === false) {
      return (
        <td className="px-3 py-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              title="Ausente â€” click para justificar"
              onClick={() =>
                setModalJustificar({ id: data.id, numero, fecha: data.fecha })
              }
              className="mx-auto block hover:opacity-70 transition-opacity"
            >
              <XCircle className="w-5 h-5 text-red-500" />
            </button>
            <button
              type="button"
              onClick={() =>
                setModalJustificar({ id: data.id, numero, fecha: data.fecha })
              }
              className="text-[9px] text-orange-500 hover:underline leading-tight"
            >
              Justificar
            </button>
          </div>
        </td>
      );
    }

    // Sin marcar aÃºn
    return (
      <td className="px-3 py-4 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            title="Marcar presente"
            onClick={() => handleMarcar(data.id, true)}
            className="hover:scale-110 transition-transform"
          >
            <CheckCircle2 className="w-4 h-4 text-gray-300 hover:text-green-500" />
          </button>
          <button
            type="button"
            title="Marcar ausente"
            onClick={() => handleMarcar(data.id, false)}
            className="hover:scale-110 transition-transform"
          >
            <XCircle className="w-4 h-4 text-gray-300 hover:text-red-500" />
          </button>
        </div>
      </td>
    );
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Control de Asistencia</h1>
        <p className="text-sm text-gray-500 mt-1">Registro de asistencia de los 8 encuentros</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Users className="w-4 h-4" /> Total Estudiantes
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalEstudiantes}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <UserX className="w-4 h-4" /> Ausentes
          </div>
          <p className="text-3xl font-bold text-red-600">{ausentes}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filtros */}
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
            {ENCUENTROS.map((e) => (
              <option key={e} value={e}>Encuentro {e}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        {cargando ? (
          <div className="p-12 text-center text-gray-400">Cargando asistencia...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Estudiante</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">CÃ©dula</th>
                {ENCUENTROS.map((e) => (
                  <th key={e} className={`px-3 py-3 text-center font-semibold ${e === encuentroFiltro ? "text-blue-600" : "text-gray-700"}`}>
                    E{e}
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-gray-400">
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
                  <tr key={est.matricula_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900">{est.nombre}</td>
                    <td className="px-4 py-4 text-gray-500">{est.cedula}</td>
                    {ENCUENTROS.map((num) => (
                      <CeldaAsistencia
                        key={num}
                        data={est.asistencias[String(num)]}
                        numero={num}
                      />
                    ))}
                    <td className={`px-4 py-4 text-center font-bold text-base ${color}`}>
                      {est.porcentaje}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Presente</div>
        <div className="flex items-center gap-1.5"><XCircle className="w-4 h-4 text-red-500" /> Ausente (click para justificar)</div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">J</span>
          </div>
          Justificada (clase reprogramada)
        </div>
        <div className="flex items-center gap-1.5"><Circle className="w-4 h-4 text-gray-200" /> Sin encuentro aÃºn</div>
      </div>

      {/* Modal Justificar */}
      {modalJustificar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-2.5 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Justificar Ausencia</h3>
                <p className="text-xs text-gray-500">
                  Encuentro {modalJustificar.numero} â€” {modalJustificar.fecha}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 bg-orange-50 border border-orange-100 rounded-xl p-3">
              âš ï¸ Esta clase y <strong>todas las siguientes</strong> (incluyendo el examen) se reprogramarÃ¡n al siguiente dÃ­a disponible.
            </p>
            <textarea
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 resize-none"
              rows={3}
              placeholder="Motivo de la justificaciÃ³n..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => { setModalJustificar(null); setMotivo(""); }}
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