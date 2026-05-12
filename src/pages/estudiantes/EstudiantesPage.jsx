import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

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
        en_caso_de_emergencia: "",
        telefono_emergencia: "",
        activo: true,
    });

    const fetchEstudiantes = async () => {
        try {
            setLoading(true);

            const response = await fetch("http://127.0.0.1:8000/api/estudiantes/", {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setEstudiantes(Array.isArray(data) ? data : []);
            } else {
                Swal.fire("Error", "No se pudieron cargar los estudiantes", "error");
            }
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
            en_caso_de_emergencia: "",
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
            en_caso_de_emergencia: estudiante.en_caso_de_emergencia || "",
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

        const url = editData
            ? `http://127.0.0.1:8000/api/estudiantes/${editData.id}/`
            : "http://127.0.0.1:8000/api/estudiantes/";

        const method = editData ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire(
                    "Correcto",
                    editData ? "Estudiante actualizado correctamente" : "Estudiante registrado correctamente",
                    "success"
                );

                setShowModal(false);
                resetForm();
                fetchEstudiantes();
            } else {
                const mensaje = typeof data === "object"
                    ? Object.values(data).flat().join("\n")
                    : "No se pudo guardar el estudiante";

                Swal.fire("Error", mensaje, "error");
            }
        } catch (error) {
            Swal.fire("Error", "Error de conexión con el servidor", "error");
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
            const response = await fetch(
                `http://127.0.0.1:8000/api/estudiantes/${estudiante.id}/`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (response.ok) {
                Swal.fire("Eliminado", "Estudiante eliminado correctamente", "success");
                fetchEstudiantes();
            } else {
                Swal.fire(
                    "Error",
                    "No se pudo eliminar. Puede que el estudiante ya tenga matrícula relacionada.",
                    "error"
                );
            }
        } catch (error) {
            Swal.fire("Error", "Error de conexión con el servidor", "error");
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

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Estudiantes
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Registro de estudiantes antes de realizar la matrícula
                    </p>
                </div>

                <button
                    onClick={abrirCrear}
                    className="bg-blue-600 text-white px-5 py-3 rounded-2xl shadow hover:bg-blue-700 transition"
                >
                    Nuevo Estudiante
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
                <input
                    type="text"
                    placeholder="Buscar por nombre, cédula, correo o teléfono..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
                    Cargando estudiantes...
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Lista de estudiantes
                            </h2>
                            <p className="text-sm text-gray-500">
                                {estudiantesFiltrados.length} estudiante(s) encontrados
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                                    <th className="p-4 text-left">Nombre</th>
                                    <th className="p-4 text-left">Cédula</th>
                                    <th className="p-4 text-left">Teléfono</th>
                                    <th className="p-4 text-left">Correo</th>
                                    <th className="p-4 text-left">Nivel educativo</th>
                                    <th className="p-4 text-center">Estado</th>
                                    <th className="p-4 text-center">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {estudiantesFiltrados.length > 0 ? (
                                    estudiantesFiltrados.map((estudiante) => (
                                        <tr
                                            key={estudiante.id}
                                            className="border-b border-gray-100 hover:bg-blue-50 transition"
                                        >
                                            <td className="p-4">
                                                <p className="font-semibold text-gray-800">
                                                    {estudiante.nombre} {estudiante.apellido}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {estudiante.sexo === "M" ? "Masculino" : "Femenino"} · {estudiante.edad} años
                                                </p>
                                            </td>

                                            <td className="p-4 text-gray-700">
                                                {estudiante.cedula}
                                            </td>

                                            <td className="p-4 text-gray-700">
                                                {estudiante.telefono_movil}
                                            </td>

                                            <td className="p-4 text-gray-700">
                                                {estudiante.correo_electronico}
                                            </td>

                                            <td className="p-4 text-gray-700">
                                                {estudiante.nivel_educativo}
                                            </td>

                                            <td className="p-4 text-center">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        estudiante.activo
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {estudiante.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => abrirEditar(estudiante)}
                                                        className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        onClick={() => eliminarEstudiante(estudiante)}
                                                        className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-400">
                                            No hay estudiantes registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editData ? "Editar Estudiante" : "Nuevo Estudiante"}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Complete los datos personales del estudiante
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-red-500 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Nombres"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />

                                <input
                                    type="text"
                                    name="apellido"
                                    placeholder="Apellidos"
                                    value={form.apellido}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />

                                <input
                                    type="number"
                                    name="edad"
                                    placeholder="Edad"
                                    value={form.edad}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />

                                <select
                                    name="sexo"
                                    value={form.sexo}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Seleccione sexo</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>

                                <input
                                    type="text"
                                    name="nacionalidad"
                                    placeholder="Nacionalidad"
                                    value={form.nacionalidad}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />

                                <input
                                    type="date"
                                    name="fecha_nacimiento"
                                    value={form.fecha_nacimiento}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />

                                <input
                                    type="text"
                                    name="cedula"
                                    placeholder="Cédula"
                                    value={form.cedula}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />

                                <input
                                    type="email"
                                    name="correo_electronico"
                                    placeholder="Correo electrónico"
                                    value={form.correo_electronico}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />

                                <input
                                    type="text"
                                    name="telefono_movil"
                                    placeholder="Teléfono móvil"
                                    value={form.telefono_movil}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />

                                <select
                                    name="nivel_educativo"
                                    value={form.nivel_educativo}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Seleccione nivel educativo</option>
                                    <option value="Primaria">Primaria</option>
                                    <option value="Secundaria">Secundaria</option>
                                    <option value="Universidad">Universidad</option>
                                    <option value="Profesional">Profesional</option>
                                </select>

                                <input
                                    type="text"
                                    name="en_caso_de_emergencia"
                                    placeholder="Contacto de emergencia"
                                    value={form.en_caso_de_emergencia}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />

                                <input
                                    type="text"
                                    name="telefono_emergencia"
                                    placeholder="Teléfono de emergencia"
                                    value={form.telefono_emergencia}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <textarea
                                name="direccion"
                                placeholder="Dirección"
                                value={form.direccion}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                required
                            />

                            <label className="flex items-center gap-2 text-gray-700">
                                <input
                                    type="checkbox"
                                    name="activo"
                                    checked={form.activo}
                                    onChange={handleChange}
                                />
                                Estudiante activo
                            </label>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 border rounded-xl text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                                >
                                    {editData ? "Actualizar" : "Guardar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EstudiantesPage;
