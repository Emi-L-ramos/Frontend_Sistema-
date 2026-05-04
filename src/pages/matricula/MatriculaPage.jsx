// src/pages/matricula/MatriculaPage.jsx
import { useState, useEffect } from "react";
import { FiUserPlus, FiSearch, FiX, FiPrinter } from "react-icons/fi";
import { AiOutlinePrinter } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { CiEdit } from "react-icons/ci";
import MatriculaForm from "../../components/matriculaForm";
import { IoLogoWhatsapp } from "react-icons/io5";
import Swal from 'sweetalert2';

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
 
    // Traer datos desde Django
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

    //Funcion para eliminar una matricula

    const eliminarMatricula = async (id) => {
    const result = await Swal.fire({
        title: 'Â¿EstÃ¡s seguro?',
        text: "Â¡No podrÃ¡s revertir esta acciÃ³n!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'SÃ­, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        // Mostrar loading
        Swal.fire({
            title: 'Eliminando...',
            text: 'Por favor espera',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const token = localStorage.getItem("token");
            await fetch(`http://localhost:8000/api/matricula/${id}/`, {
                method: "DELETE",
                headers: { "Authorization": `Token ${token}` }
            });
            
            setData(prev => prev.filter(item => item.id !== id));
            
            Swal.fire(
                'Â¡Eliminado!',
                'La matrÃ­cula ha sido eliminada correctamente.',
                'success'
            );
        } catch (error) {
            console.error("Error eliminando:", error);
            Swal.fire(
                'Error',
                'Hubo un problema al eliminar la matrÃ­cula.',
                'error'
            );
        }
    }
};

        const imprimirMatriculaIndividual = (matricula) => {
            const baseUrl = window.location.origin;
            const ventanaImpresion = window.open('', '_blank');
            ventanaImpresion.document.write(`
                <html>
                    <head>
                        <style>
                            @page { size: A4; margin: 15mm; }
                            body { font-family: 'Arial', sans-serif; font-size: 13px; line-height: 1.4; color: #000; }
                            
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
                            .titulo { font-weight: bold; text-decoration: underline; margin-bottom: 15px; }
                            .form-row { margin-bottom: 10px; border-bottom: 1px solid #000; width: 100%; display: inline-block; }
                            .label { font-weight: bold; }
                            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                            th, td { border: 1px solid #000; padding: 5px; height: 30px; text-align: left; }
                            .footer-nota { font-size: 11px; margin-top: 20px; }
                            .pie-pagina { margin-top: 40px; text-align: center; border-top: 2px solid #333; padding-top: 10px; font-size: 11px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <img src="${baseUrl}/Logo.png" class="logo-img" alt="Logo Adiact" />
                            <div class="header-text">
                                <strong>Instituto de FormaciÃ³n y CapacitaciÃ³n "Adiact"</strong><br>
                                <em>Somos expertos en FormaciÃ³n y CapacitaciÃ³n del Talento Humano</em><br>
                                <em>Ã‰tica, Integridad, DedicaciÃ³n y Solidaridad</em>
                            </div>
                            <img src="${baseUrl}/Logo_esesa.png" class="logo-img" alt="Logo Escuela" />
                        </div>

                        <div class="titulo">HOJA DE MATRICULA DE ADULTOS A CURSO DE: EDUCACION VIAL Y MANEJO RESPONSABLE.
                        <br/>
                        Fecha: ${matricula.f_matricula}</div>
                        <br/>
                    
                        <div class="form-row"><span class="label">Nombres y apellidos:</span> ${matricula.nombre || ''}  ${matricula.apellido || ''}</div>
                        <br/>
                        <br/>
                        <div style="display: flex; gap: 20px;">
                            <div class="form-row" style="width: 30%"><span class="label">Sexo:</span> ${matricula.sexo || ''}</div>
                            <div class="form-row"><span class="label">Nacionalidad/fecha de nacimiento:</span> ${matricula.fecha_nacimiento}, ${matricula.nacionalidad || ''}</div>
                        </div>
                        <br/>
                        <div style="display: flex; gap: 20px;">
                            <div class="form-row" style="width: 30%"><span class="label">Edad:</span> ${matricula.edad || ''}</div>
                            <br/>
                            <div class="form-row"><span class="label">NÃºmero de cÃ©dula:</span> ${matricula.cedula || ''}</div>
                        </div>
                        <br/>
                        <div class="form-row"><span class="label">DirecciÃ³n:</span> ${matricula.direccion || ''}</div>
                        <br/>
                        <br/>
                        <div class="form-row"><span class="label">Correo electrÃ³nico:</span> ${matricula.correo_electronico || ''}</div>
                        <br/><br/>
                        <div style="display: flex; gap: 20px;">
                            <div class="form-row"><span class="label">TelÃ©fono convencional:</span> ${matricula.telefono_movil || ''}</div>
                            <div class="form-row"><span class="label">TelÃ©fono mÃ³vil:</span> ${matricula.telefono_emergencia || ''}</div>
                        </div>

                        <br/>

                        <div style="display: flex; gap: 10px;">
                            <div class="form-row"><span class="label">Nivel Academico:</span> ${matricula.nivel_educativo || ''}</div>
                            <div class="form-row"><span class="label">ProfesiÃ³n u oficio:</span> ${matricula.profesion_u_oficio || ''}</div>
                        </div>

                        <br/>

                        <div style="display: flex; gap: 10px;">
                            <div class="form-row"><span class="label">Modalidad:</span> ${matricula.modalidad || ''}</div>
                            <div class="form-row"><span class="label">Horario:</span> ${matricula.horario || ''}</div>
                            <div class="form-row"><span class="label">Tipo de curso:</span> ${matricula.tipo_curso || ''}</div>
                            
                        </div>
                       <br/>
                       <div class="form-row"><span class="label">Observación:</span> ${matricula.observaciones || ''}</div>
                        <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
                        

                        <div style="text-align: center; margin: 30px 0; font-weight: bold;">FIRMA DEL SOLICITANTE</div>

                        <div class="footer-nota">
                            <strong>NOTA:</strong><br>
                            1-NO SE ACEPTA DEVOLUCIONES.<br>
                            2-TIENE 60 DIAS PARA GESTION DE LICENCIA.<br>
                            3-AUSENCIA INJUSTIFICADA ES CLASE DADA
                        </div>

                        <div class="pie-pagina">
                            <strong>ESCUELA DE MANEJO EL CACIQUE ADIACT</strong><br>
                            Gasolinera UNO Sutiava 1 cuadra al norte y Â½ c. oeste. TelÃ©fono: 2315 - 2568
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

    // FunciÃ³n para enviar WhatsApp

    const  driveLink = "https://drive.google.com/drive/folders/1UysqcQZQNAqBnSDtWmnssxGZL2XPuki8";
    const enviarWhatsApp = (matricula) => {
        const telefono = matricula.telefono_movil;
        if (!telefono) {
            alert("El estudiante no tiene nÃºmero de telÃ©fono registrado");
            return;
        }
        //Aqui configuramos un mensaje automatico para whatpsap
        const mensaje = `Hola ${matricula.nombre} ${matricula.apellido || ''}, Tu matricula ha sido registrada exitosamente. Nos complaces comunicarte que te has inscrito en el curso  ${matricula.tipo_curso || ''} de vehiculo para la Categoria ${matricula.categoria}, esperamos que aprobechas al maximo tus clases como teori­ca y practica, ¡Si tienes alguna Consulta no dudes en Comunicarte con nosotros!, Material de estudio: ${driveLink}`;
        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    };
    

  

    // FunciÃ³n para imprimir por edades
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
            datosAImprimir = filteredByAge; // Usar filteredByAge en lugar de displayData
        }

        const ventanaImpresion = window.open('', '_blank');
        ventanaImpresion.document.write(`
            <html>
                <head>
                    <title>Reporte de MatrÃ­culas por Edad</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #4CAF50; color: white; }
                        .total { margin-top: 20px; font-weight: bold; text-align: right; }
                        @media print {
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Reporte de MatrÃ­culas</h1>
                    <p><strong>Filtro de edad:</strong> ${filtroEdad === "menores18" ? "Menores de 18 aÃ±os" : 
                        filtroEdad === "18a30" ? "18 a 30 aÃ±os" :
                        filtroEdad === "31a50" ? "31 a 50 aÃ±os" :
                        filtroEdad === "mayores50" ? "Mayores de 50 aÃ±os" : "Todos los registros"}</p>
                    <p><strong>Fecha de generaciÃ³n:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Total de registros:</strong> ${datosAImprimir.length}</p>
                    <table>
                        <thead>
                            <tr><th>Nombre</th><th>CÃ©dula</th><th>Edad</th><th>Sexo</th><th>TelÃ©fono</th><th>CategorÃ­a</th><th>Curso</th><th>Monto</th></tr>
                        </thead>
                        <tbody>
                            ${datosAImprimir.map(item => `
                                <tr>
                                    <td>${item.nombre} ${item.apellido || ''}</td>
                                    <td>${item.cedula || ''}</td>
                                    <td>${item.edad || ''}</td>
                                    <td>${item.sexo || ''}</td>
                                    <td>${item.telefono_movil || ''}</td>
                                    <td>${item.categoria || ''}</td>
                                    <td>${item.tipo_curso || ''}</td>
                                    <td>C$${parseFloat(item.monto_total || 0).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total">Total recaudado: C$${datosAImprimir.reduce((sum, item) => sum + (parseFloat(item.monto_total) || 0), 0).toFixed(2)}</div>
                    <p style="margin-top: 30px; text-align: center; color: #666;">Reporte generado el ${new Date().toLocaleDateString()}</p>
                </body>
            </html>
        `);
        ventanaImpresion.document.close();
        ventanaImpresion.print();
    };

    useEffect(() => {
        fetchMatriculas();
    }, []);

    // Filtro por nombre/cÃ©dula
    const filteredData = data.filter(item =>
        (item.nombre?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (item.cedula || "").includes(search)
    );

    // Filtro por edad
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
        <div className="w-full max-w-full min-w-0 overflow-hidden px-4">
                <div className="mb-4 space-y-10">
                    <h1 className="text-4xl font-bold">MatrÃ­culas</h1>
                    <p className="text-gray-600">Registro y gestiÃ³n de nuevas matrÃ­culas</p>
                </div>
                <div className="w-full max-w-full overflow-x-auto">
                    <div className="w-[1300px]">
                        <div className="flex flex-row items-center gap-3 rounded-xl whitespace-nowrap mb-4">
                    {/* BUSCADOR por nombre/cÃ©dula */}
                    <div className="relative w-[280px] shrink-0">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o cÃ©dula..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-3xl focus:outline-none bg-white border-blue-500 hover:outline-2 hover:outline-offset-2 hover:outline-dashed hover:border-blue-900 transition h-11"
                        />
                    </div>

                    {/* FILTRO POR EDADES */}
                    <div className="flex gap-2">
                        <select
                            value={filtroEdad}
                            onChange={(e) => setFiltroEdad(e.target.value)}
                            className="w-[170px] border rounded-3xl focus:outline-none bg-white border-blue-500 h-11 px-3 shrink-0"
                        >
                            <option value="">Todas las edades</option>
                            <option value="menores18">Menor a 18 AÃ±o</option>
                            <option value="18a30">18 a 30 aÃ±os</option>
                            <option value="31a50">31 a 50 aÃ±os</option>
                            <option value="mayores50">Mayores de 50 aÃ±os</option>
                        </select>

                        {/* BOTÃ“N IMPRIMIR POR EDADES */}
                        <button
                            onClick={imprimirPorEdades}
                            className="flex items-center gap-1 bg-white text-black px-5 py-0 rounded-3xl hover:bg-blue-300 transition hover:cursor-pointer h-11 hover:border-blue-400"
                        >
                            <FiPrinter className="text-black" /> Por Edades    
                        </button>
                    </div>

                    {/* FILTRO POR RANGO DE FECHAS */}
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
                        onClick={() => {
                            let filtrados = data;

                            // Convertimos a Date para una comparaciÃ³n segura
                            if (fechaDesde) {
                                const desde = new Date(fechaDesde);
                                filtrados = filtrados.filter(item => new Date(item.f_matricula) >= desde);
                            }
                            
                            if (fechaHasta) {
                                const hasta = new Date(fechaHasta);
                                filtrados = filtrados.filter(item => new Date(item.f_matricula) <= hasta);
                            }

                            if (filtrados.length === 0) {
                                alert("No se encontraron registros en este rango de fechas.");
                                return;
                            }

                            const ventanaImpresion = window.open('', '_blank');
                            ventanaImpresion.document.write(`
                                <html><head><title>Reporte por Fechas</title>
                                <style>body{font-family:Arial;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background:#f0f0f0;}</style>
                                </head><body>
                                <h1>Reporte de MatrÃ­culas</h1>
                                <p><strong>Desde:</strong> ${fechaDesde || 'Inicio'} <strong>Hasta:</strong> ${fechaHasta || 'Fin'}</p>
                                <p><strong>Total:</strong> ${filtrados.length} registros</p>
                                <table>
                                <tr><th>F. MatrÃ­cula</th><th>Nombre</th><th>CÃ©dula</th><th>Edad</th><th>CategorÃ­a</th><th>Curso</th></tr>
                                ${filtrados.map(item => `
                                    <tr>
                                        <td>${item.f_matricula || ''}</td>
                                        <td>${item.nombre} ${item.apellido || ''}</td>
                                        <td>${item.cedula || ''}</td>
                                        <td>${item.edad || ''}</td>
                                        <td>${item.categoria || ''}</td>
                                        <td>${item.tipo_curso || ''}</td>
                                    </tr>
                                `).join('')}
                                </table>
                                </body></html>
                            `);
                            ventanaImpresion.document.close();
                            ventanaImpresion.print();
                        }}
                        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-3xl hover:bg-blue-300 transition cursor-pointer"
                    >
                        <FiPrinter /> Por Fechas
                    </button>

                    {/* BOTÃ“N NUEVA MATRÃCULA */}
                    <button
                        onClick={() => {
                            setEditData(null);
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 text-black px-5 py-0 cursor-pointer rounded-3xl border border-gray-300 hover:bg-blue-300 hover:text-whitetransition h-11"
                    >
                        <FiUserPlus className="size-7"/>
                        <span>Nueva MatrÃ­cula</span>
                    </button>
                </div>

            {/* TABLA */}
            <div className="max-h-[600px] overflow-y-auto overflow-x-hidden w-full">
                <div>
                    <table className="table-fixed w-full">
                        <thead className="bg-gray-50">
                            <tr className="border-gray-300">
                                <th className="p-3 w-[220px]">Nombre</th>
                                <th className="p-3 w-[180px]">CÃ©dula</th>
                                <th className="p-3 w-[90px]">Edad</th>
                                <th className="p-3 w-[90px]">Sexo</th>
                                <th className="p-3 w-[150px]">TelÃ©fono</th>
                                <th className="p-3 w-[120px]">CategorÃ­a</th>
                                <th className="p-3 w-[180px]">Curso</th>
                                <th className="p-3 w-[170px]">Opciones</th> 
                            </tr>
                        </thead>

                        {/*Tabla que muestra los datos */}
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" className="p-6 text-center">Cargando...</td></tr>
                            ) : displayData.length > 0 ? (
                                displayData.map(item => (
                                    <tr key={item.id} className="hover:bg-blue-200 transition">
                                        <td className="px-2">{item.nombre} {item.apellido}</td>
                                        <td className="px-2">{item.cedula}</td>
                                      
                                        <td className="px-5">{item.edad}</td>
                                        <td className="px-5">{item.sexo}</td>
                                        <td className="px-7">{item.telefono_movil}</td>
                                        <td className="px-9  text-blue-800 font-bold ">{item.categoria}</td>
                                        <td className="p-2">{item.tipo_curso}</td>
                                        <td className="p-2">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => eliminarMatricula(item.id)} 
                                                    className="p-2 rounded-lg hover:bg-red-100" 
                                                    title="Eliminar"
                                                >
                                                    <RiDeleteBinLine className="text-red-500 text-xl hover:text-red-700 hover:cursor-pointer" />
                                                </button>
                                                <button 
                                                    onClick={() => { setEditData(item); setShowModal(true); }} 
                                                    className="p-2 rounded-lg hover:bg-blue-100" 
                                                    title="Editar"
                                                >
                                                    <CiEdit className="text-blue-500 text-xl hover:text-blue-700 hover:cursor-pointer" />
                                                </button>
                                                <button 
                                                    onClick={() => imprimirMatriculaIndividual(item)} 
                                                    className="p-2 rounded-lg hover:bg-green-100" 
                                                    title="Imprimir MatrÃ­cula"
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
                                <tr><td colSpan="9" className="p-6 text-center text-gray-400">No hay registros</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl" style={{ maxHeight: "90vh", overflowY: "auto" }}>
                        <div className="flex justify-between p-4 border-b">
                            <h2 className="font-bold text-4xl">{editData ? "Editar MatrÃ­cula" : "Nueva MatrÃ­cula"}</h2>
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
