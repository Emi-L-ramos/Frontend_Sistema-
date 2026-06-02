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
    const getCategoria = (item) => item.categoria || "";
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
                        HOJA DE MATRÍCULA DE ADULTOS A CURSO DE: EDUCACIÓN VIAL Y MANEJO RESPONSABLE.
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
                        2- TIENE 60 DÍAS PARA GESTIÓN DE LICENCIA.<br>
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
        const driveLink = "https://drive.google.com/drive/folders/1Xo9n8s0l7mLh2j3k4n5o6p7q8r9s0t?usp=sharing";

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

    Esperamos que aproveches al máximo tus clases teóricas y prácticas.

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

    return (
        <div className="w-full max-w-full min-w-0 overflow-hidden px-4">
            <div className="mb-4 space-y-2">
                <h1 className="text-4xl font-bold">Matrículas</h1>
                <p className="text-gray-600">
                    Registro y gestión de matrículas vinculadas a estudiantes ya registrados.
                </p>
            </div>

            <div className="w-full max-w-full overflow-x-auto">
                <div className="w-full min-w-[1100px]">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl mb-4">
                        <div className="relative w-full sm:w-[420px]">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                placeholder="Buscar por nombre, cédula o estado..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-3xl bg-white border-blue-500 transition h-11"
                            />
                        </div>

                        <button
                            onClick={() => {
                                setEditData(null);
                                setShowModal(true);
                            }}
                            className="relative group overflow-hidden w-full sm:w-auto px-6 sm:px-12 h-11 rounded-3xl bg-green-500 text-white flex items-center justify-center gap-2 transition-all duration-300 hover:bg-green-600 hover:cursor-pointer"
                        >
                            <span className="absolute top-0 left-[-75%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 group-hover:left-[125%] transition-all duration-700"></span>

                            <span className="relative z-10 flex items-center gap-2">
                                <FiUserPlus className="size-5" />
                                Nueva Matrícula
                            </span>
                        </button>
                    </div>

                    <div className="max-h-[650px] overflow-y-auto overflow-x-auto w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <table className="w-full table-fixed border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr className="border-gray-300">
                                    <th className="p-3 w-[7%] text-center text-xs font-semibold text-gray-600 uppercase">Código</th>
                                    <th className="p-3 w-[20%] text-left text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                                    <th className="p-3 w-[14%] text-center text-xs font-semibold text-gray-600 uppercase">Fecha Matrícula</th>
                                    <th className="p-3 w-[15%] text-center text-xs font-semibold text-gray-600 uppercase">Cédula</th>
                                    <th className="p-3 w-[7%] text-center text-xs font-semibold text-gray-600 uppercase">Edad</th>
                                    <th className="p-3 w-[13%] text-center text-xs font-semibold text-gray-600 uppercase">Teléfono</th>
                                    <th className="p-3 w-[13%] text-center text-xs font-semibold text-gray-600 uppercase">Curso</th>
                                    <th className="p-3 w-[11%] text-center text-xs font-semibold text-gray-600 uppercase">Estado</th>
                                    <th className="p-3 w-[15%] text-center text-xs font-semibold text-gray-600 uppercase">Opciones</th>
                                </tr>
                            </thead>

                            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="p-6 text-center">
                                            Cargando...
                                        </td>
                                    </tr>
                                ) : displayData.length > 0 ? (
                                    displayData.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-blue-50 transition"
                                        >
                                            <td className="p-3 text-center font-semibold text-gray-700">{item.id}</td>

                                            <td className="p-3 text-left font-semibold text-gray-800 truncate">
                                                {getNombre(item)}
                                            </td>

                                            <td className="p-3 text-center whitespace-nowrap">
                                                {formatearFecha(getFechaMatricula(item))}
                                            </td>

                                            <td className="p-3 text-center whitespace-nowrap">
                                                {getCedula(item)}
                                            </td>

                                            <td className="p-3 text-center">
                                                {getEdad(item)}
                                            </td>

                                            <td className="p-3 text-center whitespace-nowrap">
                                                {getTelefono(item)}
                                            </td>

                                            <td className="p-3 text-center truncate">
                                                {getCurso(item) || getPlan(item)}
                                            </td>

                                            <td className="p-2">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        item.estado === "matriculado"
                                                            ? "bg-green-100 text-green-700"
                                                            : item.estado === "cancelado"
                                                            ? "bg-red-100 text-red-700"
                                                            : item.estado === "aprobado"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                                >
                                                    {item.estado === "matriculado"
                                                        ? "Matriculado"
                                                        : item.estado === "cancelado"
                                                        ? "Cancelado"
                                                        : item.estado === "aprobado"
                                                        ? "Aprobado"
                                                        : "Pendiente"}
                                                </span>
                                            </td>

                                            <td className="p-2">
                                                <div className="flex items-center gap-3 justify-center">
                                                    <button
                                                        onClick={() => eliminarMatricula(item.id)}
                                                        className="p-2 rounded-lg hover:bg-red-100"
                                                        title="Eliminar"
                                                    >
                                                        <RiDeleteBinLine className="text-red-500 text-xl hover:text-red-700 hover:cursor-pointer" />
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setEditData(item);
                                                            setShowModal(true);
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-blue-100"
                                                        title="Editar"
                                                    >
                                                        <CiEdit className="text-blue-500 text-xl hover:text-blue-700 hover:cursor-pointer" />
                                                    </button>

                                                    <button
                                                        onClick={() => enviarWhatsApp(item)}
                                                        className="p-2 rounded-lg hover:bg-green-100"
                                                        title="Enviar por WhatsApp"
                                                    >
                                                        <IoLogoWhatsapp className="text-green-600 text-xl hover:text-green-700 hover:cursor-pointer" />
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            console.log("MATRÍCULA A IMPRIMIR:", item);
                                                            imprimirMatriculaIndividual(item);
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-green-100"
                                                        title="Imprimir Matrícula"
                                                    >
                                                        <AiOutlinePrinter className="text-green-500 text-xl hover:text-green-700 hover:cursor-pointer" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="p-6 text-center text-gray-400">
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
