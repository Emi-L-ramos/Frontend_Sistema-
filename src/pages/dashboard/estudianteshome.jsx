import { cloneElement, useEffect, useState } from "react";
import {
    GraduationCap,
    CalendarCheck,
    BookOpen,
    CalendarDays,
    Clock3,
    UserRound,
    PieChart,
} from "lucide-react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

function EstudianteHome({ setActiveTab }) {
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(true);

    const [asistencia, setAsistencia] = useState({
        porcentaje: 0,
        asistidas: 0,
        total: 0,
    });

    const [progresoPlan, setProgresoPlan] = useState({
        porcentaje: 0,
        temas_completados: 0,
        total_temas: 0,
        unidad: "temas",
        aplica_progreso: false,
        tipo_curso: null,
    });

    const [loadingAsistencia, setLoadingAsistencia] = useState(true);
    const [loadingProgresoPlan, setLoadingProgresoPlan] = useState(true);

    const navigate = useNavigate();

    const fecha = new Date().toLocaleDateString("es-NI", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    useEffect(() => {
        cargarCalendario();
        cargarAsistencia();
        cargarProgresoPlan();
    }, []);

    const cargarCalendario = async () => {
        try {
            setLoading(true);

            const response = await api.get("/calendario/");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.results || [];

            setClases(data);
        } catch (error) {
            console.error("Error cargando calendario del estudiante:", error);
            setClases([]);
        } finally {
            setLoading(false);
        }
    };

    const cargarAsistencia = async () => {
        try {
            setLoadingAsistencia(true);

            const response = await api.get("/asistencia/resumen-estudiante/");

            setAsistencia({
                porcentaje: response.data.porcentaje || 0,
                asistidas: response.data.asistidas || 0,
                total: response.data.total || 0,
            });
        } catch (error) {
            console.error("Error cargando asistencia:", error);

            setAsistencia({
                porcentaje: 0,
                asistidas: 0,
                total: 0,
            });
        } finally {
            setLoadingAsistencia(false);
        }
    };

    const cargarProgresoPlan = async () => {
        try {
            setLoadingProgresoPlan(true);

            const response = await api.get("/dashboard-plan/mi-progreso/");

            setProgresoPlan({
                porcentaje: response.data.porcentaje || 0,
                temas_completados: response.data.temas_completados || 0,
                total_temas: response.data.total_temas || 0,
                unidad: response.data.unidad || "temas",
                aplica_progreso: Boolean(response.data.aplica_progreso),
                tipo_curso: response.data.tipo_curso || null,
            });
        } catch (error) {
            console.error("Error cargando progreso del plan:", error);

            setProgresoPlan({
                porcentaje: 0,
                temas_completados: 0,
                total_temas: 0,
                unidad: "temas",
                aplica_progreso: false,
                tipo_curso: null,
            });
        } finally {
            setLoadingProgresoPlan(false);
        }
    };

    const calcularHorasPorDia = (clase) => {
        if (!clase?.hora_inicio || !clase?.hora_fin) return 1;

        const inicio = new Date(`2000-01-01T${clase.hora_inicio}`);
        const fin = new Date(`2000-01-01T${clase.hora_fin}`);

        const horas = (fin - inicio) / (1000 * 60 * 60);

        return horas > 0 ? horas : 1;
    };

    const calcularTotalEncuentrosOficiales = () => {
        const primeraClase = clases.find((clase) => !clase.es_examen);

        if (!primeraClase) return 0;

        const horasPorDia = calcularHorasPorDia(primeraClase);

        let horasTotales = 0;

        if (primeraClase.tipo_curso === "Principiante") {
            horasTotales = 15;
        } else {
            horasTotales = Number(primeraClase.horas_reforzamiento || 0);
        }

        return Math.ceil(horasTotales / horasPorDia);
    };

    const totalEncuentrosOficiales = calcularTotalEncuentrosOficiales();

    const clasesPracticas = clases.filter(
        (clase) =>
            !clase.es_examen &&
            clase.numero_clase <= totalEncuentrosOficiales
    );

    const clasesCompletadas = clasesPracticas.filter(
        (clase) => clase.estado === "completada"
    );

    const clasesPendientes = clasesPracticas.filter(
        (clase) => clase.estado === "pendiente"
    );

    const proximasClases = clases
        .filter((clase) => {
            const fechaClase = new Date(`${clase.fecha}T00:00:00`);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            return (
                fechaClase >= hoy &&
                clase.estado === "pendiente"
            );
        })
        .sort((a, b) => {
            const fechaA = new Date(`${a.fecha}T${a.hora_inicio}`);
            const fechaB = new Date(`${b.fecha}T${b.hora_inicio}`);
            return fechaA - fechaB;
        })
        .slice(0, 2);

    const totalClases = clasesPracticas.length;
    const totalCompletadas = clasesCompletadas.length;

    const progresoEncuentros =
        totalClases > 0 ? Math.round((totalCompletadas / totalClases) * 100) : 0;

    const totalResumenCurso = Number(progresoPlan.total_temas || 0);
    const completadosResumenCurso = Number(progresoPlan.temas_completados || 0);
    const pendientesResumenCurso = Math.max(
        totalResumenCurso - completadosResumenCurso,
        0
    );

    const formatoFecha = (fecha) => {
        return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-NI", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
    };

    const obtenerColorEstado = (estado) => {
        if (estado === "completada") return "bg-green-100 text-green-700";
        if (estado === "inasistencia") return "bg-red-100 text-red-700";
        if (estado === "reprogramada") return "bg-orange-100 text-orange-700";
        return "bg-yellow-100 text-yellow-700";
    };

    const unidadProgreso = progresoPlan.unidad || "temas";

    const mostrarPlanEstudio = Boolean(
        progresoPlan.aplica_progreso
    );

    const textoUnidadCompletada =
        unidadProgreso === "clases" ? "clases completadas" : "temas completados";

    const TarjetaResumen = ({ variante, icono, titulo, valor, descripcion, extra, valorGrande = false }) => {
        const estilos = {
            blue: {
                card: "border-blue-100 bg-blue-50/70",
                iconBox: "text-blue-600",
                value: "text-blue-600",
                shape: "text-blue-200",
            },
            green: {
                card: "border-emerald-100 bg-emerald-50/70",
                iconBox: "text-emerald-600",
                value: "text-emerald-600",
                shape: "text-emerald-200",
            },
            orange: {
                card: "border-orange-100 bg-orange-50/70",
                iconBox: "text-orange-600",
                value: "text-slate-950",
                shape: "text-orange-200",
            },
        };

        const estilo = estilos[variante] || estilos.blue;

        return (
            <div
                className={`relative min-h-[126px] overflow-hidden rounded-[24px] border px-6 py-5 shadow-sm ${estilo.card}`}
            >
                <div className={`pointer-events-none absolute -bottom-8 -right-7 opacity-50 ${estilo.shape}`}>
                    {cloneElement(icono, {
                        size: 118,
                        strokeWidth: 1.6,
                    })}
                </div>

                <div className="relative z-10 flex h-full items-center justify-between gap-5">
                    <div className="min-w-0">
                        <p className="text-sm font-black text-slate-700">
                            {titulo}
                        </p>

                        <h2
                            className={`mt-2 font-black leading-tight ${estilo.value} ${
                                valorGrande ? "text-3xl" : "text-4xl"
                            }`}
                        >
                            {valor}
                        </h2>

                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            {descripcion}
                        </p>

                        {extra && (
                            <p className="mt-1 text-sm font-bold text-slate-600">
                                {extra}
                            </p>
                        )}
                    </div>

                    <div className={`flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-[22px] border border-white/80 bg-white shadow-sm ${estilo.iconBox}`}>
                        {cloneElement(icono, {
                            size: 32,
                            strokeWidth: 2.3,
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const ClaseItem = ({ clase }) => {
        const dia = new Date(`${clase.fecha}T00:00:00`).toLocaleDateString("es-NI", {
            day: "2-digit",
        });

        const mes = new Date(`${clase.fecha}T00:00:00`).toLocaleDateString("es-NI", {
            month: "short",
        });

        return (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <span className="text-3xl font-black leading-none">
                            {dia}
                        </span>
                        <span className="mt-1 text-xs font-black uppercase">
                            {mes}
                        </span>
                    </div>

                    <div>
                        <p className="text-base font-black text-slate-900">
                            {clase.es_examen
                                ? "Examen Policial"
                                : `Encuentro ${clase.numero_clase}`}
                        </p>

                        <div className="mt-2 space-y-1">
                            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                                <CalendarDays size={15} />
                                {formatoFecha(clase.fecha)}
                            </p>

                            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                                <Clock3 size={15} />
                                {clase.hora_inicio} - {clase.hora_fin}
                            </p>

                            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                                <UserRound size={15} />
                                Instructor: {clase.instructor_nombre || "Sin asignar"}
                            </p>

                            <p className="text-sm font-semibold text-slate-500">
                                Curso: {clase.tipo_curso} - {clase.modalidad}
                            </p>
                        </div>
                    </div>
                </div>

                <span
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-black ${obtenerColorEstado(
                        clase.estado
                    )}`}
                >
                    {clase.estado}
                </span>
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto bg-[#f7f9fd] px-4 py-5 md:px-6 lg:px-8">
            <div className="mx-auto max-w-[1550px] space-y-6">
                <div className="flex items-center gap-5">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
                        <GraduationCap size={38} />
                    </div>

                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-950">
                            Mi Dashboard
                        </h1>
                        <p className="mt-2 text-base font-medium text-slate-500">
                            Bienvenido/a, {fecha}
                        </p>
                    </div>
                </div>

                <div
                    className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${
                        mostrarPlanEstudio
                            ? "xl:grid-cols-3"
                            : "xl:grid-cols-2"
                    }`}
                >
                    <TarjetaResumen
                        variante="blue"
                        icono={<CalendarCheck />}
                        titulo="Asistencia"
                        valor={loadingAsistencia ? "..." : `${asistencia.porcentaje}%`}
                        descripcion={`${asistencia.asistidas} de ${asistencia.total} asistencias registradas`}
                    />

                    {mostrarPlanEstudio && (
                        <TarjetaResumen
                            variante="green"
                            icono={<BookOpen />}
                            titulo="Plan de Estudio"
                            valor={
                                loadingProgresoPlan
                                    ? "..."
                                    : `${progresoPlan.porcentaje}%`
                            }
                            descripcion={
                                loadingProgresoPlan
                                    ? "Cargando avance del plan"
                                    : `${progresoPlan.temas_completados} de ${progresoPlan.total_temas} ${textoUnidadCompletada}`
                            }
                        />
                    )}

                    <TarjetaResumen
                        variante="orange"
                        icono={<CalendarDays />}
                        titulo="Próxima Clase"
                        valor={
                            proximasClases[0]
                                ? formatoFecha(proximasClases[0].fecha).replace(",", "")
                                : "Sin clases"
                        }
                        descripcion={
                            proximasClases[0]
                                ? `${proximasClases[0].hora_inicio} - ${proximasClases[0].hora_fin}`
                                : "No hay clases programadas"
                        }
                        extra={
                            proximasClases[0] &&
                            (proximasClases[0].es_examen
                                ? "Examen Policial"
                                : `Encuentro ${proximasClases[0].numero_clase}`)
                        }
                        valorGrande
                    />
                </div>

                <div
                    className={`grid grid-cols-1 gap-6 ${
                        mostrarPlanEstudio
                            ? "xl:grid-cols-[1.05fr_1fr]"
                            : "xl:grid-cols-1"
                    }`}
                >
                    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <CalendarDays size={22} />
                            </div>

                            <h3 className="text-xl font-black text-slate-950">
                                Próximas Clases
                            </h3>
                        </div>

                        {loading ? (
                            <p className="py-10 text-center text-sm font-semibold text-slate-400">
                                Cargando clases...
                            </p>
                        ) : proximasClases.length === 0 ? (
                            <p className="py-10 text-center text-sm font-semibold text-slate-400">
                                No hay clases programadas
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {proximasClases.map((clase) => (
                                    <ClaseItem key={clase.id} clase={clase} />
                                ))}
                            </div>
                        )}
                    </div>

                    {mostrarPlanEstudio && (
                        <div className="space-y-6">
                            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                        <BookOpen size={22} />
                                    </div>

                                    <h3 className="text-xl font-black text-slate-950">
                                        Plan de Estudio
                                    </h3>
                                </div>

                                <div className="mb-2 flex justify-between text-sm font-semibold text-slate-500">
                                    <span>Avance del plan</span>
                                    <span>
                                        {loadingProgresoPlan
                                            ? "..."
                                            : `${progresoPlan.porcentaje}%`}
                                    </span>
                                </div>

                                <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className="h-full rounded-full bg-blue-600 transition-all"
                                        style={{ width: `${progresoPlan.porcentaje}%` }}
                                    />
                                </div>

                                <p className="text-sm font-semibold text-slate-500">
                                    {progresoPlan.temas_completados} de{" "}
                                    {progresoPlan.total_temas} {textoUnidadCompletada}
                                </p>
                            </div>

                            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <PieChart size={22} />
                                    </div>

                                    <h3 className="text-xl font-black text-slate-950">
                                        Resumen del Curso
                                    </h3>
                                </div>

                                <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                    <div className="border-r border-slate-200 p-4 text-center">
                                        <p className="text-sm font-semibold text-slate-500">
                                            Total
                                        </p>
                                        <p className="mt-2 text-3xl font-black text-blue-600">
                                            {loadingProgresoPlan ? "..." : totalResumenCurso}
                                        </p>
                                    </div>

                                    <div className="border-r border-slate-200 p-4 text-center">
                                        <p className="text-sm font-semibold text-slate-500">
                                            Completados
                                        </p>
                                        <p className="mt-2 text-3xl font-black text-green-600">
                                            {loadingProgresoPlan ? "..." : completadosResumenCurso}
                                        </p>
                                    </div>

                                    <div className="p-4 text-center">
                                        <p className="text-sm font-semibold text-slate-500">
                                            Pendientes
                                        </p>
                                        <p className="mt-2 text-3xl font-black text-orange-500">
                                            {loadingProgresoPlan ? "..." : pendientesResumenCurso}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}    
                </div>
            </div>
        </div>
    );
}

export default EstudianteHome;