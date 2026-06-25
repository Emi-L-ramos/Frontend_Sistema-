import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  Clock3,
  ClipboardCheck,
  TrendingUp,
  CheckCircle2,
  Filter,
} from "lucide-react";
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

  const resumen = useMemo(() => {
    const total = notasAgrupadas.length;

    const aprobados = notasAgrupadas.filter((nota) => {
      const practicaOk =
        nota.nota_practica !== null &&
        nota.nota_practica !== undefined &&
        nota.nota_practica !== "" &&
        Number(nota.nota_practica) >= 80;

      const teoricaOk =
        nota.nota_teorica !== null &&
        nota.nota_teorica !== undefined &&
        nota.nota_teorica !== "" &&
        Number(nota.nota_teorica) >= 80;

      return practicaOk || teoricaOk;
    }).length;

    const reprobados = notasAgrupadas.filter((nota) => {
      const tienePractica =
        nota.nota_practica !== null &&
        nota.nota_practica !== undefined &&
        nota.nota_practica !== "";

      const tieneTeorica =
        nota.nota_teorica !== null &&
        nota.nota_teorica !== undefined &&
        nota.nota_teorica !== "";

      if (!tienePractica || !tieneTeorica) {
        return false;
      }

      return Number(nota.nota_practica) < 80 || Number(nota.nota_teorica) < 80;
    }).length;

    const pendientes = notasAgrupadas.filter(
      (nota) =>
        nota.nota_practica === null ||
        nota.nota_practica === undefined ||
        nota.nota_practica === "" ||
        nota.nota_teorica === null ||
        nota.nota_teorica === undefined ||
        nota.nota_teorica === ""
    ).length;

    const notasNumericas = [];

    notasAgrupadas.forEach((nota) => {
      if (
        nota.nota_practica !== null &&
        nota.nota_practica !== undefined &&
        nota.nota_practica !== ""
      ) {
        notasNumericas.push(Number(nota.nota_practica));
      }

      if (
        nota.nota_teorica !== null &&
        nota.nota_teorica !== undefined &&
        nota.nota_teorica !== ""
      ) {
        notasNumericas.push(Number(nota.nota_teorica));
      }
    });

    const promedio =
      notasNumericas.length > 0
        ? (
            notasNumericas.reduce((total, nota) => total + nota, 0) /
            notasNumericas.length
          ).toFixed(1)
        : "0.0";

    return {
      total,
      aprobados,
      reprobados,
      pendientes,
      promedio,
    };
  }, [notasAgrupadas]);

  return (
    <div className="min-h-screen bg-[#f7f9fd] px-4 py-5 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1550px]">
        <div className="mb-8 flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
            <ClipboardCheck size={34} />
          </div>

          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950">
              Notas
            </h1>

            {rol === "admin" && (
              <p className="mt-2 text-base font-medium text-slate-500">
                Vista administrativa de las notas registradas en el sistema.
              </p>
            )}

            {rol === "instructor" && (
              <p className="mt-2 text-base font-medium text-slate-500">
                Panel para visualizar estudiantes asignados y registrar sus notas.
              </p>
            )}

            {rol === "estudiante" && (
              <p className="mt-2 text-base font-medium text-slate-500">
                Consulta tus notas y tu progreso académico.
              </p>
            )}
          </div>
        </div>

        {rol === "admin" && <ResumenAdmin resumen={resumen} />}
        {rol === "instructor" && <ResumenInstructor resumen={resumen} />}
        {rol === "estudiante" && <ResumenEstudiante resumen={resumen} />}
        {(rol === "admin" || rol === "instructor") && (
        <div className="mb-6 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              {(rol === "admin" || rol === "instructor") && (
                <div className="flex h-14 w-full items-center rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 lg:w-[560px]">
                  <Search className="shrink-0 text-slate-400" size={21} />

                  <input
                    type="text"
                    placeholder="Buscar por estudiante, cédula, instructor o plan..."
                    className="h-full w-full bg-transparent pl-3 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
              )}

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="h-14 min-w-[190px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              >
                <option value="Todas">Todas</option>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>

              {rol === "admin" && (
                <button
                  type="button"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 text-sm font-black text-blue-600 transition hover:bg-blue-50"
                >
                  <Filter size={19} />
                  Filtros
                </button>
              )}
            </div>

            {rol === "instructor" && (
              <button
                onClick={() => setModalAbierto(true)}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
              >
                <Plus size={21} />
                Agregar nota práctica
              </button>
            )}
          </div>
        </div>
        )}
        {rol === "admin" && <TablaAdmin notas={notasAgrupadas} />}
        {rol === "instructor" && <TablaInstructor notas={notasAgrupadas} />}
        {rol === "estudiante" && <TablaEstudiante notas={notasAgrupadas} />}

        <NotasForm
          open={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onNotaGuardada={obtenerNotas}
        />
      </div>
    </div>
  );  
}

{/* Vista para admin */}
function ResumenAdmin({ resumen }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <TarjetaResumen
        variante="blue"
        icono={<Users size={34} />}
        titulo="Total estudiantes"
        valor={resumen.total}
        descripcion="Estudiantes registrados"
      />

      <TarjetaResumen
        variante="green"
        icono={<UserCheck size={34} />}
        titulo="Aprobados"
        valor={resumen.aprobados}
        descripcion="Estudiantes aprobados"
      />

      <TarjetaResumen
        variante="red"
        icono={<UserX size={34} />}
        titulo="Reprobados"
        valor={resumen.reprobados}
        descripcion="Estudiantes reprobados"
      />

      <TarjetaResumen
        variante="orange"
        icono={<Clock3 size={34} />}
        titulo="Pendientes"
        valor={resumen.pendientes}
        descripcion="Sin resultados"
      />
    </div>
  );
}

function ResumenInstructor({ resumen }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <TarjetaResumen
        variante="blue"
        icono={<Users size={34} />}
        titulo="Estudiantes asignados"
        valor={resumen.total}
        descripcion="Estudiantes en total"
      />

      <TarjetaResumen
        variante="green"
        icono={<ClipboardCheck size={34} />}
        titulo="Notas registradas"
        valor={resumen.aprobados + resumen.reprobados}
        descripcion="Registros completados"
      />

      <TarjetaResumen
        variante="orange"
        icono={<Clock3 size={34} />}
        titulo="Pendientes de registro"
        valor={resumen.pendientes}
        descripcion="Notas por registrar"
      />
    </div>
  );
}

function ResumenEstudiante({ resumen }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <TarjetaResumen
        variante="purple"
        icono={<TrendingUp size={34} />}
        titulo="Promedio general"
        valor={resumen.promedio}
        descripcion="Promedio de todas tus notas"
      />

      <TarjetaResumen
        variante="green"
        icono={<CheckCircle2 size={34} />}
        titulo="Notas aprobadas"
        valor={resumen.aprobados}
        descripcion="Asignaturas aprobadas"
      />

      <TarjetaResumen
        variante="orange"
        icono={<Clock3 size={34} />}
        titulo="Notas pendientes"
        valor={resumen.pendientes}
        descripcion="Asignaturas sin completar"
      />
    </div>
  );
}

function TarjetaResumen({ variante, icono, titulo, valor, descripcion }) {
  const estilos = {
    blue: {
      card: "border-blue-100 bg-blue-50/70",
      icon: "text-blue-600",
      value: "text-blue-600",
      shape: "bg-blue-200/45",
    },
    green: {
      card: "border-emerald-100 bg-emerald-50/70",
      icon: "text-emerald-600",
      value: "text-emerald-600",
      shape: "bg-emerald-200/45",
    },
    red: {
      card: "border-red-100 bg-red-50/70",
      icon: "text-red-600",
      value: "text-red-600",
      shape: "bg-red-200/45",
    },
    orange: {
      card: "border-orange-100 bg-orange-50/70",
      icon: "text-orange-600",
      value: "text-orange-600",
      shape: "bg-orange-200/45",
    },
    purple: {
      card: "border-violet-100 bg-violet-50/70",
      icon: "text-violet-600",
      value: "text-violet-600",
      shape: "bg-violet-200/45",
    },
  };

  const estilo = estilos[variante] || estilos.blue;

  return (
    <div
      className={`relative min-h-[150px] overflow-hidden rounded-[26px] border p-5 shadow-sm ${estilo.card}`}
    >
      <div
        className={`absolute -bottom-10 -right-8 h-28 w-28 rounded-full ${estilo.shape}`}
      />
      <div
        className={`absolute bottom-4 right-14 h-10 w-10 rounded-full ${estilo.shape}`}
      />
      <div
        className={`absolute bottom-2 right-4 h-16 w-16 rounded-full ${estilo.shape}`}
      />

      <div className="relative z-10 flex h-full items-center gap-5">
        <div
          className={`flex h-[82px] w-[82px] shrink-0 items-center justify-center rounded-[24px] border border-white/80 bg-white shadow-sm ${estilo.icon}`}
        >
          {icono}
        </div>

        <div>
          <p className="text-base font-black text-slate-700">
            {titulo}
          </p>

          <p className={`mt-2 text-4xl font-black ${estilo.value}`}>
            {valor}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {descripcion}
          </p>
        </div>
      </div>
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
            <Th>Instructor</Th>
            <Th>Tipo Curso</Th>
            <Th>Modalidad</Th>
             <Th>Nota Practica</Th>
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
    <tr className="border-b border-slate-100 transition last:border-b-0 hover:bg-blue-50/30">
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

      <Td>
        <span className="line-clamp-3 block max-w-[220px] text-sm leading-relaxed text-slate-600">
          {comentario}
        </span>
      </Td>
    </tr>
  );
}

function NotaBadge({ nota, textoEspera = "En espera" }) {
  if (nota === null || nota === undefined || nota === "") {
    return <Badge color="gray">{textoEspera}</Badge>;
  }

  return (
    <Badge color={Number(nota) >= 80 ? "green" : "red"}>
      {nota}
    </Badge>
  );
}

function ResultadoBadge({ nota, textoEspera = "Pendiente" }) {
  if (nota === null || nota === undefined || nota === "") {
    return <Badge color="gray">{textoEspera}</Badge>;
  }

  return (
    <Badge color={Number(nota) >= 80 ? "green" : "red"}>
      {Number(nota) >= 80 ? "Aprobado" : "Reprobado"}
    </Badge>
  );
}

function ContenedorTabla({ children }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-6 py-5 text-left text-sm font-black text-slate-700">
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-6 py-6 align-middle text-sm font-medium text-slate-700">
      {children}
    </td>
  );
}

function TdBold({ children }) {
  return (
    <td className="px-6 py-6 align-middle text-sm font-black leading-relaxed text-slate-900">
      {children}
    </td>
  );
}

function Badge({ children, color }) {
  const colores = {
    purple: "bg-violet-100 text-violet-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-black whitespace-nowrap ${
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
