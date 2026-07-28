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
    FiAward,
} from "react-icons/fi";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    Header,
    ImageRun,
    PageNumber,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    VerticalAlign,
    WidthType,
} from "docx";
import api from "../../api/axios";

const escaparHtml = (valor) => {
    return String(valor ?? "").replace(
        /[&<>"']/g,
        (caracter) => {
            const equivalencias = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;",
            };

            return equivalencias[caracter];
        }
    );
};

const cargarImagenWord = async (ruta) => {
    try {
        const respuesta = await fetch(ruta);

        if (!respuesta.ok) {
            return null;
        }

        return new Uint8Array(
            await respuesta.arrayBuffer()
        );
    } catch (error) {
        console.warn(
            "No se pudo cargar una imagen para Word:",
            error
        );

        return null;
    }
};

const bordesTablaWord = {
    top: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: "000000",
    },
    bottom: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: "000000",
    },
    left: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: "000000",
    },
    right: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: "000000",
    },
};

const sinBordesWord = {
    top: {
        style: BorderStyle.NONE,
        size: 0,
        color: "FFFFFF",
    },
    bottom: {
        style: BorderStyle.NONE,
        size: 0,
        color: "FFFFFF",
    },
    left: {
        style: BorderStyle.NONE,
        size: 0,
        color: "FFFFFF",
    },
    right: {
        style: BorderStyle.NONE,
        size: 0,
        color: "FFFFFF",
    },
};

const crearCeldaInformeWord = ({
    texto,
    ancho,
    encabezado = false,
    alineacion = AlignmentType.CENTER,
}) => {
    return new TableCell({
        width: {
            size: ancho,
            type: WidthType.DXA,
        },
        borders: bordesTablaWord,
        shading: encabezado
            ? {
                fill: "D9EAF7",
            }
            : undefined,
        verticalAlign: VerticalAlign.CENTER,
        margins: {
            top: 80,
            bottom: 80,
            left: 80,
            right: 80,
        },
        children: [
            new Paragraph({
                alignment: alineacion,
                spacing: {
                    before: 0,
                    after: 0,
                },
                children: [
                    new TextRun({
                        text: String(texto ?? ""),
                        bold: encabezado,
                        font: "Arial",
                        size: encabezado ? 16 : 15,
                    }),
                ],
            }),
        ],
    });
};

function ReportesPages() {
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

    const [fechaCertificadoDesde, setFechaCertificadoDesde] = useState("");
    const [fechaCertificadoHasta, setFechaCertificadoHasta] = useState("");
    const [certificados, setCertificados] = useState([]);
    const [loadingCertificados, setLoadingCertificados] = useState(false);

    const getNombre = (item) => item.estudiante_nombre || "";
    const getCedula = (item) => item.estudiante_cedula || "";
    const getTelefono = (item) => item.estudiante_telefono || "";
    const getCurso = (item) => item.tipo_curso || "";
    const getCategoria = (item) =>
        item.categoria_nombre ||
        item.categoria?.nombre ||
        (
            typeof item.categoria === "string"
                ? item.categoria
                : ""
        );
    const getEstadoMatricula = (item) => {
        const estados = {
            pendiente: "Pendiente",
            matriculado: "Matriculado",
            finalizado: "Finalizado",
        };

        return estados[item.estado] || item.estado || "";
    };
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

    useEffect(() => {
        fetchMatriculas();
        fetchRecibos();
        cargarInstructores();
    }, []);

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
    const recibosFiltrados =
        recibosFiltradosPorFecha;

    if (recibosFiltrados.length === 0) {
        Swal.fire(
            "Sin datos",
            "No hay recibos para exportar en ese rango.",
            "info"
        );
        return;
    }

    const datosExcel = recibosFiltrados.map(
        (recibo) => {
            const esBeneficio =
                String(
                    recibo.tipo_pago || ""
                ).toLowerCase() === "beneficio";

            const montoPagado = Number(
                recibo.monto_pagado ??
                recibo.monto_cordobas ??
                0
            );

            const porPagar =
                String(recibo.tipo_pago || "")
                    .trim()
                    .toLowerCase() === "anticipo"
                    ? Number(recibo.por_pagar ?? 0)
                    : 0;

            const totalCurso = Number(
                recibo.monto_total_curso ?? 0
            );

            return {
                "N° Recibo/Factura":
                    recibo.numero_recibo || "N/A",

                Fecha:
                    formatearFecha(
                        getFechaRecibo(recibo)
                    ),

                Estudiante:
                    recibo.estudiante_nombre ||
                    recibo.matricula_data
                        ?.estudiante_nombre ||
                    "N/A",

                Cédula:
                    recibo.estudiante_cedula ||
                    recibo.matricula_data
                        ?.estudiante_cedula ||
                    "N/A",

                "Tipo de Pago":
                    obtenerEstado(recibo),

                "Monto (C$)":
                    montoPagado,

                "Por Pagar (C$)":
                    porPagar,

                "Total del curso (C$)":
                    totalCurso,

                "Método de Pago":
                    recibo.metodo_pago ||
                    "Efectivo",

                Observaciones:
                    recibo.observaciones || "",
            };
        }
    );

    const cantidadRecibos =
        datosExcel.length;

    const totalesMoneda = {
        F: datosExcel.reduce(
            (total, fila) => (
                total +
                Number(
                    fila["Monto (C$)"] || 0
                )
            ),
            0
        ),

        G: datosExcel.reduce(
            (total, fila) => (
                total +
                Number(
                    fila["Por Pagar (C$)"] || 0
                )
            ),
            0
        ),

        H: datosExcel.reduce(
            (total, fila) => (
                total +
                Number(
                    fila[
                        "Total del curso (C$)"
                    ] || 0
                )
            ),
            0
        ),
    };

    datosExcel.push({
        "N° Recibo/Factura": "TOTALES",
        Fecha: "",
        Estudiante: "",
        Cédula: "",
        "Tipo de Pago": "",
        "Monto (C$)": totalesMoneda.F,
        "Por Pagar (C$)": totalesMoneda.G,
        "Total del curso (C$)":
            totalesMoneda.H,
        "Método de Pago": "",
        Observaciones: "",
    });

    const ws =
        XLSX.utils.json_to_sheet(
            datosExcel
        );

    const filaTotalExcel =
        cantidadRecibos + 2;

    const ultimaFilaDatos =
        cantidadRecibos + 1;

    ["F", "G", "H"].forEach(
        (columna) => {
            ws[
                `${columna}${filaTotalExcel}`
            ] = {
                t: "n",
                f: (
                    `SUM(${columna}2:` +
                    `${columna}${ultimaFilaDatos})`
                ),
                v: totalesMoneda[columna],
                z: '"C$" #,##0.00',
            };
        }
    );

    const rangoHoja =
        XLSX.utils.decode_range(
            ws["!ref"]
        );

    for (
        let fila = 1;
        fila <= rangoHoja.e.r;
        fila += 1
    ) {
        [5, 6, 7].forEach(
            (columna) => {
                const referencia =
                    XLSX.utils.encode_cell({
                        r: fila,
                        c: columna,
                    });

                const celda =
                    ws[referencia];

                if (celda) {
                    celda.t = "n";
                    celda.z =
                        '"C$" #,##0.00';
                }
            }
        );
    }

    ws["!cols"] = [
        { wch: 20 },
        { wch: 14 },
        { wch: 38 },
        { wch: 22 },
        { wch: 17 },
        { wch: 16 },
        { wch: 18 },
        { wch: 22 },
        { wch: 18 },
        { wch: 35 },
    ];

    const wb =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Recibos"
    );

    const horaArchivo = new Date()
        .toISOString()
        .replaceAll(":", "-")
        .slice(0, 19);

    Swal.fire(
        "Excel generado",
        (
            `Se exportaron ` +
            `${recibosFiltrados.length} ` +
            `recibo(s).`
        ),
        "success"
    );

    XLSX.writeFile(
        wb,
        (
            `recibos_` +
            `${fechaReciboDesde || "inicio"}_` +
            `${fechaReciboHasta || "fin"}_` +
            `${horaArchivo}.xlsx`
        )
    );
};

    const imprimirPorEdades = () => {
        const datosAImprimir = datosPorEdad;

        if (datosAImprimir.length === 0) {
            Swal.fire("Sin registros", "No se encontraron matrículas con ese filtro de edad.", "info");
            return;
        }

        const ventanaImpresion = window.open("", "_blank");

        if (!ventanaImpresion) {
            Swal.fire(
                "Ventana bloqueada",
                (
                    "El navegador bloqueó la ventana de impresión. "
                    + "Permita las ventanas emergentes e inténtelo nuevamente."
                ),
                "warning"
            );
            return;
        }

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
                                        <td>${escaparHtml(getNombre(item))}</td>
                                        <td>${escaparHtml(getCedula(item))}</td>
                                        <td>${escaparHtml(getEdad(item))}</td>
                                        <td>${escaparHtml(getSexo(item))}</td>
                                        <td>${escaparHtml(getTelefono(item))}</td>
                                        <td>${escaparHtml(getCategoria(item))}</td>
                                        <td>${escaparHtml(getCurso(item))}</td>
                                        <td>${escaparHtml(getEstadoMatricula(item))}</td>
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

    const exportarPorFechasWord = async () => {
        const filtrados = datosPorFecha;

        if (filtrados.length === 0) {
            Swal.fire(
                "Sin registros",
                "No se encontraron registros en este rango de fechas.",
                "info"
            );
            return;
        }

        try {
            const bordes = {
                top: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: "B8C4D6",
                },
                bottom: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: "B8C4D6",
                },
                left: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: "B8C4D6",
                },
                right: {
                    style: BorderStyle.SINGLE,
                    size: 4,
                    color: "B8C4D6",
                },
            };

            const crearCelda = (
                texto,
                ancho,
                encabezado = false,
                alineacion = AlignmentType.LEFT
            ) => {
                return new TableCell({
                    width: {
                        size: ancho,
                        type: WidthType.DXA,
                    },
                    borders: bordes,
                    shading: encabezado
                        ? { fill: "2563EB" }
                        : undefined,
                    verticalAlign: VerticalAlign.CENTER,
                    margins: {
                        top: 90,
                        bottom: 90,
                        left: 100,
                        right: 100,
                    },
                    children: [
                        new Paragraph({
                            alignment: alineacion,
                            spacing: {
                                before: 0,
                                after: 0,
                            },
                            children: [
                                new TextRun({
                                    text: String(texto ?? ""),
                                    bold: encabezado,
                                    color: encabezado
                                        ? "FFFFFF"
                                        : "111827",
                                    font: "Arial",
                                    size: encabezado ? 18 : 17,
                                }),
                            ],
                        }),
                    ],
                });
            };

            const anchos = [
                1300,
                2500,
                1700,
                700,
                1700,
                1400,
                1500,
            ];

            const encabezados = [
                "Fecha Matrícula",
                "Nombre",
                "Cédula",
                "Edad",
                "Categoría",
                "Curso",
                "Estado",
            ];

            const filasTabla = [
                new TableRow({
                    tableHeader: true,
                    children: encabezados.map(
                        (encabezado, indice) =>
                            crearCelda(
                                encabezado,
                                anchos[indice],
                                true,
                                AlignmentType.CENTER
                            )
                    ),
                }),

                ...filtrados.map((item) => {
                    const valores = [
                        formatearFecha(
                            getFechaMatricula(item)
                        ),
                        getNombre(item),
                        getCedula(item),
                        getEdad(item),
                        getCategoria(item),
                        getCurso(item),
                        getEstadoMatricula(item),
                    ];

                    return new TableRow({
                        cantSplit: true,
                        children: valores.map(
                            (valor, indice) =>
                                crearCelda(
                                    valor,
                                    anchos[indice],
                                    false,
                                    indice === 1
                                        ? AlignmentType.LEFT
                                        : AlignmentType.CENTER
                                )
                        ),
                    });
                }),
            ];

            const documento = new Document({
                creator: "CACIQUE ADIACT",
                title: "Reporte de Matrículas por Fechas",
                description:
                    "Reporte de matrículas filtrado por rango de fechas",
                sections: [
                    {
                        properties: {
                            page: {
                                margin: {
                                    top: 650,
                                    right: 540,
                                    bottom: 720,
                                    left: 540,
                                },
                            },
                        },

                        footers: {
                            default: new Footer({
                                children: [
                                    new Paragraph({
                                        alignment:
                                            AlignmentType.CENTER,
                                        children: [
                                            new TextRun({
                                                text:
                                                    "CACIQUE ADIACT — Página ",
                                                font: "Arial",
                                                size: 16,
                                                color: "64748B",
                                            }),
                                            PageNumber.CURRENT,
                                        ],
                                    }),
                                ],
                            }),
                        },

                        children: [
                            new Paragraph({
                                alignment:
                                    AlignmentType.CENTER,
                                spacing: {
                                    after: 80,
                                },
                                children: [
                                    new TextRun({
                                        text:
                                            "REPORTE DE MATRÍCULAS",
                                        bold: true,
                                        font: "Arial",
                                        size: 30,
                                        color: "1E3A8A",
                                    }),
                                ],
                            }),

                            new Paragraph({
                                alignment:
                                    AlignmentType.CENTER,
                                spacing: {
                                    after: 280,
                                },
                                children: [
                                    new TextRun({
                                        text:
                                            "Reporte filtrado por rango de fechas",
                                        font: "Arial",
                                        size: 20,
                                        color: "475569",
                                    }),
                                ],
                            }),

                            new Paragraph({
                                spacing: {
                                    after: 80,
                                },
                                children: [
                                    new TextRun({
                                        text: "Desde: ",
                                        bold: true,
                                        font: "Arial",
                                        size: 20,
                                    }),
                                    new TextRun({
                                        text: formatearFecha(
                                            fechaDesde
                                        ),
                                        font: "Arial",
                                        size: 20,
                                    }),
                                    new TextRun({
                                        text: "    Hasta: ",
                                        bold: true,
                                        font: "Arial",
                                        size: 20,
                                    }),
                                    new TextRun({
                                        text: formatearFecha(
                                            fechaHasta
                                        ),
                                        font: "Arial",
                                        size: 20,
                                    }),
                                ],
                            }),

                            new Paragraph({
                                spacing: {
                                    after: 80,
                                },
                                children: [
                                    new TextRun({
                                        text:
                                            "Fecha de generación: ",
                                        bold: true,
                                        font: "Arial",
                                        size: 20,
                                    }),
                                    new TextRun({
                                        text:
                                            new Date().toLocaleString(
                                                "es-NI"
                                            ),
                                        font: "Arial",
                                        size: 20,
                                    }),
                                ],
                            }),

                            new Paragraph({
                                spacing: {
                                    after: 220,
                                },
                                children: [
                                    new TextRun({
                                        text:
                                            "Total de registros: ",
                                        bold: true,
                                        font: "Arial",
                                        size: 20,
                                    }),
                                    new TextRun({
                                        text: String(
                                            filtrados.length
                                        ),
                                        font: "Arial",
                                        size: 20,
                                    }),
                                ],
                            }),

                            new Table({
                                width: {
                                    size: 10800,
                                    type: WidthType.DXA,
                                },
                                columnWidths: anchos,
                                rows: filasTabla,
                            }),

                            new Paragraph({
                                alignment:
                                    AlignmentType.RIGHT,
                                spacing: {
                                    before: 220,
                                },
                                children: [
                                    new TextRun({
                                        text:
                                            `Total: ${filtrados.length} registros`,
                                        bold: true,
                                        font: "Arial",
                                        size: 20,
                                        color: "1E3A8A",
                                    }),
                                ],
                            }),
                        ],
                    },
                ],
            });

            const archivoWord = await Packer.toBlob(
                documento
            );

            saveAs(
                archivoWord,
                `reporte_matriculas_${fechaDesde || "inicio"}_${fechaHasta || "fin"}.docx`
            );

            Swal.fire(
                "Word generado",
                `Se exportaron ${filtrados.length} matrícula(s) correctamente.`,
                "success"
            );
        } catch (error) {
            console.error(
                "Error generando Word de matrículas:",
                error
            );

            Swal.fire(
                "Error",
                "No se pudo generar el documento Word.",
                "error"
            );
        }
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

    const exportarReporteInduccionWord = async () => {
        try {
            if (!instructorSeleccionado) {
                Swal.fire(
                    "Instructor requerido",
                    "Debe seleccionar un instructor para generar el informe.",
                    "info"
                );
                return;
            }

            const params = new URLSearchParams();

            if (fechaInduccionDesde) {
                params.append(
                    "desde",
                    fechaInduccionDesde
                );
            }

            if (fechaInduccionHasta) {
                params.append(
                    "hasta",
                    fechaInduccionHasta
                );
            }

            params.append(
                "instructor",
                instructorSeleccionado
            );

            const response = await api.get(
                `/reporte-induccion-instructores/?${params.toString()}`
            );

            const reporte = response.data;

            if (!reporte.estudiantes?.length) {
                Swal.fire(
                    "Sin datos",
                    "No hay estudiantes para ese instructor en el rango seleccionado.",
                    "info"
                );
                return;
            }

            const [logoEsesa, logoAdiact] =
                await Promise.all([
                    cargarImagenWord(
                        `${window.location.origin}/Logo_esesa.png`
                    ),
                    cargarImagenWord(
                        `${window.location.origin}/Logo.png`
                    ),
                ]);

            const crearTexto = (
                texto,
                opciones = {}
            ) => {
                return new TextRun({
                    text: String(texto ?? ""),
                    font: "Arial",
                    size: 20,
                    ...opciones,
                });
            };

            const crearParrafo = (
                children,
                opciones = {}
            ) => {
                return new Paragraph({
                    children,
                    spacing: {
                        before: 0,
                        after: 100,
                        ...(opciones.spacing || {}),
                    },
                    ...opciones,
                });
            };

            const imagenLogo = (imagen) => {
                if (!imagen) {
                    return [];
                }

                return [
                    new ImageRun({
                        data: imagen,
                        type: "png",
                        transformation: {
                            width: 55,
                            height: 55,
                        },
                    }),
                ];
            };

            const crearCeldaEncabezado = ({
                children,
                ancho,
                alineacion,
            }) => {
                return new TableCell({
                    width: {
                        size: ancho,
                        type: WidthType.DXA,
                    },
                    borders: {
                        ...sinBordesWord,
                        bottom: {
                            style: BorderStyle.SINGLE,
                            size: 12,
                            color: "222222",
                        },
                    },
                    verticalAlign:
                        VerticalAlign.CENTER,
                    children: [
                        new Paragraph({
                            alignment: alineacion,
                            children,
                        }),
                    ],
                });
            };

            const encabezadoDocumento =
                new Header({
                    children: [
                        new Table({
                            width: {
                                size: 10800,
                                type: WidthType.DXA,
                            },
                            columnWidths: [
                                1200,
                                8400,
                                1200,
                            ],
                            rows: [
                                new TableRow({
                                    children: [
                                        crearCeldaEncabezado({
                                            children:
                                                imagenLogo(
                                                    logoEsesa
                                                ),
                                            ancho: 1200,
                                            alineacion:
                                                AlignmentType.LEFT,
                                        }),

                                        new TableCell({
                                            width: {
                                                size: 8400,
                                                type:
                                                    WidthType.DXA,
                                            },
                                            borders: {
                                                ...sinBordesWord,
                                                bottom: {
                                                    style:
                                                        BorderStyle.SINGLE,
                                                    size: 12,
                                                    color:
                                                        "222222",
                                                },
                                            },
                                            verticalAlign:
                                                VerticalAlign.CENTER,
                                            children: [
                                                crearParrafo(
                                                    [
                                                        crearTexto(
                                                            "Instituto de Formación y Capacitación “Adiact”",
                                                            {
                                                                bold: true,
                                                            }
                                                        ),
                                                    ],
                                                    {
                                                        alignment:
                                                            AlignmentType.CENTER,
                                                        spacing: {
                                                            after: 25,
                                                        },
                                                    }
                                                ),

                                                crearParrafo(
                                                    [
                                                        crearTexto(
                                                            "Somos expertos en Formación y Capacitación del Talento Humano",
                                                            {
                                                                italics:
                                                                    true,
                                                                size: 16,
                                                            }
                                                        ),
                                                    ],
                                                    {
                                                        alignment:
                                                            AlignmentType.CENTER,
                                                        spacing: {
                                                            after: 25,
                                                        },
                                                    }
                                                ),

                                                crearParrafo(
                                                    [
                                                        crearTexto(
                                                            "Ética, Integridad, Dedicación y Solidaridad",
                                                            {
                                                                bold: true,
                                                                size: 17,
                                                            }
                                                        ),
                                                    ],
                                                    {
                                                        alignment:
                                                            AlignmentType.CENTER,
                                                        spacing: {
                                                            after: 0,
                                                        },
                                                    }
                                                ),
                                            ],
                                        }),

                                        crearCeldaEncabezado({
                                            children:
                                                imagenLogo(
                                                    logoAdiact
                                                ),
                                            ancho: 1200,
                                            alineacion:
                                                AlignmentType.RIGHT,
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                });

            const anchos = [
                500,
                2500,
                1300,
                1400,
                1200,
                1400,
                2500,
            ];

            const encabezados = [
                "N°",
                "Alumnos atendidos\nNombres y apellidos",
                "Fecha de\nmatrícula",
                "Fecha de\nfinalización",
                "N° de factura",
                "Cobro por alumno",
                "Observaciones",
            ];

            const filasTabla = [
                new TableRow({
                    tableHeader: true,
                    children: encabezados.map(
                        (texto, indice) =>
                            crearCeldaInformeWord({
                                texto,
                                ancho:
                                    anchos[indice],
                                encabezado: true,
                            })
                    ),
                }),

                ...reporte.estudiantes.map(
                    (item, indice) => {
                        const cobro = Number(
                            item.cobro || 0
                        ).toLocaleString(
                            "es-NI",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        );

                        const valores = [
                            indice + 1,
                            item.estudiante || "",
                            item.fecha_matricula || "",
                            item.fecha_finalizacion || "",
                            item.numero_recibo || "",
                            `C$ ${cobro}`,
                            item.observaciones || "",
                        ];

                        return new TableRow({
                            cantSplit: true,
                            children: valores.map(
                                (
                                    texto,
                                    columna
                                ) =>
                                    crearCeldaInformeWord({
                                        texto,
                                        ancho:
                                            anchos[columna],
                                        alineacion:
                                            [
                                                1,
                                                6,
                                            ].includes(
                                                columna
                                            )
                                                ? AlignmentType.LEFT
                                                : AlignmentType.CENTER,
                                    })
                            ),
                        });
                    }
                ),
            ];

            const crearFirma = (
                nombre,
                cargo
            ) => {
                return new TableCell({
                    width: {
                        size: 4000,
                        type: WidthType.DXA,
                    },
                    borders: {
                        ...sinBordesWord,
                        top: {
                            style:
                                BorderStyle.SINGLE,
                            size: 8,
                            color: "000000",
                        },
                    },
                    children: [
                        crearParrafo(
                            [
                                crearTexto(
                                    nombre,
                                    {
                                        bold: true,
                                        size: 18,
                                    }
                                ),
                            ],
                            {
                                alignment:
                                    AlignmentType.CENTER,
                                spacing: {
                                    after: 25,
                                },
                            }
                        ),

                        crearParrafo(
                            [
                                crearTexto(
                                    cargo,
                                    {
                                        bold: true,
                                        size: 18,
                                    }
                                ),
                            ],
                            {
                                alignment:
                                    AlignmentType.CENTER,
                                spacing: {
                                    after: 0,
                                },
                            }
                        ),
                    ],
                });
            };

            const nombreInstructor = String(
                reporte.instructor?.nombre || ""
            );

            const total = Number(
                reporte.total || 0
            ).toLocaleString(
                "es-NI",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }
            );

            const documento = new Document({
                creator: "CACIQUE ADIACT",
                title:
                    "Informe de pago a instructores",

                sections: [
                    {
                        properties: {
                            page: {
                                margin: {
                                    top: 1450,
                                    right: 720,
                                    bottom: 1100,
                                    left: 720,
                                    header: 300,
                                    footer: 300,
                                },
                            },
                        },

                        headers: {
                            default:
                                encabezadoDocumento,
                        },

                        footers: {
                            default: new Footer({
                                children: [
                                    crearParrafo(
                                        [
                                            crearTexto(
                                                "Gasolinera Uno Sutiaba 1 cuadra al norte ½ cuadra al oeste. León, Nicaragua\n"
                                                + "Teléfonos: 2311-1333 y 8966-3770.\n"
                                                + "email: institutoadiact@esesa.com.ni    http://www.esesa.com.ni",
                                                {
                                                    bold: true,
                                                    size: 14,
                                                }
                                            ),
                                        ],
                                        {
                                            alignment:
                                                AlignmentType.CENTER,
                                            border: {
                                                top: {
                                                    style:
                                                        BorderStyle.SINGLE,
                                                    size: 12,
                                                    color:
                                                        "222222",
                                                },
                                            },
                                            spacing: {
                                                before: 60,
                                                after: 0,
                                            },
                                        }
                                    ),
                                ],
                            }),
                        },

                        children: [
                            crearParrafo(
                                [
                                    crearTexto(
                                        `León, ${reporte.fecha_emision || ""}`
                                    ),
                                ],
                                {
                                    alignment:
                                        AlignmentType.RIGHT,
                                    spacing: {
                                        after: 220,
                                    },
                                }
                            ),

                            crearParrafo([
                                crearTexto(
                                    "Licenciado"
                                ),
                            ]),

                            crearParrafo([
                                crearTexto(
                                    reporte.firmas
                                        ?.gerente_nombre
                                    || "",
                                    {
                                        bold: true,
                                    }
                                ),
                            ]),

                            crearParrafo([
                                crearTexto(
                                    "Gerente General de ESESA."
                                ),
                            ]),

                            crearParrafo(
                                [
                                    crearTexto(
                                        "Sus Manos."
                                    ),
                                ],
                                {
                                    spacing: {
                                        after: 220,
                                    },
                                }
                            ),

                            crearParrafo(
                                [
                                    crearTexto(
                                        "Estimado Licenciado:",
                                        {
                                            bold: true,
                                        }
                                    ),
                                ],
                                {
                                    spacing: {
                                        after: 180,
                                    },
                                }
                            ),

                            crearParrafo(
                                [
                                    crearTexto(
                                        "De la manera más atenta le solicito la autorización para el pago por los servicios de Inducción en la Escuela de Manejo Cacique Adiact, prestados por el instructor "
                                    ),

                                    crearTexto(
                                        nombreInstructor,
                                        {
                                            bold: true,
                                        }
                                    ),

                                    crearTexto(
                                        ", durante el período comprendido del "
                                    ),

                                    crearTexto(
                                        reporte.fecha_desde
                                        || "inicio",
                                        {
                                            bold: true,
                                        }
                                    ),

                                    crearTexto(" al "),

                                    crearTexto(
                                        reporte.fecha_hasta
                                        || "actual",
                                        {
                                            bold: true,
                                        }
                                    ),

                                    crearTexto(
                                        ". La Inducción les fue impartida a los siguientes estudiantes de dicha Escuela:"
                                    ),
                                ],
                                {
                                    alignment:
                                        AlignmentType.JUSTIFIED,
                                    spacing: {
                                        line: 300,
                                        after: 220,
                                    },
                                }
                            ),

                            new Table({
                                width: {
                                    size: 10800,
                                    type:
                                        WidthType.DXA,
                                },
                                columnWidths: anchos,
                                rows: filasTabla,
                            }),

                            crearParrafo(
                                [
                                    crearTexto(
                                        `TOTAL: C$ ${total}`,
                                        {
                                            bold: true,
                                            size: 21,
                                        }
                                    ),
                                ],
                                {
                                    alignment:
                                        AlignmentType.RIGHT,
                                    spacing: {
                                        before: 180,
                                        after: 320,
                                    },
                                }
                            ),

                            crearParrafo(
                                [
                                    crearTexto(
                                        "Sin más que agradecer su atenta y pronta respuesta, aprovecho para desearle éxitos en sus funciones."
                                    ),
                                ],
                                {
                                    alignment:
                                        AlignmentType.JUSTIFIED,
                                    spacing: {
                                        line: 300,
                                        after: 180,
                                    },
                                }
                            ),

                            crearParrafo(
                                [
                                    crearTexto(
                                        "De usted,\nMuy atentamente."
                                    ),
                                ],
                                {
                                    spacing: {
                                        after: 700,
                                    },
                                }
                            ),

                            new Table({
                                width: {
                                    size: 9000,
                                    type:
                                        WidthType.DXA,
                                },
                                columnWidths: [
                                    4000,
                                    1000,
                                    4000,
                                ],
                                alignment:
                                    AlignmentType.CENTER,
                                rows: [
                                    new TableRow({
                                        cantSplit: true,
                                        children: [
                                            crearFirma(
                                                nombreInstructor,
                                                "Instructor de Manejo"
                                            ),

                                            new TableCell({
                                                width: {
                                                    size: 1000,
                                                    type:
                                                        WidthType.DXA,
                                                },
                                                borders:
                                                    sinBordesWord,
                                                children: [
                                                    new Paragraph(
                                                        ""
                                                    ),
                                                ],
                                            }),

                                            crearFirma(
                                                reporte.firmas
                                                    ?.director_nombre
                                                || "",
                                                "Director Inst. Formación y Capacitación"
                                            ),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    },
                ],
            });

            const archivoWord =
                await Packer.toBlob(
                    documento
                );

            const nombreArchivo =
                nombreInstructor
                    .normalize("NFD")
                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    )
                    .replace(
                        /[^a-zA-Z0-9]+/g,
                        "_"
                    )
                    .replace(
                        /^_+|_+$/g,
                        ""
                    )
                || "instructor";

            saveAs(
                archivoWord,
                (
                    `pago_instructor_${nombreArchivo}_`
                    + `${fechaInduccionDesde || "inicio"}_`
                    + `${fechaInduccionHasta || "fin"}.docx`
                )
            );

            Swal.fire(
                "Word generado",
                "El informe de pago al instructor fue descargado correctamente.",
                "success"
            );
        } catch (error) {
            console.error(
                "Error generando informe Word:",
                error
            );

            Swal.fire(
                "Error",
                "Error generando el informe de pago al instructor.",
                "error"
            );
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

    const buscarEstudiantesParaCertificado = async () => {
        try {
            if (!fechaCertificadoDesde || !fechaCertificadoHasta) {
                Swal.fire(
                    "Fechas requeridas",
                    "Debe seleccionar la fecha desde y la fecha hasta para buscar egresados.",
                    "info"
                );
                return;
            }

            setLoadingCertificados(true);

            const params = new URLSearchParams();
            params.append("desde", fechaCertificadoDesde);
            params.append("hasta", fechaCertificadoHasta);

            const response = await api.get(
                `/certificados-egresados/?${params.toString()}`
            );

            const result = response.data;

            const lista = Array.isArray(result)
                ? result
                : Array.isArray(result.results)
                ? result.results
                : [];

            setCertificados(lista);

            if (lista.length === 0) {
                Swal.fire(
                    "Sin registros",
                    "No hay estudiantes egresados del curso principiante con las dos notas mayor o igual a 80 en ese rango.",
                    "info"
                );
            }
        } catch (error) {
            console.error("ERROR CERTIFICADOS:", error);

            const mensaje =
                error.response?.data?.detail ||
                error.message ||
                "No se pudieron cargar los estudiantes para certificado.";

            Swal.fire("Error", mensaje, "error");
            setCertificados([]);
        } finally {
            setLoadingCertificados(false);
        }
    };

    const descargarCertificadosPowerPoint = async () => {
        try {
            if (!fechaCertificadoDesde || !fechaCertificadoHasta) {
                Swal.fire(
                    "Fechas requeridas",
                    "Debe seleccionar la fecha desde y la fecha hasta para generar el PowerPoint.",
                    "info"
                );
                return;
            }

            const params = new URLSearchParams();
            params.append("desde", fechaCertificadoDesde);
            params.append("hasta", fechaCertificadoHasta);

            const response = await api.get(
                `/certificados-egresados-powerpoint/?${params.toString()}`,
                {
                    responseType: "blob",
                    validateStatus: () => true,
                }
            );

            if (response.status < 200 || response.status >= 300) {
                const errorText = await response.data.text();

                console.error("ERROR WORD CERTIFICADOS:", errorText);

                Swal.fire(
                    "Error",
                    errorText || "No se pudo generar el PowerPoint de certificados.",
                    "error"
                );
                return;
            }

            const blob = response.data;
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `certificados_${fechaCertificadoDesde}_${fechaCertificadoHasta}.pptx`;

            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);

            Swal.fire(
                "PowerPoint generado",
                "Los certificados fueron descargados correctamente.",
                "success"
            );
        } catch (error) {
            console.error("ERROR DESCARGANDO CERTIFICADOS:", error);

            Swal.fire(
                "Error",
                "Error de conexión con el servidor al generar los certificados.",
                "error"
            );
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

                    </div>
                </div>

                {loading ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 shadow-sm">
                        Cargando reportes...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className={`${cardBase} xl:col-span-2`}>
                            <div className="absolute top-0 left-0 right-0 h-3 bg-amber-600"></div>
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-50 rounded-full"></div>

                            <div className="absolute right-5 top-3 w-10 h-10 bg-amber-600 text-white rounded-bl-3xl rounded-tr-[1.7rem] flex items-center justify-center">
                                <FiAward size={19} />
                            </div>

                            <div className="relative flex items-start gap-5 mb-6">
                                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                    <FiAward size={30} />
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-2xl font-extrabold text-slate-900">
                                        Emisión de certificados
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Genera certificados PowerPoint para estudiantes egresados del curso principiante con nota teórica y práctica mayor o igual a 80.
                                    </p>
                                </div>
                            </div>

                            <div className="relative space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelBase}>Fecha Desde</label>

                                        <input
                                            type="date"
                                            value={fechaCertificadoDesde}
                                            onChange={(e) => setFechaCertificadoDesde(e.target.value)}
                                            className={inputBase}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelBase}>Fecha Hasta</label>

                                        <input
                                            type="date"
                                            value={fechaCertificadoHasta}
                                            onChange={(e) => setFechaCertificadoHasta(e.target.value)}
                                            className={inputBase}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button
                                        onClick={buscarEstudiantesParaCertificado}
                                        disabled={loadingCertificados}
                                        className="w-full h-12 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <FiUsers />
                                        {loadingCertificados ? "Buscando..." : "Buscar egresados"}
                                    </button>

                                    <button
                                        onClick={descargarCertificadosPowerPoint}
                                        className="w-full h-12 rounded-2xl bg-amber-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-amber-700 transition cursor-pointer"
                                    >
                                        <FiFileText />
                                        Descargar PowerPoint
                                    </button>
                                </div>

                                <div className="border-t border-dashed border-slate-200 pt-4">
                                    <div className={`${counterBase} bg-amber-50 text-amber-700`}>
                                        <FiAward />
                                        Certificados encontrados:
                                        <strong>{certificados.length}</strong>
                                    </div>
                                </div>

                                {certificados.length > 0 && (
                                    <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-2xl">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 text-slate-600 sticky top-0">
                                                <tr>
                                                    <th className="text-left px-4 py-3">Estudiante</th>
                                                    <th className="text-left px-4 py-3">Cédula</th>
                                                    <th className="text-left px-4 py-3">Categoría</th>
                                                    <th className="text-left px-4 py-3">Egreso</th>
                                                    <th className="text-left px-4 py-3">Teórica</th>
                                                    <th className="text-left px-4 py-3">Práctica</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {certificados.map((item) => (
                                                    <tr key={item.id} className="border-t border-slate-100">
                                                        <td className="px-4 py-3 font-semibold text-slate-800">
                                                            {item.estudiante || "N/A"}
                                                        </td>

                                                        <td className="px-4 py-3 text-slate-600">
                                                            {item.cedula || "N/A"}
                                                        </td>

                                                        <td className="px-4 py-3 text-slate-600">
                                                            {item.categoria || "N/A"}
                                                        </td>

                                                        <td className="px-4 py-3 text-slate-600">
                                                            {item.fecha_egreso || "N/A"}
                                                        </td>

                                                        <td className="px-4 py-3 text-slate-600">
                                                            {item.nota_teorica ?? "N/A"}
                                                        </td>

                                                        <td className="px-4 py-3 text-slate-600">
                                                            {item.nota_practica ?? "N/A"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

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
                                    onClick={exportarPorFechasWord}
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
                                        Solicitud de Pago a Instructores
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
                                    onClick={exportarReporteInduccionWord}
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
