// frontend/src/pages/recibos/RecibosPage.jsx

import { useEffect, useState } from "react";
import { FiPlus, FiSearch, FiFileText } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';
import RecibosForm from "../../components/RecibosForm";
import { CiEdit } from "react-icons/ci";
import { FiX } from "react-icons/fi";

function RecibosPage() {
    const [recibos, setRecibos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [matriculas, setMatriculas] = useState([]);

    const fetchRecibos = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetch("http://127.0.0.1:8000/api/recibo/", {
                headers: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("📊 RECIBOS CARGADOS:", data);
                setRecibos(Array.isArray(data) ? data : []);
            } else {
                console.error("Error cargando recibos:", response.status);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const eliminarRecibo = async (id) => {
        const confirm = await Swal.fire({
            title: '¿Eliminar recibo?',
            text: 'Esta acción actualizará el saldo pendiente del estudiante',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://127.0.0.1:8000/api/recibo/${id}/`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Token ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    Swal.fire('Eliminado', 'El recibo ha sido eliminado', 'success');
                    fetchRecibos();
                } else {
                    Swal.fire('Error', 'No se pudo eliminar el recibo', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Error de conexión', 'error');
            }
        }
    };

    useEffect(() => {
        fetchRecibos();
    }, []);

    // Filtrar recibos
    const filtrados = recibos.filter(r => {
        const searchTerm = busqueda.toLowerCase();
        const estudianteNombre = `${r.matricula_data?.estudiante_nombre || ''} ${r.matricula_data?.estudiante_apellido || ''}`.toLowerCase();
        const numeroRecibo = (r.numero_recibo || '').toLowerCase();
        const cedula = (r.estudiante_cedula || '').toLowerCase();
        
        return (
            numeroRecibo.includes(searchTerm) ||
            estudianteNombre.includes(searchTerm) ||
            cedula.includes(searchTerm)
        );
    });

    // Calcular totales
    const totalIngresos = recibos.reduce((acc, r) => {
        const monto = parseFloat(r.monto_cordobas) || parseFloat(r.monto_pagado) || 0;
        return acc + monto;
    }, 0);
    
    const mesActual = new Date().getMonth();
    const anioActual = new Date().getFullYear();
    
    const recibosMes = recibos.filter(r => {
        if (!r.fecha_pago) return false;
        const fecha = new Date(r.fecha_pago);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });
    
    const totalMes = recibosMes.reduce((acc, r) => {
        const monto = parseFloat(r.monto_cordobas) || parseFloat(r.monto_pagado) || 0;
        return acc + monto;
    }, 0);
    
    const formatearFecha = (fecha) => {
        if (!fecha) return "N/A";
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES');
    };

    // Función para mostrar el texto del estado según el tipo de pago
    const obtenerEstado = (r) => {
        const tipo = r.tipo_pago || "";
        if (tipo === "completo") return "Completo";
        if (tipo === "beneficio") return "Beneficio";
        if (tipo === "anticipo") return "Anticipo";
        return "Pendiente";
    };

    // Función para obtener la clase CSS del estado
    const obtenerClaseEstado = (r) => {
        const tipo = r.tipo_pago || "";
        if (tipo === "completo") return "bg-green-100 text-green-700";
        if (tipo === "beneficio") return "bg-purple-100 text-purple-700";
        if (tipo === "anticipo") return "bg-yellow-100 text-yellow-700";
        return "bg-gray-100 text-gray-700";
    };

    const exportarAExcel = () => {
        const datosExcel = filtrados.map(recibo => ({
            'N° Recibo/Factura': recibo.numero_recibo || 'N/A',
            'Fecha': formatearFecha(recibo.fecha_pago),
            'Estudiante': recibo.estudiante_nombre || `${recibo.matricula_data?.estudiante_nombre || ''} ${recibo.matricula_data?.estudiante_apellido || ''}`.trim(),
            'Cédula': recibo.estudiante_cedula || recibo.matricula_data?.estudiante_cedula || 'N/A',
            'Tipo de Pago': obtenerEstado(recibo),
            'Monto (C$)': parseFloat(recibo.monto_pagado || recibo.monto_cordobas || 0).toFixed(2),
            'Método de Pago': recibo.metodo_pago || 'Efectivo',
            'Observaciones': recibo.observaciones || ''
        }));

        const ws = XLSX.utils.json_to_sheet(datosExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Recibos');
        XLSX.writeFile(wb, `recibos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <div className="h-full">
            <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Recibos de Pago</h1>
                <p className="text-sm text-gray-500">Gestión de pagos y recibos emitidos</p>
            </div>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-xs md:text-sm">Ingresos Mensuales</p>
                    <h2 className="text-xl md:text-2xl font-bold text-green-600">C${totalMes.toFixed(2)}</h2>
                </div>
                
                <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-xs md:text-sm">Recibos este Mes</p>
                    <h2 className="text-xl md:text-2xl font-bold text-blue-600">{recibosMes.length}</h2>
                    <p className="text-xs text-gray-400">Total: C${totalMes.toFixed(2)}</p>
                </div>

                <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-xs md:text-sm">Ingresos Totales</p>
                    <h2 className="text-xl md:text-2xl font-bold text-purple-600">C${totalIngresos.toFixed(2)}</h2>
                </div>
            </div>

            {/* Barra de búsqueda y botones */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por N° Recibo/Factura, estudiante o cédula..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer text-sm"
                    />
                </div>
                
                <div className="flex flex-wrap gap-2">
                    <button onClick={exportarAExcel} className="bg-white text-black px-3 py-2 rounded-3xl flex items-center gap-2 hover:bg-blue-300 cursor-pointer text-sm">
                        <FiFileText size={16} /> Exportar Todo
                    </button>
                    
                    <button 
                        onClick={() => { setEditData(null); setShowModal(true); }} 
                        className="relative group overflow-hidden px-5 h-11 rounded-3xl hover:cursor-pointer bg-green-500 text-white flex items-center gap-2 transition-all duration-300 hover:bg-green-600 justify-end"
                    >
                        <span className="absolute top-0 left-[-75%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 group-hover:left-[125%] transition-all duration-700"></span>
                        <FiPlus size={16} /> Nuevo Recibo
                    </button>
                </div>
            </div>

            {/* Tabla de recibos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Cargando recibos...</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Recibo/Factura</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Pago</th>
                                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        
                        <tbody className="divide-y divide-gray-200">
                            {filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-400">
                                        No se encontraron recibos
                                    </td>
                                </tr>
                            ) : (
                                filtrados.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition">
                                        <td className="p-3 font-semibold text-blue-600 text-sm">{r.numero_recibo}</td>
                                        <td className="p-3 text-sm">{formatearFecha(r.fecha_pago)}</td>
                                        <td className="p-3 text-sm">{r.estudiante_nombre || r.matricula_data?.estudiante_nombre || "N/A"}</td>
                                        <td className="p-3 text-sm font-mono">{r.estudiante_cedula || r.matricula_data?.estudiante_cedula || "N/A"}</td>
                                        <td className="p-3 font-bold text-green-600 text-sm">
                                            C${parseFloat(r.monto_pagado || r.monto_cordobas || 0).toFixed(2)}
                                        </td>
                                        <td className="p-3 text-sm capitalize">{r.metodo_pago || "Efectivo"}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerClaseEstado(r)}`}>
                                                {obtenerEstado(r)}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => { setEditData(r); setShowModal(true); }} 
                                                    className="p-2 rounded-lg hover:bg-blue-100" 
                                                    title="Editar"
                                                >
                                                    <CiEdit size={18} />
                                                </button>
                                                
                                                <button
                                                    onClick={() => eliminarRecibo(r.id)}
                                                    className="p-2 rounded-lg hover:bg-red-100"
                                                    title="Eliminar recibo"
                                                >
                                                    <RiDeleteBinLine size={18} className="text-red-500 hover:text-red-700" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal para crear/editar recibo */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
                            <h2 className="text-xl font-bold">{editData ? "Editar Recibo" : "Nuevo Recibo"}</h2>
                            <button 
                                onClick={() => { setShowModal(false); setEditData(null); }} 
                                className="text-gray-500 hover:text-red-500 text-2xl"
                            >
                                <FiX className="hover:cursor-pointer hover:bg-red-100 rounded-full h-10 w-10" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <RecibosForm
                                key={editData?.id || 'new'}
                                initialData={editData}
                                onSave={() => { 
                                    fetchRecibos(); 
                                    setShowModal(false); 
                                    setEditData(null); 
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RecibosPage;
