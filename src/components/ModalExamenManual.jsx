import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { crearExamenManual, listarInstructores, listarMatriculas } from "../api/calendario";

export default function ModalExamenManual({ abierto, onClose, onCreada }) {
  const [instructores, setInstructores] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [form, setForm] = useState({
    instructor_id: "",
    matricula_id: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    listarInstructores().then(setInstructores).catch(() => {});
    listarMatriculas().then(setMatriculas).catch(() => {});
    setForm({ instructor_id: "", matricula_id: "", fecha: "", hora_inicio: "", hora_fin: "" });
    setError("");
  }, [abierto]);

  if (!abierto) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.instructor_id) return setError("Debe seleccionar un instructor");
    if (!form.matricula_id) return setError("Debe seleccionar un estudiante");
    if (!form.fecha) return setError("Debe indicar la fecha del examen");
    if (!form.hora_inicio || !form.hora_fin) return setError("Debe indicar la hora de inicio y fin");

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
            <h3 className="text-lg font-semibold">Examen</h3>
            <p className="text-xs text-orange-100">Programa la clase 9 (examen final)</p>
          </div>
          <button onClick={onClose} className="text-black hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Instructor</label>
            <select
              required
              value={form.instructor_id}
              onChange={(e) => setForm({ ...form, instructor_id: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">-- Seleccionar --</option>
              {instructores.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombre || i.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Estudiante</label>
            <select
              required
              value={form.matricula_id}
              onChange={(e) => setForm({ ...form, matricula_id: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">-- Seleccionar --</option>
              {matriculas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre} {m.apellido} {m.cedula}
                </option>
              ))}
            </select>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Hora inicio</label>
              <input
                type="time"
                required
                value={form.hora_inicio}
                onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
                <input
                type="time"
                required
                value={form.hora_fin}
                onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
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