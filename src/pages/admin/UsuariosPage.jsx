// src/pages/admin/UsuariosPage.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import api from "../../api/axios";
import {
    FaUsers,
    FaUserShield,
    FaChalkboardTeacher,
    FaUserGraduate,
} from "react-icons/fa";

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
            setLoading(true);

            let url = "/usuarios/";
            let todosLosUsuarios = [];

            while (url) {
                console.log("Cargando usuarios desde:", url);

                const response = await api.get(url);
                const data = response.data;

                console.log("RESPUESTA USUARIOS:", data);

                if (Array.isArray(data)) {
                    todosLosUsuarios = data;
                    url = null;
                } else {
                    todosLosUsuarios = [
                        ...todosLosUsuarios,
                        ...(data.results || [])
                    ];

                    if (data.next) {
                        const nextUrl = new URL(data.next);
                        url = `${nextUrl.pathname.replace("/api", "")}${nextUrl.search}`;
                    } else {
                        url = null;
                    }
                }
            }

            console.log("TODOS LOS USUARIOS CARGADOS:", todosLosUsuarios);
            console.log("TOTAL ESTUDIANTES:", todosLosUsuarios.filter(u =>
                String(u.rol || u.rol_nombre || "").toLowerCase() === "estudiante"
            ));

            setUsuarios(todosLosUsuarios);
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
            setMatriculas(Array.isArray(data) ? data : data.results || []);
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
                await api.put(`/usuarios/${editData.id}/`, userData);
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

    const getRolVisual = (rolValue) => {
        const rol = normalizarRol(rolValue);

        const estilos = {
        admin: {
            Icon: FaUserShield,
            titulo: "Admin",
            descripcion: "Cuentas con permisos de administración",
            subtituloFila: "Cuenta de administrador",
            card: "border-red-100 bg-red-50/60",
            cardIcon: "bg-white text-red-500 ring-red-100",
            cardNumber: "text-red-600",
            cardGhost: "text-red-500",
            sectionIcon: "bg-red-50 text-red-500 ring-red-100",
            sectionHeader: "bg-red-50/50 border-red-100",
            badge: "bg-red-50 text-red-700 ring-red-100",
            avatar: "bg-red-50 text-red-600",
            hover: "hover:bg-red-50/40",
        },

        instructor: {
            Icon: FaChalkboardTeacher,
            titulo: "Instructores",
            descripcion: "Encargados de la formación y enseñanza",
            subtituloFila: "Cuenta de instructor",
            card: "border-emerald-100 bg-emerald-50/60",
            cardIcon: "bg-white text-emerald-600 ring-emerald-100",
            cardNumber: "text-emerald-600",
            cardGhost: "text-emerald-500",
            sectionIcon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
            sectionHeader: "bg-emerald-50/50 border-emerald-100",
            badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
            avatar: "bg-emerald-50 text-emerald-600",
            hover: "hover:bg-emerald-50/40",
        },

        estudiante: {
            Icon: FaUserGraduate,
            titulo: "Estudiantes",
            descripcion: "Cuentas registradas como estudiantes",
            subtituloFila: "Cuenta de estudiante",
            card: "border-violet-100 bg-violet-50/60",
            cardIcon: "bg-white text-violet-600 ring-violet-100",
            cardNumber: "text-violet-600",
            cardGhost: "text-violet-500",
            sectionIcon: "bg-violet-50 text-violet-600 ring-violet-100",
            sectionHeader: "bg-violet-50/50 border-violet-100",
            badge: "bg-violet-50 text-violet-700 ring-violet-100",
            avatar: "bg-violet-50 text-violet-600",
            hover: "hover:bg-violet-50/40",
        },
    };

        return estilos[rol] || {
            Icon: FaUsers,
            titulo: rol ? rol.charAt(0).toUpperCase() + rol.slice(1) : "Sin rol",
            descripcion: "Usuarios registrados en el sistema",
            subtituloFila: "Cuenta de usuario",
            card: "border-slate-100 bg-slate-50/60",
            cardIcon: "bg-white text-slate-600 ring-slate-100",
            cardNumber: "text-slate-700",
            cardGhost: "text-slate-400",
            sectionIcon: "bg-slate-50 text-slate-600 ring-slate-100",
            sectionHeader: "bg-slate-50 border-slate-100",
            badge: "bg-slate-50 text-slate-700 ring-slate-100",
            avatar: "bg-slate-50 text-slate-600",
            hover: "hover:bg-slate-50",
        };
    };

    const getNombreCompletoUsuario = (u) => {
        const rolUsuario = normalizarRol(u.rol);

        if (rolUsuario === "estudiante") {
            return u.estudiante_nombre || "-";
        }

        if (rolUsuario === "instructor") {
            return u.instructor_nombre || "-";
        }

        if (u.first_name || u.last_name) {
            return `${u.first_name || ""} ${u.last_name || ""}`.trim();
        }

        return "-";
    };

    const getInicialUsuario = (username) => {
        return (username || "U").charAt(0).toUpperCase();
    };

    const totalAdmin = usuariosPorRol.admin?.length || 0;
    const totalInstructores = usuariosPorRol.instructor?.length || 0;
    const totalEstudiantes = usuariosPorRol.estudiante?.length || 0;

    return (
        <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f6f8fc] px-4 py-5 md:px-8 lg:px-10">
            <div className="mx-auto w-full min-w-0 max-w-[1500px]">
                <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                            <FaUsers className="text-3xl" />
                        </div>

                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900">
                                Gestión de Usuarios
                            </h1>

                            <p className="mt-2 text-base text-slate-500">
                                Administración de cuentas clasificadas por rol
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-600/35 md:w-auto"
                    >
                        <span className="text-lg">＋</span>
                        Nuevo Usuario
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-red-100 bg-red-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="relative z-10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-red-500 shadow-sm ring-1 ring-red-100">
                                    <FaUserShield className="text-4xl" />
                                </div>

                                <div>
                                    <p className="text-base font-bold text-slate-600">
                                        Admin
                                    </p>

                                    <p className="mt-2 text-4xl font-black text-red-600">
                                        {totalAdmin}
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-slate-500">
                                        Cuentas con permisos de administración
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pointer-events-none absolute -bottom-8 -right-6 text-red-500 opacity-10">
                            <FaUserShield className="text-[125px]" />
                        </div>
                    </div>

                    <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="relative z-10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                                    <FaChalkboardTeacher className="text-4xl" />
                                </div>

                                <div>
                                    <p className="text-base font-bold text-slate-600">
                                        Instructores
                                    </p>

                                    <p className="mt-2 text-4xl font-black text-emerald-600">
                                        {totalInstructores}
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-slate-500">
                                        Encargados de la formación y enseñanza
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pointer-events-none absolute -bottom-8 -right-6 text-emerald-500 opacity-10">
                            <FaChalkboardTeacher className="text-[125px]" />
                        </div>
                    </div>

                    <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-violet-100 bg-violet-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:col-span-2 xl:col-span-1">
                        <div className="relative z-10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-violet-500 shadow-sm ring-1 ring-violet-100">
                                    <FaUserGraduate className="text-4xl" />
                                </div>

                                <div>
                                    <p className="text-base font-bold text-slate-600">
                                        Estudiantes
                                    </p>

                                    <p className="mt-2 text-4xl font-black text-violet-600">
                                        {totalEstudiantes}
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-slate-500">
                                        Cuentas registradas como estudiantes
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pointer-events-none absolute -bottom-8 -right-6 text-violet-500 opacity-10">
                            <FaUserGraduate className="text-[125px]" />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-[28px] bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                        <p className="font-semibold text-slate-500">
                            Cargando usuarios...
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {roles.map((rol) => {
                            const lista = usuariosPorRol[rol.value] || [];
                            const visual = getRolVisual(rol.value);

                            return (
                                <div
                                    key={rol.value}
                                    className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                                >
                                    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ${visual.sectionIcon}`}>
                                                <visual.Icon className="text-2xl" />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h2 className="text-2xl font-black text-slate-900">
                                                        {visual.titulo}
                                                    </h2>

                                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${visual.badge}`}>
                                                        {lista.length} usuario(s)
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-sm font-medium text-slate-500">
                                                    {visual.descripcion}
                                                </p>
                                            </div>
                                        </div>

                                        <span className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-black ring-1 ${visual.badge}`}>
                                            {rol.label}
                                        </span>
                                    </div>

                                    {lista.length > 0 ? (
                                        <div className="w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain p-4 [-webkit-overflow-scrolling:touch]">
                                            <div className="inline-block min-w-full rounded-2xl border border-slate-100 align-middle">
                                                <table className="w-full min-w-[950px]">
                                                    <thead>
                                                        <tr className={`border-b text-xs uppercase tracking-wide text-slate-500 ${visual.sectionHeader}`}>
                                                            <th className="px-5 py-4 text-left">
                                                                Usuario
                                                            </th>

                                                            <th className="px-5 py-4 text-left">
                                                                Nombre completo
                                                            </th>

                                                            <th className="px-5 py-4 text-center">
                                                                Rol
                                                            </th>

                                                            <th className="px-5 py-4 text-center">
                                                                Estado
                                                            </th>

                                                            <th className="px-5 py-4 text-center">
                                                                Acciones
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody className="divide-y divide-slate-100">
                                                        {lista.map((u) => {
                                                            const roleInfo = getRoleInfo(u.rol);
                                                            const visualFila = getRolVisual(u.rol);
                                                            const rolUsuario = normalizarRol(u.rol);

                                                            return (
                                                                <tr
                                                                    key={u.id}
                                                                    className={`transition ${visualFila.hover}`}
                                                                >
                                                                    <td className="px-5 py-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${visualFila.avatar}`}>
                                                                                {getInicialUsuario(u.username)}
                                                                            </div>

                                                                            <div>
                                                                                <p className="font-black text-slate-900">
                                                                                    {u.username}
                                                                                </p>

                                                                                <p className="mt-0.5 text-xs font-medium text-slate-400">
                                                                                    {visualFila.subtituloFila}
                                                                                </p>

                                                                                {u.id === usuarioActual?.id && (
                                                                                    <span className="mt-1 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-black text-blue-600 ring-1 ring-blue-100">
                                                                                        Usuario actual
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </td>

                                                                    <td className="px-5 py-4">
                                                                        <p className="font-semibold text-slate-700">
                                                                            {getNombreCompletoUsuario(u)}
                                                                        </p>
                                                                    </td>

                                                                    <td className="px-5 py-4 text-center">
                                                                        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ring-1 ${visualFila.badge}`}>
                                                                            {roleInfo.label}
                                                                        </span>
                                                                    </td>

                                                                    <td className="px-5 py-4 text-center">
                                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                                            Activo
                                                                        </span>
                                                                    </td>

                                                                    <td className="px-5 py-4">
                                                                        <div className="flex min-w-max justify-center gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
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
                                                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-blue-50 px-4 text-sm font-black text-blue-600 ring-1 ring-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-100 hover:cursor-pointer"
                                                                            >
                                                                                ✎ Editar
                                                                            </button>

                                                                            {/*<button
                                                                                type="button"
                                                                                onClick={() => eliminarUsuario(u.id, u.username)}
                                                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 text-sm font-black text-red-600 ring-1 ring-red-100 transition hover:-translate-y-0.5 hover:bg-red-100 hover:cursor-pointer"
                                                                            >
                                                                                🗑 Eliminar
                                                                            </button>
                                                                            */}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                           <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-100">
                                                <visual.Icon className="text-2xl" />
                                            </div>

                                            <p className="font-semibold text-slate-400">
                                                No hay usuarios con este rol.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

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
