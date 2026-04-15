// src/pages/matricula/MatriculaPage.jsx
import { useState, useEffect } from "react";
import { FiUserPlus, FiSearch, FiX, FiPrinter } from "react-icons/fi";
import { AiOutlinePrinter } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { CiEdit } from "react-icons/ci";
import MatriculaForm from "../../components/matriculaForm";

function MatriculaPage() {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [filtroEdad, setFiltroEdad] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editData, setEditData] = useState(null);

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

    // Función para imprimir por edades
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
            datosAImprimir = displayData;
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
                    <p><strong>Filtro de edad:</strong> ${filtroEdad === "menores18" ? "Menores de 18 años" : 
                        filtroEdad === "18a30" ? "18 a 30 años" :
                        filtroEdad === "31a50" ? "31 a 50 años" :
                        filtroEdad === "mayores50" ? "Mayores de 50 años" : "Todos los registros"}</p>
                    <p><strong>Total de registros:</strong> ${datosAImprimir.length}</p>
                    <table>
                        <thead>
                            <tr><th>Nombre</th><th>Cédula</th><th>Edad</th><th>Sexo</th><th>Teléfono</th><th>Categoría</th><th>Curso</th><th>Monto</th></tr>
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
                                    <td>C$${item.monto_total || 0}</td>
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

    // Filtro por nombre/cédula
    const filteredData = data.filter(item =>
        (item.nombre?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (item.cedula || "").includes(search)
    );

    // Filtro por edad
    const filteredByAge = (() => {
        if (!filtroEdad) return filteredData;
        
        return filteredData.filter(item => {
            const edad = parseInt(item.edad);
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
            <div className="max-w-7xl mx-auto mb-4 space-y-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold">Matrículas</h1>
                    <p className="text-gray-600">Registro y gestión de nuevas matrículas</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:justify-between rounded-xl">
                    {/* BUSCADOR por nombre/cédula */}
                    <div className="relative w-full md:w-1/3">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o cédula..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-3xl focus:outline-none bg-white border-blue-500 hover:outline-2 hover:outline-offset-2 hover:outline-dashed hover:border-blue-900 transition"
                        />
                    </div>

                    {/* FILTRO POR EDADES */}
                    <div className="flex gap-2">
                        <select
                            value={filtroEdad}
                            onChange={(e) => setFiltroEdad(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:outline-none bg-white border-blue-500"
                        >
                            <option value="">Todas las edades</option>
                            <option value="menores18">Menores de 18 años</option>
                            <option value="18a30">18 a 30 años</option>
                            <option value="31a50">31 a 50 años</option>
                            <option value="mayores50">Mayores de 50 años</option>
                        </select>

                        {/* BOTÓN IMPRIMIR POR EDADES */}
                        <button
                            onClick={imprimirPorEdades}
                            className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition"
                        >
                            <FiPrinter />
                            Imprimir Reporte
                        </button>
                    </div>

                    {/* BOTÓN NUEVA MATRÍCULA */}
                    <button
                        onClick={() => {
                            setEditData(null);
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 text-blue-600 px-5 py-2 cursor-pointer rounded-lg outline-2 outline-offset-2 outline-dashed hover:outline-emerald-500 hover:bg-green-400 hover:text-white transition"
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
                                <th className="p-3">Pago</th>
                                <th className="p-3">Curso</th>
                                <th className="p-3">Monto</th>
                                <th className="p-3">Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="10" className="p-6 text-center">Cargando...</td></tr>
                            ) : displayData.length > 0 ? (
                                displayData.map(item => (
                                    <tr key={item.id} className="hover:bg-blue-200 transition">
                                        <td className="p-2">{item.nombre} {item.apellido}</td>
                                        <td className="p-2">{item.cedula}</td>
                                        <td className="p-2">{item.edad}</td>
                                        <td className="p-2">{item.sexo}</td>
                                        <td className="p-2">{item.telefono_movil}</td>
                                        <td className="p-2">{item.categoria}</td>
                                        <td className="p-2">{item.tipo_pago}</td>
                                        <td className="p-2">{item.tipo_curso}</td>
                                        <td className="p-2 font-bold text-blue-600">C$ {item.monto_total}</td>
                                        <td className="p-2">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => eliminarMatricula(item.id)} className="p-2 rounded-lg hover:bg-red-100" title="Eliminar">
                                                    <RiDeleteBinLine className="text-red-500 text-xl hover:text-red-700" />
                                                </button>
                                                <button onClick={() => { setEditData(item); setShowModal(true); }} className="p-2 rounded-lg hover:bg-blue-100" title="Editar">
                                                    <CiEdit className="text-blue-500 text-xl hover:text-blue-700" />
                                                </button>
                                                <button onClick={() => { console.log("Imprimir matrícula:", item); }} className="p-2 rounded-lg hover:bg-green-100" title="Imprimir">
                                                    <AiOutlinePrinter className="text-green-500 text-xl hover:text-green-700" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="10" className="p-6 text-center text-gray-400">No hay registros</td></tr>
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