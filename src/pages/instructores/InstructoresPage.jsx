import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../api/axios";
import { Image, Upload, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { VscChromeClose } from "react-icons/vsc";
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

    const guardarInstructor = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append("nombre", form.nombre);
        formData.append("apellido", form.apellido);
        formData.append("numero_telefono", form.numero_telefono);
        formData.append("direccion", form.direccion);
        formData.append("categoria_instructor", form.categoria_instructor || "");
        formData.append("edad", form.edad || "");
        formData.append("cedula", form.cedula);
        formData.append("nacionalidad", form.nacionalidad);
        formData.append("nivel_escolar", form.nivel_escolar);
        formData.append("antecedentes_penales", form.antecedentes_penales);
        formData.append("centro_trabajo", form.centro_trabajo);
        formData.append("cargo", form.cargo);
        formData.append("curso_aprobado_instructor", form.curso_aprobado_instructor);
        formData.append("fecha_ingreso", form.fecha_ingreso || "");
        formData.append("fecha_salida", form.fecha_salida || "");
        formData.append("motivo_salida", form.motivo_salida);
        formData.append("infracciones_resoluciones", form.infracciones_resoluciones);

        if (form.eliminar_foto) {
            formData.append("foto", "");
        } else if (form.foto instanceof File) {
            formData.append("foto", form.foto);
        }

        try {
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            };

            if (editData) {
                await api.patch(`/instructores/${editData.id}/`, formData, config);
            } else {
                await api.post("/instructores/", formData, config);
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

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">
                        Instructores
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Gestión de datos profesionales de instructores.
                    </p>
                </div>

                <button
                    onClick={abrirCrear}
                    className="relative group overflow-hidden px-20 h-11 rounded-3xl bg-green-500 text-white flex items-center gap-2 transition-all duration-300 hover:bg-green-600 justify-center hover:cursor-pointer"
                >
                    <span className="absolute top-0 left-[-75%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 group-hover:left-[125%] transition-all duration-700"></span>

                    <span className="relative z-10">
                        Nuevo Instructor
                    </span>
                </button>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
                    Cargando instructores...
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">
                            Lista de instructores
                        </h2>
                        <p className="text-sm text-gray-500">
                            {instructores.length} instructor(es) registrados
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-sm">
                                    <th className="p-4 text-left">Instructor</th>
                                    <th className="p-4 text-left">Teléfono</th>
                                    <th className="p-4 text-left">Categoría</th>
                                    <th className="p-4 text-left">Edad</th>
                                    <th className="p-4 text-left">Dirección</th>
                                    <th className="p-4 text-center">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {instructores.map((inst) => (
                                    <tr
                                        key={inst.id}
                                        className="border-t border-gray-100 hover:bg-green-50 transition"
                                    >
                                        <td className="p-4">

                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                                                    {inst.foto_url ? (
                                                        <img
                                                            src={inst.foto_url}
                                                            alt={inst.nombre_completo}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="font-bold text-gray-400">
                                                            {(inst.nombre || "I").charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 text-gray-700">
                                            {inst.numero_telefono || "-"}
                                        </td>

                                        <td className="p-4 text-gray-700">
                                            {inst.categoria_instructor || "-"}
                                        </td>

                                        <td className="p-4 text-gray-700">
                                            {inst.edad || "-"}
                                        </td>

                                        <td className="p-4 text-gray-700">
                                            {inst.direccion || "-"}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => abrirEditar(inst)}
                                                    className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    onClick={() => despedirInstructor(inst)}
                                                    className="px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition"
                                                >
                                                    Despedir
                                                </button>
                                                
                                                {/*borrar despues de las pruebas*/}
                                                <button
                                                    onClick={() => eliminarInstructor(inst)}
                                                    className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {instructores.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="p-6 text-center text-gray-400"
                                        >
                                            No hay instructores registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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

                            {editData?.foto_url && (
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
