// frontend/src/pages/recibos/RecibosPage.jsx

import { useEffect, useState } from "react";
import {
    FiPlus,
    FiSearch,
    FiFileText,
    FiTrendingUp,
    FiCreditCard,
} from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';
import RecibosForm from "../../components/RecibosForm";
import { CiEdit } from "react-icons/ci";
import { FiX } from "react-icons/fi";
import api from "../../api/axios";

function RecibosPage() {
    const [recibos, setRecibos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchRecibos = async () => {
        try {
            setLoading(true);

            const response = await api.get("/recibo/");
            const data = response.data;

            console.log("📊 RECIBOS CARGADOS:", data);

            setRecibos(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error("Error cargando recibos:", error);

            const mensaje =
                error.response?.data?.detail ||
                "No se pudieron cargar los recibos.";

            Swal.fire("Error", mensaje, "error");
        } finally {
            setLoading(false);
        }
    };

    const eliminarRecibo = async (id) => {
        const confirm = await Swal.fire({
            title: "¿Eliminar recibo?",
            text: "Esta acción actualizará el saldo pendiente del estudiante",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!confirm.isConfirmed) return;

        try {
            await api.delete(`/recibo/${id}/`);

            Swal.fire("Eliminado", "El recibo ha sido eliminado", "success");
            fetchRecibos();

        } catch (error) {
            console.error("Error eliminando recibo:", error);

            const mensaje =
                error.response?.data?.detail ||
                "No se pudo eliminar el recibo";

            Swal.fire("Error", mensaje, "error");
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

        const [year, month] = String(r.fecha_pago).split("T")[0].split("-");

        return (
            Number(month) - 1 === mesActual &&
            Number(year) === anioActual
        );
    });
    
    const totalMes = recibosMes.reduce((acc, r) => {
        const monto = parseFloat(r.monto_cordobas) || parseFloat(r.monto_pagado) || 0;
        return acc + monto;
    }, 0);
    
    const formatearFecha = (fecha) => {
        if (!fecha) return "N/A";

        const texto = String(fecha).split("T")[0].trim();

        if (texto.includes("-")) {
            const [year, month, day] = texto.split("-");
            return `${day}/${month}/${year}`;
        }

        return texto;
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
            'N° Rec/Fac': recibo.numero_recibo || 'N/A',
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
        <div className="min-h-screen bg-[#f6f8fc] px-4 py-5">
            <br />
            <div className="mb-7 flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-emerald-50 text-3xl shadow-sm ring-1 ring-emerald-100">
                    💵
                </div>

                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">
                        Solvencia
                    </h1>

                    <p className="mt-2 text-base text-slate-500">
                        Gestión de pagos y recibos emitidos
                    </p>
                </div>
            </div>

            {/* Tarjetas de resumen */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-4xl text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                                <FiCreditCard />
                            </div>

                            <div>
                                <p className="text-base font-bold text-slate-600">
                                    Ingresos Mensuales
                                </p>

                                <h2 className="mt-2 text-2xl font-black text-emerald-600">
                                    C${totalMes.toFixed(2)}
                                </h2>

                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Total este mes
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pointer-events-none absolute -bottom-8 -right-6 text-[120px] text-emerald-500 opacity-10">
                        <FiCreditCard />
                    </div>
                </div>

                <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-4xl text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                                <FiFileText />
                            </div>

                            <div>
                                <p className="text-base font-bold text-slate-600">
                                    Recibos este Mes
                                </p>

                                <h2 className="mt-2 text-2xl font-black text-emerald-600">
                                    {recibosMes.length}
                                </h2>

                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Total: C${totalMes.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pointer-events-none absolute -bottom-8 -right-6 text-[120px] text-emerald-500 opacity-10">
                        <FiFileText />
                    </div>
                </div>

                <div className="relative min-h-[150px] overflow-hidden rounded-[28px] border border-emerald-100 bg-emerald-50/60 px-6 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:col-span-2 xl:col-span-1">
                    <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white text-4xl text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                                <FiTrendingUp />
                            </div>

                            <div>
                                <p className="text-base font-bold text-slate-600">
                                    Ingresos Totales
                                </p>

                                <h2 className="mt-2 text-2xl font-black text-emerald-600">
                                    C${totalIngresos.toFixed(2)}
                                </h2>

                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Total acumulado
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pointer-events-none absolute -bottom-8 -right-6 text-[120px] text-emerald-500 opacity-10">
                        <FiTrendingUp />
                    </div>
                </div>
            </div>

            {/* Barra de búsqueda y botón */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input
                        type="text"
                        placeholder="Buscar por N° Rec/Fac, estudiante o cédula..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    />
                </div>

                <button
                    onClick={() => {
                        setEditData(null);
                        setShowModal(true);
                    }}
                    className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-emerald-600/35 sm:w-auto"
                >
                    <FiPlus size={18} />
                    Nuevo Recibo
                </button>
            </div>

            {/* Tabla de recibos */}
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="p-10 text-center font-semibold text-slate-400">
                        Cargando recibos...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] text-sm">
                            <thead className="bg-slate-50/95">
                                <tr className="border-b border-slate-100">
                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                                        N° Rec/Fac
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                                        Fecha
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                                        Estudiante
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                                        Cédula
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                                        Monto
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                                        Método
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                                        Tipo pago
                                    </th>

                                    <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-wide text-slate-500">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filtrados.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="p-10 text-center font-semibold text-slate-400"
                                        >
                                            No se encontraron recibos
                                        </td>
                                    </tr>
                                ) : (
                                    filtrados.map((r) => (
                                        <tr
                                            key={r.id}
                                            className="transition hover:bg-emerald-50/40"
                                        >
                                            <td className="px-5 py-4">
                                                <span className="inline-flex min-w-[82px] items-center justify-center rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
                                                    {r.numero_recibo || "N/A"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 whitespace-nowrap font-semibold text-slate-700">
                                                {formatearFecha(r.fecha_pago)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-bold text-slate-900">
                                                    {r.estudiante_nombre || r.matricula_data?.estudiante_nombre || "N/A"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 whitespace-nowrap font-semibold text-slate-600">
                                                {r.estudiante_cedula || r.matricula_data?.estudiante_cedula || "N/A"}
                                            </td>

                                            <td className="px-5 py-4 whitespace-nowrap font-black text-emerald-600">
                                                C${parseFloat(r.monto_pagado || r.monto_cordobas || 0).toFixed(2)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black capitalize text-emerald-700 ring-1 ring-emerald-100">
                                                    {r.metodo_pago || "Efectivo"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ring-1 ${
                                                        obtenerEstado(r) === "Completo"
                                                            ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                                            : obtenerEstado(r) === "Beneficio"
                                                            ? "bg-purple-50 text-purple-700 ring-purple-100"
                                                            : obtenerEstado(r) === "Anticipo"
                                                            ? "bg-amber-50 text-amber-700 ring-amber-100"
                                                            : "bg-slate-50 text-slate-600 ring-slate-100"
                                                    }`}
                                                >
                                                    {obtenerEstado(r)}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditData(r);
                                                            setShowModal(true);
                                                        }}
                                                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-600 hover:ring-blue-100"
                                                        title="Editar"
                                                    >
                                                        <CiEdit size={20} />
                                                    </button>

                                                    <button
                                                        onClick={() => eliminarRecibo(r.id)}
                                                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100 transition hover:-translate-y-0.5 hover:bg-red-100 hover:text-red-700"
                                                        title="Eliminar recibo"
                                                    >
                                                        <RiDeleteBinLine size={19} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
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
