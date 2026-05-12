// src/pages/matricula/MatriculaPage.jsx

import { useState, useEffect } from "react";
import { FiUserPlus, FiSearch, FiX, FiPrinter } from "react-icons/fi";
import { AiOutlinePrinter } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { CiEdit } from "react-icons/ci";
import { IoLogoWhatsapp } from "react-icons/io5";
import Swal from "sweetalert2";

import MatriculaForm from "../../components/matriculaForm";

function MatriculaPage() {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [filtroEdad, setFiltroEdad] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editData, setEditData] = useState(null);
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");

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
    const getContactoEmergencia = (item) => item.estudiante_contacto_emergencia || item.en_caso_de_emergencia || "";
    const getTelefonoEmergencia = (item) => item.estudiante_telefono_emergencia || item.telefono_emergencia || "";

    const fechaLocal = (fecha) => {
        if (!fecha) return null;

        const soloFecha = fecha.split("T")[0];
        const [year, month, day] = soloFecha.split("-");

        return new Date(Number(year), Number(month) - 1, Number(day));
    };

    const fetchMatriculas = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await fetch("http://127.0.0.1:8000/api/matricula/", {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            const contentType = response.headers.get("content-type");
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("La API no devolvió JSON");
            }
            
            const result = await response.json();
            
            // Debug: Ver los estados de las matrículas
            console.log("📊 MATRÍCULAS CARGADAS:");
            result.forEach(mat => {
                console.log(`  - ID ${mat.id}: ${mat.estudiante_nombre} → ESTADO: ${mat.estado}`);
            });
            
            setData(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Error al cargar matrículas:", error);
            Swal.fire("Error", "No se pudieron cargar las matrículas: " + error.message, "error");
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
            const token = localStorage.getItem("token");

            const response = await fetch(`http://127.0.0.1:8000/api/matricula/${id}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            if (response.ok) {
                setData((prev) => prev.filter((item) => item.id !== id));

                Swal.fire(
                    "¡Eliminado!",
                    "La matrícula ha sido eliminada correctamente.",
                    "success"
                );
            } else {
                Swal.fire(
                    "Error",
                    "No se pudo eliminar la matrícula. Puede tener datos relacionados.",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error eliminando:", error);

            Swal.fire(
                "Error",
                "Hubo un problema al eliminar la matrícula.",
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
                            width: 80px;
                            height: auto;
                        }

                        .titulo {
                            font-weight: bold;
                            text-decoration: underline;
                            margin-bottom: 15px;
                        }

                        .form-row {
                            margin-bottom: 10px;
                            border-bottom: 1px solid #000;
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
                    </style>
                </head>

                <body>
                    <div class="header">
                        <img src="${baseUrl}/Logo.png" class="logo-img" alt="Logo Adiact" />

                        <div class="header-text">
                            <strong>Instituto de Formación y Capacitación "Adiact"</strong><br>
                            <em>Somos expertos en Formación y Capacitación del Talento Humano</em><br>
                            <em>Ética, Integridad, Dedicación y Solidaridad</em>
                        </div>

                        <img src="${baseUrl}/Logo_esesa.png" class="logo-img" alt="Logo Escuela" />
                    </div>

                    <div class="titulo">
                        HOJA DE MATRÍCULA DE ADULTOS A CURSO DE: EDUCACIÓN VIAL Y MANEJO RESPONSABLE.
                        <br/>
                        Fecha: ${getFechaMatricula(matricula)}
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
                            <span class="label">Nacionalidad / fecha de nacimiento:</span>
                            ${getNacionalidad(matricula)} / ${getFechaNacimiento(matricula)}
                        </div>
                    </div>

                    <br/>

                    <div style="display: flex; gap: 20px;">
                        <div class="form-row" style="width: 30%">
                            <span class="label">Edad:${getEdad(matricula)}</span> 
                        </div>

                        <div class="form-row">
                            <span class="label">Número de cédula:${getCedula(matricula)}</span>
                            
                        </div>
                    </div>

                    <br/>

                    <div class="form-row">
                        <span class="label">Dirección${getDireccion(matricula)}:</span>
                    
                    </div>

                    <br/><br/>

                    <div class="form-row">
                        <span class="label">Correo electrónico: ${getCorreo(matricula)}</span>
                       
                    </div>

                    <br/><br/>

                    <div style="display: flex; gap: 20px;">
                        <div class="form-row">
                            <span class="label">Teléfono móvil ${getTelefono(matricula)}:</span>
                           
                        </div>

                        <div class="form-row">
                            <span class="label">Teléfono emergencia:</span>
                            <span class="value">${getTelefonoEmergencia(matricula)}</span>
                        </div>
                    </div>

                    <br/>

                    <div style="display: flex; gap: 10px;">
                        <div class="form-row">
                            <span class="label">Nivel Académico: ${getNivelEducativo(matricula)}</span>
                           
                        </div>

                        <div class="form-row">
                            <span class="label">Contacto emergencia:</span>
                            <span class="value">${getContactoEmergencia(matricula)}</span>
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
                            <span class="label">Categoría:   ${getCategoria(matricula)}</span>
                         
                        </div>
                    </div>

                    <br/>

                    <div class="form-row">
                        <span class="label">Observación:</span>
                        <span class="value">${matricula.observaciones || ""}</span>
                    </div>

                    <br/><br/><br/><br/><br/><br/><br/><br/>

                    <div style="text-align: center; margin: 30px 0; font-weight: bold;">
                        FIRMA DEL SOLICITANTE
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

    const enviarWhatsApp = (matricula) => {
        const telefono = getTelefono(matricula);
        const driveLink = "https://drive.google.com/drive/folders/1Xo9n8s0l7mLh2j3k4n5o6p7q8r9s0t?usp=sharing";

        if (!telefono) {
            Swal.fire("Sin teléfono", "El estudiante no tiene número de teléfono registrado", "warning");
            return;
        }

        const mensaje = `Hola ${getNombre(matricula)}, tu matrícula ha sido registrada exitosamente. Te has inscrito en el curso ${getCurso(matricula)} para la categoría ${getCategoria(matricula)}. Esperamos que aproveches al máximo tus clases teóricas y prácticas. Material de estudio: ${driveLink}`;

        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
    };

    const imprimirPorEdades = () => {
        let datosAImprimir = [];

        if (filtroEdad === "menores18") {
            datosAImprimir = data.filter((item) => parseInt(getEdad(item)) < 18);
        } else if (filtroEdad === "18a30") {
            datosAImprimir = data.filter(
                (item) => parseInt(getEdad(item)) >= 18 && parseInt(getEdad(item)) <= 30
            );
        } else if (filtroEdad === "31a50") {
            datosAImprimir = data.filter(
                (item) => parseInt(getEdad(item)) >= 31 && parseInt(getEdad(item)) <= 50
            );
        } else if (filtroEdad === "mayores50") {
            datosAImprimir = data.filter((item) => parseInt(getEdad(item)) > 50);
        } else {
            datosAImprimir = filteredByAge;
        }

        const ventanaImpresion = window.open("", "_blank");

        ventanaImpresion.document.write(`
            <html>
                <head>
                    <title>Reporte de Matrículas por Edad</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #4CAF50; color: white; }
                        .total { margin-top: 20px; font-weight: bold; text-align: right; }
                    </style>
                </head>

                <body>
                    <h1>Reporte de Matrículas</h1>

                    <p>
                        <strong>Filtro de edad:</strong>
                        ${
                            filtroEdad === "menores18"
                                ? "Menores de 18 años"
                                : filtroEdad === "18a30"
                                ? "18 a 30 años"
                                : filtroEdad === "31a50"
                                ? "31 a 50 años"
                                : filtroEdad === "mayores50"
                                ? "Mayores de 50 años"
                                : "Todos los registros"
                        }
                    </p>

                    <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Total de registros:</strong> ${datosAImprimir.length}</p>

                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Cédula</th>
                                <th>Edad</th>
                                <th>Sexo</th>
                                <th>Teléfono</th>
                                <th>Categoría</th>
                                <th>Curso</th>
                                <th>Estado</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${datosAImprimir
                                .map(
                                    (item) => `
                                    <tr>
                                        <td>${getNombre(item)}</td>
                                        <td>${getCedula(item)}</td>
                                        <td>${getEdad(item)}</td>
                                        <td>${getSexo(item)}</td>
                                        <td>${getTelefono(item)}</td>
                                        <td>${getCategoria(item)}</td>
                                        <td>${getCurso(item)}</td>
                                        <td>${item.estado === "matriculado" ? "Matriculado" : item.estado === "cancelado" ? "Cancelado" : "Pendiente"}</td>
                                    </tr>
                                `
                                )
                                .join("")}
                        </tbody>
                    </table>

                    <p style="margin-top: 30px; text-align: center; color: #666;">
                        Reporte generado el ${new Date().toLocaleDateString()}
                    </p>
                </body>
            </html>
        `);

        ventanaImpresion.document.close();
        ventanaImpresion.print();
    };

    const imprimirPorFechas = () => {
        let filtrados = data;

        if (fechaDesde) {
            const desde = new Date(fechaDesde);
            filtrados = filtrados.filter((item) => fechaLocal(getFechaMatricula(item)) >= desde);
        }

        if (fechaHasta) {
            const hasta = new Date(fechaHasta);
            filtrados = filtrados.filter((item) => fechaLocal(getFechaMatricula(item)) <= hasta);
        }

        if (filtrados.length === 0) {
            Swal.fire("Sin registros", "No se encontraron registros en este rango de fechas.", "info");
            return;
        }

        const ventanaImpresion = window.open("", "_blank");

        ventanaImpresion.document.write(`
            <html>
                <head>
                    <title>Reporte por Fechas</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background: #f0f0f0; }
                    </style>
                </head>

                <body>
                    <h1>Reporte de Matrículas</h1>

                    <p>
                        <strong>Desde:</strong> ${fechaDesde || "Inicio"}
                        <strong>Hasta:</strong> ${fechaHasta || "Fin"}
                    </p>

                    <p><strong>Total:</strong> ${filtrados.length} registros</p>

                    <table>
                        <thead>
                            <tr>
                                <th>F. Matrícula</th>
                                <th>Nombre</th>
                                <th>Cédula</th>
                                <th>Edad</th>
                                <th>Categoría</th>
                                <th>Curso</th>
                                <th>Estado</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${filtrados
                                .map(
                                    (item) => `
                                    <tr>
                                        <td>${getFechaMatricula(item)}</td>
                                        <td>${getNombre(item)}</td>
                                        <td>${getCedula(item)}</td>
                                        <td>${getEdad(item)}</td>
                                        <td>${getCategoria(item)}</td>
                                        <td>${getCurso(item)}</td>
                                        <td>${item.estado === "matriculado" ? "Matriculado" : item.estado === "cancelado" ? "Cancelado" : "Pendiente"}</td>
                                    </tr>
                                `
                                )
                                .join("")}
                        </tbody>
                    </table>
                </body>
            </html>
        `);

        ventanaImpresion.document.close();
        ventanaImpresion.print();
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

    const filteredByAge = (() => {
        if (!filtroEdad) return filteredData;

        return filteredData.filter((item) => {
            const edad = parseInt(getEdad(item));

            if (isNaN(edad)) return false;

            if (filtroEdad === "menores18") return edad < 18;
            if (filtroEdad === "18a30") return edad >= 18 && edad <= 30;
            if (filtroEdad === "31a50") return edad >= 31 && edad <= 50;
            if (filtroEdad === "mayores50") return edad > 50;

            return true;
        });
    })();

    const displayData = filteredByAge;

    return (
        <div className="w-full max-w-full min-w-0 overflow-hidden px-4">
            <div className="mb-4 space-y-2">
                <h1 className="text-4xl font-bold">Matrículas</h1>
                <p className="text-gray-600">
                    Registro y gestión de matrículas vinculadas a estudiantes ya registrados.
                </p>
            </div>

            <div className="w-full max-w-full overflow-x-auto">
                <div className="w-[1300px]">
                    <div className="flex flex-row items-center gap-3 rounded-xl whitespace-nowrap mb-4">
                        <div className="relative w-[280px] shrink-0">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                placeholder="Buscar por nombre, cédula o estado..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-3xl focus:outline-none bg-white border-blue-500 hover:outline-2 hover:outline-offset-2 hover:outline-dashed hover:border-blue-900 transition h-11"
                            />
                        </div>

                        <div className="flex gap-2">
                            <select
                                value={filtroEdad}
                                onChange={(e) => setFiltroEdad(e.target.value)}
                                className="w-[100px] border rounded-3xl focus:outline-none bg-white border-blue-500 h-11 px-3 shrink-0"
                            >
                                <option value="">Edades</option>
                                <option value="menores18">Menor a 18 años</option>
                                <option value="18a30">18 a 30 años</option>
                                <option value="31a50">31 a 50 años</option>
                                <option value="mayores50">Mayores de 50 años</option>
                            </select>

                            <button
                                onClick={imprimirPorEdades}
                                className="flex items-center gap-1 bg-white text-black px-5 rounded-3xl hover:bg-blue-300 transition h-11 hover:cursor-pointer"
                            >
                                <FiPrinter className="text-black" />
                                Edades
                            </button>
                        </div>

                        <input
                            type="date"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                            className="w-[140px] px-4 py-2 border rounded-3xl bg-white border-blue-500 shrink-0"
                            title="Fecha desde"
                        />

                        <input
                            type="date"
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                            className="w-[140px] px-4 py-2 border rounded-3xl bg-white border-blue-500 shrink-0"
                            title="Fecha hasta"
                        />

                        <button
                            onClick={imprimirPorFechas}
                            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-3xl hover:bg-blue-300 transition cursor-pointer"
                        >
                            <FiPrinter />
                            
                        </button>

                        <button
                            onClick={() => {
                                setEditData(null);
                                setShowModal(true);
                            }}
                            className="relative group overflow-hidden px-20 h-11 rounded-3xl bg-green-500 text-white flex items-center gap-2 transition-all duration-300 hover:bg-green-600 justify-end hover:cursor-pointer"
                        >
                            <span className="absolute top-0 left-[-75%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 group-hover:left-[125%] transition-all duration-700"></span>

                            <span className="relative z-10 flex items-center gap-2">
                                <FiUserPlus className="size-5" />
                                Nueva Matrícula
                            </span>
                        </button>
                    </div>

                    <div className="max-h-[600px] overflow-y-auto w-full">
                        <table className="">
                            <thead className="bg-gray-50 justify-center">
                                <tr className="border-gray-300">
                                    <th className="p-3 w-[60px]">Código</th>
                                    <th className="p-3 w-[220px]">Nombre</th>
                                    <th className="p-3 w-[180px]">Cédula</th> 
                                    <th className="p-3 w-[90px]">Edad</th> 
                                    <th className="p-3 w-[150px]">Teléfono</th>
                                    {/* <th className="p-3 w-[120px]">Categoría</th> */}
                                    <th className="p-3 w-[180px]">Curso</th>
                                    <th className="p-3 w-[130px]">Estado</th>
                                    <th className="p-3 w-[170px]">Opciones</th>
                                </tr>
                            </thead>

                            <tbody className="justify-center text-center items-center">
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
                                            className="hover:bg-blue-200 transition justify-center"
                                        >
                                            <td className="px-2">{item.id}</td>

                                            <td className="px-2">
                                                {getNombre(item)}
                                            </td>

                                             <td className="px-2">
                                                {getCedula(item)}
                                            </td> 

                                             <td className="px-5">
                                                {getEdad(item)}
                                            </td> 

                                            <td className="px-7">
                                                {getTelefono(item)}
                                            </td>

                                            {/* <td className="px-9 text-blue-800 font-bold">
                                                {getCategoria(item)}
                                            </td> */}

                                            <td className="p-2">
                                                {getCurso(item) || getPlan(item)}
                                            </td>

                                            {/* ESTADO CORREGIDO - Ahora usa "matriculado" en lugar de "aprobado" */}
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
                                                        onClick={() => imprimirMatriculaIndividual(item)}
                                                        className="p-2 rounded-lg hover:bg-green-100"
                                                        title="Imprimir Matrícula"
                                                    >
                                                        <AiOutlinePrinter className="text-green-500 text-xl hover:text-green-700 hover:cursor-pointer" />
                                                    </button>

                                                    <button
                                                        onClick={() => enviarWhatsApp(item)}
                                                        className="p-2 rounded-lg hover:bg-green-100"
                                                        title="Enviar por WhatsApp"
                                                    >
                                                        <IoLogoWhatsapp className="text-green-600 text-xl hover:text-green-700 hover:cursor-pointer" />
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
                        <div className="flex justify-between p-4 border-b">
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
