import { useEffect, useState } from "react";
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

    const hoyTexto = new Date().toISOString().split("T")[0];

    const clasesHoy = clases.filter((clase) => clase.fecha === hoyTexto);

    const estudiantesUnicos = new Map();

    clases.forEach((clase) => {
        if (clase.estudiante_cedula) {
            estudiantesUnicos.set(clase.estudiante_cedula, {
                nombre: clase.estudiante_nombre,
                cedula: clase.estudiante_cedula,
                tipo_curso: clase.tipo_curso,
                modalidad: clase.modalidad,
            });
        }
    });

    const estudiantesActivos = Array.from(estudiantesUnicos.values());

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

    return (
        <div className="p-6 space-y-6 h-full overflow-y-auto bg-gray-50">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                    Panel de Control
                </h1>
                <p className="text-gray-400 text-sm">{fecha}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <p className="text-gray-500 text-sm">Estudiantes activos</p>
                    <h2 className="text-4xl font-bold mt-2">
                        {estudiantesActivos.length}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Estudiantes asignados en calendario
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <p className="text-gray-500 text-sm">Clases hoy</p>
                    <h2 className="text-4xl font-bold mt-2">
                        {clasesHoy.length}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Clases programadas para hoy
                    </p>
                </div>
            </div>

            {/* Próximas clases */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-700 mb-4">
                        Próximas clases
                    </h3>

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
                                            {clase.estudiante_nombre}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {clase.es_examen
                                                ? "Examen Policial"
                                                : `Clase ${clase.numero_clase}`}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {formatoFecha(clase.fecha)}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {clase.hora_inicio} - {clase.hora_fin}
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
            </div>
        </div>
    );
}

export default InstructorHome;