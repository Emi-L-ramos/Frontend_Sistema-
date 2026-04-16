import { useState, useEffect } from "react";
import { FiUserPlus, FiSearch, FiX, FiPrinter } from "react-icons/fi";
import { AiOutlinePrinter } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { CiEdit } from "react-icons/ci";
import MatriculaForm from "../../components/matriculaForm";
import { IoLogoWhatsapp } from "react-icons/io5";

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

    const fetchMatriculas = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/matricula/", {
                headers: { "Authorization": `Token ${token}` }
            });
            const result = await response.json();
            setData(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const eliminarMatricula = async (id) => {
        const confirmacion = confirm("¿Seguro que quieres eliminar?");
        if (!confirmacion) return;

        try {
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:8000/api/matricula/${id}/`, {
                method: "DELETE",
                headers: { "Authorization": `Token ${token}` }
            });
            setData(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Error eliminando:", error);
        }
    };

    const imprimirMatriculaIndividual = (matricula) => {
        const ventanaImpresion = window.open('', '_blank');
        ventanaImpresion.document.write(`
            <html>
                <head>
                    <style>
                        @page { size: A4; margin: 15mm; }
                        body { font-family: 'Arial', sans-serif; font-size: 13px; line-height: 1.4; color: #000; }
                        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                        .titulo { font-weight: bold; text-decoration: underline; margin-bottom: 15px; }
                        .form-row { margin-bottom: 10px; border-bottom: 1px solid #000; width: 100%; display: inline-block; }
                        .label { font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #000; padding: 5px; height: 30px; text-align: left; }
                        .th-col { width: 100px; }
                        .footer-nota { font-size: 11px; margin-top: 20px; }
                        .pie-pagina { margin-top: 40px; text-align: center; border-top: 2px solid #333; padding-top: 10px; font-size: 11px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <strong>Instituto de Formación y Capacitación "Adiact"</strong><br>
                        <em>Somos expertos en Formación y Capacitación del Talento Humano</em><br>
                        <em>Ética, Integridad, Dedicación y Solidaridad</em>
                    </div>
                    <div class="titulo">HOJA DE MATRICULA DE ADULTOS A CURSO DE: EDUCACION VIAL Y MANEJO RESPONSABLE... Fecha: ${matricula.f_matricula}</div>
                    <div class="form-row"><span class="label">Nombres y apellidos:</span> ${matricula.nombre || ''} ${matricula.apellido || ''}</div>
                    <div style="display: flex; gap: 20px;">
                        <div class="form-row" style="width: 30%"> <span class="label">Sexo:</span> ${matricula.sexo || ''}</div>
                        <div class="form-row"> <span class="label">Nacionalidad/fecha de nacimiento:</span> ${matricula.fecha_nacimiento}</div>
                    </div>
                    <div style="display: flex; gap: 20px;">
                        <div class="form-row" style="width: 30%"> <span class="label">Edad:</span> ${matricula.edad || ''}</div>
                        <div class="form-row"> <span class="label">Número de cédula:</span> ${matricula.cedula || ''}</div>
                    </div>
                    <div class="form-row"> <span class="label">Dirección:</span> ${matricula.direccion || '' }</div>
                    <div class="form-row"> <span class="label">Correo electrónico:</span>${matricula.correo_electronico || '' }</div>
                    <div style="display: flex; gap: 20px;">
                        <div class="form-row"> <span class="label">Teléfono convencional:</span> ${matricula.telefono_movil}</div>
                        <div class="form-row"> <span class="label">Teléfono móvil:</span> ${matricula.telefono_movil || ''}</div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <div class="form-row"> <span class="label">Nivel Academico:</span>${matricula.nivel_educativo || '' }</div>
                        <div class="form-row"> <span class="label">Profesión u oficio:</span> ${matricula.profesion_u_oficio || '' }</div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <div class="form-row"> <span class="label">Modalidad:</span> ${matricula.modalidad  || '' }</div>
                        <div class="form-row"> <span class="label">Horario:</span> ${matricula.horario || '' }</div>
                        <div class="form-row"> <span class="label">Tipo de curso:</span> ${matricula.tipo_curso || ''}</div>
                    </div>
                    <div style="text-align: center; margin: 30px 0; font-weight: bold;">FIRMA DEL SOLICITANTE</div>
                    <table>
                        <tr><td class="th-col">DE:</td><td>Escuela de Manejo</td><td class="th-col">FECHA:</td><td></td></tr>
                        <tr><td class="th-col">ASUNTO:</td><td colspan="3" style="height: 60px;"></td></tr>
                        <tr><td class="th-col">CANTIDAD:</td><td colspan="3"></td></tr>
                    </table>
                    <div class="footer-nota">
                        <strong>NOTA:</strong><br>
                        1-NO SE ACEPTA DEVOLUCIONES.<br>
                        2-TIENE 60 DIAS PARA GESTION DE LICENCIA.<br>
                        3-AUSENCIA INJUSTIFICADA ES CLASE DADA
                    </div>
                    <div class="pie-pagina">
                        <strong>ESCUELA DE MANEJO EL CACIQUE ADIACT</strong><br>
                        Gasolinera UNO Sutiava 1 cuadra al norte y ½ c. oeste. Teléfono: 2315 - 2568
                    </div>
                </body>
            </html>
        `);
        ventanaImpresion.document.close();
        ventanaImpresion.print();
    };

    const enviarWhatsApp = (matricula) => {
        const telefono = matricula.telefono_movil;
        if (!telefono) {
            alert("El estudiante no tiene número de teléfono registrado");
            return;
        }
        const mensaje = `Hola ${matricula.nombre} ${matricula.apellido || ''}, te confirmamos tu matrícula en el curso ${matricula.tipo_curso || ''}. ¡Bienvenido!`;
        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    };

    const imprimirPorEdades = () => {
        let datosAImprimir = [];
        if (filtroEdad === "menores18") {
            datosAImprimir = data.filter(item => parseInt(item.edad) < 18);
        } else if (filtroEdad === "18a30") {
            datosAImprimir = data.filter(item => parseInt(item.edad) >= 18 && parseInt(item.edad) <= 30);
        } else if (filtroEdad === "31a50") {
            datosAImprimir = data.filter(item => parseInt(item.edad) >= 31 && parseInt(item.edad) <= 50);
        } else if (filtroEdad === "mayores50") {
            datosAImprimir = data.filter(item => parseInt(item.edad) > 50);
        } else {
            datosAImprimir = filteredByAge;
        }

        const ventanaImpresion = window.open('', '_blank');
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
                    <p><strong>Filtro:</strong> ${filtroEdad || "Todos"}</p>
                    <table>
                        <thead>
                            <tr><th>Nombre</th><th>Cédula</th><th>Edad</th><th>Sexo</th><th>Teléfono</th><th>Curso</th></tr>
                        </thead>
                        <tbody>
                            ${datosAImprimir.map(item => `
                                <tr>
                                    <td>${item.nombre} ${item.apellido || ''}</td>
                                    <td>${item.cedula || ''}</td>
                                    <td>${item.edad || ''}</td>
                                    <td>${item.sexo || ''}</td>
                                    <td>${item.telefono_movil || ''}</td>
                                    <td>${item.tipo_curso || ''}</td>
                                </tr>
                            `).join('')}
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

    const filteredData = data.filter(item =>
        (item.nombre?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (item.cedula || "").includes(search)
    );

    const filteredByAge = (() => {
        if (!filtroEdad) return filteredData;
        return filteredData.filter(item => {
            const edad = parseInt(item.edad);
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
        <div className="min-h-screen">
            {/* HEADER */}
            <div className="max-w-7xl mx-auto mb-4 space-y-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold">Matrículas</h1>
                    <p className="text-gray-600">Registro y gestión de nuevas matrículas</p>
                </div>

                {/* BARRA DE HERRAMIENTAS - CORREGIDA PARA ALINEACIÓN */}
                <div className="flex flex-col md:flex-row items-center gap-3">
                    
                    {/* BUSCADOR */}
                    <div className="relative w-full md:w-1/3 flex items-center">
                        <FiSearch className="absolute left-3 text-gray-400 z-10" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o cédula..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 border rounded-3xl border-blue-500 focus:outline-none bg-white transition hover:border-blue-900"
                        />
                    </div>

                    {/* FILTRO EDADES */}
                    <select
                        value={filtroEdad}
                        onChange={(e) => setFiltroEdad(e.target.value)}
                        className="h-11 px-4 border rounded-lg border-blue-500 focus:outline-none bg-white"
                    >
                        <option value="">Todas las edades</option>
                        <option value="menores18">Menores de 18 años</option>
                        <option value="18a30">18 a 30 años</option>
                        <option value="31a50">31 a 50 años</option>
                        <option value="mayores50">Mayores de 50 años</option>
                    </select>

                    {/* BOTÓN IMPRIMIR EDADES */}
                    <button
                        onClick={imprimirPorEdades}
                        className="h-11 w-12 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm"
                    >
                        <FiPrinter className="text-black text-xl" />    
                    </button>

                    {/* RANGO DE FECHAS */}
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                            className="h-11 px-3 border rounded-lg border-blue-500 bg-white"
                        />
                        <input
                            type="date"
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                            className="h-11 px-3 border rounded-lg border-blue-500 bg-white"
                        />
                    </div>

                    {/* BOTÓN IMPRIMIR FECHAS */}
                    <button
                        onClick={() => {
                            let filtrados = data;
                            if (fechaDesde) filtrados = filtrados.filter(item => new Date(item.f_matricula) >= new Date(fechaDesde));
                            if (fechaHasta) filtrados = filtrados.filter(item => new Date(item.f_matricula) <= new Date(fechaHasta));
                            if (filtrados.length === 0) return alert("No hay registros.");
                            
                            const v = window.open('', '_blank');
                            v.document.write(`<html><body><h1>Reporte</h1><table>${filtrados.map(i => `<tr><td>${i.nombre}</td></tr>`).join('')}</table></body></html>`);
                            v.document.close();
                            v.print();
                        }}
                        className="h-11 px-4 flex items-center justify-center bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                        <FiPrinter className="text-xl" />
                    </button>

                    {/* BOTÓN NUEVA MATRÍCULA */}
                    <button
                        onClick={() => { setEditData(null); setShowModal(true); }}
                        className="h-11 px-5 flex items-center gap-2 text-black font-medium border-2 border-dashed border-gray-800 rounded-lg hover:bg-yellow-400 hover:text-white transition ml-auto"
                    >
                        <FiUserPlus />
                        Nueva Matrícula
                    </button>
                </div>
            </div>

            {/* TABLA */}
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-50">
                            <tr className="border-gray-300">
                                <th className="p-3">Nombre</th>
                                <th className="p-3">Cédula</th>
                                <th className="p-3">Edad</th>
                                <th className="p-3">Sexo</th>
                                <th className="p-3">Teléfono</th>
                                <th className="p-3">Categoría</th>
                                <th className="p-3">Curso</th>
                                <th className="p-3">Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" className="p-6 text-center">Cargando...</td></tr>
                            ) : displayData.length > 0 ? (
                                displayData.map(item => (
                                    <tr key={item.id} className="hover:bg-blue-200 transition border-b border-gray-100">
                                        <td className="p-2">{item.nombre} {item.apellido}</td>
                                        <td className="p-2">{item.cedula}</td>
                                        <td className="p-2">{item.edad}</td>
                                        <td className="p-2">{item.sexo}</td>
                                        <td className="p-2">{item.telefono_movil}</td>
                                        <td className="p-2">{item.categoria}</td>
                                        <td className="p-2">{item.tipo_curso}</td>
                                        <td className="p-2">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => eliminarMatricula(item.id)} className="p-2 rounded-lg hover:bg-red-100"><RiDeleteBinLine className="text-red-500 text-xl" /></button>
                                                <button onClick={() => { setEditData(item); setShowModal(true); }} className="p-2 rounded-lg hover:bg-blue-100"><CiEdit className="text-blue-500 text-xl" /></button>
                                                <button onClick={() => imprimirMatriculaIndividual(item)} className="p-2 rounded-lg hover:bg-green-100"><AiOutlinePrinter className="text-green-500 text-xl" /></button>
                                                <button onClick={() => enviarWhatsApp(item)} className="p-2 rounded-lg hover:bg-green-100"><IoLogoWhatsapp className="text-green-600 text-xl" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="9" className="p-6 text-center text-gray-400">No hay registros</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl" style={{ maxHeight: "90vh", overflowY: "auto" }}>
                        <div className="flex justify-between p-4 border-b">
                            <h2 className="font-bold text-4xl">{editData ? "Editar Matrícula" : "Nueva Matrícula"}</h2>
                            <button onClick={closeModal} className="text-red-700 text-2xl hover:bg-red-100 rounded-full w-12 h-12">
                                <FiX />
                            </button>
                        </div>
                        <div className="p-6">
                            <MatriculaForm
                                key={editData?.id || 'new'}
                                initialData={editData}
                                onSave={() => { fetchMatriculas(); closeModal(); }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MatriculaPage;