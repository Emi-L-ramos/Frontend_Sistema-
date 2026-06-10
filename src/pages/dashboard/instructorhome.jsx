import { cloneElement, useEffect, useState } from "react";
import {
    UserCheck,
    Users,
    CalendarCheck,
    CalendarDays,
    ClipboardCheck,
    TrendingUp,
    Clock3,
    UserRound,
} from "lucide-react";
import api from "../../api/axios";

function InstructorHome() {
    const [clases, setClases] = useState([]);
    const [loading, setLoading] = useState(true);

    const fecha = new Date().toLocaleDateString("es-NI", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    useEffect(() => {
        cargarCalendario();
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
            console.error("Error cargando calendario del instructor:", error);
            setClases([]);
        } finally {
            setLoading(false);
        }
    };

    const obtenerFechaLocalISO = (fecha = new Date()) => {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, "0");
        const day = String(fecha.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const crearFechaLocal = (fechaTexto) => {
        return new Date(`${fechaTexto}T00:00:00`);
    };

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const hoyTexto = obtenerFechaLocalISO(hoy);

    const clasesHoy = clases.filter(
        (clase) =>
            clase.fecha === hoyTexto &&
            clase.estado !== "cancelada" &&
            !clase.es_examen
    );

    const inicioSemana = new Date(hoy);
    const diaSemana = inicioSemana.getDay();
    const diferenciaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;

    inicioSemana.setDate(inicioSemana.getDate() + diferenciaLunes);
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    const clasesEstaSemana = clases.filter((clase) => {
        const fechaClase = crearFechaLocal(clase.fecha);

        return (
            fechaClase >= inicioSemana &&
            fechaClase <= finSemana &&
            clase.estado !== "cancelada" &&
            !clase.es_examen
        );
    });

    const asistenciasHoy = clasesHoy.filter(
        (clase) => clase.estado === "completada"
    ).length;

    const estudiantesUnicos = new Map();

    const estudiantesVigentesMap = new Map();

    clases.forEach((clase) => {
        const fechaClase = crearFechaLocal(clase.fecha);

        const tieneClasePendienteVigente =
            fechaClase >= hoy &&
            clase.estado === "pendiente" &&
            !clase.es_examen;

        if (tieneClasePendienteVigente && clase.estudiante_cedula) {
            estudiantesVigentesMap.set(clase.estudiante_cedula, {
                nombre: clase.estudiante_nombre,
                cedula: clase.estudiante_cedula,
                tipo_curso: clase.tipo_curso,
                modalidad: clase.modalidad,
            });
        }
    });

    const estudiantesVigentes = Array.from(estudiantesVigentesMap.values());

    const proximasClases = clases
        .filter((clase) => {
            const fechaClase = new Date(`${clase.fecha}T00:00:00`);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            return fechaClase >= hoy && clase.estado === "pendiente";
        })
        .sort((a, b) => {
            const fechaA = new Date(`${a.fecha}T${a.hora_inicio}`);
            const fechaB = new Date(`${b.fecha}T${b.hora_inicio}`);
            return fechaA - fechaB;
        })
        .slice(0, 3);

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

    const TarjetaResumen = ({ variante, icono, titulo, valor, descripcion }) => {
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
                value: "text-slate-950",
                shape: "text-emerald-200",
            },
            purple: {
                card: "border-violet-100 bg-violet-50/70",
                iconBox: "text-violet-600",
                value: "text-violet-600",
                shape: "text-violet-200",
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

                        <h2 className={`mt-2 text-4xl font-black leading-tight ${estilo.value}`}>
                            {valor}
                        </h2>

                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            {descripcion}
                        </p>
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

    const ClaseInstructorItem = ({ clase }) => {
        const dia = new Date(`${clase.fecha}T00:00:00`).toLocaleDateString("es-NI", {
            day: "2-digit",
        });

        const mes = new Date(`${clase.fecha}T00:00:00`).toLocaleDateString("es-NI", {
            month: "short",
        });

        return (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center rounded-2xl bg-green-50 text-green-600">
                        <span className="text-3xl font-black leading-none">
                            {dia}
                        </span>
                        <span className="mt-1 text-xs font-black uppercase">
                            {mes}
                        </span>
                    </div>

                    <div>
                        <p className="text-base font-black text-slate-900">
                            {clase.estudiante_nombre}
                        </p>

                        <div className="mt-2 space-y-1">
                            <p className="text-sm font-semibold text-slate-500">
                                {clase.es_examen
                                    ? "Examen Policial"
                                    : `Encuentro ${clase.numero_clase}`}
                            </p>

                            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                                <Clock3 size={15} />
                                {clase.hora_inicio} - {clase.hora_fin}
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

    const EstudianteAsignadoItem = ({ estudiante, index }) => {
        const colores = [
            "bg-blue-600 text-white",
            "bg-emerald-500 text-white",
            "bg-violet-600 text-white",
            "bg-orange-500 text-white",
        ];

        return (
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-black ${
                        colores[index % colores.length]
                    }`}
                >
                    {(estudiante.nombre || "E").charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                        {estudiante.nombre || "Sin nombre"}
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-500">
                        {estudiante.cedula || "Sin cédula"}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500">
                        Curso
                    </p>
                    <p className="text-sm font-black text-slate-700">
                        {estudiante.tipo_curso || "Sin curso"}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto bg-[#f7f9fd] px-4 py-5 md:px-6 lg:px-8">
            <div className="mx-auto max-w-[1550px] space-y-6">
                <div className="flex items-center gap-5">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm">
                        <UserCheck size={38} />
                    </div>

                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-950">
                            Panel de Control
                        </h1>
                        <p className="mt-2 text-base font-medium text-slate-500">
                            {fecha}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <TarjetaResumen
                        variante="blue"
                        icono={<Users />}
                        titulo="Estudiantes Asignados"
                        valor={estudiantesVigentes.length}
                        descripcion="Con clases pendientes programadas"
                    />

                    <TarjetaResumen
                        variante="green"
                        icono={<CalendarCheck />}
                        titulo="Clases de Hoy"
                        valor={clasesHoy.length}
                        descripcion="Programadas para hoy"
                    />

                    <TarjetaResumen
                        variante="purple"
                        icono={<ClipboardCheck />}
                        titulo="Clases Esta Semana"
                        valor={clasesEstaSemana.length}
                        descripcion="Encuentros programados"
                    />

                    <TarjetaResumen
                        variante="orange"
                        icono={<TrendingUp />}
                        titulo="Asistencia Hoy"
                        valor={`${asistenciasHoy}/${clasesHoy.length}`}
                        descripcion="Estudiantes presentes"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
                    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
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
                                    <ClaseInstructorItem
                                        key={clase.id}
                                        clase={clase}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Users size={22} />
                            </div>

                            <h3 className="text-xl font-black text-slate-950">
                                Mis Estudiantes Asignados
                            </h3>
                        </div>

                        {estudiantesVigentes.length === 0 ? (
                            <p className="py-10 text-center text-sm font-semibold text-slate-400">
                                No hay estudiantes asignados.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {estudiantesVigentes.slice(0, 4).map((estudiante, index) => (
                                    <EstudianteAsignadoItem
                                        key={estudiante.cedula || index}
                                        estudiante={estudiante}
                                        index={index}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InstructorHome;