import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    UserRound,
    X,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import api from "../../api/axios";

function EstudiantesPage() {
    const { token } = useAuth();

    const [estudiantes, setEstudiantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [busqueda, setBusqueda] = useState("");

    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        edad: "",
        sexo: "",
        nacionalidad: "",
        fecha_nacimiento: "",
        cedula: "",
        direccion: "",
        correo_electronico: "",
        telefono_movil: "",
        nivel_educativo: "",
        nombre_emergencia: "",
        telefono_emergencia: "",
        activo: true,
    });

    const fetchEstudiantes = async () => {
        try {
            setLoading(true);

            const response = await api.get("/estudiantes/");
            const data = response.data;

            setEstudiantes(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            Swal.fire("Error", "Error de conexión con el servidor", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchEstudiantes();
        }
    }, [token]);

    const resetForm = () => {
        setForm({
            nombre: "",
            apellido: "",
            edad: "",
            sexo: "",
            nacionalidad: "",
            fecha_nacimiento: "",
            cedula: "",
            direccion: "",
            correo_electronico: "",
            telefono_movil: "",
            nivel_educativo: "",
            nombre_emergencia: "",
            telefono_emergencia: "",
            activo: true,
        });

        setEditData(null);
    };

    const abrirCrear = () => {
        resetForm();
        setShowModal(true);
    };

    const abrirEditar = (estudiante) => {
        setEditData(estudiante);

        setForm({
            nombre: estudiante.nombre || "",
            apellido: estudiante.apellido || "",
            edad: estudiante.edad || "",
            sexo: estudiante.sexo || "",
            nacionalidad: estudiante.nacionalidad || "",
            fecha_nacimiento: estudiante.fecha_nacimiento || "",
            cedula: estudiante.cedula || "",
            direccion: estudiante.direccion || "",
            correo_electronico: estudiante.correo_electronico || "",
            telefono_movil: estudiante.telefono_movil || "",
            nivel_educativo: estudiante.nivel_educativo || "",
            nombre_emergencia: estudiante.nombre_emergencia || "",
            telefono_emergencia: estudiante.telefono_emergencia || "",
            activo: estudiante.activo ?? true,
        });

        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            edad: parseInt(form.edad),
        };

        try {
            if (editData) {
                await api.put(`/estudiantes/${editData.id}/`, payload);
            } else {
                await api.post("/estudiantes/", payload);
            }

            Swal.fire(
                "Correcto",
                editData ? "Estudiante actualizado correctamente" : "Estudiante registrado correctamente",
                "success"
            );

            setShowModal(false);
            resetForm();
            fetchEstudiantes();

        } catch (error) {
            const data = error.response?.data;

            const mensaje = data && typeof data === "object"
                ? Object.values(data).flat().join("\n")
                : "No se pudo guardar el estudiante";

            Swal.fire("Error", mensaje, "error");
        }
    };

    const eliminarEstudiante = async (estudiante) => {
        const confirm = await Swal.fire({
            title: "¿Eliminar estudiante?",
            text: `Se eliminará a ${estudiante.nombre} ${estudiante.apellido}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!confirm.isConfirmed) return;

        try {
            await api.delete(`/estudiantes/${estudiante.id}/`);

            Swal.fire("Eliminado", "Estudiante eliminado correctamente", "success");
            fetchEstudiantes();

        } catch (error) {
            Swal.fire(
                "Error",
                "No se pudo eliminar. Puede que el estudiante ya tenga matrícula relacionada.",
                "error"
            );
        }
    };

    const estudiantesFiltrados = estudiantes.filter((estudiante) => {
        const texto = `
            ${estudiante.nombre || ""}
            ${estudiante.apellido || ""}
            ${estudiante.cedula || ""}
            ${estudiante.correo_electronico || ""}
            ${estudiante.telefono_movil || ""}
        `.toLowerCase();

        return texto.includes(busqueda.toLowerCase());
    });

    const obtenerIniciales = (estudiante) => {
        const nombre = estudiante.nombre?.charAt(0) || "";
        const apellido = estudiante.apellido?.charAt(0) || "";
        return `${nombre}${apellido}`.toUpperCase() || "E";
    };

    const obtenerSexo = (sexo) => {
        if (sexo === "M") return "Masculino";
        if (sexo === "F") return "Femenino";
        return "No definido";
    };

    return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-5 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
            <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                        Estudiantes
                    </h1>

                    <p className="mt-1 max-w-2xl text-sm text-slate-500 md:text-base">
                        Registro de Estudiantes.
                    </p>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-500">
                        Total registrados
                    </p>
                    <p className="mt-2 text-3xl font-black text-slate-900">
                        {estudiantes.length}
                    </p>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-500">
                        Activos
                    </p>
                    <p className="mt-2 text-3xl font-black text-emerald-600">
                        {estudiantes.filter((estudiante) => estudiante.activo).length}
                    </p>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-500">
                        Resultado actual
                    </p>
                    <p className="mt-2 text-3xl font-black text-blue-600">
                        {estudiantesFiltrados.length}
                    </p>
                </div>
            </div>

            <div className="mb-6 rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                        <input
                            type="text"
                            placeholder="Buscar por nombre, cédula, correo o teléfono..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={abrirCrear}
                        className="cursor-pointer group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-7 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-emerald-500/30"
                    >
                        <Plus className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                        Nuevo estudiante
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="rounded-[28px] bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                    <p className="font-semibold text-slate-500">
                        Cargando estudiantes...
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200">
                    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">
                                Lista de estudiantes
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {estudiantesFiltrados.length} estudiante(s) encontrados
                            </p>
                        </div>

                        <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500">
                            Vista general
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                                    <th className="px-7 py-4 text-left">Nombre</th>
                                    <th className="px-5 py-4 text-left">Cédula</th>
                                    <th className="px-5 py-4 text-left">Teléfono</th>
                                    <th className="px-5 py-4 text-left">Nivel educativo</th>
                                    <th className="px-5 py-4 text-center">Estado</th>
                                    <th className="px-7 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {estudiantesFiltrados.length > 0 ? (
                                    estudiantesFiltrados.map((estudiante) => (
                                        <tr
                                            key={estudiante.id}
                                            className="group border-b border-slate-100 transition hover:bg-blue-50/40"
                                        >
                                            <td className="px-7 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-sm font-black text-slate-700">
                                                        {obtenerIniciales(estudiante)}
                                                    </div>

                                                    <div>
                                                        <p className="font-bold text-slate-900">
                                                            {estudiante.nombre} {estudiante.apellido}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                            {obtenerSexo(estudiante.sexo)} · {estudiante.edad || "Sin edad"} años
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                                {estudiante.cedula || "No registrado"}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {estudiante.telefono_movil || "No registrado"}
                                            </td>

                                            <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                                {estudiante.nivel_educativo || "No registrado"}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${
                                                        estudiante.activo
                                                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                                                            : "bg-red-50 text-red-700 ring-1 ring-red-100"
                                                    }`}
                                                >
                                                    {estudiante.activo ? (
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <XCircle className="h-3.5 w-3.5" />
                                                    )}

                                                    {estudiante.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>

                                            <td className="px-7 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => abrirEditar(estudiante)}
                                                        title="Editar estudiante"
                                                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-100"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarEstudiante(estudiante)}
                                                        title="Eliminar estudiante"
                                                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100 transition hover:-translate-y-0.5 hover:bg-red-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <td
                                        colSpan="7"
                                        className="px-7 py-12 text-center text-sm font-medium text-slate-400"
                                    >
                                        No hay estudiantes registrados.
                                    </td>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>

        {showModal && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 z-10 bg-white px-6 py-5 border-gray-100 flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {editData ? "Editar Estudiante" : "Nuevo Estudiante"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Complete los datos personales del estudiante.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="h-10 w-10 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 text-3xl leading-none transition"
                >
                    ×
                </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-90px)] px-6 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className=" border border-blue-50 rounded-2xl p-5">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            Datos personales
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Nombres *
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Ejemplo: Juan Carlos"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Apellidos *
                                </label>
                                <input
                                    type="text"
                                    name="apellido"
                                    placeholder="Ejemplo: Pérez López"
                                    value={form.apellido}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Edad *
                                </label>
                                <input
                                    type="number"
                                    name="edad"
                                    placeholder="Edad"
                                    value={form.edad}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Sexo *
                                </label>
                                <select
                                    name="sexo"
                                    value={form.sexo}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Seleccione sexo</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Nacionalidad *
                                </label>
                                <input
                                    type="text"
                                    name="nacionalidad"
                                    placeholder="Nacionalidad"
                                    value={form.nacionalidad}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Fecha de nacimiento *
                                </label>
                                <input
                                    type="date"
                                    name="fecha_nacimiento"
                                    value={form.fecha_nacimiento}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Cédula *
                                </label>
                                <input
                                    type="text"
                                    name="cedula"
                                    placeholder="Número de cédula"
                                    value={form.cedula}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Nivel educativo *
                                </label>
                                <select
                                    name="nivel_educativo"
                                    value={form.nivel_educativo}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Seleccione nivel educativo</option>
                                    <option value="Primaria">Primaria</option>
                                    <option value="Secundaria">Secundaria</option>
                                    <option value="Universidad">Universidad</option>
                                    <option value="Profesional">Profesional</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-2xl p-5">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            Contacto
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Correo electrónico *
                                </label>
                                <input
                                    type="email"
                                    name="correo_electronico"
                                    placeholder="correo@ejemplo.com"
                                    value={form.correo_electronico}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Teléfono móvil *
                                </label>
                                <input
                                    type="text"
                                    name="telefono_movil"
                                    placeholder="Número de teléfono"
                                    value={form.telefono_movil}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Dirección *
                                </label>
                                <textarea
                                    name="direccion"
                                    placeholder="Dirección completa del estudiante"
                                    value={form.direccion}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    rows="3"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border border-orange-100 rounded-2xl p-5">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            Contacto de emergencia
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Nombre del contacto *
                                </label>
                                <input
                                    type="text"
                                    name="nombre_emergencia"
                                    placeholder="Nombre de la persona de emergencia"
                                    value={form.nombre_emergencia}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Teléfono de emergencia *
                                </label>
                                <input
                                    type="text"
                                    name="telefono_emergencia"
                                    placeholder="Número de emergencia"
                                    value={form.telefono_emergencia}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-4">
                        <div>
                            <p className="font-semibold text-gray-800">
                                Estado del estudiante
                            </p>
                            <p className="text-sm text-gray-500">
                                Si está activo, podrá usarse para matrícula y demás procesos.
                            </p>
                        </div>

                        <label className="flex items-center gap-3 text-gray-700 cursor-pointer">
                            <input
                                type="checkbox"
                                name="activo"
                                checked={form.activo}
                                onChange={handleChange}
                                className="h-5 w-5 accent-blue-600"
                            />
                            <span className="font-semibold">
                                Activo
                            </span>
                        </label>
                    </div>

                    <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition font-semibold"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-sm"
                        >
                            {editData ? "Actualizar estudiante" : "Guardar estudiante"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
)}
        </div>
    );
}

export default EstudiantesPage;
