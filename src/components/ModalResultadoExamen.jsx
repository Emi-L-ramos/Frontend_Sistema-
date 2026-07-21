import { useState } from "react";
import {
  X,
  AlertCircle,
  CheckCircle2,
  Ban,
  GraduationCap,
} from "lucide-react";
import { registrarResultadoExamen } from "../api/calendario";

export default function ModalResultadoExamen({
  abierto,
  cita,
  onClose,
  onActualizado,
}) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  if (!abierto || !cita) {
    return null;
  }

  const examenPendiente =
    String(cita.estado || "").toLowerCase() === "pendiente";

  const registrarResultado = async (resultado) => {
    if (!examenPendiente) {
      setError(
        "Este examen ya fue procesado y no puede modificarse nuevamente."
      );
      return;
    }

    setError("");
    setProcesando(true);

    try {
      const respuesta = await registrarResultadoExamen(
        cita.id,
        resultado
      );

      const estadoActualizado =
        resultado === "cancelado"
          ? "cancelada"
          : "completada";

      onActualizado?.({
        ...cita,
        ...(respuesta?.calendario || {}),
        estado: respuesta?.calendario?.estado || estadoActualizado,
      });

      onClose();
    } catch (err) {
      setError(
        err.message ||
        "No se pudo registrar el resultado del examen"
      );
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Resultado del examen
                </h3>

                <p className="mt-1 text-sm text-orange-100">
                  Examen policial
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={procesando}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Estudiante
            </p>

            <p className="mt-1 font-bold text-gray-800">
              {cita.estudiante_nombre || "Estudiante"}
            </p>

            <p className="mt-3 text-sm text-gray-500">
              Fecha: {cita.fecha}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Horario: {cita.hora_inicio?.slice(0, 5)} -{" "}
              {cita.hora_fin?.slice(0, 5)}
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Selecciona lo ocurrido con el estudiante en el
            examen policial.
          </p>

          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
            type="button"
            disabled={procesando || !examenPendiente}
            onClick={() =>
              registrarResultado("asistieron")
            }
              className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 className="h-5 w-5" />
              Aprobo
            </button>

            <button
              type="button"
              disabled={procesando || !examenPendiente}
              onClick={() =>
                registrarResultado("cancelado")
              }
              className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Ban className="h-5 w-5" />
              Reprogramar
            </button>
          </div>

          <p className="text-xs leading-5 text-gray-400">
            Al marcar “Aprobo” o “Reprogramar”, este resultado
            quedará cerrado y no podrá modificarse nuevamente.
            Si se marca “Reprogramar”, el estudiante podrá volver
            a programarse mientras no alcance las tres asignaciones.
          </p>
        </div>
      </div>
    </div>
  );
}