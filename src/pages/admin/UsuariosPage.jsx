// src/pages/admin/UsuariosPage.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import api from "../../api/axios";

function UsuariosPage() {
    const { token, user: usuarioActual } = useAuth();

    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [matriculas, setMatriculas] = useState([]);
    const [busquedaMatricula, setBusquedaMatricula] = useState("");
    const [instructores, setInstructores] = useState([]);
    const [busquedaInstructor, setBusquedaInstructor] = useState("");
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);

    const [form, setForm] = useState({
        username: "",
        password: "",
        confirm_password: "",
        first_name: "",
        last_name: "",
        rol: "",
        matricula_id: "",
        instructor_id: "",
    });

    const normalizarRol = (rol) => {
        if (!rol) return "";

        if (typeof rol === "string") {
            return rol.toLowerCase();
        }

        if (typeof rol === "object") {
            return (rol.nombre || rol.label || rol.value || "").toLowerCase();
        }

        return "";
    };

    const getRoleInfo = (rol) => {
        const rolNormalizado = normalizarRol(rol);

        return roles.find(r => r.value === rolNormalizado) || {
            label: rolNormalizado || "Sin rol",
            color: "bg-gray-100 text-gray-700",
        };
    };

    const usuariosPorRol = roles.reduce((acc, rol) => {
        const valorRol = rol.value || "";

        acc[valorRol] = usuarios.filter(u => {
            const rolUsuario = normalizarRol(u.rol);
            return rolUsuario === valorRol;
        });

        return acc;
    }, {});

    const fetchUsuarios = async () => {
        try {
            const response = await api.get("/usuarios/");
            const data = response.data;
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get("/roles/");
            const data = response.data;

            console.log("ROLES DESDE API:", data);

            const colores = {
                admin: "bg-red-100 text-red-700",
                instructor: "bg-green-100 text-green-700",
                estudiante: "bg-blue-100 text-blue-700",
            };

            const rolesFormateados = (Array.isArray(data) ? data : []).map(r => {
                const nombre = r.nombre || r.label || r.value || "";
                const value = nombre.toLowerCase();

                return {
                    id: r.id,
                    value,
                    label: nombre
                        ? nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase()
                        : "Sin rol",
                    color: colores[value] || "bg-gray-100 text-gray-700",
                };
            });

            rolesFormateados.sort((a, b) => {
                const orden = {
                    admin: 1,
                    instructor: 2,
                    estudiante: 3,
                };

                return orden[a.value] - orden[b.value];
            });

            setRoles(rolesFormateados);
        } catch (error) {
            console.error("Error cargando roles:", error);
        }
    };

    const fetchMatriculas = async () => {
        try {
            const response = await api.get("/matricula/");
            const data = response.data;
            setMatriculas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando matrículas:", error);
        }
    };

    const fetchInstructores = async () => {
        try {
            const response = await api.get("/instructores/");
            const data = response.data;
            setInstructores(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error("Error cargando instructores:", error);
        }
    };

    const resetForm = () => {
        setForm({
            username: "",
            password: "",
            confirm_password: "",
            first_name: "",
            last_name: "",
            rol: "",
            matricula_id: "",
            instructor_id: "",
        });

        setEditData(null);
        setBusquedaMatricula("");
        setBusquedaInstructor("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirm_password) {
            Swal.fire("Error", "Las contraseñas no coinciden", "error");
            return;
        }

        const userData = {
            username: form.username,
            first_name: form.first_name,
            last_name: form.last_name,
            rol: form.rol,
        };

        if (form.rol === "estudiante" && form.matricula_id) {
            userData.matricula_id = parseInt(form.matricula_id);
        }

        if (form.rol === "instructor" && form.instructor_id) {
            userData.instructor_id = parseInt(form.instructor_id);
        }

        if (form.password) {
            userData.password = form.password;
        }

        try {
            if (editData) {
                await api.patch(`/usuarios/${editData.id}/`, userData);
            } else {
                await api.post("/usuarios/", userData);
            }

            Swal.fire(
                "Éxito",
                editData ? "Usuario actualizado" : "Usuario creado",
                "success"
            );

            fetchUsuarios();
            setShowModal(false);
            resetForm();

        } catch (error) {
            const data = error.response?.data;

            const mensaje = data && typeof data === "object"
                ? Object.values(data).flat().join("\n")
                : "Error de conexión";

            Swal.fire("Error", mensaje, "error");
        }
    };

    const eliminarUsuario = async (id, username) => {
        if (id === usuarioActual?.id) {
            Swal.fire("Error", "No puedes eliminar tu propio usuario", "error");
            return;
        }

        const confirm = await Swal.fire({
            title: "¿Eliminar?",
            text: `¿Deseas eliminar a ${username}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!confirm.isConfirmed) return;

        try {
            await api.delete(`/usuarios/${id}/`);

            Swal.fire("Eliminado", "Usuario eliminado correctamente", "success");
            fetchUsuarios();

        } catch (error) {
            Swal.fire("Error", "No se pudo eliminar el usuario", "error");
        }
    };

    useEffect(() => {
        if (!token) return;

        fetchUsuarios();
        fetchRoles();
        fetchMatriculas();
        fetchInstructores();
    }, [token]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">
                        Gestión de Usuarios
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Administración de cuentas clasificadas por rol
                    </p>
                </div>

               <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="relative group overflow-hidden px-20 h-11 rounded-3xl bg-green-500 text-white flex items-center gap-2 transition-all duration-300 hover:bg-green-600 justify-end hover:cursor-pointer"
                >
                    <span className="absolute top-0 left-[-75%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 group-hover:left-[125%] transition-all duration-700"></span>

                    <span className="relative z-10 flex items-center gap-2">
                        Nuevo Usuario
                    </span>
                </button>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
                    Cargando usuarios...
                </div>
            ) : (
                <div className="space-y-8">
                    {roles.map(rol => {
                        const lista = usuariosPorRol[rol.value] || [];

                        return (
                            <div
                                key={rol.value}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                            >
                                <div className="px-6 py-4 border-b flex items-center justify-between border-gray-200">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">
                                            {rol.label}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {lista.length} usuario(s) registrados
                                        </p>
                                    </div>

                                    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${rol.color}`}>
                                        {rol.label}
                                    </span>
                                </div>

                                {lista.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-white text-gray-500 text-sm border-gray-300">
                                                    <th className="p-4 text-left">Usuario</th>
                                                    <th className="p-4 text-left">Nombre completo</th>
                                                    <th className="p-4 text-left">Rol</th>
                                                    <th className="p-4 text-center">Acciones</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {lista.map(u => {
                                                    const roleInfo = getRoleInfo(u.rol);

                                                    return (
                                                        <tr
                                                            key={u.id}
                                                            className="border-gray-300 last:border-b-0 hover:bg-blue-50 transition"
                                                        >
                                                            <td className="p-4">
                                                                <div className="font-semibold text-gray-800">
                                                                    {u.username}
                                                                </div>

                                                                {u.id === usuarioActual?.id && (
                                                                    <span className="text-xs text-blue-600">
                                                                        Usuario actual
                                                                    </span>
                                                                )}
                                                            </td>

                                                            <td className="p-4 text-gray-700">
                                                                {normalizarRol(u.rol) === "estudiante"
                                                                    ? (u.estudiante_nombre || "-")
                                                                    : normalizarRol(u.rol) === "instructor"
                                                                    ? (u.instructor_nombre || "-")
                                                                    : (u.first_name || u.last_name
                                                                        ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                                                                        : "-")}
                                                            </td>

                                                            <td className="p-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleInfo.color}`}>
                                                                    {roleInfo.label}
                                                                </span>
                                                            </td>

                                                            <td className="p-4">
                                                                <div className="flex justify-center gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            const rolUsuario = normalizarRol(u.rol);

                                                                            setEditData(u);
                                                                            setForm({
                                                                                username: u.username || "",
                                                                                password: "",
                                                                                confirm_password: "",
                                                                                first_name: u.first_name || "",
                                                                                last_name: u.last_name || "",
                                                                                rol: rolUsuario,
                                                                                matricula_id: "",
                                                                                instructor_id: "",
                                                                            });

                                                                            setShowModal(true);
                                                                        }}
                                                                        className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                                                                    >
                                                                        Editar
                                                                    </button>

                                                                    <button
                                                                        onClick={() => eliminarUsuario(u.id, u.username)}
                                                                        className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-gray-400">
                                        No hay usuarios con este rol.
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

           {showModal && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 z-10 bg-gradient-to-r from-yellow-600 to-yellow-600 px-6 py-5 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        {editData ? "Editar Usuario" : "Nuevo Usuario"}
                    </h2>
                    <p className="text-sm text-blue-100 mt-1">
                        Complete la información de la cuenta
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="h-10 w-10 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 text-2xl transition hover:cursor-pointer"
                >
                    ×
                </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-88px)] p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            Datos de acceso
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Usuario *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nombre de usuario"
                                    value={form.username}
                                    onChange={e => setForm({ ...form, username: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        {editData ? "Nueva contraseña" : "Contraseña *"}
                                    </label>
                                    <input
                                        type="password"
                                        placeholder={editData ? "Opcional" : "Contraseña"}
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required={!editData}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Confirmar contraseña
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Confirmar contraseña"
                                        value={form.confirm_password}
                                        onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required={!editData && form.password}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            Rol del usuario
                        </h3>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Rol *
                            </label>
                            <select
                                value={form.rol}
                                onChange={e => {
                                    setForm({
                                        ...form,
                                        rol: e.target.value,
                                        matricula_id: "",
                                        instructor_id: "",
                                    });
                                    setBusquedaMatricula("");
                                    setBusquedaInstructor("");
                                }}
                                className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="" disabled>
                                    Selecciona un rol
                                </option>

                                {roles.map(r => (
                                    <option key={r.id} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {form.rol !== "estudiante" && form.rol !== "instructor" && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                Información personal
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Nombres
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nombres"
                                        value={form.first_name}
                                        onChange={e => setForm({ ...form, first_name: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Apellidos
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Apellidos"
                                        value={form.last_name}
                                        onChange={e => setForm({ ...form, last_name: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {form.rol === "estudiante" && !editData && (
                        <div className="relative bg-green-50 border border-green-100 rounded-2xl p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                Vincular matrícula
                            </h3>

                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Buscar matrícula *
                            </label>

                            <input
                                type="text"
                                placeholder="Buscar matrícula por nombre o cédula..."
                                value={busquedaMatricula}
                                onChange={e => {
                                    setBusquedaMatricula(e.target.value);
                                    setForm({ ...form, matricula_id: "" });
                                }}
                                className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                required={!form.matricula_id}
                            />

                            {busquedaMatricula && !form.matricula_id && (
                                <div className="absolute z-10 left-5 right-5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto mt-2">
                                    {matriculas
                                        .filter(m => {
                                            const texto = `
                                                ${m.estudiante_nombre || ""}
                                                ${m.estudiante_cedula || ""}
                                                ${m.plan_nombre || ""}
                                            `.toLowerCase();

                                            return texto.includes(busquedaMatricula.toLowerCase());
                                        })
                                        .map(m => (
                                            <div
                                                key={m.id}
                                                onClick={() => {
                                                    setForm({ ...form, matricula_id: m.id });
                                                    setBusquedaMatricula(
                                                        `${m.estudiante_nombre || "Estudiante"} - ${m.estudiante_cedula || "Sin cédula"}`
                                                    );
                                                }}
                                                className="p-3 hover:bg-green-50 cursor-pointer text-sm border-b last:border-b-0"
                                            >
                                                <p className="font-semibold text-gray-800">
                                                    {m.estudiante_nombre || "Sin nombre"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Cédula: {m.estudiante_cedula || "N/A"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Estado: {m.estado || "N/A"}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {form.rol === "instructor" && !editData && (
                        <div className="relative bg-purple-50 border border-purple-100 rounded-2xl p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                Vincular instructor
                            </h3>

                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Buscar instructor *
                            </label>

                            <input
                                type="text"
                                placeholder="Buscar instructor por nombre..."
                                value={busquedaInstructor}
                                onChange={e => {
                                    setBusquedaInstructor(e.target.value);
                                    setForm({ ...form, instructor_id: "" });
                                }}
                                className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                required={!form.instructor_id}
                            />

                            {busquedaInstructor && !form.instructor_id && (
                                <div className="absolute z-10 left-5 right-5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto mt-2">
                                    {instructores
                                        .filter(i => {
                                            const texto = `
                                                ${i.nombre || ""}
                                                ${i.apellido || ""}
                                                ${i.nombre_completo || ""}
                                                ${i.numero_telefono || ""}
                                            `.toLowerCase();

                                            return texto.includes(busquedaInstructor.toLowerCase());
                                        })
                                        .map(i => (
                                            <div
                                                key={i.id}
                                                onClick={() => {
                                                    setForm({ ...form, instructor_id: i.id });
                                                    setBusquedaInstructor(
                                                        i.nombre_completo ||
                                                        `${i.nombre || ""} ${i.apellido || ""}`.trim()
                                                    );
                                                }}
                                                className="p-3 hover:bg-purple-50 cursor-pointer text-sm border-b last:border-b-0"
                                            >
                                                <p className="font-semibold text-gray-800">
                                                    {i.nombre_completo || `${i.nombre || ""} ${i.apellido || ""}`.trim()}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    Teléfono: {i.numero_telefono || "N/A"}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    Categoría: {i.categoria_nombre || "N/A"}
                                                </p>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition font-semibold hover:cursor-pointer"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition font-semibold shadow-sm hover:cursor-pointer"
                        >
                            Guardar
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

export default UsuariosPage;
