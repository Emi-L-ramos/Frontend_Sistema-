import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Search,
  Plus,
  BookOpen,
  GraduationCap,
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Swal from "sweetalert2";

function PlanStudio({ userRole }) {
  const navigate = useNavigate();

  const [progresos, setProgresos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todas");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [accionEnProceso, setAccionEnProceso] = useState(false);
  
  const pollingIntervalRef = useRef(null);
  const isMounted = useRef(true);

  const rol = userRole?.toLowerCase();

  // Función para obtener progresos
  const obtenerProgresos = useCallback(async (mostrarCargaInicial = false) => {
  if (!isMounted.current) return;
  
  try {
    if (mostrarCargaInicial) setError(null);
    
    const response = await axios.get("/progreso-tema/");
    const data = Array.isArray(response.data)
      ? response.data
      : response.data.results || [];

    // Ordenar correctamente por tema_orden (NO por orden_general)
    const sortedData = [...data].sort((a, b) => {
    const ordenA = Number(a.orden_general || a.tema_orden || 0);
    const ordenB = Number(b.orden_general || b.tema_orden || 0);

    return ordenA - ordenB;
  });

    setProgresos(sortedData);
  } catch (error) {
    console.error("Error cargando progreso:", error);
    if (mostrarCargaInicial) {
      setError("Error al cargar el progreso. Por favor, recarga la página.");
    }
  } finally {
    if (mostrarCargaInicial) setCargando(false);
  }
}, []);




  // Iniciar polling automático (invisible)
  useEffect(() => {
    isMounted.current = true;
    
    // Carga inicial
    obtenerProgresos(true);
    
    // Polling cada 3 segundos - SIN MOSTRAR NADA
    pollingIntervalRef.current = setInterval(() => {
      if (!accionEnProceso && isMounted.current) {
        obtenerProgresos(false); // false = sin indicadores visuales
      }
    }, 3000);
    
    return () => {
      isMounted.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [obtenerProgresos, accionEnProceso]);

  const marcarClase = async (progresoId, tipo, valor = true) => {
    if (accionEnProceso) {
      alert("Por favor espera a que termine la acción actual");
      return;
    }

    setAccionEnProceso(true);
    const progresosAntes = [...progresos];

    try {
      let endpoint = "";
      let payload = {};

      if (tipo === "estudiante") {
        endpoint = `/progreso-tema/${progresoId}/marcar-estudiante/`;
      } else if (tipo === "instructor") {
        endpoint = `/progreso-tema/${progresoId}/marcar-instructor/`;
      } else if (tipo === "admin_estudiante") {
        endpoint = `/progreso-tema/${progresoId}/admin-forzar/`;
        payload = { tipo: "estudiante", valor };
      } else if (tipo === "admin_instructor") {
        endpoint = `/progreso-tema/${progresoId}/admin-forzar/`;
        payload = { tipo: "instructor", valor };
      }

      if (!endpoint) return;

      // Optimistic update
      setProgresos((prev) =>
        prev.map((item) => {
          if (item.id !== progresoId) return item;
          
          if (tipo === "admin_estudiante" || tipo === "estudiante") {
            return { ...item, estudiante_completado: valor };
          }
          if (tipo === "admin_instructor" || tipo === "instructor") {
            return { ...item, instructor_completado: valor };
          }
          return item;
        })
      );

      await axios.post(endpoint, payload);
      
      // Recargar después de la acción (sin mostrar carga)
      setTimeout(() => {
        obtenerProgresos(false);
      }, 500);
      
    } catch (error) {
      setProgresos(progresosAntes);
      const errorMsg = error.response?.data?.error || error.message || "Error al marcar la clase";
      console.error("Error:", errorMsg);
      alert(errorMsg);
    } finally {
      setAccionEnProceso(false);
    }
  };

  const progresosFiltrados = useMemo(() => {
    return progresos.filter((item) => {
      const texto = `
        ${item.matricula?.estudiante?.nombre_completo || item.estudiante_nombre || ""}
        ${item.matricula?.estudiante?.cedula || item.estudiante_cedula || ""}
        ${item.matricula?.tipo_curso || item.tipo_curso || ""}
        ${item.subtema?.tema?.titulo || item.tema_titulo || ""}
        ${item.subtema?.titulo || item.subtema_titulo || ""}
      `.toLowerCase();

      const coincideBusqueda = texto.includes(busqueda.toLowerCase());

      const coincideTipo =
        filtroTipo === "Todas" ||
        (item.matricula?.tipo_curso || item.tipo_curso || "").toLowerCase() === filtroTipo.toLowerCase();

      return coincideBusqueda && coincideTipo;
    });
  }, [progresos, busqueda, filtroTipo]);

  if (error && !cargando) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Plan de Estudio
          </h1>

          {rol === "admin" && (
            <p className="text-slate-500 mt-2">
              Panel administrativo para revisar el progreso y gestionar planes.
            </p>
          )}

          {rol === "instructor" && (
            <p className="text-slate-500 mt-2">
              Marca las clases dadas de los estudiantes asignados.
            </p>
          )}

          {rol === "estudiante" && (
            <p className="text-slate-500 mt-2">
              Consulta tu avance y marca tus clases recibidas.
            </p>
          )}
        </div>

        {rol === "admin" && (
          <div className="flex gap-4">

             <button
              onClick={() => navigate("/dashboard/examen-teorico")}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-sm transition hover:cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
              Crear examen
            </button>
            <button
              onClick={() => navigate("/dashboard/plan-estudio/ver")}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-sm transition hover:cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
              Ver planes
            </button>

            {/* <button
              onClick={() => navigate("/dashboard/plan-estudio/nuevo")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl shadow-sm transition hover:cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Nuevo plan
            </button> */}
          </div>
        )}
      </div>

      {rol !== "estudiante" && (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 h-14 w-full md:max-w-xl">
            <Search className="text-slate-400" size={20} />

            <input
              type="text"
              placeholder="Buscar por estudiante, cédula, tema o subtema..."
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
          Cargando progreso del plan de estudio...
        </div>
      )}

      {!cargando && rol === "admin" && (
        <PanelAdmin 
          progresos={progresosFiltrados} 
          marcarClase={marcarClase}
          accionEnProceso={accionEnProceso}
        />
      )}

      {!cargando && rol === "instructor" && (
        <PanelInstructor 
          progresos={progresosFiltrados} 
          marcarClase={marcarClase}
          accionEnProceso={accionEnProceso}
        />
      )}

      {!cargando && rol === "estudiante" && (
        <PanelEstudiante 
          progresos={progresosFiltrados} 
          marcarClase={marcarClase}
          accionEnProceso={accionEnProceso}
        />
      )}
    </div>
  );
}

function estaCompletado(item) {
  return Boolean(item.estudiante_completado && item.instructor_completado);
}

function PanelAdmin({ progresos, marcarClase, accionEnProceso }) {
  const [busquedaAdmin, setBusquedaAdmin] = useState("");
  const [matriculaSeleccionada, setMatriculaSeleccionada] = useState(null);

  const estudiantes = useMemo(() => {
    const mapa = {};

    progresos.forEach((item) => {
      const cedula = item.matricula?.estudiante?.cedula || item.estudiante_cedula;
      const tipoCurso = item.matricula?.tipo_curso || item.tipo_curso;
      const key = `${cedula}-${tipoCurso}`;

      if (!mapa[key]) {
        mapa[key] = {
          key,
          matricula_id: item.matricula?.id,
          nombre: item.matricula?.estudiante?.nombre_completo || item.estudiante_nombre,
          cedula: cedula,
          tipo_curso: tipoCurso,
          progresos: [],
        };
      }

      mapa[key].progresos.push({
        ...item,
        completado: estaCompletado(item),
        desbloqueado: item.desbloqueado || false
      });
    });

    Object.values(mapa).forEach((est) => {
    est.progresos.sort((a, b) => {
      const ordenA = Number(a.orden_general || a.tema_orden || 0);
      const ordenB = Number(b.orden_general || b.tema_orden || 0);

      return ordenA - ordenB;
    });
  });

    return Object.values(mapa);
  }, [progresos]);

  const estudiantesFiltrados = estudiantes.filter((estudiante) => {
    const texto = `
      ${estudiante.nombre || ""}
      ${estudiante.cedula || ""}
      ${estudiante.tipo_curso || ""}
    `.toLowerCase();

    return texto.includes(busquedaAdmin.toLowerCase());
  });

  const estudianteActual =
    estudiantesFiltrados.find((e) => e.key === matriculaSeleccionada) ||
    estudiantesFiltrados[0];

  const calcularProgreso = (items) => {
    const total = items.length;
    const completados = items.filter((item) => item.completado).length;
    const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;

    return {
      total,
      completados,
      porcentaje,
    };
  };

  const obtenerColorProgreso = (porcentaje) => {
    if (porcentaje >= 80) return "bg-green-600 text-green-600";
    if (porcentaje >= 40) return "bg-yellow-500 text-yellow-600";
    return "bg-red-600 text-red-600";
  };

  if (progresos.length === 0) {
    return <MensajeVacioTarjeta />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-5 h-fit">
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />

          <input
            type="text"
            placeholder="Buscar estudiante..."
            value={busquedaAdmin}
            onChange={(e) => setBusquedaAdmin(e.target.value)}
            className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        <div className="space-y-4 max-h-[360px] md:max-h-[520px] overflow-y-auto pr-2">
          {estudiantesFiltrados.map((estudiante) => {
            const avance = calcularProgreso(estudiante.progresos);
            const color = obtenerColorProgreso(avance.porcentaje);

            return (
              <button
                key={estudiante.key}
                type="button"
                onClick={() => setMatriculaSeleccionada(estudiante.key)}
                className={`w-full text-left border rounded-2xl p-4 transition ${
                  estudianteActual?.key === estudiante.key
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {estudiante.nombre}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {avance.completados}/{avance.total} clases
                    </p>
                  </div>

                  <span className={`text-3xl font-bold ${color.split(" ")[1]}`}>
                    {avance.porcentaje}%
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-200 rounded-full mt-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color.split(" ")[0]}`}
                    style={{ width: `${avance.porcentaje}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        {!estudianteActual ? (
          <MensajeVacioTarjeta />
        ) : (
          <>
            {(() => {
              const avance = calcularProgreso(estudianteActual.progresos);

              return (
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">
                    {estudianteActual.nombre}
                  </h2>

                  <p className="text-slate-600 mt-2">
                    Progreso total:{" "}
                    <span className="font-bold text-green-600">
                      {avance.porcentaje}%
                    </span>{" "}
                    - {avance.completados} de {avance.total} clases completadas
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Curso: {estudianteActual.tipo_curso} · Cédula:{" "}
                    {estudianteActual.cedula}
                  </p>
                </div>
              );
            })()}

            <div className="space-y-4">
              {estudianteActual.progresos.map((item, index) => {
                const completado = item.completado;
                const soloEstudiante = item.estudiante_completado && !item.instructor_completado;
                const soloInstructor = !item.estudiante_completado && item.instructor_completado;

                return (
                  <div
                    key={item.id}
                    className={`grid grid-cols-1 lg:grid-cols-[1fr_210px_210px] gap-4 items-center rounded-2xl px-5 py-4 border transition ${
                      completado
                        ? "bg-green-50 border-green-200"
                        : item.desbloqueado
                        ? soloEstudiante || soloInstructor
                          ? "bg-amber-50 border-amber-200"
                          : "bg-blue-50 border-blue-200"
                        : "bg-slate-50 border-slate-200 opacity-80"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          completado
                            ? "bg-green-100 text-green-700"
                            : item.desbloqueado
                            ? soloEstudiante || soloInstructor
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {item.orden_general}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-800">
                          {item.subtema?.titulo || item.subtema_titulo}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {item.subtema?.tema?.titulo || item.tema_titulo}
                        </p>

                        <div className="mt-2">
                          {completado ? (
                            <Badge color="green">Completado</Badge>
                          ) : item.desbloqueado ? (
                            soloEstudiante ? (
                              <Badge color="amber">Esperando instructor</Badge>
                            ) : soloInstructor ? (
                              <Badge color="amber">Esperando estudiante</Badge>
                            ) : (
                              <Badge color="blue">Disponible</Badge>
                            )
                          ) : (
                            <Badge color="gray">Bloqueado</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="lg:border-l border-slate-200 lg:pl-5">
                      <p className="text-sm text-slate-500 mb-2">Instructor</p>

                      <button
                        type="button"
                        onClick={() =>
                          marcarClase(
                            item.id,
                            "admin_instructor",
                            !item.instructor_completado
                          )
                        }
                        disabled={accionEnProceso}
                        className={`flex items-center gap-2 font-semibold rounded-xl px-3 py-2 transition w-full justify-center ${
                          item.instructor_completado
                            ? "text-green-700 bg-green-100"
                            : item.desbloqueado
                            ? "text-blue-700 bg-blue-100 hover:bg-blue-200"
                            : "text-slate-500 bg-slate-200 cursor-not-allowed"
                        }`}
                      >
                        {item.instructor_completado ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : item.desbloqueado ? (
                          <span className="w-6 h-6 rounded-full border-2 border-blue-500" />
                        ) : (
                          <Lock className="w-5 h-5 text-slate-400" />
                        )}

                        {item.instructor_completado
                          ? "Clase dada"
                          : item.desbloqueado
                          ? "Forzar como dada"
                          : "Bloqueado"}
                      </button>
                    </div>

                    <div className="lg:border-l border-slate-200 lg:pl-5">
                      <p className="text-sm text-slate-500 mb-2">Estudiante</p>

                      <button
                        type="button"
                        onClick={() =>
                          marcarClase(
                            item.id,
                            "admin_estudiante",
                            !item.estudiante_completado
                          )
                        }
                        disabled={accionEnProceso}
                        className={`flex items-center gap-2 font-semibold rounded-xl px-3 py-2 transition w-full justify-center ${
                          item.estudiante_completado
                            ? "text-green-700 bg-green-100"
                            : item.desbloqueado
                            ? "text-blue-700 bg-blue-100 hover:bg-blue-200"
                            : "text-slate-500 bg-slate-200 cursor-not-allowed"
                        }`}
                      >
                        {item.estudiante_completado ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : item.desbloqueado ? (
                          <span className="w-6 h-6 rounded-full border-2 border-blue-500" />
                        ) : (
                          <Lock className="w-5 h-5 text-slate-400" />
                        )}

                        {item.estudiante_completado
                          ? "Clase recibida"
                          : item.desbloqueado
                          ? "Forzar como recibida"
                          : "Bloqueado"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PanelInstructor({ progresos, marcarClase, accionEnProceso }) {

  const [busquedaInstructor, setBusquedaInstructor] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [temasExpandidos, setTemasExpandidos] = useState({});
  const [habilitandoExamen, setHabilitandoExamen] = useState(false);

  const toggleTema = (id) => {
    setTemasExpandidos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const habilitarExamenTeorico = async (matriculaId) => {

    try {
      if (!matriculaId) {
        Swal.fire({
          icon: "warning",
          title: "Matrícula no encontrada",
          text: "No se pudo obtener la matrícula del estudiante seleccionado.",
          confirmButtonColor: "#059669",
        });
        return;
      }

      setHabilitandoExamen(true);

      const confirmar = await Swal.fire({
        title: "¿Habilitar examen teórico?",
        text: "El estudiante podrá realizar el examen teórico inmediatamente.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#059669",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Sí, habilitar",
        cancelButtonText: "Cancelar",
      });

      if (!confirmar.isConfirmed) {
        return;
      }

      const response = await axios.post(
        "/examen-teorico/habilitar/",
        {
          matricula_id: matriculaId,
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Examen habilitado",
        text:
          response.data?.message ||
          "El examen teórico fue habilitado correctamente.",
        confirmButtonColor: "#059669",
      });

    } catch (error) {

      console.error(
        "Error habilitando examen:",
        error
      );

      const mensaje =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "No se pudo habilitar el examen.";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: mensaje,
        confirmButtonColor: "#dc2626",
      });

    } finally {

      setHabilitandoExamen(false);

    }
  };

  const estudiantes = useMemo(() => {

    const mapa = {};

    progresos.forEach((item) => {

      const cedula =
        item.matricula?.estudiante?.cedula ||
        item.estudiante_cedula;

      const tipoCurso =
        item.matricula?.tipo_curso ||
        item.tipo_curso;

      const key = `${cedula}-${tipoCurso}`;

      if (!mapa[key]) {

        mapa[key] = {
          key,
          nombre:
            item.matricula?.estudiante?.nombre_completo ||
            item.estudiante_nombre,
          cedula,
          tipo_curso: tipoCurso,
          progresos: [],
        };
      }

      mapa[key].progresos.push({
        ...item,
        completado:
          item.estudiante_completado &&
          item.instructor_completado,
      });

    });

    Object.values(mapa).forEach((estudiante) => {
    estudiante.progresos.sort((a, b) => {
      const ordenA = Number(a.orden_general || a.tema_orden || 0);
      const ordenB = Number(b.orden_general || b.tema_orden || 0);

      return ordenA - ordenB;
    });
  });

    return Object.values(mapa);

  }, [progresos]);

  const estudiantesFiltrados = estudiantes.filter((estudiante) => {

    const texto = `
      ${estudiante.nombre || ""}
      ${estudiante.cedula || ""}
      ${estudiante.tipo_curso || ""}
    `.toLowerCase();

    return texto.includes(busquedaInstructor.toLowerCase());

  });

  const estudianteActual =
    estudiantesFiltrados.find(
      (e) => e.key === estudianteSeleccionado
    ) || estudiantesFiltrados[0];

  const calcularProgresoInstructor = (items) => {

    const total = items.length;

    const dadas = items.filter(
      (item) => item.instructor_completado
    ).length;

    return {
      total,
      dadas,
      porcentaje:
        total > 0
          ? Math.round((dadas / total) * 100)
          : 0,
    };

  };

  if (progresos.length === 0) {
    return <MensajeVacioTarjeta />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">

      <div className="bg-white border border-slate-200 rounded-3xl p-5 h-fit">

        <div className="relative mb-5">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />

          <input
            type="text"
            placeholder="Buscar estudiante..."
            value={busquedaInstructor}
            onChange={(e) =>
              setBusquedaInstructor(e.target.value)
            }
            className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        <div className="space-y-4 max-h-[360px] md:max-h-[520px] overflow-y-auto pr-2">

          {estudiantesFiltrados.map((estudiante) => {

            const avance =
              calcularProgresoInstructor(
                estudiante.progresos
              );

            return (
              <button
                key={estudiante.key}
                type="button"
                onClick={() =>
                  setEstudianteSeleccionado(
                    estudiante.key
                  )
                }
                className={`w-full text-left border rounded-2xl p-4 transition ${
                  estudianteActual?.key === estudiante.key
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      {estudiante.nombre}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {estudiante.cedula}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {estudiante.tipo_curso}
                    </p>

                  </div>

                  <span className="text-2xl font-bold text-blue-600">
                    {avance.porcentaje}%
                  </span>

                </div>

                <div className="w-full h-2 bg-slate-200 rounded-full mt-4 overflow-hidden">

                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${avance.porcentaje}%`,
                    }}
                  />

                </div>

                <p className="text-xs text-slate-500 mt-2">
                  {avance.dadas}/{avance.total} temas dados
                </p>

              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6">

        {!estudianteActual ? (
          <MensajeVacioTarjeta />
        ) : (
          <>

            {(() => {

              const avance =
                calcularProgresoInstructor(
                  estudianteActual.progresos
                );

              return (
                <div className="mb-8">

                  <h2 className="text-3xl font-bold text-slate-900">
                    {estudianteActual.nombre}
                  </h2>

                  <p className="text-slate-600 mt-2">
                    Temas dados:{" "}
                    <span className="font-bold text-blue-600">
                      {avance.porcentaje}%
                    </span>{" "}
                    - {avance.dadas} de {avance.total}
                  </p>

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-3">

                    <p className="text-sm text-slate-500">
                      Curso: {estudianteActual.tipo_curso} · Cédula:{" "}
                      {estudianteActual.cedula}
                    </p>

                    <button
                      onClick={() => {

                        console.log(
                          "PROGRESO USADO:",
                          estudianteActual.progresos?.[0]
                        );

                        console.log(
                          "MATRICULA ID:",
                          estudianteActual.progresos?.[0]?.matricula?.id ||
                          estudianteActual.progresos?.[0]?.matricula_id
                        );

                        console.log(
                          "ESTADO MATRICULA:",
                          estudianteActual.progresos?.[0]?.matricula?.estado ||
                          estudianteActual.progresos?.[0]?.matricula_estado
                        );

                        habilitarExamenTeorico(
                          estudianteActual.progresos?.[0]?.matricula?.id ||
                          estudianteActual.progresos?.[0]?.matricula_id
                        );

                      }}
                      disabled={habilitandoExamen}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-3 rounded-2xl transition font-medium"
                    >

                      <BookOpen className="w-5 h-5" />

                      {
                        habilitandoExamen
                          ? "Habilitando..."
                          : "Habilitar examen teórico"
                      }

                    </button>

                  </div>

                </div>
              );
            })()}

            <div className="space-y-4">

              {estudianteActual.progresos.map((item, index) => {

                const expandido =
                  temasExpandidos[item.id];

                const esperandoEstudiante =
                  item.instructor_completado &&
                  !item.estudiante_completado;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border transition overflow-hidden ${
                      item.instructor_completado
                        ? esperandoEstudiante
                          ? "bg-amber-50 border-amber-200"
                          : "bg-green-50 border-green-200"
                        : item.desbloqueado
                        ? "bg-white border-slate-200 hover:border-blue-300"
                        : "bg-slate-100 border-slate-200 opacity-70"
                    }`}
                  >

                    <div className="flex items-center justify-between px-5 py-4">

                      <div className="flex items-center gap-4 flex-1">

                        <button
                          type="button"
                          onClick={() =>
                            toggleTema(item.id)
                          }
                          className="text-slate-500 hover:text-slate-700"
                        >

                          {expandido ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}

                        </button>

                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            item.instructor_completado
                              ? esperandoEstudiante
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                              : item.desbloqueado
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {item.orden_general}
                        </div>

                        <div>

                          <h3 className="font-bold text-slate-800">
                            {item.tema_titulo}
                          </h3>

                          <p className="text-sm text-slate-500 mt-1">
                            {item.subtemas?.length || 0} subtemas
                          </p>

                          <div className="mt-2">

                            {item.instructor_completado ? (

                              esperandoEstudiante ? (
                                <Badge color="amber">
                                  Esperando estudiante
                                </Badge>
                              ) : (
                                <Badge color="green">
                                  Tema dado
                                </Badge>
                              )

                            ) : item.desbloqueado ? (

                              <Badge color="blue">
                                Disponible
                              </Badge>

                            ) : (

                              <Badge color="gray">
                                Bloqueado
                              </Badge>

                            )}

                          </div>

                        </div>

                      </div>

                      <button
                        disabled={
                          !item.desbloqueado ||
                          item.instructor_completado ||
                          accionEnProceso
                        }
                        onClick={() =>
                          marcarClase(
                            item.id,
                            "instructor",
                            true
                          )
                        }
                        className="disabled:cursor-not-allowed"
                      >

                        {item.instructor_completado ? (

                          <CheckCircle2 className="w-7 h-7 text-green-600" />

                        ) : item.desbloqueado ? (

                          <div className="w-7 h-7 rounded-full border-2 border-blue-500 hover:bg-blue-50" />

                        ) : (

                          <Lock className="w-6 h-6 text-slate-400" />

                        )}

                      </button>

                    </div>

                    {expandido && (

                      <div className="border-t border-slate-200 bg-white px-6 py-4">

                        {item.subtemas &&
                        item.subtemas.length > 0 ? (

                          <div className="space-y-2">

                            {item.subtemas.map(
                              (subtema) => (
                                <div
                                  key={subtema.id}
                                  className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                                >

                                  <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold">
                                    {subtema.orden}
                                  </span>

                                  <span className="text-sm text-slate-700">
                                    {subtema.titulo}
                                  </span>

                                </div>
                              )
                            )}

                          </div>

                        ) : (

                          <p className="text-sm text-slate-500">
                            Este tema no tiene subtemas registrados.
                          </p>

                        )}

                      </div>

                    )}

                  </div>
                );
              })}

            </div>

          </>
        )}

      </div>

    </div>
  );
}

function PanelEstudiante({ progresos, marcarClase, accionEnProceso }) {
  const [matriculasExpandidas, setMatriculasExpandidas] = useState({});
  const [temasExpandidos, setTemasExpandidos] = useState({});
  const [busquedaLocal, setBusquedaLocal] = useState("");
  const navigate = useNavigate();
  const [examenDisponible, setExamenDisponible] = useState(false);
  const [examenRealizado, setExamenRealizado] = useState(false);

  const toggleMatricula = (matriculaId) => {
    setMatriculasExpandidas((prev) => ({
      ...prev,
      [matriculaId]: !prev[matriculaId],
    }));
  };

  const toggleTema = (temaId) => {
    setTemasExpandidos((prev) => ({
      ...prev,
      [temaId]: !prev[temaId],
    }));
  };

  const verificarExamen = async () => {

  try {

    const response = await axios.get(
      "/examen-teorico/mi-examen/"
    );

    if (response.data?.disponible) {

      setExamenDisponible(true);

    }

    if (response.data?.realizado) {

      setExamenRealizado(true);

    }

  } catch (error) {

    console.error(
      "Error verificando examen:",
      error
    );

  }
};

useEffect(() => {

  verificarExamen();

}, []);

    const matriculasAgrupadas = useMemo(() => {
    const mapa = new Map();

    progresos.forEach((item) => {
      const matriculaId = item.matricula_id || item.matricula?.id;
      const matriculaFecha = item.matricula_fecha || item.matricula?.fecha_registro;
      const planNombre = item.plan_estudio_nombre || "Plan de Estudio";
      const planId = item.plan_estudio_id;
      const tipoCurso = item.tipo_curso || item.matricula?.tipo_curso || "Curso";
      const estadoMatricula = item.matricula_estado || item.matricula?.estado || "activo";

      if (!matriculaId) return;

      const key = String(matriculaId);

      if (!mapa.has(key)) {
        mapa.set(key, {
          id: matriculaId,
          fecha: matriculaFecha,
          planNombre,
          planId,
          tipoCurso,
          estado: estadoMatricula,
          progresos: [],
        });
      }

      mapa.get(key).progresos.push({
        ...item,
        completado: item.estudiante_completado && item.instructor_completado,
      });
    });

    const resultado = Array.from(mapa.values()).map((matricula) => {
      matricula.progresos.sort((a, b) => {
        const ordenA = Number(a.orden_general || a.tema_orden || 0);
        const ordenB = Number(b.orden_general || b.tema_orden || 0);

        return ordenA - ordenB;
      });

      return matricula;
    });

    resultado.sort((a, b) => {
      const fechaA = a.fecha ? new Date(a.fecha) : new Date(0);
      const fechaB = b.fecha ? new Date(b.fecha) : new Date(0);
      return fechaB - fechaA;
    });

    return resultado;
  }, [progresos]);


  const matriculasFiltradas = useMemo(() => {
    if (!busquedaLocal.trim()) return matriculasAgrupadas;

    const textoBusqueda = busquedaLocal.toLowerCase();

    return matriculasAgrupadas.filter((matricula) => {
      if (matricula.planNombre.toLowerCase().includes(textoBusqueda)) return true;
      if (matricula.tipoCurso.toLowerCase().includes(textoBusqueda)) return true;

      return matricula.progresos.some((item) => {
        const tema = item.tema_titulo || "";
        const subtemas = item.subtemas || [];

        return (
          tema.toLowerCase().includes(textoBusqueda) ||
          subtemas.some((subtema) =>
            subtema.titulo.toLowerCase().includes(textoBusqueda)
          )
        );
      });
    });
  }, [matriculasAgrupadas, busquedaLocal]);

  const expandirTodos = () => {
    const expandidos = {};

    matriculasFiltradas.forEach((matricula) => {
      expandidos[matricula.id] = true;
    });

    setMatriculasExpandidas(expandidos);
  };

  const cerrarTodos = () => {
    setMatriculasExpandidas({});
    setTemasExpandidos({});
  };

  const calcularProgresoMatricula = (items) => {
    const total = items.length;
    const completados = items.filter((item) => item.completado).length;

    return {
      total,
      completados,
      porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0,
    };
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return null;

    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case "activo":
      case "matriculado":
        return "bg-green-100 text-green-700";
      case "completado":
      case "finalizado":
        return "bg-blue-100 text-blue-700";
      case "suspendido":
        return "bg-red-100 text-red-700";
      case "abandonado":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (progresos.length === 0) {
    return <MensajeVacioTarjeta />;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
            <GraduationCap className="text-purple-700" size={28} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Mis Planes de Estudio
            </h2>

            <p className="text-slate-500 mt-1">
              {matriculasAgrupadas.length} matrícula(s) - Haz clic para ver los temas
            </p>
          </div>
        </div>

        {matriculasFiltradas.length > 1 && (
          <div className="flex gap-2">
            <button
              onClick={expandirTodos}
              className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              Expandir todos
            </button>

            <button
              onClick={cerrarTodos}
              className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              Cerrar todos
            </button>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-12">
          <Search className="text-slate-400" size={18} />

          <input
            type="text"
            placeholder="Buscar por plan, tema o subtema..."
            className="w-full h-full outline-none ml-3 bg-transparent text-slate-700"
            value={busquedaLocal}
            onChange={(e) => setBusquedaLocal(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {matriculasFiltradas.map((matricula) => {
          const avance = calcularProgresoMatricula(matricula.progresos);
          const esperandoInstructor = matricula.progresos.some(
            (item) => item.estudiante_completado && !item.instructor_completado
          );

          const estaExpandido = matriculasExpandidas[matricula.id];
          const fechaFormateada = formatearFecha(matricula.fecha);

          return (
            <div
              key={matricula.id}
              className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <button
                onClick={() => toggleMatricula(matricula.id)}
                className="w-full text-left bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 transition-all p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div
                        className={`transform transition-transform duration-200 ${
                          estaExpandido ? "rotate-90" : ""
                        }`}
                      >
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>

                      <h3 className="text-xl font-bold text-slate-800">
                        {matricula.planNombre}
                      </h3>

                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {matricula.tipoCurso}
                      </span>

                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getEstadoColor(
                          matricula.estado
                        )}`}
                      >
                        {matricula.estado === "matriculado"
                          ? "Activo"
                          : matricula.estado || "Activo"}
                      </span>

                      {esperandoInstructor && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                          Esperando instructor
                        </span>
                      )}

                      {avance.porcentaje === 100 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Completado
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 ml-6">
                      {fechaFormateada && (
                        <p className="text-xs text-slate-500">
                          {fechaFormateada}
                        </p>
                      )}

                      <div className="flex-1 min-w-[150px]">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Progreso</span>
                          <span className="font-medium text-purple-600">
                            {avance.porcentaje}%
                          </span>
                        </div>

                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-600 transition-all duration-500"
                            style={{ width: `${avance.porcentaje}%` }}
                          />
                        </div>
                      </div>

                      <span className="text-xs text-slate-400">
                        {avance.completados}/{avance.total} temas
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {estaExpandido && (
                <div className="border-t border-slate-200 bg-white p-5">
                  <div className="space-y-3">
                    {matricula.progresos.map((item, index) => {
                      const completado = item.completado;
                      const esperandoInstructorItem =
                        item.estudiante_completado && !item.instructor_completado;

                      const soloInstructor =
                        !item.estudiante_completado && item.instructor_completado;

                      const temaExpandido = temasExpandidos[item.id];

                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl transition-all border overflow-hidden ${
                            completado
                              ? "bg-green-50 border-green-200"
                              : esperandoInstructorItem
                              ? "bg-amber-50 border-amber-200"
                              : soloInstructor
                              ? "bg-orange-50 border-orange-200"
                              : item.desbloqueado
                              ? "bg-white border-slate-200 hover:border-purple-300"
                              : "bg-slate-50 border-slate-200 opacity-60"
                          }`}
                        >
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                type="button"
                                onClick={() => toggleTema(item.id)}
                                className="text-slate-500 hover:text-slate-700"
                              >
                                {temaExpandido ? (
                                  <ChevronDown className="w-5 h-5" />
                                ) : (
                                  <ChevronRight className="w-5 h-5" />
                                )}
                              </button>

                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                  completado
                                    ? "bg-green-500 text-white"
                                    : esperandoInstructorItem
                                    ? "bg-amber-500 text-white"
                                    : soloInstructor
                                    ? "bg-orange-500 text-white"
                                    : item.desbloqueado
                                    ? "bg-purple-500 text-white"
                                    : "bg-slate-300 text-slate-500"
                                }`}
                              >
                                {item.orden_general}
                              </div>

                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-800 text-sm">
                                  {item.tema_titulo}
                                </h4>

                                <p className="text-xs text-slate-500">
                                  {item.subtemas?.length || 0} subtemas
                                </p>

                                {esperandoInstructorItem && (
                                  <p className="text-xs text-amber-600 mt-1">
                                    Esperando confirmación del instructor
                                  </p>
                                )}

                                {soloInstructor && (
                                  <p className="text-xs text-orange-600 mt-1">
                                    Instructor ya marcó, falta tu confirmación
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              disabled={
                                !item.desbloqueado ||
                                item.estudiante_completado ||
                                accionEnProceso
                              }
                              onClick={() =>
                                marcarClase(item.id, "estudiante", true)
                              }
                              className="disabled:cursor-not-allowed"
                            >
                              {item.estudiante_completado ? (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Recibido</span>
                                </div>
                              ) : item.desbloqueado ? (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition cursor-pointer text-sm">
                                  <div className="w-4 h-4 rounded-full border-2 border-purple-500" />
                                  <span>Marcar</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-sm">
                                  <Lock className="w-4 h-4" />
                                  <span>Bloqueado</span>
                                </div>
                              )}
                            </button>
                          </div>

                          {temaExpandido && (
                            <div className="border-t border-slate-200 bg-white px-5 py-4">
                              {item.subtemas && item.subtemas.length > 0 ? (
                                <div className="space-y-2">
                                  {item.subtemas.map((subtema) => (
                                    <div
                                      key={subtema.id}
                                      className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                                    >
                                      <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold">
                                        {subtema.orden}
                                      </span>

                                      <span className="text-sm text-slate-700">
                                        {subtema.titulo}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-500">
                                  Este tema no tiene subtemas registrados.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {avance.porcentaje === 100 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                      <p className="text-green-700 text-sm font-medium">
                        Has completado este plan.
                      </p>
                      {examenDisponible && !examenRealizado && (

                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-6">

                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                            <div>

                              <h2 className="text-xl font-bold text-slate-800">
                                Examen teórico habilitado
                              </h2>

                              <p className="text-slate-600 mt-2">
                                Tu instructor ya habilitó el examen teórico.
                              </p>

                            </div>

                            <button
                              onClick={() =>
                                navigate("/dashboard/mi-examen-teorico")
                              }
                              className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-7 py-4 rounded-2xl font-semibold transition"
                            >

                              <BookOpen className="w-5 h-5" />

                              Realizar examen teórico

                            </button>

                          </div>

                        </div>

                      )}

                      {examenRealizado && (

                        <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-6">

                          <div className="flex items-center gap-4">

                            <div className="bg-green-100 p-3 rounded-2xl">

                              <CheckCircle2 className="w-7 h-7 text-green-700" />

                            </div>

                            <div>

                              <h2 className="text-xl font-bold text-green-800">
                                Examen teórico realizado
                              </h2>

                              <p className="text-green-700 mt-1">
                                Ya completaste el examen teórico.
                              </p>

                            </div>

                          </div>

                        </div>

                      )}
                    </div>

                    
                  )}
                </div>
                



              )}
            </div>
          );
        })}

        {matriculasFiltradas.length === 0 && busquedaLocal && (
          <div className="text-center py-8 text-slate-500">
            No se encontraron matrículas que coincidan con tu búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ children, color }) {
  const colores = {
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    gray: "bg-slate-200 text-slate-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${colores[color]}`}
    >
      {children}
    </span>
  );
}

function MensajeVacioTarjeta() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
      No se encontraron registros de progreso del plan de estudio.
    </div>
  );
}

export default PlanStudio;
