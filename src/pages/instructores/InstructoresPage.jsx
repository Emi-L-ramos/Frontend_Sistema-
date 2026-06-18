import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../api/axios";
import { Image, Upload, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { VscChromeClose } from "react-icons/vsc";
import {
    FaChalkboardTeacher,
    FaUserCheck,
    FaLayerGroup,
    FaPlus,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaEdit,
    FaTrashAlt,
    FaUserSlash,
    FaEye,
    FaUserTie,
} from "react-icons/fa";

function InstructoresPage() {

    const [instructores, setInstructores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [calendarioActivo, setCalendarioActivo] = useState(null);
    const [mesActual, setMesActual] = useState(new Date());

const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const obtenerDiasMes = (fecha) => {
    const year = fecha.getFullYear();
    const month = fecha.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();

    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({
            day: prevMonthDays - i,
            isCurrentMonth: false,
            fecha: new Date(year, month - 1, prevMonthDays - i),
        });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        days.push({
            day: i,
            isCurrentMonth: true,
            fecha: new Date(year, month, i),
        });
    }

    const remaining = 42 - days.length;

    for (let i = 1; i <= remaining; i++) {
        days.push({
            day: i,
            isCurrentMonth: false,
            fecha: new Date(year, month + 1, i),
        });
    }

    return days;
};

const cambiarMes = (incremento) => {
    const nuevoMes = new Date(mesActual);
    nuevoMes.setMonth(mesActual.getMonth() + incremento);
    setMesActual(nuevoMes);
};

const formatearFechaVista = (fecha) => {
    if (!fecha) return "Seleccione una fecha";

    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
};

const seleccionarFechaCalendario = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    const fechaStr = `${year}-${month}-${day}`;

    if (calendarioActivo === "ingreso") {
        setForm((prev) => ({
            ...prev,
            fecha_ingreso: fechaStr,
        }));
    }

    if (calendarioActivo === "salida") {
        setForm((prev) => ({
            ...prev,
            fecha_salida: fechaStr,
        }));
    }

    setCalendarioActivo(null);
};

    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        numero_telefono: "",
        direccion: "",
        categoria_instructor: "",
        edad: "",
        foto: null,
        foto_base64: "",
        eliminar_foto: false,
        cedula: "",
        nacionalidad: "",
        nivel_escolar: "",
        antecedentes_penales: "",
        centro_trabajo: "",
        cargo: "",
        curso_aprobado_instructor: "",
        fecha_ingreso: "",
        fecha_salida: "",
        motivo_salida: "",
        infracciones_resoluciones: "",
    });

    const cargarInstructores = async () => {
        try {
            const response = await api.get("/instructores/");
            const data = response.data;

            console.log("Respuesta instructores:", data);

            setInstructores(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error("Error cargando instructores:", error);
            setInstructores([]);

            const mensaje =
                error.response?.data?.detail ||
                "Error cargando instructores";

            Swal.fire("Error", mensaje, "error");
        }
    };

    useEffect(() => {
        const iniciar = async () => {
            setLoading(true);
            await cargarInstructores();
            setLoading(false);
        };

        iniciar();
    }, []);

    const limpiarForm = () => {
        setForm({
            nombre: "",
            apellido: "",
            numero_telefono: "",
            direccion: "",
            categoria_instructor: "",
            edad: "",
            foto: null,
            foto_base64: "",
            eliminar_foto: false,
            cedula: "",
            nacionalidad: "",
            nivel_escolar: "",
            antecedentes_penales: "",
            centro_trabajo: "",
            cargo: "",
            curso_aprobado_instructor: "",
            fecha_ingreso: "",
            fecha_salida: "",
            motivo_salida: "",
            infracciones_resoluciones: "",
        });

        setEditData(null);
    };

    const abrirCrear = () => {
        limpiarForm();
        setModal(true);
    };

    const abrirEditar = (instructor) => {
        setEditData(instructor);

        setForm({
            nombre: instructor.nombre || "",
            apellido: instructor.apellido || "",
            numero_telefono: instructor.numero_telefono || "",
            direccion: instructor.direccion || "",
            categoria_instructor: instructor.categoria_instructor || "",
            edad: instructor.edad || "",
            foto: null,
            foto_base64: instructor.foto_base64 || "",
            eliminar_foto: false,
            cedula: instructor.cedula || "",
            nacionalidad: instructor.nacionalidad || "",
            nivel_escolar: instructor.nivel_escolar || "",
            antecedentes_penales: instructor.antecedentes_penales || "",
            centro_trabajo: instructor.centro_trabajo || "",
            cargo: instructor.cargo || "",
            curso_aprobado_instructor: instructor.curso_aprobado_instructor || "",
            fecha_ingreso: instructor.fecha_ingreso || "",
            fecha_salida: instructor.fecha_salida || "",
            motivo_salida: instructor.motivo_salida || "",
            infracciones_resoluciones: instructor.infracciones_resoluciones || "",
        });

        setModal(true);
    };

    const cerrarModal = () => {
        setModal(false);
        limpiarForm();
    };

    const convertirImagenABase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;

            reader.readAsDataURL(file);
        });
    };

    const guardarInstructor = async (e) => {
        e.preventDefault();

        try {
            let fotoBase64Final = form.foto_base64 || "";

            if (form.eliminar_foto) {
                fotoBase64Final = "";
            } else if (form.foto instanceof File) {
                fotoBase64Final = await convertirImagenABase64(form.foto);
            }

            const payload = {
                nombre: form.nombre,
                apellido: form.apellido,
                numero_telefono: form.numero_telefono,
                direccion: form.direccion,
                categoria_instructor: form.categoria_instructor || "",
                edad: form.edad || null,
                cedula: form.cedula || null,
                nacionalidad: form.nacionalidad || "",
                nivel_escolar: form.nivel_escolar || "",
                antecedentes_penales: form.antecedentes_penales || "No",
                centro_trabajo: form.centro_trabajo || "",
                cargo: form.cargo || "",
                curso_aprobado_instructor: form.curso_aprobado_instructor || "",
                fecha_ingreso: form.fecha_ingreso || null,
                fecha_salida: form.fecha_salida || null,
                motivo_salida: form.motivo_salida || "",
                infracciones_resoluciones: form.infracciones_resoluciones || "",
                foto_base64: fotoBase64Final,
            };

            if (editData) {
                await api.patch(`/instructores/${editData.id}/`, payload);
            } else {
                await api.post("/instructores/", payload);
            }

            Swal.fire(
                "Éxito",
                editData
                    ? "Instructor actualizado correctamente."
                    : "Instructor creado correctamente.",
                "success"
            );

            cerrarModal();
            cargarInstructores();

        } catch (error) {
            console.error(error);

            const data = error.response?.data;

            const mensaje = data && typeof data === "object"
                ? Object.values(data).flat().join("\n")
                : "No se pudo guardar el instructor.";

            Swal.fire("Error", mensaje, "error");
        }
    };

    const eliminarInstructor = async (instructor) => {
        const confirm = await Swal.fire({
            title: "¿Eliminar instructor?",
            text: `Se eliminará a ${instructor.nombre_completo || instructor.nombre}.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!confirm.isConfirmed) return;

        try {
            await api.delete(`/instructores/${instructor.id}/`);

            Swal.fire("Eliminado", "Instructor eliminado correctamente.", "success");
            cargarInstructores();

        } catch (error) {
            Swal.fire("Error", "No se pudo eliminar el instructor.", "error");
        }
    };

    const despedirInstructor = async (instructor) => {
        const { isConfirmed } = await Swal.fire({
            title: "Despedir instructor",
            text: `¿Deseas desactivar a ${instructor.nombre_completo}?`,
            icon: "warning",
            input: "textarea",
            inputLabel: "Motivo de salida",
            inputPlaceholder: "Escriba el motivo...",
            showCancelButton: true,
            confirmButtonText: "Despedir",
            cancelButtonText: "Cancelar",
        });

        if (!isConfirmed) return;

        try {
            const formData = new FormData();
            formData.append(
                "motivo_salida",
                document.querySelector(".swal2-textarea")?.value || ""
            );

            await api.post(
                `/instructores/${instructor.id}/despedir/`,
                formData
            );

            Swal.fire(
                "Instructor desactivado",
                "El instructor ya no podrá iniciar sesión.",
                "success"
            );

            cargarInstructores();

        } catch (error) {
            console.error(error);

            Swal.fire(
                "Error",
                "No se pudo desactivar el instructor.",
                "error"
            );
        }
    };

    const getNombreInstructor = (inst) => {
        return (
            inst.nombre_completo ||
            `${inst.nombre || ""} ${inst.apellido || ""}`.trim() ||
            "Instructor"
        );
    };

    const getFotoInstructor = (inst) => {
        return inst.foto_base64 || inst.foto_url || inst.foto || "";
    };

    const getCategoriaInstructor = (inst) => {
        return inst.categoria_nombre || inst.categoria_instructor || "-";
    };

    const esInstructorActivo = (inst) => {
        return inst.activo !== false && !inst.fecha_salida;
    };

    const totalInstructores = instructores.length;

    const totalActivos = instructores.filter((inst) =>
        esInstructorActivo(inst)
    ).length;

    const totalCategorias = new Set(
        instructores
            .map((inst) => getCategoriaInstructor(inst))
            .filter((categoria) => categoria && categoria !== "-")
    ).size;

    return (
        <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f6f8fc] px-4 py-5 md:px-8 lg:px-10">
            <div className="mx-auto w-full min-w-0 max-w-[1500px]">
                <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-1 ring-blue-500">
                            <FaChalkboardTeacher className="text-3xl" />
                        </div>

                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900">
                                Instructores
                            </h1>

                            <p className="mt-2 text-base text-slate-500">
                                Gestión de datos profesionales de instructores.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={abrirCrear}
                        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-600/35 md:w-auto"
                    >
                        <FaPlus className="text-sm transition-transform duration-300 group-hover:rotate-90" />
                        Nuevo Instructor
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-blue-100 bg-blue-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="relative z-10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                                    <FaChalkboardTeacher className="text-4xl" />
                                </div>

                                <div>
                                    <p className="text-base font-bold text-slate-600">
                                        Instructores registrados
                                    </p>

                                    <p className="mt-2 text-4xl font-black text-blue-600">
                                        {totalInstructores}
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-slate-500">
                                        Personal registrado en el sistema
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pointer-events-none absolute -bottom-8 -right-6 text-blue-500 opacity-10">
                            <FaChalkboardTeacher className="text-[125px]" />
                        </div>
                    </div>

                    <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="relative z-10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                                    <FaUserCheck className="text-4xl" />
                                </div>

                                <div>
                                    <p className="text-base font-bold text-slate-600">
                                        Activos
                                    </p>

                                    <p className="mt-2 text-4xl font-black text-emerald-600">
                                        {totalActivos}
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-slate-500">
                                        Disponibles para asignación
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pointer-events-none absolute -bottom-8 -right-6 text-emerald-500 opacity-10">
                            <FaUserCheck className="text-[125px]" />
                        </div>
                    </div>

                    <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-violet-100 bg-violet-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:col-span-2 xl:col-span-1">
                        <div className="relative z-10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-violet-600 shadow-sm ring-1 ring-violet-100">
                                    <FaLayerGroup className="text-4xl" />
                                </div>

                                <div>
                                    <p className="text-base font-bold text-slate-600">
                                        Categorías
                                    </p>

                                    <p className="mt-2 text-4xl font-black text-violet-600">
                                        {totalCategorias}
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-slate-500">
                                        Categorías profesionales registradas
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pointer-events-none absolute -bottom-8 -right-6 text-violet-500 opacity-10">
                            <FaLayerGroup className="text-[125px]" />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-[28px] bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                        <p className="font-semibold text-slate-500">
                            Cargando instructores...
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">
                                    Lista de instructores
                                </h2>

                                <p className="mt-1 text-sm font-medium text-slate-500">
                                    {instructores.length} instructor(es) registrados
                                </p>
                            </div>

                            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-600 ring-1 ring-blue-100">
                                <FaEye className="text-xs" />
                                Vista general
                            </div>
                        </div>

                        <div className="w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain p-4 [-webkit-overflow-scrolling:touch]">
                            <div className="inline-block min-w-full rounded-2xl border border-slate-100 align-middle">
                                <table className="w-full min-w-[1180px]">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/90 text-xs uppercase tracking-wide text-slate-500">
                                            <th className="px-5 py-4 text-left">
                                                Instructor
                                            </th>

                                            <th className="px-5 py-4 text-left">
                                                Teléfono
                                            </th>

                                            <th className="px-5 py-4 text-left">
                                                Categoría
                                            </th>

                                            <th className="px-5 py-4 text-center">
                                                Edad
                                            </th>

                                            <th className="px-5 py-4 text-left">
                                                Dirección
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
                                        {instructores.map((inst) => (
                                            <tr
                                                key={inst.id}
                                                className="transition hover:bg-blue-50/40"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-slate-200">
                                                            {getFotoInstructor(inst) ? (
                                                                <img
                                                                    src={getFotoInstructor(inst)}
                                                                    alt={getNombreInstructor(inst)}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600">
                                                                    <FaUserTie className="text-2xl" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-black text-slate-900">
                                                                {getNombreInstructor(inst)}
                                                            </p>

                                                            <p className="mt-0.5 text-xs font-medium text-slate-400">
                                                                Instructor profesional
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-slate-600">
                                                        <FaPhoneAlt className="text-blue-500" />
                                                        {inst.numero_telefono || "-"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="inline-flex rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-600 ring-1 ring-blue-100">
                                                        {getCategoriaInstructor(inst)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-center font-semibold text-slate-600">
                                                    {inst.edad || "-"}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex max-w-[360px] items-start gap-2 text-sm font-medium text-slate-600">
                                                        <FaMapMarkerAlt className="mt-1 shrink-0 text-slate-400" />
                                                        <span className="line-clamp-2">
                                                            {inst.direccion || "-"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ring-1 ${
                                                            esInstructorActivo(inst)
                                                                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                                                : "bg-red-50 text-red-700 ring-red-100"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                esInstructorActivo(inst)
                                                                    ? "bg-emerald-500"
                                                                    : "bg-red-500"
                                                            }`}
                                                        ></span>

                                                        {esInstructorActivo(inst) ? "Activo" : "Inactivo"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex min-w-max items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => abrirEditar(inst)}
                                                            title="Editar instructor"
                                                            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-blue-50 px-4 text-sm font-black text-blue-600 ring-1 ring-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-100 hover:cursor-pointer"
                                                        >
                                                            <FaEdit className="text-sm" />
                                                            Editar
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => despedirInstructor(inst)}
                                                            title="Despedir instructor"
                                                            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-orange-50 px-4 text-sm font-black text-orange-600 ring-1 ring-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-100 hover:cursor-pointer"
                                                        >
                                                            <FaUserSlash className="text-sm" />
                                                            Despedir
                                                        </button>

                                                        {/*<button
                                                            type="button"
                                                            onClick={() => eliminarInstructor(inst)}
                                                            title="Eliminar instructor"
                                                            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 text-sm font-black text-red-600 ring-1 ring-red-100 transition hover:-translate-y-0.5 hover:bg-red-100 hover:cursor-pointer"
                                                        >
                                                            <FaTrashAlt className="text-sm" />
                                                            Eliminar
                                                        </button>*/}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {instructores.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan="7"
                                                    className="px-7 py-12 text-center text-sm font-semibold text-slate-400"
                                                >
                                                    No hay instructores registrados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {modal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editData ? "Editar Instructor" : "Nuevo Instructor"}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Complete la información profesional.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={cerrarModal}
                                className="text-gray-400 hover:text-red-500 text-2xl hover:cursor-pointer transition"
                            >
                                <VscChromeClose className="hover:cursor-pointer"/>
                            </button>
                        </div>

                        <form onSubmit={guardarInstructor} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={form.nombre}
                                    onChange={(e) =>
                                        setForm({ ...form, nombre: e.target.value })
                                    }
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Apellido"
                                    value={form.apellido}
                                    onChange={(e) =>
                                        setForm({ ...form, apellido: e.target.value })
                                    }
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Cédula"
                                    value={form.cedula}
                                    onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />

                                <input
                                    type="text"
                                    placeholder="Nacionalidad"
                                    value={form.nacionalidad}
                                    onChange={(e) => setForm({ ...form, nacionalidad: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Nivel escolar"
                                    value={form.nivel_escolar}
                                    onChange={(e) => setForm({ ...form, nivel_escolar: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />

                                <select
                                    value={form.antecedentes_penales}
                                    onChange={(e) => setForm({ ...form, antecedentes_penales: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Antecedentes penales</option>
                                    <option value="No">No</option>
                                    <option value="Si">Sí</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Centro de trabajo"
                                    value={form.centro_trabajo}
                                    onChange={(e) => setForm({ ...form, centro_trabajo: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />

                                <input
                                    type="text"
                                    placeholder="Cargo"
                                    value={form.cargo}
                                    onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <input
                                type="text"
                                placeholder="Curso aprobado para instructor"
                                value={form.curso_aprobado_instructor}
                                onChange={(e) => setForm({ ...form, curso_aprobado_instructor: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* FECHA INGRESO */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Fecha de ingreso
                                    </label>

                                    <div className="flex items-center gap-3 border border-gray-300 rounded-2xl px-4 py-3 bg-white shadow-sm hover:border-green-400 transition">
                                        <span
                                            className={
                                                form.fecha_ingreso
                                                    ? "text-gray-700 text-sm"
                                                    : "text-gray-400 text-sm"
                                            }
                                        >
                                            {form.fecha_ingreso
                                                ? new Date(form.fecha_ingreso).toLocaleDateString("es-ES")
                                                : "Seleccione una fecha"}
                                        </span>

                                        <label className="relative ml-auto h-11 w-11 flex items-center justify-center rounded-xl bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer transition overflow-hidden">
                                        

                                        <button
                                                type="button"
                                                onClick={() => setCalendarioActivo("ingreso")}
                                                className="ml-auto h-11 w-11 flex items-center justify-center rounded-xl bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer transition"
                                            >
                                                <Calendar className="w-5 h-5" />
                                            </button>
                                        </label>
                                    </div>
                                </div>

                                {/* FECHA SALIDA */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Fecha de salida
                                    </label>

                                    <div className="flex items-center gap-3 border border-gray-300 rounded-2xl px-4 py-3 bg-white shadow-sm hover:border-green-400 transition">
                                        <span
                                            className={
                                                form.fecha_salida
                                                    ? "text-gray-700 text-sm"
                                                    : "text-gray-400 text-sm"
                                            }
                                        >
                                            {form.fecha_salida
                                                ? new Date(form.fecha_salida).toLocaleDateString("es-ES")
                                                : "Seleccione una fecha"}
                                        </span>

                                        <label className="relative ml-auto h-11 w-11 flex items-center justify-center rounded-xl bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer transition overflow-hidden">
                                            

                                        <button
                                                type="button"
                                                onClick={() => setCalendarioActivo("salida")}
                                                className="ml-auto h-11 w-11 flex items-center justify-center rounded-xl bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer transition"
                                            >
                                                <Calendar className="w-5 h-5" />
                                            </button>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <textarea
                                placeholder="Motivo de la salida"
                                value={form.motivo_salida}
                                onChange={(e) => setForm({ ...form, motivo_salida: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                            />

                            <textarea
                                placeholder="Infracciones / Resoluciones"
                                value={form.infracciones_resoluciones}
                                onChange={(e) => setForm({ ...form, infracciones_resoluciones: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Número telefónico"
                                    value={form.numero_telefono}
                                    onChange={(e) =>
                                        setForm({ ...form, numero_telefono: e.target.value })
                                    }
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />

                                <input
                                    type="number"
                                    placeholder="Edad"
                                    value={form.edad}
                                    onChange={(e) =>
                                        setForm({ ...form, edad: e.target.value })
                                    }
                                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <input
                                type="text"
                                placeholder="Dirección"
                                value={form.direccion}
                                onChange={(e) =>
                                    setForm({ ...form, direccion: e.target.value })
                                }
                                className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />

                            <input
                                type="text"
                                placeholder="Categoría del instructor"
                                value={form.categoria_instructor || ""}
                                onChange={(e) =>
                                    setForm({ ...form, categoria_instructor: e.target.value })
                                }
                                className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Foto del instructor
                                </label>

                                <label className="w-full border-2 border-dashed border-green-300 rounded-2xl p-5 bg-green-50 hover:bg-green-100 hover:border-green-400 transition cursor-pointer flex flex-col items-center justify-center text-center gap-3">
                                    <div className="w-16 h-16 rounded-full bg-white border border-green-200 flex items-center justify-center shadow-sm">
                                        <Image className="w-8 h-8 text-green-600" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {form.foto ? form.foto.name : "Seleccionar fotografía"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Haz clic aquí para subir una imagen
                                        </p>
                                    </div>

                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition">
                                        <Upload className="w-4 h-4" />
                                        Buscar foto
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                foto: e.target.files[0],
                                                eliminar_foto: false,
                                            })
                                        }
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {editData?.foto_base64 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setForm({
                                            ...form,
                                            eliminar_foto: true,
                                            foto: null,
                                        })
                                    }
                                    className="w-full p-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition"
                                >
                                    Quitar foto actual
                                </button>
                            )}

                            {form.eliminar_foto && (
                                <p className="text-xs text-red-500">
                                    La foto actual será eliminada al guardar.
                                </p>
                            )}

                            {calendarioActivo && (
    <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-4 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => cambiarMes(-1)}
                    className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                    <p className="text-white font-bold text-lg">
                        {meses[mesActual.getMonth()]} {mesActual.getFullYear()}
                    </p>
                    <p className="text-xs text-green-100">
                        {calendarioActivo === "ingreso"
                            ? "Seleccionar fecha de ingreso"
                            : "Seleccionar fecha de salida"}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => cambiarMes(1)}
                    className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="p-5">
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {diasSemana.map((dia, idx) => (
                        <div
                            key={idx}
                            className="text-center text-xs font-bold text-gray-500 py-2"
                        >
                            {dia}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {obtenerDiasMes(mesActual).map((dia, idx) => {
                        const year = dia.fecha.getFullYear();
                        const month = String(dia.fecha.getMonth() + 1).padStart(2, "0");
                        const day = String(dia.fecha.getDate()).padStart(2, "0");
                        const fechaStr = `${year}-${month}-${day}`;

                        const fechaSeleccionada =
                            calendarioActivo === "ingreso"
                                ? form.fecha_ingreso
                                : form.fecha_salida;

                        const esSeleccionada = fechaStr === fechaSeleccionada;

                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => seleccionarFechaCalendario(dia.fecha)}
                                className={`
                                    h-11 rounded-xl text-sm font-semibold transition-all duration-200
                                    ${!dia.isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                                    ${esSeleccionada ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md scale-105" : ""}
                                    ${!esSeleccionada && dia.isCurrentMonth ? "hover:bg-green-100 hover:scale-105 cursor-pointer" : ""}
                                `}
                            >
                                {dia.day}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-end mt-5">
                    <button
                        type="button"
                        onClick={() => setCalendarioActivo(null)}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </div>
)}

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="px-5 py-2.5 border rounded-xl text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
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

export default InstructoresPage;
