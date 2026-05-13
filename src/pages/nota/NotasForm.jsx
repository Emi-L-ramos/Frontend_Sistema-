import React, { useState } from "react";
import { X } from "lucide-react";

function NotasForm({ open, onClose }) {
  const [formData, setFormData] = useState({
    estudiante: "",
    nota: "",
    comentario: "",
  });

  if (!open) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const guardarNota = async (e) => {
    e.preventDefault();

    console.log(formData);

    /*
      await axios.post("/notas/", {
        estudiante: formData.estudiante,
        nota: formData.nota,
        comentario: formData.comentario,
      });
    */

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Agregar nota
          </h2>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={guardarNota} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Buscar estudiante
            </label>

            <input
              type="text"
              name="estudiante"
              value={formData.estudiante}
              onChange={handleChange}
              placeholder="Nombre o cédula..."
              className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nota práctica
            </label>

            <input
              type="number"
              name="nota"
              min="0"
              max="100"
              value={formData.nota}
              onChange={handleChange}
              placeholder="0 - 100"
              className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Comentario
            </label>

            <textarea
              name="comentario"
              value={formData.comentario}
              onChange={handleChange}
              rows="4"
              placeholder="Comentario..."
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Guardar nota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NotasForm;
