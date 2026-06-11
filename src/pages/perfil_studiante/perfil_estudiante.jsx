import { useEffect, useMemo, useState, useDeferredValue } from "react";
import {
    Search,
    Eye,
    UserRound,
} from "lucide-react";
import api from "../../api/axios";

const LIMITE_POR_PAGINA = 30;

function PerfilEstudiante() {
    const [loading, setLoading] = useState(true);
    const [rol, setRol] = useState("");
    const [miPerfil, setMiPerfil] = useState(null);
    const [instructor, setInstructor] = useState(null);
    const [instructores, setInstructores] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);
    const [pagina, setPagina] = useState(1);

    const busquedaDiferida = useDeferredValue(busqueda);

    const cargarPerfiles = async () => {
        try {
            setLoading(true);

            const response = await api.get("/perfiles/");
            const data = response.data;

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

    useEffect(() => {
        setPagina(1);
    }, [busquedaDiferida, rol]);

    const perfilesFiltrados = useMemo(() => {
        const texto = busquedaDiferida.trim().toLowerCase();

        const listaInstructores = instructores
            .filter((i) => {
                if (!texto) return true;

                const contenido = `
                    ${i.nombre || ""}
                    ${i.apellido || ""}
                    ${i.telefono || ""}
                    ${i.categoria || ""}
                `.toLowerCase();

                return contenido.includes(texto);
            })
            .map((i) => ({ ...i, tipo: "instructor" }));

        const listaEstudiantes = estudiantes
            .filter((e) => {
                if (!texto) return true;

                const contenido = `
                    ${e.nombre || ""}
                    ${e.apellido || ""}
                    ${e.cedula || ""}
                    ${e.telefono || ""}
                    ${e.correo || ""}
                `.toLowerCase();

                return contenido.includes(texto);
            })
            .map((e) => ({ ...e, tipo: "estudiante" }));

        return [...listaInstructores, ...listaEstudiantes];
    }, [busquedaDiferida, instructores, estudiantes]);

    const estudiantesFiltrados = useMemo(() => {
        return perfilesFiltrados.filter((p) => p.tipo === "estudiante");
    }, [perfilesFiltrados]);

    const perfilesVisibles = useMemo(() => {
        return perfilesFiltrados.slice(0, pagina * LIMITE_POR_PAGINA);
    }, [perfilesFiltrados, pagina]);

    const estudiantesVisibles = useMemo(() => {
        return estudiantesFiltrados.slice(0, pagina * LIMITE_POR_PAGINA);
    }, [estudiantesFiltrados, pagina]);

    const hayMasPerfiles = perfilesVisibles.length < perfilesFiltrados.length;
    const hayMasEstudiantes = estudiantesVisibles.length < estudiantesFiltrados.length;

    const PerfilCard = ({ perfil, tipo }) => {
        const esInstructor = tipo === "instructor";
        const nombreCompleto = `${perfil?.nombre || ""} ${perfil?.apellido || ""}`.trim();

        return (
            <div
                onClick={() => setPerfilSeleccionado({ ...perfil, tipo })}
                className="group grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md md:grid-cols-[auto_minmax(220px,1.2fr)_110px_auto] lg:grid-cols-[auto_minmax(240px,1.2fr)_110px_140px_auto] xl:grid-cols-[auto_minmax(260px,1.2fr)_120px_150px_minmax(220px,1fr)_44px]"
            >
                <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${
                        esInstructor ? "bg-green-50" : "bg-blue-50"
                    }`}
                >
                    {perfil?.foto ? (
                        <img
                            src={perfil.foto}
                            alt={nombreCompleto || "Perfil"}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span
                            className={`text-2xl font-black ${
                                esInstructor ? "text-green-600" : "text-blue-600"
                            }`}
                        >
                            {(perfil?.nombre || "P").charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>

                <div className="min-w-0">
                    <h2 className="truncate text-[15px] font-black text-slate-900">
                        {nombreCompleto || "Sin nombre"}
                    </h2>

                    <div className="mt-1 md:hidden">
                        <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black ${
                                esInstructor
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                            }`}
                        >
                            {esInstructor ? "Instructor" : "Estudiante"}
                        </span>
                    </div>
                </div>

                <span
                    className={`hidden justify-center rounded-full px-3 py-1 text-xs font-black md:inline-flex ${
                        esInstructor
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                    }`}
                >
                    {esInstructor ? "Instructor" : "Estudiante"}
                </span>

                <div className="hidden truncate text-sm font-semibold text-slate-500 lg:block">
                    {perfil?.telefono || "Sin teléfono"}
                </div>

                <div className="hidden truncate text-sm font-semibold text-slate-500 xl:block">
                    {perfil?.correo || perfil?.categoria || "Sin correo"}
                </div>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setPerfilSeleccionado({ ...perfil, tipo });
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    title="Ver perfil"
                >
                    <Eye size={18} />
                </button>
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
                                            loading="lazy"
                                            decoding="async"
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
                                <InfoItem titulo="Categoría vehicular" valor={perfilSeleccionado.categoria || "No asignada"} />
                                <InfoItem titulo="Dirección" valor={perfilSeleccionado.direccion || "No registrada"} />
                                <InfoItem titulo="Centro de trabajo" valor={perfilSeleccionado.centro_trabajo || "No registrado"} />
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
        <div className="min-h-screen bg-[#f7f9fd] px-4 py-5 md:px-6 lg:px-8">
            <div className="mb-8 flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
                    <UserRound size={34} />
                </div>

                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-950">
                        Perfiles
                    </h1>

                    <p className="mt-2 text-base font-medium text-slate-500">
                        Consulta la información registrada.
                    </p>
                </div>
            </div>

            {(rol === "admin" || rol === "secretaria" || rol === "instructor") && (
                <div className="mb-6 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex h-14 items-center rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                        <Search className="shrink-0 text-slate-400" size={21} />

                        <input
                            type="text"
                            placeholder="Buscar por nombre, cédula, teléfono, correo o categoría..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="h-full w-full bg-transparent pl-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                        />
                    </div>
                </div>
            )}

            {rol === "estudiante" && (
                <div className="space-y-3">
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

                            <div className="space-y-3">
                                <PerfilCard perfil={miPerfil} tipo="instructor" />
                            </div>
                        </div>
                    )}

                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Mis estudiantes asignados
                        </h2>

                        <div className="space-y-3">
                            {estudiantesVisibles.map((perfil) => (
                                <PerfilCard
                                    key={`estudiante-${perfil.id}`}
                                    perfil={perfil}
                                    tipo="estudiante"
                                />
                            ))}

                            {estudiantesFiltrados.length === 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-gray-400">
                                    No hay estudiantes para mostrar.
                                </div>
                            )}

                            {hayMasEstudiantes && (
                                <button
                                    type="button"
                                    onClick={() => setPagina((prev) => prev + 1)}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm transition hover:bg-blue-50 hover:text-blue-600"
                                >
                                    Ver más estudiantes
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {(rol === "admin" || rol === "secretaria") && (
                <div className="space-y-3">
                    {perfilesVisibles.map((perfil) => (
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

                    {hayMasPerfiles && (
                        <button
                            type="button"
                            onClick={() => setPagina((prev) => prev + 1)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 shadow-sm transition hover:bg-blue-50 hover:text-blue-600"
                        >
                            Ver más perfiles
                        </button>
                    )}
                </div>
            )}

            <ModalPerfil />
        </div>
    );
}

export default PerfilEstudiante;