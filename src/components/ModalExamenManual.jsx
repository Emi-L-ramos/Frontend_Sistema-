import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { crearExamenManual, listarInstructores, listarMatriculas } from "../api/calendario";

export default function ModalExamenManual({ abierto, onClose, onCreada }) {
  const [instructores, setInstructores] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [form, setForm] = useState({
  matricula_id: "",
  fecha: "",
  hora_inicio: "14:00",
  hora_fin: "16:00",
});

  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    listarInstructores().then(setInstructores).catch(() => {});
    listarMatriculas().then(setMatriculas).catch(() => {});
    setForm({ matricula_id: "", fecha: "", hora_inicio: "14:00", hora_fin: "16:00" });
    setError("");
  }, [abierto]);

  if (!abierto) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.matricula_id) return setError("Debe seleccionar un Estudiante");
    if (!form.fecha) return setError("Debe indicar la fecha del Examen");

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-orange-500 to-orange-600 text-black rounded-t-xl">
          <div>
            <h3 className="text-lg font-semibold">Examen Policial</h3>
          </div>
          <button onClick={onClose} className="text-black hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              Buscar estudiante
            </label>

            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />

            {busqueda.trim() && (
            <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
              {matriculas
                .filter((m) => {
                  const texto = `${m.estudiante_nombre || ""} ${m.estudiante_cedula || ""}`.toLowerCase();

                  return texto.includes(busqueda.toLowerCase());
                })
                .map((m) => (
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
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 border-b last:border-b-0 ${
                      Number(form.matricula_id) === m.id
                        ? "bg-orange-100"
                        : ""
                    }`}
                  >
                    {m.estudiante_nombre} - {m.estudiante_cedula}
                  </button>
                ))}
            </div>
          )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha del examen</label>
            <input
              type="date"
              required
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              El examen puede ser cualquier día (incluso fin de semana).
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-sm text-orange-800">
            Horario fijo del Examen Policial: <strong>2:00 PM - 4:00 PM</strong>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {cargando ? "Creando..." : "Crear examen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}