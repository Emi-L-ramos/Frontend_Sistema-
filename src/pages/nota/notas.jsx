import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import axios from "../../api/axios";
import NotasForm from "./NotasForm";

function NotasPages({ userRole }) {
  const [notas, setNotas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todas");
  const [modalAbierto, setModalAbierto] = useState(false);

  const rol = userRole?.toLowerCase();

  useEffect(() => {
    obtenerNotas();
  }, []);

  const obtenerNotas = async () => {
    try {
      const response = await axios.get("/notas/");
      setNotas(response.data);
    } catch (error) {
      console.error("Error cargando notas:", error);
    }
  };

  const notasFiltradas = useMemo(() => {
    return notas.filter((nota) => {
      const texto = `
        ${nota.estudiante_nombre || ""}
        ${nota.estudiante_cedula || ""}
        ${nota.instructor_nombre || ""}
        ${nota.plan_nombre || ""}
        ${nota.tipo_curso || ""}
        ${nota.modalidad || ""}
      `.toLowerCase();

      const coincideBusqueda = texto.includes(busqueda.toLowerCase());

      const coincideTipo =
        filtroTipo === "Todas" ||
        nota.tipo_curso?.toLowerCase() === filtroTipo.toLowerCase();

      return coincideBusqueda && coincideTipo;
    });
  }, [notas, busqueda, filtroTipo]);

  const notasAgrupadas = useMemo(() => {
    const agrupadas = {};

    notasFiltradas.forEach((nota) => {
      const matriculaId = nota.matricula;

      if (!agrupadas[matriculaId]) {
        agrupadas[matriculaId] = {
          ...nota,
          nota_practica: null,
          nota_teorica: null,
          comentario_practico: "",
          comentario_teorico: "",
        };
      }

      if (nota.tipo_nota === "practico") {
        agrupadas[matriculaId].nota_practica = nota.nota;
        agrupadas[matriculaId].comentario_practico = nota.comentario;
      }

      if (nota.tipo_nota === "teorico") {
        agrupadas[matriculaId].nota_teorica = nota.nota;
        agrupadas[matriculaId].comentario_teorico = nota.comentario;
      }
    });

    return Object.values(agrupadas);
  }, [notasFiltradas]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Notas</h1>

          {rol === "admin" && (
            <p className="text-slate-500 mt-2">
              Vista administrativa de las notas registradas en el sistema.
            </p>
          )}

          {rol === "instructor" && (
            <p className="text-slate-500 mt-2">
              Panel para visualizar estudiantes asignados y registrar sus notas.
            </p>
          )}

          {rol === "estudiante" && (
            <p className="text-slate-500 mt-2">
              Consulta de tus notas registradas.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {(rol === "admin" || rol === "instructor") && (
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 h-14 w-full md:max-w-xl">
            <Search className="text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por estudiante, cédula, instructor o plan..."
              className="w-full h-full outline-none ml-3 bg-transparent text-slate-700"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        )}

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

        {rol === "instructor" && (
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Agregar nota práctica
          </button>
        )}
      </div>

      {rol === "admin" && <TablaAdmin notas={notasAgrupadas} />}

      {rol === "instructor" && <TablaInstructor notas={notasAgrupadas} />}

      {rol === "estudiante" && <TablaEstudiante notas={notasAgrupadas} />}

      <NotasForm
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onNotaGuardada={obtenerNotas}
      />
    </div>
  );
}

function TablaAdmin({ notas }) {
  return (
    <ContenedorTabla>
      <table className="w-full min-w-[1200px]">
        <thead>
          <tr className="border-b border-slate-200">
            <Th>Estudiante</Th>
            <Th>Cédula</Th>
            <Th>Instructor</Th>
            <Th>Curso</Th>
            <Th>Modalidad</Th>
            <Th>Nota práctica</Th>
            <Th>Resultado práctica</Th>
            <Th>Nota teórica</Th>
            <Th>Resultado teórico</Th>
            <Th>Comentario</Th>
          </tr>
        </thead>

        <tbody>
          {notas.map((nota) => (
            <FilaNota key={nota.matricula} nota={nota} mostrarEstudiante />
          ))}
        </tbody>
      </table>

      {notas.length === 0 && <MensajeVacio />}
    </ContenedorTabla>
  );
}

function TablaInstructor({ notas }) {
  return (
    <ContenedorTabla>
      <table className="w-full min-w-[1100px]">
        <thead>
          <tr className="border-b border-slate-200">
            <Th>Estudiante</Th>
            <Th>Cédula</Th>
            <Th>Curso</Th>
            <Th>Modalidad</Th>
            <Th>Nota práctica</Th>
            <Th>Resultado práctica</Th>
            <Th>Nota teórica</Th>
            <Th>Resultado teórico</Th>
            <Th>Comentario</Th>
          </tr>
        </thead>

        <tbody>
          {notas.map((nota) => (
            <FilaNota key={nota.matricula} nota={nota} mostrarEstudiante />
          ))}
        </tbody>
      </table>

      {notas.length === 0 && <MensajeVacio />}
    </ContenedorTabla>
  );
}

function TablaEstudiante({ notas }) {
  return (
    <ContenedorTabla>
      <table className="w-full min-w-[950px]">
        <thead>
          <tr className="border-b border-slate-200">
            <Th>Instructor</Th>
            <Th>Curso</Th>
            <Th>Modalidad</Th>
            <Th>Nota práctica</Th>
            <Th>Resultado práctica</Th>
            <Th>Nota teórica</Th>
            <Th>Resultado teórico</Th>
            <Th>Comentario</Th>
          </tr>
        </thead>

        <tbody>
          {notas.map((nota) => (
            <FilaNota key={nota.matricula} nota={nota} mostrarInstructor />
          ))}
        </tbody>
      </table>

      {notas.length === 0 && <MensajeVacio />}
    </ContenedorTabla>
  );
}

function FilaNota({ nota, mostrarEstudiante, mostrarInstructor }) {
  const comentario =
    nota.comentario_practico ||
    nota.comentario_teorico ||
    nota.comentario ||
    "Sin comentario";

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition">
      {mostrarEstudiante && (
        <>
          <TdBold>{nota.estudiante_nombre || "Sin estudiante"}</TdBold>
          <Td>{nota.estudiante_cedula || "Sin cédula"}</Td>
        </>
      )}

      {mostrarInstructor && (
        <TdBold>{nota.instructor_nombre || "Sin instructor"}</TdBold>
      )}

      {mostrarEstudiante && (
        <Td>{nota.instructor_nombre || "Sin instructor"}</Td>
      )}

      <Td>
        <Badge color="purple">{nota.tipo_curso || "Sin curso"}</Badge>
      </Td>

      <Td>
        <Badge color="green">{nota.modalidad || "Sin modalidad"}</Badge>
      </Td>

      <Td>
        <NotaBadge nota={nota.nota_practica} />
      </Td>

      <Td>
        <ResultadoBadge nota={nota.nota_practica} />
      </Td>

      <Td>
        <NotaBadge nota={nota.nota_teorica} textoEspera="En espera" />
      </Td>

      <Td>
        <ResultadoBadge nota={nota.nota_teorica} textoEspera="Pendiente de examen" />
      </Td>

      <Td>{comentario}</Td>
    </tr>
  );
}

function NotaBadge({ nota, textoEspera = "En espera" }) {
  if (nota === null || nota === undefined || nota === "") {
    return <Badge color="gray">{textoEspera}</Badge>;
  }

  return (
    <Badge color={Number(nota) >= 70 ? "green" : "red"}>
      {nota}
    </Badge>
  );
}

function ResultadoBadge({ nota, textoEspera = "Pendiente" }) {
  if (nota === null || nota === undefined || nota === "") {
    return <Badge color="gray">{textoEspera}</Badge>;
  }

  return (
    <Badge color={Number(nota) >= 70 ? "green" : "red"}>
      {Number(nota) >= 70 ? "Aprobado" : "Reprobado"}
    </Badge>
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
    gray: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${
        colores[color] || colores.gray
      }`}
    >
      {children}
    </span>
  );
}

function MensajeVacio() {
  return (
    <div className="text-center py-10 text-slate-500">
      No se encontraron notas registradas.
    </div>
  );
}

export default NotasPages;
