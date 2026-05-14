// frontend/src/components/calendarioEditarForm.jsx
import { useEffect, useState } from "react";
import { X, Calendar, Clock, User } from "lucide-react";
import Swal from "sweetalert2";
import { actualizarCita, listarInstructores } from "../api/calendario";

export default function CalendarioEditarForm({ abierto, onClose, onActualizada, cita }) {
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

  useEffect(() => {
    if (!abierto || !cita) return;
    
    const cargarInstructores = async () => {
      const inst = await listarInstructores();
      setInstructores(inst || []);
    };
    cargarInstructores();
    
    setForm({
      fecha: cita.fecha || "",
      hora_inicio: cita.hora_inicio?.slice(0, 5) || "",
      hora_fin: cita.hora_fin?.slice(0, 5) || "",
      instructor_id: cita.instructor || "",
      aplicar_a: "solo",
    });
    setError("");
  }, [abierto, cita]);

  if (!abierto || !cita) return null;

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
        title: '¡Actualizada!',
        text: 'La clase ha sido reprogramada exitosamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      onActualizada?.();
      onClose();
    } catch (error) {
      setError(error.message || "Error al actualizar la clase");
      Swal.fire('Error', error.message || "Error al actualizar", 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Reprogramar Clase
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={cargando}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Información actual */}
          <div className="bg-gray-50 p-3 rounded-lg mb-2">
            <p className="text-xs text-gray-500 mb-1">Información actual:</p>
            <div className="text-sm space-y-1">
              <div><strong>Estudiante:</strong> {cita.estudiante_nombre || 'N/A'}</div>
              <div><strong>Instructor:</strong> {cita.instructor_nombre || 'N/A'}</div>
              <div><strong>Clase:</strong> {cita.numero_clase || 'N/A'}/8</div>
              <div><strong>Horario actual:</strong> {cita.hora_inicio?.slice(0,5) || 'N/A'} - {cita.hora_fin?.slice(0,5) || 'N/A'}</div>
            </div>
          </div>

          {/* Seleccionar instructor */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Cambiar Instructor (opcional)
            </label>
            <select
              value={form.instructor_id}
              onChange={(e) => setForm({ ...form, instructor_id: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={cargando}
            >
              <option value={cita.instructor}>{cita.instructor_nombre} (actual)</option>
              {instructores
                .filter(i => i.id !== cita.instructor)
                .map(i => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
            </select>

            <div>
              <label className="block text-sm font-medium mb-1">
                Aplicar cambio
              </label>

              <select
                value={form.aplicar_a}
                onChange={(e) =>
                  setForm({ ...form, aplicar_a: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="solo">
                  Solo esta clase
                </option>

                <option value="pendientes">
                  Todas las clases pendientes
                </option>
              </select>
            </div>
          </div>

          {/* Nueva fecha */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Nueva Fecha *
            </label>
            <input
              type="date"
              required
              value={form.fecha}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={cargando}
            />
          </div>

          {/* Nuevo horario */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Hora Inicio *
              </label>
              <input
                type="time"
                required
                value={form.hora_inicio}
                onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={cargando}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Hora Fin *
              </label>
              <input
                type="time"
                required
                value={form.hora_fin}
                onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={cargando}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition"
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? "Guardando..." : "Reprogramar Clase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}