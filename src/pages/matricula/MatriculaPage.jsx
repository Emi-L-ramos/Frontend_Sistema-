// src/pages/matricula/MatriculaPage.jsx

import { useState, useEffect } from "react";
import { FiUserPlus, FiSearch, FiX} from "react-icons/fi";
import { AiOutlinePrinter } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { CiEdit } from "react-icons/ci";
import { IoLogoWhatsapp } from "react-icons/io5";
import Swal from "sweetalert2";
import api from "../../api/axios";
import MatriculaForm from "../../components/matriculaForm";

function MatriculaPage() {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editData, setEditData] = useState(null);

    const closeModal = () => {
        setEditData(null);
        setShowModal(false);
    };

    const getNombre = (item) => item.estudiante_nombre || "";
    const getCedula = (item) => item.estudiante_cedula || "";
    const getTelefono = (item) => item.estudiante_telefono || "";
    const getCorreo = (item) => item.estudiante_correo || "";
    const getPlan = (item) => item.plan_nombre || "";
    const getCurso = (item) => item.tipo_curso || "";
    const getModalidad = (item) => item.modalidad || "";
    const getCategoria = (item) => {return item.categoria_nombre || item.categoria?.nombre || "";};
    const getFechaMatricula = (item) => item.fecha_registro || item.fecha_matricula || "";
    const getEdad = (item) => item.estudiante_edad || item.edad || "";
    const getSexo = (item) => item.estudiante_sexo || item.sexo || "";
    const getNacionalidad = (item) => item.estudiante_nacionalidad || item.nacionalidad || "";
    const getFechaNacimiento = (item) => item.estudiante_fecha_nacimiento || item.fecha_nacimiento || "";
    const getDireccion = (item) => item.estudiante_direccion || item.direccion || "";
    const getNivelEducativo = (item) => item.estudiante_nivel_educativo || item.nivel_educativo || "";
    const getNombreEmergencia = (item) => item.estudiante_contacto_emergencia ||"";
    const getTelefonoEmergencia = (item) => item.estudiante_telefono_emergencia || item.telefono_emergencia || "";
    const formatearFecha = (fecha) => {
        if (!fecha) return "";

        const soloFecha = String(fecha).split("T")[0];

        if (!soloFecha.includes("-")) {
            return soloFecha;
        }

        const [year, month, day] = soloFecha.split("-");

        return `${day}/${month}/${year}`;
    };

    const fetchMatriculas = async () => {
        try {
            setLoading(true);

            const response = await api.get("/matricula/");
            const result = response.data;

            const matriculas = Array.isArray(result) ? result : result.results || [];

            console.log("📊 MATRÍCULAS CARGADAS:");
            matriculas.forEach((mat) => {
                console.log(`  - ID ${mat.id}: ${mat.estudiante_nombre} → ESTADO: ${mat.estado}`);
            });

            setData(matriculas);
        } catch (error) {
            console.error("Error al cargar matrículas:", error);

            const mensaje =
                error.response?.data?.detail ||
                error.message ||
                "No se pudieron cargar las matrículas.";

            Swal.fire("Error", "No se pudieron cargar las matrículas: " + mensaje, "error");
        } finally {
            setLoading(false);
        }
    };

    const eliminarMatricula = async (id) => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "¡No podrás revertir esta acción!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!result.isConfirmed) return;

        Swal.fire({
            title: "Eliminando...",
            text: "Por favor espera",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            await api.delete(`/matricula/${id}/`);

            setData((prev) => prev.filter((item) => item.id !== id));

            Swal.fire(
                "¡Eliminado!",
                "La matrícula ha sido eliminada correctamente.",
                "success"
            );
        } catch (error) {
            console.error("Error eliminando:", error);

            Swal.fire(
                "Error",
                "No se pudo eliminar la matrícula. Puede tener datos relacionados.",
                "error"
            );
        }
    };

    const imprimirMatriculaIndividual = (matricula) => {
        const baseUrl = window.location.origin;
        const ventanaImpresion = window.open("", "_blank");

        ventanaImpresion.document.write(`
            <html>
                <head>
                    <style>
                        @page { size: A4; margin: 15mm; }

                        body {
                            font-family: Arial, sans-serif;
                            font-size: 13px;
                            line-height: 1.4;
                            color: #000;
                        }

                        .header {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            border-bottom: 2px solid #333;
                            padding-bottom: 10px;
                            margin-bottom: 20px;
                        }

                        .header-text {
                            text-align: center;
                            flex-grow: 1;
                        }

                        .logo-img {
                            width: 75px;
                            height: 75px;
                            object-fit: contain;
                        }

                        .titulo {
                            font-weight: bold;
                            text-decoration: underline;
                            margin-top: 20px;
                            margin-bottom: 15px;
                        }

                        .form-row {
                            margin-bottom: 10px;
                            border-bottom: 1px solid #444;
                            padding-bottom: 4px;
                            width: 100%;
                            display: inline-block;
                        }

                        .label {
                            font-weight: bold;
                        }

                        .footer-nota {
                            font-size: 11px;
                            margin-top: 20px;
                        }

                        .pie-pagina {
                            margin-top: 40px;
                            text-align: center;
                            border-top: 2px solid #333;
                            padding-top: 10px;
                            font-size: 11px;
                        }

                        .value {
                            font-weight: normal;
                        }
                    </style>
                </head>

                <body>
                    <div class="header">
                        <img src="${baseUrl}/Logo_esesa.png" class="logo-img" alt="Logo Escuela" />

                        <div class="header-text">
                            <strong>Instituto de Formación y Capacitación "Adiact"</strong><br>
                            <em>Somos expertos en Formación y Capacitación del Talento Humano</em><br>
                            <em>Ética, Integridad, Dedicación y Solidaridad</em>
                        </div>

                        <img src="${baseUrl}/Logo.png" class="logo-img" alt="Logo Adiact" />
                    </div>

                    <div class="titulo">
                        HOJA DE MATRÍCULA PARA CURSO DE: EDUCACIÓN VIAL Y MANEJO RESPONSABLE.
                        <br/>
                        Fecha: ${new Date(getFechaMatricula(matricula)).toLocaleDateString("es-NI")}
                    </div>

                    <br/>

                    <div class="form-row">
                        <span class="label">Nombres y apellidos:</span>
                        ${getNombre(matricula)}
                    </div>

                    <br/><br/>

                    <div style="display: flex; gap: 20px;">
                        <div class="form-row" style="width: 30%">
                            <span class="label">Sexo:</span> ${getSexo(matricula)}
                        </div>

                        <div class="form-row">
                            <span class="label">Nacionalidad / Fecha de nacimiento:</span>
                            ${getNacionalidad(matricula)} / ${getFechaNacimiento(matricula)}
                        </div>
                    </div>

                    <br/>

                    <div style="display: flex; gap: 20px;">
                        <div class="form-row" style="width: 30%">
                            <span class="label">Edad:</span>
                            <span class="value">${getEdad(matricula)}</span>
                        </div>

                        <div class="form-row">
                            <span class="label">Número de cédula:</span>
                            <span class="value">${getCedula(matricula)}</span>

                        </div>
                    </div>

                    <br/>

                    <div class="form-row">
                        <span class="label">Dirección:</span>
                        <span class="value">${getDireccion(matricula)}</span>
                    </div>

                    <br/><br/>

                    <div class="form-row">
                        <span class="label">Correo electrónico:</span>
                        <span class="value">${getCorreo(matricula)}</span>
                    </div>

                    <br/><br/>

                    <div style="display: flex; gap: 20px;">
                        <div class="form-row">
                            <span class="label">Teléfono móvil:</span>
                            <span class="value">${getTelefono(matricula)}</span>
                           
                        </div>

                        <div class="form-row">
                            <span class="label">Teléfono emergencia:</span>
                            <span class="value">${getTelefonoEmergencia(matricula)}</span>
                        </div>
                    </div>

                    <br/>

                    <div style="display: flex; gap: 10px;">
                        <div class="form-row">
                        <span class="label">Nivel Académico:</span>
                            <span class="value">${getNivelEducativo(matricula)}</span>
                        </div>

                        <div class="form-row">
                            <span class="label">Contacto emergencia:</span>
                            <span class="value">${getNombreEmergencia(matricula)}</span>
                        </div>
                    </div>

                    <br/>

                    <div style="display: flex; gap: 10px;">
                        <div class="form-row">
                            <span class="label">Modalidad:</span>
                            <span class="value">${getModalidad(matricula)}</span>
                        </div>
                    </div>

                    <br/>

                    <div style="display: flex; gap: 10px;">
                        <div class="form-row">
                            <span class="label">Horario:</span>
                            <span class="value">${matricula.horario || ""}</span>
                        </div>

                        <div class="form-row">
                            <span class="label">Tipo de curso:</span>
                            <span class="value">${getCurso(matricula)}</span>
                        </div>

                        <div class="form-row">
                            <span class="label">Categoría:</span>
                            <span class="value">${getCategoria(matricula)}</span>
                        </div>
                    </div>

                    <br/>

                    <div class="form-row">
                        <span class="label">Observación:</span>
                        <span class="value">${matricula.observaciones || ""}</span>
                    </div>

                    <br/><br/><br/><br/>

                    <div style="margin-top: 70px; text-align: center;">
                        <div
                            style="
                                width: 320px;
                                margin: 0 auto 10px auto;
                                border-top: 2px solid #000;
                            "
                        ></div>

                        <div style="font-weight: bold;">
                            FIRMA DEL SOLICITANTE
                        </div>
                    </div>

                    <div class="footer-nota">
                        <strong>NOTA:</strong><br>
                        1- NO SE ACEPTA DEVOLUCIONES.<br>
                        2- TIENE 15 DÍAS PARA GESTIÓN DE LICENCIA.<br>
                        3- AUSENCIA INJUSTIFICADA ES CLASE DADA.
                    </div>

                    <div class="pie-pagina">
                        <strong>ESCUELA DE MANEJO EL CACIQUE ADIACT</strong><br>
                        Gasolinera UNO Sutiava 1 cuadra al norte y ½ c. oeste. Teléfono: 2315 - 2568
                    </div>

                    <script>
                        window.onload = function() {
                            setTimeout(() => {
                                window.print();
                                window.close();
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `);

        ventanaImpresion.document.close();
    };

    const enviarWhatsApp = async (matricula) => {
        const telefono = getTelefono(matricula);
        const sistema = "https://esesaemca.cloud/login"
        const driveLink = "https://drive.google.com/drive/folders/1rf04iBVCMZi98bG95r-d3I22gokUNU4o?usp=drive_link";

        if (!telefono) {
            Swal.fire("Sin teléfono", "El estudiante no tiene número de teléfono registrado", "warning");
            return;
        }

        let primeraClase = null;

        try {
            const response = await api.get("/calendario/");
            const result = response.data;

            const calendario = Array.isArray(result) ? result : result.results || [];

            const clasesEstudiante = calendario
                .filter((cita) => String(cita.matricula) === String(matricula.id))
                .sort((a, b) => {
                    const fechaA = `${a.fecha} ${a.hora_inicio || ""}`;
                    const fechaB = `${b.fecha} ${b.hora_inicio || ""}`;
                    return fechaA.localeCompare(fechaB);
                });

            primeraClase = clasesEstudiante[0] || null;
        } catch (error) {
            console.error("Error obteniendo calendario para WhatsApp:", error);
        }

        const instructor = primeraClase?.instructor_nombre || "Pendiente de asignación";

        const fechaInicio = primeraClase?.fecha
            ? new Date(primeraClase.fecha + "T00:00:00").toLocaleDateString("es-NI", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            })
            : "Pendiente de asignación";

        const horaInicio = primeraClase?.hora_inicio
            ? primeraClase.hora_inicio.slice(0, 5)
            : "Pendiente de asignación";

        const mensaje = `Hola ${getNombre(matricula)}, tu matrícula ha sido registrada exitosamente.

    Curso: ${getCurso(matricula)}
    Categoría: ${getCategoria(matricula)}
    Instructor: ${instructor}
    Inicio del curso: ${fechaInicio}
    Hora: ${horaInicio}

    Entra al siguiente enlace para poder acceder a tu cuenta, revisar tu calendario de clases, revisar el material de estudio y más: ${sistema}
    Accede con tu usuario y contraseña que creaste al momento de matricularte. Si tienes alguna duda o necesitas ayuda, no dudes en contactarnos por este mismo medio.

    Esperamos que aproveches al máximo tus clases teóricas y prácticas!
    Material de estudio: ${driveLink}`;

        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
    };

    useEffect(() => {
        fetchMatriculas();
    }, []);

    const filteredData = data.filter((item) => {
        const texto = `
            ${getNombre(item)}
            ${getCedula(item)}
            ${getTelefono(item)}
            ${getCurso(item)}
            ${getCategoria(item)}
            ${item.estado || ""}
        `.toLowerCase();

        return texto.includes(search.toLowerCase());
    });

    const displayData = filteredData;

    const totalMatriculas = data.length;

    const totalMatriculados = data.filter(
        (item) => String(item.estado || "").toLowerCase() === "matriculado"
    ).length;

    const totalResultados = displayData.length;

    return (
        <div className="w-full max-w-full min-w-0 overflow-hidden bg-[#f6f8fc] px-4 py-5">
            <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                    <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-3xl shadow-sm ring-1 ring-blue-100 md:flex">
                        📋
                    </div>

                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">
                            Matrículas
                        </h1>

                        <p className="mt-2 max-w-3xl text-base text-slate-500">
                            Registro y gestión de matrículas vinculadas a estudiantes ya registrados.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-blue-50/60 px-6 py-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm ring-1 ring-blue-100">
                            🎓
                        </div>

                        <div>
                            <p className="text-base font-bold text-slate-600">
                                Total matrículas
                            </p>

                            <p className="mt-2 text-4xl font-black text-blue-600">
                                {totalMatriculas}
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-500">
                                Registros en el sistema
                            </p>
                        </div>
                    </div>

                    <div className="pointer-events-none absolute -bottom-5 -right-4 text-8xl opacity-10">
                        🎓
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/60 px-6 py-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm ring-1 ring-emerald-100">
                            ✅
                        </div>

                        <div>
                            <p className="text-base font-bold text-slate-600">
                                Matriculados
                            </p>

                            <p className="mt-2 text-4xl font-black text-emerald-600">
                                {totalMatriculados}
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-500">
                                Matrículas vigentes
                            </p>
                        </div>
                    </div>

                    <div className="pointer-events-none absolute -bottom-5 -right-4 text-8xl opacity-10">
                        ✅
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[28px] border border-violet-100 bg-violet-50/60 px-6 py-5 shadow-sm md:col-span-2 xl:col-span-1">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm ring-1 ring-violet-100">
                            🔎
                        </div>

                        <div>
                            <p className="text-base font-bold text-slate-600">
                                Resultados
                            </p>

                            <p className="mt-2 text-4xl font-black text-violet-600">
                                {totalResultados}
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-500">
                                Coincidencias encontradas
                            </p>
                        </div>
                    </div>

                    <div className="pointer-events-none absolute -bottom-5 -right-4 text-8xl opacity-10">
                        🔎
                    </div>
                </div>
            </div>

            <div className="w-full max-w-full overflow-x-auto">
                <div className="w-full min-w-[1150px]">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:w-[520px]">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                placeholder="Buscar por nombre, cédula o estado..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        <button
                            onClick={() => {
                                setEditData(null);
                                setShowModal(true);
                            }}
                            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-emerald-500/35 sm:w-auto"
                        >
                            <FiUserPlus className="size-5" />
                            Nueva Matrícula
                        </button>
                    </div>

                    <div className="max-h-[650px] w-full overflow-x-auto overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <table className="w-full table-fixed border-collapse">
                            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                                <tr className="border-b border-slate-100">
                                    <th className="w-[7%] px-4 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-500">
                                        Código
                                    </th>

                                    <th className="w-[20%] px-4 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                                        Nombre
                                    </th>

                                    <th className="w-[14%] px-4 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-500">
                                        Fecha matrícula
                                    </th>

                                    <th className="w-[15%] px-4 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-500">
                                        Cédula
                                    </th>

                                    <th className="w-[7%] px-4 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-500">
                                        Edad
                                    </th>

                                    <th className="w-[13%] px-4 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-500">
                                        Teléfono
                                    </th>

                                    <th className="w-[13%] px-4 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-500">
                                        Tipo de Curso
                                    </th>

                                    <th className="w-[11%] px-4 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-500">
                                        Estado
                                    </th>

                                    <th className="w-[15%] px-4 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-500">
                                        Opciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="p-8 text-center font-semibold text-slate-400">
                                            Cargando matrículas...
                                        </td>
                                    </tr>
                                ) : displayData.length > 0 ? (
                                    displayData.map((item) => {
                                        const estado = String(item.estado || "").toLowerCase();

                                        return (
                                            <tr
                                                key={item.id}
                                                className="transition hover:bg-blue-50/50"
                                            >
                                                <td className="px-4 py-4 text-center">
                                                    <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-blue-50 px-3 text-sm font-black text-blue-600 ring-1 ring-blue-100">
                                                        {item.id}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="min-w-0">
                                                        <p className="truncate font-black text-slate-900">
                                                            {getNombre(item)}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 text-center whitespace-nowrap">
                                                    <span className="inline-flex rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-slate-700 ring-1 ring-blue-100">
                                                        {formatearFecha(getFechaMatricula(item))}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-center font-semibold whitespace-nowrap text-slate-600">
                                                    {getCedula(item)}
                                                </td>

                                                <td className="px-4 py-4 text-center font-semibold text-slate-600">
                                                    {getEdad(item)}
                                                </td>

                                                <td className="px-4 py-4 text-center font-semibold whitespace-nowrap text-slate-600">
                                                    {getTelefono(item)}
                                                </td>

                                                <td className="px-4 py-4 text-center">
                                                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                                                        {getCurso(item) || getPlan(item)}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-black ring-1 ${
                                                            estado === "matriculado"
                                                                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                                                : estado === "cancelado"
                                                                ? "bg-red-50 text-red-700 ring-red-100"
                                                                : estado === "aprobado"
                                                                ? "bg-blue-50 text-blue-700 ring-blue-100"
                                                                : "bg-amber-50 text-amber-700 ring-amber-100"
                                                        }`}
                                                    >
                                                        {estado === "matriculado"
                                                            ? "Matriculado"
                                                            : estado === "cancelado"
                                                            ? "Cancelado"
                                                            : estado === "aprobado"
                                                            ? "Aprobado"
                                                            : "Pendiente"}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => eliminarMatricula(item.id)}
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100 transition hover:-translate-y-0.5 hover:bg-red-100 hover:cursor-pointer"
                                                            title="Eliminar"
                                                        >
                                                            <RiDeleteBinLine className="text-xl" />
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setEditData(item);
                                                                setShowModal(true);
                                                            }}
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-100 hover:cursor-pointer"
                                                            title="Editar"
                                                        >
                                                            <CiEdit className="text-xl" />
                                                        </button>

                                                        <button
                                                            onClick={() => enviarWhatsApp(item)}
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-100 hover:cursor-pointer"
                                                            title="Enviar por WhatsApp"
                                                        >
                                                            <IoLogoWhatsapp className="text-xl" />
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                console.log("MATRÍCULA A IMPRIMIR:", item);
                                                                imprimirMatriculaIndividual(item);
                                                            }}
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:cursor-pointer"
                                                            title="Imprimir Matrícula"
                                                        >
                                                            <AiOutlinePrinter className="text-xl" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="p-8 text-center font-semibold text-slate-400">
                                            No hay registros
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div
                        className="bg-white rounded-2xl shadow-lg w-full max-w-5xl"
                        style={{
                            maxHeight: "90vh",
                            overflowY: "auto",
                        }}
                    >
                        <div className="flex justify-between p-4">
                            <h2 className="font-bold text-4xl">
                                {editData ? "Editar Matrícula" : "Nueva Matrícula"}
                            </h2>

                            <button
                                onClick={closeModal}
                                className="text-red-700 text-2xl hover:bg-red-100 rounded-full w-10 h-10 flex items-center justify-center"
                            >
                                <FiX />
                            </button>
                        </div>

                        <div className="p-6">
                            <MatriculaForm
                                key={editData?.id || "new"}
                                initialData={editData}
                                onSave={() => {
                                    fetchMatriculas();
                                    closeModal();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MatriculaPage;
