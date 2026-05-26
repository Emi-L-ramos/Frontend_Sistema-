import { useEffect, useState } from "react";
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

            console.log("Clases del estudiante:", data);

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
            });
        } catch (error) {
            console.error("Error cargando progreso del plan:", error);

            setProgresoPlan({
                porcentaje: 0,
                temas_completados: 0,
                total_temas: 0,
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

    return (
        <div className="p-6 space-y-6 h-full overflow-y-auto bg-gray-50">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Mi Dashboard</h1>
                <p className="text-gray-400 text-sm">Bienvenido/a, {fecha}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center border border-gray-100">
                    <div>
                        <p className="text-gray-500 text-sm">Asistencia</p>

                        <h2 className="text-4xl font-bold mt-1">
                            {loadingAsistencia ? "..." : `${asistencia.porcentaje}%`}
                        </h2>

                        <p className="text-gray-400 text-sm mt-1">
                            {asistencia.asistidas} de {asistencia.total} asistencias registradas
                        </p>
                    </div>

                    <div className="bg-blue-500 p-4 rounded-2xl text-white text-2xl">
                        ✓
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center border border-gray-100">
                    <div>
                        <p className="text-gray-500 text-sm">Progreso del Curso</p>

                        <h2 className="text-4xl font-bold mt-1">
                            {progresoEncuentros}%
                        </h2>

                        <p className="text-gray-400 text-sm mt-1">
                            {totalCompletadas} de {totalClases} encuentros completados
                        </p>
                    </div>

                    <div className="bg-purple-500 p-4 rounded-2xl text-white text-2xl">
                        📖
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 text-lg">
                            Próximas Clases
                        </h3>
                    </div>

                    {loading ? (
                        <p className="text-gray-400 text-sm text-center py-8">
                            Cargando clases...
                        </p>
                    ) : proximasClases.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">
                            No hay clases programadas
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {proximasClases.map((clase) => (
                                <div
                                    key={clase.id}
                                    className="border border-gray-100 rounded-xl p-4 flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {clase.es_examen
                                                ? "Examen Policial"
                                                : `Encuentro ${clase.numero_clase}`}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {formatoFecha(clase.fecha)}
                                        </p>

                                        <p className="text-sm text-gray-400">
                                            {clase.hora_inicio} - {clase.hora_fin}
                                        </p>

                                        <p className="text-sm text-gray-400">
                                            Instructor:{" "}
                                            {clase.instructor_nombre || "Sin asignar"}
                                        </p>

                                        <p className="text-sm text-gray-400">
                                            Curso: {clase.tipo_curso} - {clase.modalidad}
                                        </p>
                                    </div>

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${obtenerColorEstado(
                                            clase.estado
                                        )}`}
                                    >
                                        {clase.estado}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h3 className="font-bold text-gray-800 text-lg mb-4">
                            Plan de Estudio
                        </h3>

                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Avance del plan</span>
                            <span>
                                {loadingProgresoPlan
                                    ? "..."
                                    : `${progresoPlan.porcentaje}%`}
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                                className="bg-gray-800 h-2 rounded-full transition-all"
                                style={{ width: `${progresoPlan.porcentaje}%` }}
                            ></div>
                        </div>

                        <p className="text-gray-400 text-sm">
                            {progresoPlan.temas_completados} de{" "}
                            {progresoPlan.total_temas} temas completados
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h3 className="font-bold text-gray-800 text-lg mb-4">
                            Resumen del Curso
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    Total de encuentros
                                </span>
                                <span className="font-semibold text-gray-800">
                                    {totalClases}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    Encuentros completados
                                </span>
                                <span className="font-semibold text-green-600">
                                    {totalCompletadas}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Pendientes</span>
                                <span className="font-semibold text-yellow-600">
                                    {clasesPendientes.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EstudianteHome;