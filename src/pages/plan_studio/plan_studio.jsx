  import { useEffect, useMemo, useState, useCallback, useRef } from "react";
  import {
    Search,
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
    const [filtroTipo, setFiltroTipo] = useState("Todas");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [accionEnProceso, setAccionEnProceso] = useState(false);
    
    const pollingIntervalRef = useRef(null);
    const isMounted = useRef(true);

    const rol = userRole?.toLowerCase();
    const obtenerMatriculaId = (item) => {
      if (!item) return null;

      if (item.matricula_id) {
        return item.matricula_id;
      }

      if (typeof item.matricula === "number" || typeof item.matricula === "string") {
        return item.matricula;
      }

      if (item.matricula?.id) {
        return item.matricula.id;
      }

      return null;
    };

    const actualizarDesbloqueos = useCallback(async (datosBase = null) => {
      try {
        let data = datosBase;

        if (!data) {
          const response = await axios.get("/progreso-tema/");

          data = Array.isArray(response.data)
            ? response.data
            : response.data.results || [];
        }

        const matriculasIds = [
          ...new Set(
            data
              .map((item) => obtenerMatriculaId(item))
              .filter(Boolean)
          ),
        ];

        for (const matriculaId of matriculasIds) {
          await axios.post("/progreso-tema/actualizar-desbloqueos/", {
            matricula_id: matriculaId,
          });
        }
      } catch (error) {
        console.error("Error actualizando desbloqueos:", error);
      }
    }, []);

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

  useEffect(() => {
    isMounted.current = true;

    const cargarInicial = async () => {
      await obtenerProgresos(true);

      actualizarDesbloqueos().then(() => {
        obtenerProgresos(false);
      });
    };

    cargarInicial();

    return () => {
      isMounted.current = false;
    };
  }, [actualizarDesbloqueos, obtenerProgresos]);

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
              const nuevoEstudiante = valor;
              const nuevoInstructor = item.instructor_completado;

              return {
                ...item,
                estudiante_completado: nuevoEstudiante,
                completado: nuevoEstudiante && nuevoInstructor,
              };
            }

            if (tipo === "admin_instructor" || tipo === "instructor") {
              const nuevoEstudiante = item.estudiante_completado;
              const nuevoInstructor = valor;

              return {
                ...item,
                instructor_completado: nuevoInstructor,
                completado: nuevoEstudiante && nuevoInstructor,
              };
            }

            return item;
          })
        );

        await axios.post(endpoint, payload);
        await new Promise((resolve) => setTimeout(resolve, 300));
        await actualizarDesbloqueos();
        await obtenerProgresos(false);
        
      } catch (error) {
        setProgresos(progresosAntes);
        const errorMsg = error.response?.data?.error || error.message || "Error al marcar la clase";
        console.error("Error:", errorMsg);
        alert(errorMsg);
      } finally {
        setAccionEnProceso(false);
      }
    };

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
      <div className="min-h-screen bg-[#f7f9fd] px-4 py-5 md:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-5 rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f0edff] text-[#4f46e5]">
                  <BookOpen className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                    {rol === "estudiante" ? "Mi Plan de Estudio" : "Plan de Estudio"}
                  </h1>

                  {rol === "admin" && (
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Revisa el progreso de los estudiantes y administra los planes de estudio.
                    </p>
                  )}

                  {rol === "instructor" && (
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Marca las clases dadas y consulta el avance de tus estudiantes asignados.
                    </p>
                  )}

                  {rol === "estudiante" && (
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Consulta tu avance y marca las clases recibidas.
                    </p>
                  )}
                </div>
              </div>

              {rol === "admin" && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/examen-teorico")}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#4338ca] px-6 text-sm font-black text-white shadow-sm transition hover:bg-[#3730a3]"
                  >
                    <BookOpen className="h-5 w-5" />
                    Crear examen
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/plan-estudio/ver")}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <BookOpen className="h-5 w-5" />
                    Ver planes
                  </button>
                </div>
              )}
            </div>
          </div>

          {cargando && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
              Cargando progreso del plan de estudio...
            </div>
          )}

          {!cargando && rol === "admin" && (
            <PanelAdmin
              progresos={progresos}
              marcarClase={marcarClase}
              accionEnProceso={accionEnProceso}
              filtroTipo={filtroTipo}
              setFiltroTipo={setFiltroTipo}
            />
          )}

          {!cargando && rol === "instructor" && (
            <PanelInstructor
              progresos={progresos}
              marcarClase={marcarClase}
              accionEnProceso={accionEnProceso}
            />
          )}

          {!cargando && rol === "estudiante" && (
            <PanelEstudiante
              progresos={progresos}
              marcarClase={marcarClase}
              accionEnProceso={accionEnProceso}
            />
          )}
        </div>
      </div>
    );
  } 

  function estaCompletado(item) {
    return Boolean(item.estudiante_completado && item.instructor_completado);
  }

  function obtenerSubtemasDelItem(item) {
    const posiblesSubtemas = [
      item.subtemas,
      item.subtemas_data,
      item.tema?.subtemas,
      item.subtema?.tema?.subtemas,
      item.tema_subtemas,
    ];

    const listaEncontrada = posiblesSubtemas.find((lista) =>
      Array.isArray(lista)
    );

    if (listaEncontrada) {
      return listaEncontrada;
    }

    if (item.subtema || item.subtema_titulo) {
      return [
        {
          id: item.subtema?.id || item.subtema_id || item.id,
          orden:
            item.subtema?.orden ||
            item.subtema_orden ||
            item.orden_general ||
            item.tema_orden ||
            1,
          titulo:
            item.subtema?.titulo ||
            item.subtema_titulo ||
            "Subtema sin título",
        },
      ];
    }

    return [];
  }

  function obtenerIniciales(nombre = "") {
    const partes = String(nombre).trim().split(" ").filter(Boolean);

    if (partes.length === 0) return "NA";

    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }

    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }

  function obtenerColorAvatar(index) {
    const colores = [
      "bg-violet-100 text-violet-700",
      "bg-emerald-100 text-emerald-700",
      "bg-blue-100 text-blue-700",
      "bg-amber-100 text-amber-700",
      "bg-pink-100 text-pink-700",
      "bg-slate-100 text-slate-700",
    ];

    return colores[index % colores.length];
  }

  function obtenerColorProgresoTexto(porcentaje) {
    if (porcentaje >= 80) return "text-green-600";
    if (porcentaje >= 40) return "text-amber-500";
    return "text-slate-500";
  }

  function obtenerColorProgresoBarra(porcentaje) {
    if (porcentaje >= 80) return "bg-green-600";
    if (porcentaje >= 40) return "bg-amber-500";
    return "bg-slate-300";
  }

  function AvatarIniciales({ nombre, index = 0, className = "" }) {
    return (
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${obtenerColorAvatar(index)} ${className}`}
      >
        {obtenerIniciales(nombre)}
      </div>
    );
  }

  function BarraProgreso({ porcentaje }) {
    return (
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${obtenerColorProgresoBarra(porcentaje)} transition-all duration-500`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    );
  }

  function PanelAdmin({
  progresos,
    marcarClase,
    accionEnProceso,
    filtroTipo,
    setFiltroTipo,
  }) {
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

      const coincideBusqueda = texto.includes(busquedaAdmin.toLowerCase());

      const coincideTipo =
        filtroTipo === "Todas" ||
        String(estudiante.tipo_curso || "").toLowerCase() === filtroTipo.toLowerCase();

      return coincideBusqueda && coincideTipo;
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

    const obtenerEstadoAdmin = (item) => {
      const completado = item.estudiante_completado && item.instructor_completado;
      const soloEstudiante = item.estudiante_completado && !item.instructor_completado;
      const soloInstructor = !item.estudiante_completado && item.instructor_completado;

      if (completado) {
        return {
          texto: "Completado",
          clase: "bg-green-100 text-green-700",
        };
      }

      if (!item.desbloqueado) {
        return {
          texto: "Bloqueado",
          clase: "bg-slate-100 text-slate-500",
        };
      }

      if (soloEstudiante) {
        return {
          texto: "Esperando instructor",
          clase: "bg-amber-100 text-amber-700",
        };
      }

      if (soloInstructor) {
        return {
          texto: "Esperando estudiante",
          clase: "bg-amber-100 text-amber-700",
        };
      }

      return {
        texto: "Disponible",
        clase: "bg-blue-100 text-blue-700",
      };
    };

    if (progresos.length === 0) {
      return <MensajeVacioTarjeta />;
    }

    return (
      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <div className="h-fit rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-900">
              Estudiantes
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Busca y selecciona un estudiante para revisar su avance.
            </p>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_145px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={busquedaAdmin}
                onChange={(e) => setBusquedaAdmin(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#ede9fe]"
              />
            </div>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-[#4f46e5] focus:ring-4 focus:ring-[#ede9fe]"
            >
              <option value="Todas">Todas</option>
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>

          <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {estudiantesFiltrados.map((estudiante, index) => {
              const avance = calcularProgreso(estudiante.progresos);
              const seleccionado = estudianteActual?.key === estudiante.key;

              return (
                <button
                  key={estudiante.key}
                  type="button"
                  onClick={() => setMatriculaSeleccionada(estudiante.key)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    seleccionado
                      ? "border-[#4f46e5] bg-[#f4f2ff] shadow-sm"
                      : "border-slate-200 bg-white hover:border-[#a5b4fc] hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AvatarIniciales nombre={estudiante.nombre} index={index} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-900">
                            {estudiante.nombre}
                          </h3>

                          <p className="mt-1 truncate text-xs font-medium text-slate-500">
                            {estudiante.cedula || "Sin cédula"} · {estudiante.tipo_curso || "Sin curso"}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {avance.completados}/{avance.total} clases
                          </p>
                        </div>

                        <span className={`shrink-0 text-2xl font-black ${obtenerColorProgresoTexto(avance.porcentaje)}`}>
                          {avance.porcentaje}%
                        </span>
                      </div>

                      <div className="mt-3">
                        <BarraProgreso porcentaje={avance.porcentaje} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {estudiantesFiltrados.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                No se encontraron estudiantes.
              </div>
            )}
          </div>

          <p className="mt-4 text-center text-sm font-medium text-slate-500">
            Mostrando {estudiantesFiltrados.length} de {estudiantes.length} estudiantes
          </p>
        </div>

        <div className="space-y-4">
          {!estudianteActual ? (
            <MensajeVacioTarjeta />
          ) : (
            <>
              {(() => {
                const avance = calcularProgreso(estudianteActual.progresos);

                return (
                  <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        <AvatarIniciales
                          nombre={estudianteActual.nombre}
                          index={0}
                          className="h-16 w-16 rounded-full text-xl"
                        />

                        <div>
                          <h2 className="text-2xl font-black leading-tight text-slate-900">
                            {estudianteActual.nombre}
                          </h2>

                          <p className="mt-1 text-sm font-medium text-slate-500">
                            Curso:{" "}
                            <span className="font-bold text-[#4f46e5]">
                              {estudianteActual.tipo_curso || "Sin curso"}
                            </span>
                            {" "}· Cédula: {estudianteActual.cedula || "Sin cédula"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[7px] border-green-600 bg-white">
                          <span className="text-lg font-black text-green-600">
                            {avance.porcentaje}%
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-500">
                            Progreso total
                          </p>

                          <p className="text-3xl font-black text-green-600">
                            {avance.porcentaje}%
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-500">
                            {avance.completados} de {avance.total} clases completadas
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                        <th className="w-[60px] px-5 py-4">#</th>
                        <th className="px-5 py-4">Tema / Subtema</th>
                        <th className="w-[160px] px-5 py-4">Estado</th>
                        <th className="w-[190px] px-5 py-4">Instructor</th>
                        <th className="w-[190px] px-5 py-4">Estudiante</th>
                        <th className="w-[70px] px-5 py-4"></th>
                      </tr>
                    </thead>

                    <tbody>
                      {estudianteActual.progresos.map((item, index) => {
                        const estado = obtenerEstadoAdmin(item);

                        return (
                          <tr
                            key={item.id}
                            className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                          >
                            <td className="px-5 py-5 align-middle">
                              <span className="text-sm font-black text-slate-700">
                                {index + 1}
                              </span>
                            </td>

                            <td className="px-5 py-5 align-middle">
                              <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0edff] text-[#4f46e5]">
                                  <GraduationCap className="h-6 w-6" />
                                </div>

                                <div>
                                  <h3 className="text-sm font-black text-slate-900">
                                    {item.subtema?.titulo ||
                                      item.subtema_titulo ||
                                      item.tema_titulo ||
                                      "Tema sin título"}
                                  </h3>

                                  <p className="mt-1 text-xs font-medium text-slate-500">
                                    {item.subtema?.tema?.titulo ||
                                      item.tema_titulo ||
                                      "Plan de estudio"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-5 align-middle">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${estado.clase}`}
                              >
                                {estado.texto}
                              </span>
                            </td>

                            <td className="px-5 py-5 align-middle">
                              <button
                                type="button"
                                onClick={() =>
                                  marcarClase(
                                    item.id,
                                    "admin_instructor",
                                    !item.instructor_completado
                                  )
                                }
                                disabled={accionEnProceso || !item.desbloqueado}
                                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition ${
                                  item.instructor_completado
                                    ? "bg-green-50 text-green-700"
                                    : item.desbloqueado
                                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                                }`}
                              >
                                {item.instructor_completado ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : item.desbloqueado ? (
                                  <span className="h-4 w-4 rounded-full border-2 border-blue-500" />
                                ) : (
                                  <Lock className="h-4 w-4" />
                                )}

                                {item.instructor_completado
                                  ? "Clase dada"
                                  : item.desbloqueado
                                  ? "Pendiente"
                                  : "Bloqueado"}
                              </button>
                            </td>

                            <td className="px-5 py-5 align-middle">
                              <button
                                type="button"
                                onClick={() =>
                                  marcarClase(
                                    item.id,
                                    "admin_estudiante",
                                    !item.estudiante_completado
                                  )
                                }
                                disabled={accionEnProceso || !item.desbloqueado}
                                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition ${
                                  item.estudiante_completado
                                    ? "bg-green-50 text-green-700"
                                    : item.desbloqueado
                                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                                }`}
                              >
                                {item.estudiante_completado ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : item.desbloqueado ? (
                                  <span className="h-4 w-4 rounded-full border-2 border-blue-500" />
                                ) : (
                                  <Lock className="h-4 w-4" />
                                )}

                                {item.estudiante_completado
                                  ? "Clase recibida"
                                  : item.desbloqueado
                                  ? "Pendiente"
                                  : "Bloqueado"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  {/* Vsta para instructor */}

  function PanelInstructor({ progresos, marcarClase, accionEnProceso }) {
    const [busquedaInstructor, setBusquedaInstructor] = useState("");
    const [filtroInstructorTipo, setFiltroInstructorTipo] = useState("Todas");
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

        const response = await axios.post("/examen-teorico/habilitar/", {
          matricula_id: matriculaId,
        });

        await Swal.fire({
          icon: "success",
          title: "Examen habilitado",
          text:
            response.data?.message ||
            "El examen teórico fue habilitado correctamente.",
          confirmButtonColor: "#059669",
        });
      } catch (error) {
        console.error("Error habilitando examen:", error);

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
            matricula_id: item.matricula?.id || item.matricula_id,
            nombre:
              item.matricula?.estudiante?.nombre_completo ||
              item.estudiante_nombre ||
              "Estudiante sin nombre",
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

      const coincideBusqueda = texto.includes(busquedaInstructor.toLowerCase());

      const coincideTipo =
        filtroInstructorTipo === "Todas" ||
        String(estudiante.tipo_curso || "").toLowerCase() ===
          filtroInstructorTipo.toLowerCase();

      return coincideBusqueda && coincideTipo;
    });

    const estudianteActual =
      estudiantesFiltrados.find((e) => e.key === estudianteSeleccionado) ||
      estudiantesFiltrados[0];

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

    const obtenerEstadoInstructor = (item) => {
      const esperandoEstudiante =
        item.instructor_completado &&
        !item.estudiante_completado;

      if (item.instructor_completado) {
        return esperandoEstudiante
          ? {
              texto: "Esperando estudiante",
              clase: "bg-amber-100 text-amber-700",
            }
          : {
              texto: "Tema dado",
              clase: "bg-green-100 text-green-700",
            };
      }

      if (!item.desbloqueado) {
        return {
          texto: "Bloqueado",
          clase: "bg-slate-100 text-slate-500",
        };
      }

      return {
        texto: "Disponible",
        clase: "bg-blue-100 text-blue-700",
      };
    };

    if (progresos.length === 0) {
      return <MensajeVacioTarjeta />;
    }

    const avanceActual = estudianteActual
      ? calcularProgresoInstructor(estudianteActual.progresos)
      : {
          total: 0,
          dadas: 0,
          porcentaje: 0,
        };

    const matriculaActualId =
      estudianteActual?.progresos?.[0]?.matricula?.id ||
      estudianteActual?.progresos?.[0]?.matricula_id ||
      estudianteActual?.matricula_id;

    return (
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[390px_1fr]">
        <div className="h-fit rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-900">
              Mis estudiantes
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              Busca un estudiante para revisar los temas asignados.
            </p>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_145px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={busquedaInstructor}
                onChange={(e) => setBusquedaInstructor(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <select
              value={filtroInstructorTipo}
              onChange={(e) => setFiltroInstructorTipo(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="Todas">Todas</option>
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>

          <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {estudiantesFiltrados.map((estudiante, index) => {
              const avance = calcularProgresoInstructor(estudiante.progresos);
              const seleccionado = estudianteActual?.key === estudiante.key;

              return (
                <button
                  key={estudiante.key}
                  type="button"
                  onClick={() => setEstudianteSeleccionado(estudiante.key)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    seleccionado
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AvatarIniciales nombre={estudiante.nombre} index={index} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-900">
                            {estudiante.nombre}
                          </h3>

                          <p className="mt-1 truncate text-xs font-medium text-slate-500">
                            {estudiante.cedula || "Sin cédula"} · {estudiante.tipo_curso || "Sin curso"}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {avance.dadas}/{avance.total} temas dados
                          </p>
                        </div>

                        <span className={`shrink-0 text-2xl font-black ${obtenerColorProgresoTexto(avance.porcentaje)}`}>
                          {avance.porcentaje}%
                        </span>
                      </div>

                      <div className="mt-3">
                        <BarraProgreso porcentaje={avance.porcentaje} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {estudiantesFiltrados.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                No se encontraron estudiantes.
              </div>
            )}
          </div>

          <p className="mt-4 text-center text-sm font-medium text-slate-500">
            Mostrando {estudiantesFiltrados.length} de {estudiantes.length} estudiantes
          </p>
        </div>

        <div className="space-y-4">
          {!estudianteActual ? (
            <MensajeVacioTarjeta />
          ) : (
            <>
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-center gap-4">
                    <AvatarIniciales
                      nombre={estudianteActual.nombre}
                      index={1}
                      className="h-16 w-16 rounded-full text-xl"
                    />

                    <div>
                      <h2 className="text-2xl font-black leading-tight text-slate-900">
                        {estudianteActual.nombre}
                      </h2>

                      <p className="mt-1 text-sm font-medium text-slate-500">
                        Curso:{" "}
                        <span className="font-bold text-blue-600">
                          {estudianteActual.tipo_curso || "Sin curso"}
                        </span>
                        {" "}· Cédula: {estudianteActual.cedula || "Sin cédula"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-5">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[7px] border-blue-600 bg-white">
                        <span className="text-lg font-black text-blue-600">
                          {avanceActual.porcentaje}%
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-500">
                          Temas dados
                        </p>

                        <p className="text-3xl font-black text-blue-600">
                          {avanceActual.porcentaje}%
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {avanceActual.dadas} de {avanceActual.total} temas dados
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => habilitarExamenTeorico(matriculaActualId)}
                      disabled={habilitandoExamen}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <BookOpen className="h-5 w-5" />
                      {habilitandoExamen
                        ? "Habilitando..."
                        : "Habilitar examen teórico"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="text-lg font-black text-slate-900">
                    Temas del plan de estudio
                  </h3>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Marca únicamente los temas que ya fueron impartidos.
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {estudianteActual.progresos.map((item, index) => {
                    const expandido = temasExpandidos[item.id];
                    const estado = obtenerEstadoInstructor(item);
                    const subtemasTema = obtenerSubtemasDelItem(item);

                    return (
                      <div
                        key={item.id}
                        className={`transition ${
                          item.instructor_completado
                            ? "bg-green-50/40"
                            : item.desbloqueado
                            ? "bg-white hover:bg-slate-50"
                            : "bg-slate-50"
                        }`}
                      >
                        <div className="grid grid-cols-1 gap-4 px-5 py-4 lg:grid-cols-[1fr_170px_120px] lg:items-center">
                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => toggleTema(item.id)}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                            >
                              {expandido ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                            </button>

                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                                item.instructor_completado
                                  ? "bg-green-100 text-green-700"
                                  : item.desbloqueado
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {item.orden_general || index + 1}
                            </div>

                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-slate-900">
                                {item.tema_titulo || "Tema sin título"}
                              </h4>

                              <p className="mt-1 text-xs font-medium text-slate-500">
                                {item.subtemas_count ?? subtemasTema.length} subtemas
                              </p>
                            </div>
                          </div>

                          <div>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${estado.clase}`}
                            >
                              {estado.texto}
                            </span>
                          </div>

                          <div className="flex justify-start lg:justify-end">
                            <button
                              type="button"
                              disabled={
                                !item.desbloqueado ||
                                item.instructor_completado ||
                                accionEnProceso
                              }
                              onClick={() =>
                                marcarClase(item.id, "instructor", true)
                              }
                              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black transition ${
                                item.instructor_completado
                                  ? "bg-green-100 text-green-700"
                                  : item.desbloqueado
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  : "cursor-not-allowed bg-slate-100 text-slate-400"
                              }`}
                            >
                              {item.instructor_completado ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : item.desbloqueado ? (
                                <span className="h-4 w-4 rounded-full border-2 border-blue-500" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}

                              {item.instructor_completado
                                ? "Dado"
                                : item.desbloqueado
                                ? "Marcar"
                                : "Bloqueado"}
                            </button>
                          </div>
                        </div>

                        {expandido && (
                          <div className="border-t border-slate-100 bg-white px-6 py-4">
                            {subtemasTema.length > 0 ? (
                              <div className="space-y-2">
                                {subtemasTema.map((subtema, subIndex) => (
                                  <div
                                    key={subtema.id || `${item.id}-${subIndex}`}
                                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                  >
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-600">
                                      {subtema.orden || subIndex + 1}
                                    </span>

                                    <span className="text-sm font-medium text-slate-700">
                                      {subtema.titulo || subtema.nombre || "Subtema sin título"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm font-medium text-slate-500">
                                Este tema no tiene subtemas en la respuesta del progreso.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs font-bold text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                    Tema dado
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                    Disponible
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    Esperando estudiante
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-400" />
                    Bloqueado
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  {/* Vista para estudiante */}

  function PanelEstudiante({ progresos, marcarClase, accionEnProceso }) {
    const [matriculasExpandidas, setMatriculasExpandidas] = useState({});
    const [temasExpandidos, setTemasExpandidos] = useState({});
    const navigate = useNavigate();
    const [examenDisponible, setExamenDisponible] = useState(false);
    const [examenRealizado, setExamenRealizado] = useState(false);

    const verificarExamen = async () => {
      try {
        const response = await axios.get("/examen-teorico/mi-examen/");

        if (response.data?.disponible) {
          setExamenDisponible(true);
        }

        if (response.data?.realizado) {
          setExamenRealizado(true);
        }
      } catch (error) {
        console.error("Error verificando examen:", error);
      }
    };

    useEffect(() => {
      verificarExamen();
    }, []);

    const matriculasAgrupadas = useMemo(() => {
      const mapa = new Map();

      progresos.forEach((item) => {
        const matriculaId = item.matricula_id || item.matricula?.id;
        const matriculaFecha =
          item.matricula_fecha || item.matricula?.fecha_registro;
        const planNombre = item.plan_estudio_nombre || "Plan de Estudio";
        const planId = item.plan_estudio_id;
        const tipoCurso =
          item.tipo_curso || item.matricula?.tipo_curso || "Curso";
        const estadoMatricula =
          item.matricula_estado || item.matricula?.estado || "activo";

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
          completado:
            item.estudiante_completado &&
            item.instructor_completado,
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

    const matriculasFiltradas = matriculasAgrupadas;

    const toggleMatricula = (matriculaId) => {
      const abiertoPorDefecto = matriculasAgrupadas.length === 1;

      setMatriculasExpandidas((prev) => ({
        ...prev,
        [matriculaId]: !(prev[matriculaId] ?? abiertoPorDefecto),
      }));
    };

    const toggleTema = (temaId) => {
      setTemasExpandidos((prev) => ({
        ...prev,
        [temaId]: !prev[temaId],
      }));
    };

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
      if (!fecha) return "Sin fecha";

      try {
        return new Date(fecha).toLocaleDateString("es-NI", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch {
        return "Sin fecha";
      }
    };

    const obtenerEstadoEstudiante = (item) => {
      const completado =
        item.estudiante_completado &&
        item.instructor_completado;

      const esperandoInstructor =
        item.estudiante_completado &&
        !item.instructor_completado;

      const faltaConfirmacionEstudiante =
        !item.estudiante_completado &&
        item.instructor_completado;

      if (completado) {
        return {
          texto: "Completado",
          clase: "bg-green-100 text-green-700",
        };
      }

      if (esperandoInstructor) {
        return {
          texto: "Esperando instructor",
          clase: "bg-amber-100 text-amber-700",
        };
      }

      if (faltaConfirmacionEstudiante) {
        return {
          texto: "Falta tu confirmación",
          clase: "bg-orange-100 text-orange-700",
        };
      }

      if (item.desbloqueado) {
        return {
          texto: "Disponible",
          clase: "bg-violet-100 text-violet-700",
        };
      }

      return {
        texto: "Bloqueado",
        clase: "bg-slate-100 text-slate-500",
      };
    };

    if (progresos.length === 0) {
      return <MensajeVacioTarjeta />;
    }

    return (
      <div className="mx-auto max-w-[1220px] space-y-5">
        {matriculasFiltradas.length > 1 && (
          <div className="flex justify-end">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={expandirTodos}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Expandir todos
              </button>

              <button
                type="button"
                onClick={cerrarTodos}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cerrar todos
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {matriculasFiltradas.map((matricula) => {
            const avance = calcularProgresoMatricula(matricula.progresos);

            const esperandoInstructor = matricula.progresos.some(
              (item) =>
                item.estudiante_completado &&
                !item.instructor_completado
            );

            const estaExpandido =
              matriculasExpandidas[matricula.id] ??
              matriculasAgrupadas.length === 1;

            return (
              <div
                key={matricula.id}
                className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleMatricula(matricula.id)}
                  className="w-full px-5 py-5 text-left transition hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f0edff] text-[#4f46e5]">
                        <ChevronRight
                          className={`h-6 w-6 transition ${
                            estaExpandido ? "rotate-90" : ""
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-slate-900">
                            {matricula.planNombre}
                          </h3>

                          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">
                            {matricula.tipoCurso}
                          </span>

                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                            {matricula.estado === "matriculado"
                              ? "Activo"
                              : matricula.estado || "Activo"}
                          </span>

                          {esperandoInstructor && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                              Esperando instructor
                            </span>
                          )}

                          {avance.porcentaje === 100 && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                              Completado
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm font-medium text-slate-500">
                          Fecha de matrícula: {formatearFecha(matricula.fecha)}
                        </p>
                      </div>
                    </div>

                    <div className="w-full rounded-2xl bg-slate-50 p-4 lg:max-w-[360px]">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-500">
                          Progreso
                        </span>

                        <span className={`text-3xl font-black ${obtenerColorProgresoTexto(avance.porcentaje)}`}>
                          {avance.porcentaje}%
                        </span>
                      </div>

                      <BarraProgreso porcentaje={avance.porcentaje} />

                      <p className="mt-2 text-right text-sm font-medium text-slate-500">
                        {avance.completados} de {avance.total} temas completados
                      </p>
                    </div>
                  </div>
                </button>

                {estaExpandido && (
                  <div className="border-t border-slate-100 bg-white">
                    <div className="border-b border-slate-100 px-5 py-4">
                      <h4 className="text-lg font-black text-slate-900">
                        Temas del plan
                      </h4>

                      <p className="mt-1 text-sm font-medium text-slate-500">
                        Marca únicamente las clases que ya recibiste.
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {matricula.progresos.map((item, index) => {
                        const estado = obtenerEstadoEstudiante(item);
                        const temaExpandido = temasExpandidos[item.id];
                        const subtemasTema = obtenerSubtemasDelItem(item);
                        const totalSubtemas =
                          item.subtemas_count ?? subtemasTema.length;

                        return (
                          <div
                            key={item.id}
                            className={`transition ${
                              item.completado
                                ? "bg-green-50/40"
                                : item.desbloqueado
                                ? "bg-white hover:bg-slate-50"
                                : "bg-slate-50"
                            }`}
                          >
                            <div className="grid grid-cols-1 gap-4 px-5 py-4 lg:grid-cols-[1fr_160px_140px] lg:items-center">
                              <div className="flex items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => toggleTema(item.id)}
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                                >
                                  {temaExpandido ? (
                                    <ChevronDown className="h-5 w-5" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5" />
                                  )}
                                </button>

                                <div
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                                    item.completado
                                      ? "bg-green-100 text-green-700"
                                      : item.desbloqueado
                                      ? "bg-violet-100 text-violet-700"
                                      : "bg-slate-200 text-slate-500"
                                  }`}
                                >
                                  {item.orden_general || index + 1}
                                </div>

                                <div className="min-w-0">
                                  <h4 className="text-sm font-black text-slate-900">
                                    {item.tema_titulo || "Tema sin título"}
                                  </h4>

                                  <p className="mt-1 text-xs font-medium text-slate-500">
                                    {totalSubtemas} subtemas
                                  </p>

                                  {item.estudiante_completado &&
                                    !item.instructor_completado && (
                                      <p className="mt-1 text-xs font-bold text-amber-600">
                                        Esperando confirmación del instructor.
                                      </p>
                                    )}

                                  {!item.estudiante_completado &&
                                    item.instructor_completado && (
                                      <p className="mt-1 text-xs font-bold text-orange-600">
                                        El instructor ya marcó esta clase. Falta tu confirmación.
                                      </p>
                                    )}
                                </div>
                              </div>

                              <div className="flex justify-start lg:justify-center">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${estado.clase}`}
                                >
                                  {estado.texto}
                                </span>
                              </div>

                              <div className="flex justify-start lg:justify-end">
                                <button
                                  type="button"
                                  disabled={
                                    !item.desbloqueado ||
                                    item.estudiante_completado ||
                                    accionEnProceso
                                  }
                                  onClick={() =>
                                    marcarClase(item.id, "estudiante", true)
                                  }
                                  className={`inline-flex h-10 min-w-[120px] items-center justify-center gap-2 rounded-xl px-4 text-xs font-black transition ${
                                    item.estudiante_completado
                                      ? "bg-green-100 text-green-700"
                                      : item.desbloqueado
                                      ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
                                      : "cursor-not-allowed bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {item.estudiante_completado ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : item.desbloqueado ? (
                                    <span className="h-4 w-4 rounded-full border-2 border-violet-500" />
                                  ) : (
                                    <Lock className="h-4 w-4" />
                                  )}

                                  {item.estudiante_completado
                                    ? "Recibido"
                                    : item.desbloqueado
                                    ? "Marcar"
                                    : "Bloqueado"}
                                </button>
                              </div>
                            </div>

                            {temaExpandido && (
                              <div className="border-t border-slate-100 bg-white px-6 py-4">
                                {subtemasTema.length > 0 ? (
                                  <div className="space-y-2">
                                    {subtemasTema.map((subtema, subIndex) => (
                                      <div
                                        key={subtema.id || `${item.id}-${subIndex}`}
                                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                      >
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-600">
                                          {subtema.orden || subIndex + 1}
                                        </span>

                                        <span className="text-sm font-medium text-slate-700">
                                          {subtema.titulo ||
                                            subtema.nombre ||
                                            "Subtema sin título"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm font-medium text-slate-500">
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
                      <div className="border-t border-slate-100 bg-slate-50 px-5 py-5">
                        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                                <CheckCircle2 className="h-7 w-7" />
                              </div>

                              <div>
                                <h4 className="text-lg font-black text-green-800">
                                  Has completado este plan.
                                </h4>

                                <p className="mt-1 text-sm font-medium text-green-700">
                                  Tus clases ya aparecen completadas dentro del plan de estudio.
                                </p>
                              </div>
                            </div>

                            {examenDisponible && !examenRealizado && (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate("/dashboard/mi-examen-teorico")
                                }
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
                              >
                                <BookOpen className="h-5 w-5" />
                                Realizar examen teórico
                              </button>
                            )}

                            {examenRealizado && (
                              <div className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-green-100 px-5 text-sm font-black text-green-700">
                                <CheckCircle2 className="h-5 w-5" />
                                Examen teórico realizado
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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