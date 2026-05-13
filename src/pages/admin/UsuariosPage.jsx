// src/pages/admin/UsuariosPage.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

function UsuariosPage() {
    const { token, user: usuarioActual } = useAuth();

    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [matriculas, setMatriculas] = useState([]);
    const [busquedaMatricula, setBusquedaMatricula] = useState("");
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);

    const [form, setForm] = useState({
        username: "",
        password: "",
        confirm_password: "",
        email: "",
        first_name: "",
        last_name: "",
        rol: "",
        matricula_id: "",
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
            const response = await fetch("http://127.0.0.1:8000/api/usuarios/", {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsuarios(Array.isArray(data) ? data : []);
            } else {
                console.error("Error cargando usuarios");
            }
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/roles/", {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();

                const colores = {
                    admin: "bg-red-100 text-red-700",
                    instructor: "bg-green-100 text-green-700",
                    estudiante: "bg-blue-100 text-blue-700",
                    secretaria: "bg-yellow-100 text-yellow-700",
                    cajero: "bg-purple-100 text-purple-700",
                    consulta: "bg-gray-100 text-gray-700",
                };

                const rolesFormateados = (Array.isArray(data) ? data : []).map(r => {
                    const nombre = r.nombre || r.label || r.value || "";
                    const value = nombre.toLowerCase();

                    return {
                        id: r.id,
                        value,
                        label: nombre || "Sin rol",
                        color: colores[value] || "bg-gray-100 text-gray-700",
                    };
                });

                setRoles(rolesFormateados);
            } else {
                console.error("Error cargando roles");
            }
        } catch (error) {
            console.error("Error cargando roles:", error);
        }
    };

    const fetchMatriculas = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/matricula/", {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMatriculas(Array.isArray(data) ? data : []);
            } else {
                console.error("Error cargando matrículas");
            }
        } catch (error) {
            console.error("Error cargando matrículas:", error);
        }
    };

    const resetForm = () => {
        setForm({
            username: "",
            password: "",
            confirm_password: "",
            email: "",
            first_name: "",
            last_name: "",
            rol: "",
            matricula_id: "",
        });

        setEditData(null);
        setBusquedaMatricula("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirm_password) {
            Swal.fire("Error", "Las contraseñas no coinciden", "error");
            return;
        }

        const userData = {
            username: form.username,
            email: form.email,
            first_name: form.first_name,
            last_name: form.last_name,
            rol: form.rol,
        };

        if (form.rol === "estudiante" && form.matricula_id) {
            userData.matricula_id = parseInt(form.matricula_id);
        }

        if (form.password) {
            userData.password = form.password;
        }

        const url = editData
            ? `http://127.0.0.1:8000/api/usuarios/${editData.id}/`
            : "http://127.0.0.1:8000/api/usuarios/";

        const method = editData ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                Swal.fire(
                    "Éxito",
                    editData ? "Usuario actualizado" : "Usuario creado",
                    "success"
                );

                fetchUsuarios();
                setShowModal(false);
                resetForm();
            } else {
                const data = await response.json();
                const mensaje = typeof data === "object"
                    ? Object.values(data).flat().join("\n")
                    : "No se pudo guardar el usuario";

                Swal.fire("Error", mensaje, "error");
            }
        } catch (error) {
            Swal.fire("Error", "Error de conexión", "error");
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
            const response = await fetch(`http://127.0.0.1:8000/api/usuarios/${id}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            if (response.ok) {
                Swal.fire("Eliminado", "Usuario eliminado correctamente", "success");
                fetchUsuarios();
            } else {
                Swal.fire("Error", "No se pudo eliminar el usuario", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Error de conexión", "error");
        }
    };

    useEffect(() => {
        if (!token) return;

        fetchUsuarios();
        fetchRoles();
        fetchMatriculas();
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
                    className="bg-blue-600 text-white px-5 py-3 rounded-2xl shadow hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    Nuevo Usuario
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
                                                    <th className="p-4 text-left">Email</th>
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
                                                                {u.first_name || u.last_name
                                                                    ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                                                                    : "-"}
                                                            </td>

                                                            <td className="p-4 text-gray-600">
                                                                {u.email || "-"}
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
                                                                                email: u.email || "",
                                                                                first_name: u.first_name || "",
                                                                                last_name: u.last_name || "",
                                                                                rol: rolUsuario,
                                                                                matricula_id: "",
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editData ? "Editar Usuario" : "Nuevo Usuario"}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Complete la información de la cuenta
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

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Usuario"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="password"
                                    placeholder={editData ? "Nueva contraseña opcional" : "Contraseña"}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required={!editData}
                                />

                                <input
                                    type="password"
                                    placeholder="Confirmar contraseña"
                                    value={form.confirm_password}
                                    onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required={!editData && form.password}
                                />
                            </div>

                            <input
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Nombres"
                                    value={form.first_name}
                                    onChange={e => setForm({ ...form, first_name: e.target.value })}
                                    required={form.rol === "instructor"}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <input
                                    type="text"
                                    placeholder="Apellidos"
                                    value={form.last_name}
                                    onChange={e => setForm({ ...form, last_name: e.target.value })}
                                    required={form.rol === "instructor"}
                                    className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <select
                                value={form.rol}
                                onChange={e => {
                                    setForm({
                                        ...form,
                                        rol: e.target.value,
                                        matricula_id: "",
                                    });
                                    setBusquedaMatricula("");
                                }}
                                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                            {form.rol === "estudiante" && !editData && (
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar matrícula por nombre o cédula..."
                                        value={busquedaMatricula}
                                        onChange={e => {
                                            setBusquedaMatricula(e.target.value);
                                            setForm({ ...form, matricula_id: "" });
                                        }}
                                        className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required={!form.matricula_id}
                                    />

                                    {busquedaMatricula && !form.matricula_id && (
                                        <div className="absolute z-10 w-full bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto mt-1">
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
                                                        className="p-3 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-b-0"
                                                    >
                                                        <p className="font-semibold text-gray-800">
                                                            {m.estudiante_nombre || "Sin nombre"}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Cédula: {m.estudiante_cedula || "N/A"}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Plan: {m.plan_nombre || "N/A"}
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
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UsuariosPage;
