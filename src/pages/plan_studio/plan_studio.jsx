import { useEffect, useMemo, useState } from "react";
import {
  Search,
  CheckCircle2,
  Plus,
  BookOpen,
  Users,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

function PlanStudio({ userRole }) {
  const navigate = useNavigate();

  const [planes, setPlanes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todas");
  const [cargando, setCargando] = useState(true);
  const [progresos, setProgresos] = useState([]);

  const rol = userRole?.toLowerCase();

  useEffect(() => {
     obtenerProgresos();
  }, []);

  const obtenerProgresos = async () => {
  try {
    const response = await axios.get("/progreso-plan/");

    const data = Array.isArray(response.data)
      ? response.data
      : response.data.results || [];

    setProgresos(data);
  } catch (error) {
    console.error("Error cargando progreso del plan:", error);
  } finally {
    setCargando(false);
  }
};

    const marcarInstructor = async (progresoId) => {
        try {
            await axios.post(`/progreso-plan/${progresoId}/marcar-instructor/`);
            obtenerProgresos();
        } catch (error) {
            console.error("Error marcando clase dada:", error);
        }
        };
 
    const marcarEstudiante = async (progresoId) => {
        try {
            await axios.post(`/progreso-plan/${progresoId}/marcar-estudiante/`);
            obtenerProgresos();
        } catch (error) {
            console.error("Error marcando clase recibida:", error);
        }
        };



 const marcarClase = async (progresoId, tipo, valor = true) => {
  try {
    if (tipo === "estudiante") {
      await axios.post(`/progreso-plan/${progresoId}/marcar-estudiante/`);
    }

    if (tipo === "instructor") {
      await axios.post(`/progreso-plan/${progresoId}/marcar-instructor/`);
    }

    if (tipo === "admin_estudiante") {
      await axios.post(`/progreso-plan/${progresoId}/admin-forzar/`, {
        tipo: "estudiante",
        valor,
      });
    }

    if (tipo === "admin_instructor") {
      await axios.post(`/progreso-plan/${progresoId}/admin-forzar/`, {
        tipo: "instructor",
        valor,
      });
    }

    obtenerProgresos();
  } catch (error) {
    console.error("Error marcando clase:", error.response?.data || error);
  }
};

  const planesFiltrados = useMemo(() => {
    return planes.filter((plan) => {
      const texto = `
        ${plan.nombre || ""}
        ${plan.tipo_curso || ""}
      `.toLowerCase();

      const coincideBusqueda = texto.includes(busqueda.toLowerCase());

      const coincideTipo =
        filtroTipo === "Todas" ||
        plan.tipo_curso?.toLowerCase() === filtroTipo.toLowerCase();

      return coincideBusqueda && coincideTipo;
    });
  }, [planes, busqueda, filtroTipo]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Plan de Estudio
          </h1>

          {rol === "admin" && (
            <p className="text-slate-500 mt-2">
              Panel administrativo para gestionar planes de estudio.
            </p>
          )}

          {rol === "instructor" && (
            <p className="text-slate-500 mt-2">
              Visualización del contenido académico asignado.
            </p>
          )}

          {rol === "estudiante" && (
            <p className="text-slate-500 mt-2">
              Consulta de tu plan de estudio.
            </p>
          )}
        </div>

        {rol === "admin" &&  (
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/dashboard/plan-estudio/ver")}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-sm transition hover:cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
              Ver planes
            </button>

            <button
              onClick={() => navigate("/dashboard/plan-estudio/nuevo")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl shadow-sm transition hover:cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Nuevo plan
            </button>
          </div>
        )}


      </div>

      {rol !== "estudiante" && (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 h-14 w-full md:max-w-xl">
            <Search className="text-slate-400" size={20} />

            <input
              type="text"
              placeholder="Buscar por nombre del plan o nivel..."
              className="w-full h-full outline-none ml-3 bg-transparent text-slate-700"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="h-14 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none min-w-[170px]"
          >
            <option value="Todas">Todas</option>
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>
      )}

      {cargando && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-500">
          Cargando planes de estudio...
        </div>
      )}

      {!cargando && rol === "admin" && (
        <PanelAdmin planes={planesFiltrados} />
      )}

      {!cargando && rol === "instructor" && (
        <PanelInstructor planes={planesFiltrados} />
      )}

      {!cargando && rol === "estudiante" && (
        <PanelEstudiante planes={planesFiltrados} />
      )}
    </div>
  );
}

function PanelAdmin({ planes }) {
  return (
    <ContenedorTabla>
      <table className="w-full min-w-[1000px]">
        <thead>
          <tr className="border-b border-slate-200">
            <Th>Plan</Th>
            <Th>Nivel</Th>
            <Th>Temas</Th>
            <Th>Subtemas</Th>
            <Th>Estado</Th>
          </tr>
        </thead>

        <tbody>
          {planes.map((plan) => {
            const totalTemas = plan.temas?.length || 0;

            const totalSubtemas =
              plan.temas?.reduce(
                (total, tema) => total + (tema.subtemas?.length || 0),
                0
              ) || 0;

            return (
              <tr
                key={plan.id}
                className="border-b border-slate-200 hover:bg-slate-50 transition"
              >
                <TdBold>{plan.nombre}</TdBold>

                <Td>
                  <Badge color="purple">{plan.tipo_curso}</Badge>
                </Td>

                <Td>{totalTemas}</Td>

                <Td>{totalSubtemas}</Td>

                <Td>
                  <Badge color={plan.activo ? "green" : "red"}>
                    {plan.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex gap-3">
        <button
            onClick={() =>
            adminForzarCheck(item.id, "instructor", !item.instructor_completado)
            }
            className="px-4 py-2 rounded-xl bg-blue-100 text-blue-700 font-semibold"
        >
            {item.instructor_completado ? "Quitar clase dada" : "Dar check instructor"}
        </button>

        <button
            onClick={() =>
            adminForzarCheck(item.id, "estudiante", !item.estudiante_completado)
            }
            className="px-4 py-2 rounded-xl bg-purple-100 text-purple-700 font-semibold"
        >
            {item.estudiante_completado ? "Quitar clase recibida" : "Dar check estudiante"}
        </button>
        </div>

      {planes.length === 0 && <MensajeVacio />}
    </ContenedorTabla>
  );
}

function PanelInstructor({ planes }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {planes.map((plan) => (
        <div
          key={plan.id}
          className="bg-white border border-slate-200 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {plan.nombre}
              </h2>

              <p className="text-slate-500 mt-1">
                Nivel: {plan.tipo_curso}
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Users className="text-blue-700" size={24} />
            </div>
          </div>

          <button
            disabled={!item.desbloqueado || item.instructor_completado}
            onClick={() => marcarInstructor(item.id)}
            className={`px-4 py-2 rounded-xl font-semibold ${
                item.instructor_completado
                ? "bg-green-100 text-green-700"
                : item.desbloqueado
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }`}
            >
            {item.instructor_completado ? "Clase dada" : "Marcar clase dada"}
            </button>

          <div className="space-y-4">
            {plan.temas?.map((tema, indexTema) => (
              <div
                key={tema.id}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50"
              >
                <h3 className="font-semibold text-slate-800">
                  {indexTema + 1}. {tema.titulo}
                </h3>

                <div className="mt-3 space-y-2">
                  {tema.subtemas?.map((subtema, indexSubtema) => (
                    <div
                      key={subtema.id}
                      className="flex items-center gap-3 text-slate-600"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600" />

                      <span>
                        {indexTema + 1}.{indexSubtema + 1}{" "}
                        {subtema.titulo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {planes.length === 0 && <MensajeVacioTarjeta />}
    </div>
  );
}

function PanelEstudiante({ planes }) {
  const plan = planes[0];

  if (!plan) {
    return <MensajeVacioTarjeta />;
  }

  const totalTemas = plan.temas?.length || 0;

  const totalSubtemas =
    plan.temas?.reduce(
      (total, tema) => total + (tema.subtemas?.length || 0),
      0
    ) || 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
          <GraduationCap className="text-purple-700" size={28} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {plan.nombre}
          </h2>

          <p className="text-slate-500 mt-1">
            Nivel asignado: {plan.tipo_curso}
          </p>

          <p className="text-slate-500 mt-1">
            {totalTemas} temas y {totalSubtemas} subtemas registrados.
          </p>
        </div>
      </div>


      <button
        disabled={!item.desbloqueado || item.estudiante_completado}
        onClick={() => marcarEstudiante(item.id)}
        className={`px-4 py-2 rounded-xl font-semibold ${
            item.estudiante_completado
            ? "bg-green-100 text-green-700"
            : item.desbloqueado
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-slate-200 text-slate-500 cursor-not-allowed"
        }`}
        >
        {item.estudiante_completado ? "Clase recibida" : "Marcar clase recibida"}
        </button>

      <div className="space-y-5">
        {plan.temas?.map((tema, indexTema) => (
          <div
            key={tema.id}
            className="border border-slate-200 rounded-2xl p-5 bg-slate-50"
          >
            <h3 className="font-bold text-slate-800 text-lg mb-4">
              {indexTema + 1}. {tema.titulo}
            </h3>

            <div className="space-y-3">
              {tema.subtemas?.map((subtema, indexSubtema) => (
                <div
                  key={subtema.id}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600" />

                  <span className="font-medium text-slate-700">
                    {indexTema + 1}.{indexSubtema + 1}{" "}
                    {subtema.titulo}
                  </span>
                </div>
              ))}

              {(!tema.subtemas || tema.subtemas.length === 0) && (
                <p className="text-slate-500 text-sm">
                  Este tema no tiene subtemas registrados.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContenedorTabla({ children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
      {children}
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="text-left px-6 py-5 text-slate-700 font-semibold">
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-6 py-7 text-slate-700">
      {children}
    </td>
  );
}

function TdBold({ children }) {
  return (
    <td className="px-6 py-7 font-semibold text-slate-800">
      {children}
    </td>
  );
}

function Badge({ children, color }) {
  const colores = {
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-4 py-1.5 rounded-full text-sm font-semibold ${colores[color]}`}
    >
      {children}
    </span>
  );
}

function MensajeVacio() {
  return (
    <div className="text-center py-10 text-slate-500">
      No se encontraron planes de estudio registrados.
    </div>
  );
}

function MensajeVacioTarjeta() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
      No se encontraron planes de estudio registrados.
    </div>
  );
}

export default PlanStudio;
