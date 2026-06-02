import { useEffect, useState } from "react";
import {
    FiPrinter,
    FiCalendar,
    FiUsers,
    FiFileText,
    FiBarChart2,
    FiChevronDown,
    FiShield,
    FiBookOpen,
    FiMapPin,
} from "react-icons/fi";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function ReportesPages() {
    const { user } = useAuth();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEdad, setFiltroEdad] = useState("");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [recibos, setRecibos] = useState([]);
    const [fechaReciboDesde, setFechaReciboDesde] = useState("");
    const [fechaReciboHasta, setFechaReciboHasta] = useState("");
    const [fechaInduccionDesde, setFechaInduccionDesde] = useState("");
    const [fechaInduccionHasta, setFechaInduccionHasta] = useState("");
    const [instructores, setInstructores] = useState([]);
    const [instructorSeleccionado, setInstructorSeleccionado] = useState("");
    const [fechaKmDesde, setFechaKmDesde] = useState("");
    const [fechaKmHasta, setFechaKmHasta] = useState("");
    const [instructorKmSeleccionado, setInstructorKmSeleccionado] = useState("");

    const getNombre = (item) => item.estudiante_nombre || "";
    const getCedula = (item) => item.estudiante_cedula || "";
    const getTelefono = (item) => item.estudiante_telefono || "";
    const getCurso = (item) => item.tipo_curso || "";
    const getCategoria = (item) => item.categoria || "";
    const getFechaMatricula = (item) => item.fecha_registro || item.fecha_matricula || "";
    const getFechaRecibo = (recibo) =>
        recibo.fecha_pago ||
        recibo.fecha ||
        recibo.fecha_recibo ||
        recibo.created_at ||
        recibo.fecha_creacion ||
        "";
    const getEdad = (item) => item.estudiante_edad || item.edad || "";
    const getSexo = (item) => item.estudiante_sexo || item.sexo || "";
    const [fechaPolicialDesde, setFechaPolicialDesde] = useState("");
    const [fechaPolicialHasta, setFechaPolicialHasta] = useState("");

    const fechaLocal = (fecha) => {
        if (!fecha) return null;

        const soloFecha = fecha.split("T")[0];
        const [year, month, day] = soloFecha.split("-");

        return new Date(Number(year), Number(month) - 1, Number(day));
    };

    const fetchMatriculas = async () => {
        try {
            setLoading(true);

            const response = await api.get("/matricula/");
            const result = response.data;

            setData(Array.isArray(result) ? result : result.results || []);
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

    const fetchRecibos = async () => {
        try {
            const response = await api.get("/recibo/");
            const result = response.data;

            console.log("RECIBOS CARGADOS:", result);

            const lista = Array.isArray(result)
                ? result
                : Array.isArray(result.results)
                ? result.results
                : [];

            setRecibos(lista);
        } catch (error) {
            console.error("Error cargando recibos:", error);
            setRecibos([]);
        }
    };

    useEffect(() => {
        fetchMatriculas();
        fetchRecibos();
        cargarInstructores();
    }, []);

    const cargarInstructores = async () => {
        try {
            const response = await api.get("/instructores/");
            const result = response.data;

            setInstructores(Array.isArray(result) ? result : result.results || []);
        } catch (error) {
            console.error("Error cargando instructores:", error);
            setInstructores([]);
        }
    };

    const datosPorEdad = (() => {
        if (!filtroEdad) return data;

        return data.filter((item) => {
            const edad = Number(getEdad(item));

            if (!Number.isFinite(edad)) return false;

            switch (filtroEdad) {
                case "menores18":
                    return edad < 18;

                case "18a20":
                    return edad >= 18 && edad <= 20;

                case "21a25":
                    return edad >= 21 && edad <= 25;

                case "26a30":
                    return edad >= 26 && edad <= 30;

                case "31a35":
                    return edad >= 31 && edad <= 35;

                case "36a40":
                    return edad >= 36 && edad <= 40;

                case "41a45":
                    return edad >= 41 && edad <= 45;

                case "46a50":
                    return edad >= 46 && edad <= 50;

                case "mayores50":
                    return edad > 50;

                default:
                    return true;
            }
        });
    })();

    const datosPorFecha = (() => {
        let filtrados = data;

        if (fechaDesde) {
            const desde = new Date(fechaDesde);
            filtrados = filtrados.filter((item) => {
                const fecha = fechaLocal(getFechaMatricula(item));
                return fecha && fecha >= desde;
            });
        }

        if (fechaHasta) {
            const hasta = new Date(fechaHasta);
            filtrados = filtrados.filter((item) => {
                const fecha = fechaLocal(getFechaMatricula(item));
                return fecha && fecha <= hasta;
            });
        }

        return filtrados;
    })();

    const formatearFecha = (fecha) => {
        if (!fecha) return "N/A";

        const texto = String(fecha).split("T")[0].trim();

        if (texto.includes("-")) {
            const [year, month, day] = texto.split("-");
            return `${day}/${month}/${year}`;
        }

        return texto;
    };

    const obtenerEstado = (r) => {
        const tipo = r.tipo_pago || "";

        if (tipo === "completo") return "Completo";
        if (tipo === "beneficio") return "Beneficio";
        if (tipo === "anticipo") return "Anticipo";

        return "Pendiente";
    };

    const convertirFechaANumero = (fecha) => {
        if (!fecha) return null;

        const texto = String(fecha).split("T")[0].trim();

        if (texto.includes("-")) {
            const [year, month, day] = texto.split("-");
            return Number(`${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`);
        }

        if (texto.includes("/")) {
            const [day, month, year] = texto.split("/");
            return Number(`${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`);
        }

        return null;
    };

    const recibosFiltradosPorFecha = (() => {
        const desdeNum = fechaReciboDesde
            ? convertirFechaANumero(fechaReciboDesde)
            : null;

        const hastaNum = fechaReciboHasta
            ? convertirFechaANumero(fechaReciboHasta)
            : null;

        return recibos.filter((recibo) => {
            if (!desdeNum && !hastaNum) return true;

            const fechaNum = convertirFechaANumero(getFechaRecibo(recibo));

            if (!fechaNum) return false;
            if (desdeNum && fechaNum < desdeNum) return false;
            if (hastaNum && fechaNum > hastaNum) return false;

            return true;
        });
    })();

    const exportarRecibosExcel = () => {
        const recibosFiltrados = recibosFiltradosPorFecha;

        if (recibosFiltrados.length === 0) {
            Swal.fire("Sin datos", "No hay recibos para exportar en ese rango.", "info");
            return;
        }

        const datosExcel = recibosFiltrados.map((recibo) => ({
            "N° Recibo/Factura": recibo.numero_recibo || "N/A",
            Fecha: formatearFecha(getFechaRecibo(recibo)),
            Estudiante:
                recibo.estudiante_nombre ||
                recibo.matricula_data?.estudiante_nombre ||
                "N/A",
            Cédula:
                recibo.estudiante_cedula ||
                recibo.matricula_data?.estudiante_cedula ||
                "N/A",
            "Tipo de Pago": obtenerEstado(recibo),
            "Monto (C$)": parseFloat(
                recibo.monto_pagado || recibo.monto_cordobas || 0
            ).toFixed(2),
            "Método de Pago": recibo.metodo_pago || "Efectivo",
            Observaciones: recibo.observaciones || "",
        }));

        const ws = XLSX.utils.json_to_sheet(datosExcel);
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "Recibos");

        const horaArchivo = new Date()
            .toISOString()
            .replaceAll(":", "-")
            .slice(0, 19);

        Swal.fire(
            "Excel generado",
            `Se exportaron ${recibosFiltrados.length} recibo(s).`,
            "success"
        );

        XLSX.writeFile(
            wb,
            `recibos_${fechaReciboDesde || "inicio"}_${fechaReciboHasta || "fin"}_${horaArchivo}.xlsx`
        );
    };
    const imprimirPorEdades = () => {
        const datosAImprimir = datosPorEdad;

        if (datosAImprimir.length === 0) {
            Swal.fire("Sin registros", "No se encontraron matrículas con ese filtro de edad.", "info");
            return;
        }

        const ventanaImpresion = window.open("", "_blank");

        ventanaImpresion.document.write(`
            <html>
                <head>
                    <title>Reporte de Matrículas por Edad</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #111; }
                        h1 { text-align: center; margin-bottom: 5px; }
                        .subtitulo { text-align: center; color: #555; margin-bottom: 25px; }
                        .datos { margin-bottom: 20px; font-size: 14px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #16a34a; color: white; }
                        .total { margin-top: 20px; font-weight: bold; text-align: right; }
                    </style>
                </head>

                <body>
                    <h1>Reporte de Matrículas</h1>
                    <div class="subtitulo">Reporte filtrado por edades</div>

                    <div class="datos">
                        <p>
                            <strong>Filtro de edad:</strong>
                            ${
                                filtroEdad === "menores18"
                                    ? "Menores de 18 años"
                                    : filtroEdad === "18a20"
                                    ? "18 a 20 años"
                                    : filtroEdad === "21a25"
                                    ? "21 a 25 años"
                                    : filtroEdad === "26a30"
                                    ? "26 a 30 años"
                                    : filtroEdad === "31a35"
                                    ? "31 a 35 años"
                                    : filtroEdad === "36a40"
                                    ? "36 a 40 años"
                                    : filtroEdad === "41a45"
                                    ? "41 a 45 años"
                                    : filtroEdad === "46a50"
                                    ? "46 a 50 años"
                                    : filtroEdad === "mayores50"
                                    ? "Mayores de 50 años"
                                    : "Todos los registros"
                            }
                        </p>

                        <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Total de registros:</strong> ${datosAImprimir.length}</p>
                    </div>

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
                                        <td>${
                                            item.estado === "matriculado"
                                                ? "Matriculado"
                                                : item.estado === "cancelado"
                                                ? "Cancelado"
                                                : item.estado === "aprobado"
                                                ? "Aprobado"
                                                : "Pendiente"
                                        }</td>
                                    </tr>
                                `
                                )
                                .join("")}
                        </tbody>
                    </table>

                    <p class="total">Total: ${datosAImprimir.length} registros</p>

                    <script>
                        window.onload = function() {
                            setTimeout(() => {
                                window.print();
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `);

        ventanaImpresion.document.close();
    };

    const imprimirPorFechas = () => {
        const filtrados = datosPorFecha;

        if (filtrados.length === 0) {
            Swal.fire("Sin registros", "No se encontraron registros en este rango de fechas.", "info");
            return;
        }

        const ventanaImpresion = window.open("", "_blank");

        ventanaImpresion.document.write(`
            <html>
                <head>
                    <title>Reporte de Matrículas por Fechas</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #111; }
                        h1 { text-align: center; margin-bottom: 5px; }
                        .subtitulo { text-align: center; color: #555; margin-bottom: 25px; }
                        .datos { margin-bottom: 20px; font-size: 14px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #2563eb; color: white; }
                        .total { margin-top: 20px; font-weight: bold; text-align: right; }
                    </style>
                </head>

                <body>
                    <h1>Reporte de Matrículas</h1>
                    <div class="subtitulo">Reporte filtrado por rango de fechas</div>

                    <div class="datos">
                        <p>
                            <strong>Desde:</strong> ${fechaDesde || "Inicio"}
                            &nbsp;&nbsp;
                            <strong>Hasta:</strong> ${fechaHasta || "Fin"}
                        </p>

                        <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Total de registros:</strong> ${filtrados.length}</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Fecha Matrícula</th>
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
                                        <td>${
                                            item.estado === "matriculado"
                                                ? "Matriculado"
                                                : item.estado === "cancelado"
                                                ? "Cancelado"
                                                : item.estado === "aprobado"
                                                ? "Aprobado"
                                                : "Pendiente"
                                        }</td>
                                    </tr>
                                `
                                )
                                .join("")}
                        </tbody>
                    </table>

                    <p class="total">Total: ${filtrados.length} registros</p>

                    <script>
                        window.onload = function() {
                            setTimeout(() => {
                                window.print();
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `);

        ventanaImpresion.document.close();
    };

    const exportarReporteInstructoresPolicial = async () => {
        try {
            const params = new URLSearchParams();

            if (fechaPolicialDesde) {
                params.append("desde", fechaPolicialDesde);
            }

            if (fechaPolicialHasta) {
                params.append("hasta", fechaPolicialHasta);
            }

            const response = await api.get(
                `/reporte-instructores-policial/?${params.toString()}`,
                {
                    responseType: "blob",
                    validateStatus: () => true,
                }
            );

            if (response.status < 200 || response.status >= 300) {
                const errorText = await response.data.text();

                console.error("ERROR REPORTE POLICIAL:", errorText);

                Swal.fire("Error", errorText, "error");
                return;
            }

            const blob = response.data;

            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;
            a.download = "INFORME TRANSITO POLICIA NAC.xlsm";

            document.body.appendChild(a);

            a.click();

            a.remove();

            window.URL.revokeObjectURL(url);

            Swal.fire(
                "Reporte generado",
                "El Excel fue descargado correctamente.",
                "success"
            );

        } catch (error) {
            console.error(error);

            Swal.fire(
                "Error",
                "Error de conexión con el servidor.",
                "error"
            );
        }
    };

    const imprimirReporteInduccionInstructores = async () => {
        try {
            if (!instructorSeleccionado) {
                Swal.fire(
                    "Instructor requerido",
                    "Debe seleccionar un instructor para generar el informe.",
                    "info"
                );
                return;
            }

            const baseUrl = window.location.origin;

            const params = new URLSearchParams();

            if (fechaInduccionDesde) {
                params.append("desde", fechaInduccionDesde);
            }

            if (fechaInduccionHasta) {
                params.append("hasta", fechaInduccionHasta);
            }

            params.append("instructor", instructorSeleccionado);

            const response = await api.get(
                `/reporte-induccion-instructores/?${params.toString()}`
            );

            const data = response.data;

            if (!data.estudiantes || data.estudiantes.length === 0) {
                Swal.fire(
                    "Sin datos",
                    "No hay estudiantes para ese instructor en el rango seleccionado.",
                    "info"
                );
                return;
            }

            const filas = data.estudiantes.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.estudiante || ""}</td>
                    <td>${item.fecha || ""}</td>
                    <td>${item.numero_recibo || ""}</td>
                    <td>${item.codigo_egreso || ""}</td>
                    <td>C$ ${Number(item.cobro || 0).toLocaleString()}</td>
                    <td>${item.observaciones || ""}</td>
                </tr>
            `).join("");

            const ventana = window.open("", "_blank");

            ventana.document.write(`
                <html>
                    <head>
                        <title>Informe de inducción</title>

                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                color: #000;
                                font-size: 13px;
                                background: #fff;
                            }

                            .page {
                                width: 8.5in;
                                min-height: 11in;
                                margin: 0 auto;
                                padding: 35px 45px;
                                box-sizing: border-box;
                                display: flex;
                                flex-direction: column;
                            }

                            .header {
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                border-bottom: 2px solid #222;
                                padding-bottom: 10px;
                                margin-bottom: 28px;
                            }

                            .logo-img {
                                width: 62px;
                                height: 62px;
                                object-fit: contain;
                            }

                            .header-text {
                                text-align: center;
                                font-size: 12px;
                                line-height: 1.35;
                            }

                            .header-text strong {
                                font-size: 13px;
                            }

                            .fecha {
                                margin-top: 18px;
                                margin-bottom: 18px;
                            }

                            .destinatario {
                                margin-bottom: 18px;
                                line-height: 1.45;
                            }

                            .parrafo {
                                text-align: justify;
                                line-height: 1.5;
                                margin-bottom: 18px;
                            }

                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 15px;
                                font-size: 11px;
                            }

                            th, td {
                                border: 1px solid #000;
                                padding: 6px;
                                text-align: center;
                                vertical-align: middle;
                            }

                            th {
                                background-color: #d9eaf7;
                                font-weight: bold;
                            }

                            .total {
                                margin-top: 15px;
                                text-align: right;
                                font-weight: bold;
                                font-size: 13px;
                            }

                            .mensaje-final {
                                margin-top: 40px;
                                font-size: 13px;
                                text-align: justify;
                                line-height: 1.5;
                            }

                            .despedida {
                                margin-top: 15px;
                                margin-bottom: 60px;
                                font-size: 13px;
                            }

                            .firmas {
                                display: flex;
                                justify-content: space-between;
                                gap: 70px;
                                margin-top: 35px;
                            }

                            .firma {
                                width: 45%;
                                text-align: center;
                                font-size: 12px;
                                border-top: 1px solid #000;
                                padding-top: 6px;
                            }

                            .footer {
                                margin-top: auto;
                                border-top: 2px solid #222;
                                padding-top: 8px;
                                text-align: center;
                                font-size: 10px;
                                line-height: 1.35;
                                font-weight: bold;
                            }

                            @media print {
                                body {
                                    margin: 0;
                                }

                                .page {
                                    width: 8.5in;
                                    min-height: 11in;
                                    padding: 30px 40px;
                                }
                            }
                        </style>
                    </head>

                    <body>
                        <div class="page">
                            <div class="header">
                                <img src="${baseUrl}/Logo_esesa.png" class="logo-img" alt="Logo Escuela" />

                                <div class="header-text">
                                    <strong>Instituto de Formación y Capacitación “Adiact”</strong><br>
                                    <em>Somos expertos en Formación y Capacitación del Talento Humano</em><br>
                                    <strong>Ética, Integridad, Dedicación y Solidaridad</strong>
                                </div>

                                <img src="${baseUrl}/Logo.png" class="logo-img" alt="Logo Adiact" />
                            </div>

                            <div class="fecha">
                                León, ${data.fecha_emision || ""}
                            </div>

                            <div class="destinatario">
                                <p>Licenciado</p>
                                <p><strong>${data.firmas?.gerente_nombre || ""}</strong></p>
                                <p>Gerente General de ESESA.</p>
                                <p>Sus Manos.</p>
                            </div>

                            <p><strong>Estimado Licenciado:</strong></p>

                            <p class="parrafo">
                                De la manera más atenta le solicito la autorización para el pago por los servicios 
                                de inducción en la Escuela de Manejo Cacique Adiact, prestados por el instructor
                                <strong>${data.instructor?.nombre || ""}</strong>, durante el período comprendido
                                del <strong>${data.fecha_desde || "inicio"}</strong> al
                                <strong>${data.fecha_hasta || "actual"}</strong>. La inducción les fue impartida
                                a los siguientes estudiantes de dicha Escuela:
                            </p>

                            <table>
                                <thead>
                                    <tr>
                                        <th>No.</th>
                                        <th>Alumnos Atendidos<br/>Nombres y Apellidos</th>
                                        <th>Fecha</th>
                                        <th>No. Recibo</th>
                                        <th>Código de Egreso</th>
                                        <th>Cobro por Alumno</th>
                                        <th>Observaciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    ${filas}
                                </tbody>
                            </table>

                            <div class="total">
                                TOTAL: C$ ${Number(data.total || 0).toLocaleString()}
                            </div>

                            <p class="mensaje-final">
                                Sin más que agradecer su atenta y pronta respuesta, aprovecho para desearle
                                éxitos en sus funciones.
                            </p>

                            <p class="despedida">
                                De usted, 
                                
                                Muy atentamente.
                            </p>

                            <div class="firmas">
                                <div class="firma">
                                    <div class="linea-firma"></div>
                                    <strong>${data.instructor?.nombre || ""}</strong><br>
                                    Instructor de Manejo
                                </div>

                                <div class="firma">
                                    <div class="linea-firma"></div>
                                    <strong>${data.firmas?.director_nombre || ""}</strong><br>
                                    Director Inst. Formación y Capacitación.
                                </div>
                            </div>

                            <div class="footer">
                                Gasolinera Uno Sutiaba 1 cuadra al norte ½ cuadra al oeste. León, Nicaragua<br>
                                Teléfonos: 2311-1333 y 8966-3770.<br>
                                email: institutoadiact@esesa.com.ni &nbsp;&nbsp;&nbsp; http://www.esesa.com.ni
                            </div>
                        </div>

                        <script>
                            window.onload = function() {
                                setTimeout(() => {
                                    window.focus();
                                    window.print();
                                }, 500);
                            };

                            window.onafterprint = function() {
                                window.close();
                            };
                        </script>
                    </body>
                </html>
            `);

            ventana.document.close();

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Error generando el informe de inducción.", "error");
        }
    };

    const exportarReporteKilometros = async () => {
        try {
            if (!instructorKmSeleccionado) {
                Swal.fire(
                    "Instructor requerido",
                    "Debe seleccionar un instructor para generar el reporte.",
                    "info"
                );
                return;
            }

            const params = new URLSearchParams();

            if (fechaKmDesde) {
                params.append("desde", fechaKmDesde);
            }

            if (fechaKmHasta) {
                params.append("hasta", fechaKmHasta);
            }

            params.append("instructor", instructorKmSeleccionado);

           const response = await api.get(
                `/reporte-kilometros-instructor/?${params.toString()}`,
                {
                    responseType: "blob",
                    validateStatus: () => true,
                }
            );

            if (response.status < 200 || response.status >= 300) {
                const errorText = await response.data.text();

                console.error("ERROR REPORTE KM:", errorText);
                Swal.fire("Error", errorText, "error");
                return;
            }

            const blob = response.data;
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "reporte_kilometros_instructor.xlsx";

            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);

            Swal.fire(
                "Reporte generado",
                "El reporte de kilómetros fue descargado correctamente.",
                "success"
            );
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Error generando el reporte de kilómetros.", "error");
        }
    };

    const cardBase =
        "relative overflow-hidden bg-white border border-slate-200 rounded-[1.7rem] p-6 pt-8 shadow-sm hover:shadow-md transition";

    const inputBase =
        "w-full h-11 px-4 border border-slate-300 rounded-xl bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

    const labelBase =
        "block text-sm font-semibold text-slate-600 mb-2";

    const counterBase =
        "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold";

    return (
            <div className="w-full max-w-[1500px] mx-auto px-4 md:px-6 py-6 space-y-7">
                <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 px-7 py-7 md:px-10 md:py-8 shadow-sm">
                    <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-blue-50 via-slate-50 to-transparent"></div>
                    <div className="absolute right-32 top-6 w-52 h-52 rounded-full bg-blue-100/40 blur-3xl"></div>

                    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                                <FiBarChart2 size={32} />
                            </div>

                            <div>
                                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                                    Reportes
                                </h1>

                                <p className="text-slate-500 mt-2 text-sm md:text-base">
                                    Generación de reportes administrativos
                                </p>
                            </div>
                        </div>

                        {/* <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-3xl px-4 py-3 shadow-sm">
                            <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold">
                                {(user?.username || "A").charAt(0).toUpperCase()}
                            </div>

                            <div className="leading-tight">
                                <p className="text-sm font-extrabold text-slate-900">
                                    {user?.username || "admin"}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Admin
                                </p>
                            </div>
                        </div> */}

                    </div>
                </div>

                {loading ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 shadow-sm">
                        Cargando reportes...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className={cardBase}>
                            <div className="absolute top-0 left-0 right-0 h-3 bg-green-500"></div>
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-50 rounded-full"></div>
                            <div className="absolute right-5 top-3 w-10 h-10 bg-green-500 text-white rounded-bl-3xl rounded-tr-[1.7rem] flex items-center justify-center">
                                <FiUsers size={19} />
                            </div>

                            <div className="relative flex items-start gap-5 mb-6">
                                <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                                    <FiUsers size={30} />
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-2xl font-extrabold text-slate-900">
                                        Reporte de Matrícula por edades
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Filtra las matrículas según el rango de edad del estudiante.
                                    </p>
                                </div>
                            </div>

                            <div className="relative space-y-5">
                                <select
                                    value={filtroEdad}
                                    onChange={(e) => setFiltroEdad(e.target.value)}
                                    className={inputBase}
                                >
                                    <option value="">Todas las edades</option>
                                    <option value="menores18">Menor a 18 años</option>
                                    <option value="18a20">18 a 20 años</option>
                                    <option value="21a25">21 a 25 años</option>
                                    <option value="26a30">26 a 30 años</option>
                                    <option value="31a35">31 a 35 años</option>
                                    <option value="36a40">36 a 40 años</option>
                                    <option value="41a45">41 a 45 años</option>
                                    <option value="46a50">46 a 50 años</option>
                                    <option value="mayores50">Mayores de 50 años</option>
                                </select>

                                <div className="border-t border-dashed border-slate-200 pt-4">
                                    <div className={`${counterBase} bg-green-50 text-green-700`}>
                                        <FiUsers />
                                        Registros encontrados:
                                        <strong>{datosPorEdad.length}</strong>
                                    </div>
                                </div>

                                <button
                                    onClick={imprimirPorEdades}
                                    className="w-full h-12 rounded-2xl bg-green-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition cursor-pointer"
                                >
                                    <FiPrinter />
                                    Imprimir reporte de Matrícula por edades
                                </button>
                            </div>
                        </div>

                        <div className={cardBase}>
                            <div className="absolute top-0 left-0 right-0 h-3 bg-blue-600"></div>
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-50 rounded-full"></div>
                            <div className="absolute right-5 top-3 w-10 h-10 bg-blue-600 text-white rounded-bl-3xl rounded-tr-[1.7rem] flex items-center justify-center">
                                <FiCalendar size={19} />
                            </div>

                            <div className="relative flex items-start gap-5 mb-6">
                                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                    <FiCalendar size={30} />
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-2xl font-extrabold text-slate-900">
                                        Reporte de Matrícula por fechas
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Filtra las matrículas por fecha de registro o matrícula.
                                    </p>
                                </div>
                            </div>

                            <div className="relative space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelBase}>Desde</label>
                                        <input
                                            type="date"
                                            value={fechaDesde}
                                            onChange={(e) => setFechaDesde(e.target.value)}
                                            className={inputBase}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelBase}>Hasta</label>
                                        <input
                                            type="date"
                                            value={fechaHasta}
                                            onChange={(e) => setFechaHasta(e.target.value)}
                                            className={inputBase}
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-slate-200 pt-4">
                                    <div className={`${counterBase} bg-blue-50 text-blue-700`}>
                                        <FiBarChart2 />
                                        Registros encontrados:
                                        <strong>{datosPorFecha.length}</strong>
                                    </div>
                                </div>

                                <button
                                    onClick={imprimirPorFechas}
                                    className="w-full h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition cursor-pointer"
                                >
                                    <FiPrinter />
                                    Imprimir reporte de Matrícula por fechas
                                </button>
                            </div>
                        </div>

                        <div className={cardBase}>
                            <div className="absolute top-0 left-0 right-0 h-3 bg-purple-600"></div>
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-50 rounded-full"></div>
                            <div className="absolute right-5 top-3 w-10 h-10 bg-purple-600 text-white rounded-bl-3xl rounded-tr-[1.7rem] flex items-center justify-center">
                                <FiFileText size={19} />
                            </div>

                            <div className="relative flex items-start gap-5 mb-6">
                                <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                    <FiFileText size={30} />
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-2xl font-extrabold text-slate-900">
                                        Exportar recibos
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Descarga en Excel todos los recibos registrados en el sistema.
                                    </p>
                                </div>
                            </div>

                            <div className="relative space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelBase}>Desde</label>
                                        <input
                                            type="date"
                                            value={fechaReciboDesde}
                                            onChange={(e) => setFechaReciboDesde(e.target.value)}
                                            className={inputBase}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelBase}>Hasta</label>
                                        <input
                                            type="date"
                                            value={fechaReciboHasta}
                                            onChange={(e) => setFechaReciboHasta(e.target.value)}
                                            className={inputBase}
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-slate-200 pt-4">
                                    <div className={`${counterBase} bg-purple-50 text-purple-700`}>
                                        <FiFileText />
                                        Recibos encontrados:
                                        <strong>{recibosFiltradosPorFecha.length}</strong>
                                    </div>
                                </div>

                                <button
                                    onClick={exportarRecibosExcel}
                                    className="w-full h-12 rounded-2xl bg-purple-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition cursor-pointer"
                                >
                                    <FiFileText />
                                    Exportar Recibos a Excel
                                </button>
                            </div>
                        </div>

                        <div className={cardBase}>
                            <div className="absolute top-0 left-0 right-0 h-3 bg-emerald-600"></div>
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-50 rounded-full"></div>
                            <div className="absolute right-5 top-3 w-10 h-10 bg-emerald-600 text-white rounded-bl-3xl rounded-tr-[1.7rem] flex items-center justify-center">
                                <FiShield size={19} />
                            </div>

                            <div className="relative flex items-start gap-5 mb-6">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                    <FiShield size={30} />
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-2xl font-extrabold text-slate-900">
                                        Reporte Policial
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Exporta el expediente completo de instructores.
                                    </p>
                                </div>
                            </div>

                            <div className="relative space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelBase}>Fecha Desde</label>
                                        <input
                                            type="date"
                                            value={fechaPolicialDesde}
                                            onChange={(e) => setFechaPolicialDesde(e.target.value)}
                                            className={inputBase}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelBase}>Fecha Hasta</label>
                                        <input
                                            type="date"
                                            value={fechaPolicialHasta}
                                            onChange={(e) => setFechaPolicialHasta(e.target.value)}
                                            className={inputBase}
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-slate-200 pt-4">
                                    <div className={`${counterBase} bg-emerald-50 text-emerald-700`}>
                                        <FiShield />
                                        Expedientes encontrados:
                                        <strong>{data.length}</strong>
                                    </div>
                                </div>

                                <button
                                    onClick={exportarReporteInstructoresPolicial}
                                    className="w-full h-12 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition cursor-pointer"
                                >
                                    <FiFileText />
                                    Exportar reporte policial
                                </button>
                            </div>
                        </div>

                        <div className={cardBase}>
                            <div className="absolute top-0 left-0 right-0 h-3 bg-orange-600"></div>
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-50 rounded-full"></div>
                            <div className="absolute right-5 top-3 w-10 h-10 bg-orange-600 text-white rounded-bl-3xl rounded-tr-[1.7rem] flex items-center justify-center">
                                <FiBookOpen size={19} />
                            </div>

                            <div className="relative flex items-start gap-5 mb-6">
                                <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                                    <FiBookOpen size={30} />
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-2xl font-extrabold text-slate-900">
                                        Informe de inducción de instructores
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Descarga el informe de estudiantes atendidos con sus dos notas registradas.
                                    </p>
                                </div>
                            </div>

                            <div className="relative space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelBase}>Fecha Desde</label>
                                        <input
                                            type="date"
                                            value={fechaInduccionDesde}
                                            onChange={(e) => setFechaInduccionDesde(e.target.value)}
                                            className={inputBase}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelBase}>Fecha Hasta</label>
                                        <input
                                            type="date"
                                            value={fechaInduccionHasta}
                                            onChange={(e) => setFechaInduccionHasta(e.target.value)}
                                            className={inputBase}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelBase}>Instructor</label>
                                    <select
                                        value={instructorSeleccionado}
                                        onChange={(e) => setInstructorSeleccionado(e.target.value)}
                                        className={inputBase}
                                    >
                                        <option value="">Seleccionar instructor</option>

                                        {instructores.map((instructor) => (
                                            <option key={instructor.id} value={instructor.id}>
                                                {instructor.nombre} {instructor.apellido}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="border-t border-dashed border-slate-200 pt-4">
                                    <div className={`${counterBase} bg-orange-50 text-orange-700`}>
                                        <FiBookOpen />
                                        Informes encontrados:
                                        <strong>{data.length}</strong>
                                    </div>
                                </div>

                                <button
                                    onClick={imprimirReporteInduccionInstructores}
                                    className="w-full h-12 rounded-2xl bg-orange-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition cursor-pointer"
                                >
                                    <FiPrinter />
                                    Imprimir informe de inducción
                                </button>
                            </div>
                        </div>

                        <div className={cardBase}>
                            <div className="absolute top-0 left-0 right-0 h-3 bg-sky-600"></div>
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-50 rounded-full"></div>
                            <div className="absolute right-5 top-3 w-10 h-10 bg-sky-600 text-white rounded-bl-3xl rounded-tr-[1.7rem] flex items-center justify-center">
                                <FiMapPin size={19} />
                            </div>

                            <div className="relative flex items-start gap-5 mb-6">
                                <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                                    <FiMapPin size={30} />
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-2xl font-extrabold text-slate-900">
                                        Reporte de kilómetros por instructor
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Descarga en Excel los kilómetros recorridos según asistencias registradas.
                                    </p>
                                </div>
                            </div>

                            <div className="relative space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelBase}>Fecha Desde</label>
                                        <input
                                            type="date"
                                            value={fechaKmDesde}
                                            onChange={(e) => setFechaKmDesde(e.target.value)}
                                            className={inputBase}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelBase}>Fecha Hasta</label>
                                        <input
                                            type="date"
                                            value={fechaKmHasta}
                                            onChange={(e) => setFechaKmHasta(e.target.value)}
                                            className={inputBase}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelBase}>Instructor</label>
                                    <select
                                        value={instructorKmSeleccionado}
                                        onChange={(e) => setInstructorKmSeleccionado(e.target.value)}
                                        className={inputBase}
                                    >
                                        <option value="">Seleccionar instructor</option>

                                        {instructores.map((instructor) => (
                                            <option key={instructor.id} value={instructor.id}>
                                                {instructor.nombre} {instructor.apellido}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="border-t border-dashed border-slate-200 pt-4">
                                    <div className={`${counterBase} bg-sky-50 text-sky-700`}>
                                        <FiMapPin />
                                        Registros encontrados:
                                        <strong>{data.length}</strong>
                                    </div>
                                </div>

                                <button
                                    onClick={exportarReporteKilometros}
                                    className="w-full h-12 rounded-2xl bg-sky-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-sky-700 transition cursor-pointer"
                                >
                                    <FiFileText />
                                    Exportar reporte de kilómetros
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
}

export default ReportesPages;
