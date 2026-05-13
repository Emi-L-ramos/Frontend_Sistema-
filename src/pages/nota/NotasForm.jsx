import React, { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import axios from "../../api/axios";

function NotasForm({ open, onClose, onNotaGuardada }) {
  const [busqueda, setBusqueda] = useState("");
  const [matriculas, setMatriculas] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);

  const [formData, setFormData] = useState({
    matricula: "",
    nota: "",
    comentario: "",
  });

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      obtenerMatriculas();
    }
  }, [open]);

  const obtenerMatriculas = async () => {
    try {
      const response = await axios.get("/matricula/");

      const matriculados = response.data.filter(
        (m) =>
          String(m.estado || "").toLowerCase() === "matriculado"
      );

      setMatriculas(matriculados);
    } catch (err) {
      console.error(err);
    }
  };

  const estudiantesFiltrados = useMemo(() => {
    return matriculas.filter((m) => {
      const texto = `
        ${m.nombre || ""}
        ${m.apellido || ""}
        ${m.cedula || ""}
      `.toLowerCase();

      return texto.includes(busqueda.toLowerCase());
    });
  }, [matriculas, busqueda]);

  const seleccionarEstudiante = (m) => {
    setSeleccionado(m);

    setFormData({
      ...formData,
      matricula: m.id,
    });

    setBusqueda(
      `${m.nombre || ""} ${m.apellido || ""} - ${m.cedula || ""}`
    );
  };

  const guardarNota = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.matricula) {
      setError("Debe seleccionar un estudiante.");
      return;
    }

    if (!formData.nota) {
      setError("Debe ingresar una nota.");
      return;
    }

    try {
      setGuardando(true);

      await axios.post("/notas/", {
        matricula: formData.matricula,
        nota: formData.nota,
        comentario: formData.comentario,
      });

      if (onNotaGuardada) {
        onNotaGuardada();
      }

      setFormData({
        matricula: "",
        nota: "",
        comentario: "",
      });

      setBusqueda("");
      setSeleccionado(null);

      onClose();
    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        const errores = Object.values(err.response.data)
          .flat()
          .join(" ");

        setError(errores);
      } else {
        setError("Error registrando la nota.");
      }
    } finally {
      setGuardando(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Registrar nota práctica
            </h2>

            <p className="text-slate-500 mt-1 text-sm">
              Registro del examen práctico del estudiante.
            </p>
          </div>

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

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setSeleccionado(null);

                  setFormData({
                    ...formData,
                    matricula: "",
                  });
                }}
                placeholder="Nombre o cédula..."
                className="w-full h-12 border border-slate-300 rounded-xl pl-11 pr-4 outline-none"
              />
            </div>

            {busqueda && !seleccionado && (
              <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">

                {estudiantesFiltrados.length === 0 && (
                  <div className="p-4 text-sm text-slate-500">
                    No se encontraron estudiantes.
                  </div>
                )}

                {estudiantesFiltrados.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => seleccionarEstudiante(m)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="font-semibold text-slate-800">
                      {m.nombre} {m.apellido}
                    </div>

                    <div className="text-sm text-slate-500">
                      {m.cedula}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {seleccionado && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">

              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Curso
                </p>

                <p className="font-semibold text-slate-800">
                  {seleccionado.tipo_curso}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Modalidad
                </p>

                <p className="font-semibold text-slate-800">
                  {seleccionado.modalidad}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Horario
                </p>

                <p className="font-semibold text-slate-800">
                  {seleccionado.horario}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nota práctica
            </label>

            <input
              type="number"
              min="0"
              max="100"
              value={formData.nota}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nota: e.target.value,
                })
              }
              placeholder="0 - 100"
              className="w-full h-12 border border-slate-300 rounded-xl px-4 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Comentario
            </label>

            <textarea
              value={formData.comentario}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  comentario: e.target.value,
                })
              }
              rows="4"
              placeholder="Comentario del instructor..."
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

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
              disabled={guardando}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar nota"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NotasForm;
