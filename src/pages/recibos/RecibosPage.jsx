// frontend/src/pages/recibos/RecibosPage.jsx

import { useEffect, useState } from "react";
import {
    FiPlus,
    FiSearch,
    FiFileText,
    FiTrendingUp,
    FiCreditCard,
} from "react-icons/fi";
import { CiEdit, CiSearch } from "react-icons/ci";
import Swal from "sweetalert2";
import RecibosForm from "../../components/RecibosForm";
import { FiX } from "react-icons/fi";
import api from "../../api/axios";
import Paginacion from "../../components/Paginacion";

const obtenerMontoReal = (valor) =>
    Number(valor || 0);

const formatearDinero = (valor) =>
    obtenerMontoReal(valor).toLocaleString("es-NI", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    
const REGISTROS_POR_PAGINA = 25;

function RecibosPage() {
    const [recibos, setRecibos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [editData, setEditData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [pagina, setPagina] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);

    const [resumen, setResumen] = useState({
        ingresos_mes: 0,
        ingresos_totales: 0,
        recibos_mes: 0,
    });

    const fetchRecibos = async () => {
        try {
            setLoading(true);

            const response = await api.get("/recibo/", {
                params: {
                    page: pagina,
                    page_size: REGISTROS_POR_PAGINA,
                    buscar: busqueda.trim() || undefined,
                },
            });

            const resultado = response.data;

            if (Array.isArray(resultado)) {
                setRecibos(resultado);
                setTotalRegistros(resultado.length);
            } else {
                setRecibos(resultado.results || []);
                setTotalRegistros(resultado.count || 0);
            }
        } catch (error) {
            console.error(
                "Error cargando recibos:",
                error
            );

            const mensaje =
                error.response?.data?.detail ||
                error.response?.data?.error ||
                "No se pudieron cargar los recibos.";

            Swal.fire(
                "Error",
                mensaje,
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchResumen = async () => {
        try {
            const response = await api.get(
                "/recibo/resumen/"
            );

            setResumen(response.data);
        } catch (error) {
            console.error(
                "Error cargando resumen de recibos:",
                error
            );
        }
    };

    useEffect(() => {
        const temporizador = setTimeout(() => {
            fetchRecibos();
        }, 350);

        return () => clearTimeout(temporizador);
    }, [pagina, busqueda]);

    useEffect(() => {
        setPagina(1);
    }, [busqueda]);

    useEffect(() => {
        fetchResumen();
    }, []);

    // Filtrar recibos
    const filtrados = recibos;
 
    const totalIngresos = Number(
        resumen.ingresos_totales || 0
    );

    const totalMes = Number(
        resumen.ingresos_mes || 0
    );

    const recibosMes = Number(
        resumen.recibos_mes || 0
    );

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
                                    C${formatearDinero(totalMes)}
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
                                    {recibosMes}
                                </h2>

                                <p className="mt-2 text-sm font-medium text-slate-500">
                                    Total: C${formatearDinero(totalMes)}
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
                                    C${formatearDinero(totalIngresos)}
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
                    <>
                        <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-sm">
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
                                            colSpan="7"
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
                                                C${formatearDinero(
                                                    r.monto_pagado ??
                                                    r.monto_cordobas ??
                                                    0
                                                )}
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
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditData(r);
                                                        setShowModal(true);
                                                    }}
                                                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                                                    title="Editar recibo"
                                                >
                                                    <CiEdit className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Paginacion
                        pagina={pagina}
                        total={totalRegistros}
                        porPagina={REGISTROS_POR_PAGINA}
                        cargando={loading}
                        onChange={setPagina}
                    />
                    </>
                )}
            </div>

            {/* Modal para crear recibo */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
                            <h2 className="text-xl font-bold">
                                {editData ? "Editar Recibo" : "Nuevo Recibo"}
                            </h2>
                            <button 
                                onClick={() => {
                                    setShowModal(false);
                                    setEditData(null);
                                }}
                                className="text-gray-500 hover:text-red-500 text-2xl"
                            >
                                <FiX className="hover:cursor-pointer hover:bg-red-100 rounded-full h-10 w-10" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <RecibosForm
                                initialData={editData}
                                onSave={() => {
                                    setShowModal(false);
                                    setEditData(null); 
                                    fetchRecibos();
                                    fetchResumen();
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
