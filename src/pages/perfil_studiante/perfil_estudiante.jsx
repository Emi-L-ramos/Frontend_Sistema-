import { useEffect, useMemo, useState } from "react";

function PerfilEstudiante() {
    const token = localStorage.getItem("token");

    const [loading, setLoading] = useState(true);
    const [rol, setRol] = useState("");
    const [miPerfil, setMiPerfil] = useState(null);
    const [instructor, setInstructor] = useState(null);
    const [instructores, setInstructores] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);

    const cargarPerfiles = async () => {
        try {
            setLoading(true);

            const response = await fetch("http://127.0.0.1:8000/api/perfiles/", {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            const data = await response.json();

            setRol((data.rol || "").toLowerCase());
            setMiPerfil(data.mi_perfil || null);
            setInstructor(data.instructor || null);
            setInstructores(data.instructores || []);
            setEstudiantes(data.estudiantes || []);
        } catch (error) {
            console.error("Error cargando perfiles:", error);
            setRol("");
            setMiPerfil(null);
            setInstructor(null);
            setInstructores([]);
            setEstudiantes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarPerfiles();
    }, []);

    const perfilesFiltrados = useMemo(() => {
        const texto = busqueda.toLowerCase();

        const listaInstructores = instructores
            .filter((i) => {
                const contenido = `${i.nombre || ""} ${i.apellido || ""} ${i.telefono || ""} ${i.categoria || ""}`.toLowerCase();
                return contenido.includes(texto);
            })
            .map((i) => ({ ...i, tipo: "instructor" }));

        const listaEstudiantes = estudiantes
            .filter((e) => {
                const contenido = `${e.nombre || ""} ${e.apellido || ""} ${e.cedula || ""} ${e.telefono || ""} ${e.correo || ""}`.toLowerCase();
                return contenido.includes(texto);
            })
            .map((e) => ({ ...e, tipo: "estudiante" }));

        return [...listaInstructores, ...listaEstudiantes];
    }, [busqueda, instructores, estudiantes]);

    const PerfilCard = ({ perfil, tipo }) => {
        const esInstructor = tipo === "instructor";

        return (
            <div
                onClick={() => setPerfilSeleccionado({ ...perfil, tipo })}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer hover:-translate-y-1 duration-200"
            >
                <div className="p-5">
                    <div className="flex items-start gap-4">
                        <div
                            className={`w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 ${
                                esInstructor ? "bg-green-50" : "bg-blue-50"
                            }`}
                        >
                            {perfil?.foto ? (
                                <img
                                    src={perfil.foto}
                                    alt={`${perfil.nombre || ""} ${perfil.apellido || ""}`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span
                                    className={`text-2xl font-bold ${
                                        esInstructor ? "text-green-600" : "text-blue-600"
                                    }`}
                                >
                                    {(perfil?.nombre || "P").charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-bold text-gray-800 leading-tight">
                                {perfil?.nombre} {perfil?.apellido}
                            </h2>

                            <span
                                className={`inline-flex mt-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                    esInstructor
                                        ? "bg-green-100 text-green-700"
                                        : "bg-blue-100 text-blue-700"
                                }`}
                            >
                                {esInstructor ? "Instructor" : "Estudiante"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ModalPerfil = () => {
        if (!perfilSeleccionado) return null;

        const esInstructor = perfilSeleccionado.tipo === "instructor";

        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                    <div
                        className={`h-28 ${
                            esInstructor
                                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                : "bg-gradient-to-r from-blue-500 to-indigo-600"
                        }`}
                    />

                    <div className="p-6 -mt-16">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-end gap-4">
                                <div className="w-28 h-28 rounded-2xl border-4 border-white bg-gray-100 overflow-hidden shadow flex items-center justify-center">
                                    {perfilSeleccionado.foto ? (
                                        <img
                                            src={perfilSeleccionado.foto}
                                            alt={`${perfilSeleccionado.nombre || ""} ${perfilSeleccionado.apellido || ""}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold text-gray-400">
                                            {(perfilSeleccionado.nombre || "P").charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-2">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {perfilSeleccionado.nombre} {perfilSeleccionado.apellido}
                                    </h2>

                                    <span
                                        className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                                            esInstructor
                                                ? "bg-green-100 text-green-700"
                                                : "bg-blue-100 text-blue-700"
                                        }`}
                                    >
                                        {esInstructor ? "Instructor" : "Estudiante"}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setPerfilSeleccionado(null)}
                                className="text-gray-400 hover:text-red-500 text-3xl"
                            >
                                ×
                            </button>
                        </div>

                        {esInstructor ? (
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoItem titulo="Cédula" valor={perfilSeleccionado.cedula || "No registrada"} />
                                <InfoItem titulo="Teléfono" valor={perfilSeleccionado.telefono || "No registrado"} />
                                <InfoItem titulo="Edad" valor={perfilSeleccionado.edad ? `${perfilSeleccionado.edad} años` : "No registrada"} />
                                <InfoItem titulo="Nacionalidad" valor={perfilSeleccionado.nacionalidad || "No registrada"} />
                                <InfoItem titulo="Nivel escolar" valor={perfilSeleccionado.nivel_escolar || "No registrado"} />
                                <InfoItem titulo="Categoría vehicular" valor={perfilSeleccionado.categoria || "No asignada"} />
                                <InfoItem titulo="Dirección" valor={perfilSeleccionado.direccion || "No registrada"} />
                                <InfoItem titulo="Antecedentes penales" valor={perfilSeleccionado.antecedentes_penales || "No registrado"} />
                                <InfoItem titulo="Centro de trabajo" valor={perfilSeleccionado.centro_trabajo || "No registrado"} />
                                <InfoItem titulo="Cargo" valor={perfilSeleccionado.cargo || "No registrado"} />
                                <InfoItem titulo="Curso aprobado como instructor" valor={perfilSeleccionado.curso_aprobado_instructor || "No registrado"} />
                                <InfoItem titulo="Fecha de ingreso" valor={perfilSeleccionado.fecha_ingreso || "No registrada"} />
                                <InfoItem titulo="Fecha de salida" valor={perfilSeleccionado.fecha_salida || "No registrada"} />

                                <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                                    <p className="text-xs text-gray-400">Experiencia</p>
                                    <p className="font-semibold text-gray-700 whitespace-pre-line">
                                        {perfilSeleccionado.experiencia || "Sin experiencia registrada."}
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                                    <p className="text-xs text-gray-400">Motivo de salida</p>
                                    <p className="font-semibold text-gray-700 whitespace-pre-line">
                                        {perfilSeleccionado.motivo_salida || "No registrado."}
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                                    <p className="text-xs text-gray-400">Infracciones / resoluciones</p>
                                    <p className="font-semibold text-gray-700 whitespace-pre-line">
                                        {perfilSeleccionado.infracciones_resoluciones || "No registradas."}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoItem titulo="Cédula" valor={perfilSeleccionado.cedula || "No registrada"} />
                                <InfoItem titulo="Teléfono" valor={perfilSeleccionado.telefono || "No registrado"} />
                                <InfoItem titulo="Correo" valor={perfilSeleccionado.correo || "No registrado"} />
                                <InfoItem titulo="Edad" valor={perfilSeleccionado.edad ? `${perfilSeleccionado.edad} años` : "No registrada"} />
                                <InfoItem titulo="Sexo" valor={perfilSeleccionado.sexo || "No registrado"} />
                                <InfoItem titulo="Nacionalidad" valor={perfilSeleccionado.nacionalidad || "No registrada"} />
                                <InfoItem titulo="Fecha de nacimiento" valor={perfilSeleccionado.fecha_nacimiento || "No registrada"} />
                                <InfoItem titulo="Nivel educativo" valor={perfilSeleccionado.nivel_educativo || "No registrado"} />
                                <InfoItem titulo="Dirección" valor={perfilSeleccionado.direccion || "No registrada"} />
                                <InfoItem titulo="Contacto de emergencia" valor={perfilSeleccionado.nombre_emergencia || "No registrado"} />
                                <InfoItem titulo="Teléfono de emergencia" valor={perfilSeleccionado.telefono_emergencia || "No registrado"} />
                                <InfoItem titulo="Estado" valor={perfilSeleccionado.activo ? "Activo" : "Inactivo"} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const InfoItem = ({ titulo, valor }) => {
        return (
            <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400">{titulo}</p>
                <p className="font-semibold text-gray-700">{valor}</p>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
                    Cargando perfiles...
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">
                    Perfiles
                </h1>

                <p className="text-gray-500 mt-1">
                    Consulta la información registrada.
                </p>
            </div>

            {(rol === "admin" || rol === "secretaria" || rol === "instructor") && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, cédula, teléfono, correo o categoría..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            )}

            {rol === "estudiante" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {miPerfil && (
                        <PerfilCard
                            perfil={miPerfil}
                            tipo="estudiante"
                        />
                    )}

                    {instructor && (
                        <PerfilCard
                            perfil={instructor}
                            tipo="instructor"
                        />
                    )}

                    {!instructor && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-gray-400">
                            Todavía no tienes instructor asignado.
                        </div>
                    )}
                </div>
            )}

            {rol === "instructor" && (
                <div className="space-y-6">
                    {miPerfil && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Mi perfil
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                <PerfilCard perfil={miPerfil} tipo="instructor" />
                            </div>
                        </div>
                    )}

                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Mis estudiantes asignados
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {perfilesFiltrados
                                .filter((p) => p.tipo === "estudiante")
                                .map((perfil) => (
                                    <PerfilCard
                                        key={`estudiante-${perfil.id}`}
                                        perfil={perfil}
                                        tipo="estudiante"
                                    />
                                ))}

                            {perfilesFiltrados.filter((p) => p.tipo === "estudiante").length === 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-gray-400">
                                    No hay estudiantes para mostrar.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {(rol === "admin" || rol === "secretaria") && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {perfilesFiltrados.map((perfil) => (
                        <PerfilCard
                            key={`${perfil.tipo}-${perfil.id}`}
                            perfil={perfil}
                            tipo={perfil.tipo}
                        />
                    ))}

                    {perfilesFiltrados.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-gray-400">
                            No hay perfiles que coincidan con la búsqueda.
                        </div>
                    )}
                </div>
            )}

            <ModalPerfil />
        </div>
    );
}

export default PerfilEstudiante;