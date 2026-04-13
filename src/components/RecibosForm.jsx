// src/components/RecibosForm.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiUserCheck, FiX } from "react-icons/fi";

const PRECIO_BASE = 6500;

function RecibosForm({ onSave, initialData, matriculas = [] }) {
    const navigate = useNavigate();

    const initialState = {
        matricula: "",
        numero_recibo: "",
        monto_pagado: "",
        metodo_pago: "efectivo",
        estado: "anticipo",
        fecha_pago: new Date().toISOString().split('T')[0],
        observaciones: ""
    };

    const [form, setForm] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [saldoInfo, setSaldoInfo] = useState(null);
    const [matriculaSeleccionada, setMatriculaSeleccionada] = useState(null);
    const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
    const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [buscando, setBuscando] = useState(false);

    const buscarEstudiantes = async (termino) => {
        if (!termino || termino.length < 2) {
            setResultadosBusqueda([]);
            setMostrarResultados(false);
            return;
        }

        setBuscando(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/api/matricula/`, {
                headers: { "Authorization": `Token ${token}` }
            });

            if (response.ok) {
                const todasLasMatriculas = await response.json();
                const searchTerm = termino.toLowerCase();
                const filtrados = todasLasMatriculas.filter(mat => {
                    return (
                        mat.nombre?.toLowerCase().includes(searchTerm) ||
                        mat.apellido?.toLowerCase().includes(searchTerm) ||
                        mat.cedula?.toLowerCase().includes(searchTerm)
                    );
                });
                setResultadosBusqueda(filtrados);
                setMostrarResultados(true);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setBuscando(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            if (busquedaEstudiante && busquedaEstudiante.length >= 2) {
                buscarEstudiantes(busquedaEstudiante);
            } else {
                setResultadosBusqueda([]);
                setMostrarResultados(false);
            }
        }, 500);
        return () => clearTimeout(delay);
    }, [busquedaEstudiante]);

    const cargarInfoMatricula = async (matriculaId) => {
        if (!matriculaId) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://127.0.0.1:8000/api/saldo/?matricula=${matriculaId}`, {
                headers: { "Authorization": `Token ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                console.log("📊 Información de pagos:", data);
                setSaldoInfo(data);
            } else {
                console.error("Error al cargar saldo:", response.status);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const seleccionarEstudiante = (estudiante) => {
        console.log("👤 Estudiante seleccionado:", estudiante);
        setForm({ ...form, matricula: estudiante.id });
        setMatriculaSeleccionada(estudiante);
        setBusquedaEstudiante(`${estudiante.nombre} ${estudiante.apellido} - ${estudiante.cedula}`);
        setMostrarResultados(false);
        cargarInfoMatricula(estudiante.id);
    };

    const limpiarSeleccion = () => {
        setForm({ ...form, matricula: "" });
        setMatriculaSeleccionada(null);
        setBusquedaEstudiante("");
        setSaldoInfo(null);
        setResultadosBusqueda([]);
        setMostrarResultados(false);
    };

    useEffect(() => {
        if (initialData && initialData.id) {
            setForm({
                matricula: initialData.matricula || "",
                numero_recibo: initialData.numero_recibo || "",
                monto_pagado: initialData.monto_pagado || "",
                metodo_pago: initialData.metodo_pago || "efectivo",
                estado: initialData.estado || "anticipo",
                fecha_pago: initialData.fecha_pago ? initialData.fecha_pago.split('T')[0] : new Date().toISOString().split('T')[0],
                observaciones: initialData.observaciones || ""
            });
            if (initialData.matricula) {
                cargarInfoMatricula(initialData.matricula);
                // Buscar datos de la matrícula
                const buscarMatricula = async () => {
                    const token = localStorage.getItem("token");
                    const response = await fetch(`http://127.0.0.1:8000/api/matricula/${initialData.matricula}/`, {
                        headers: { "Authorization": `Token ${token}` }
                    });
                    if (response.ok) {
                        const mat = await response.json();
                        setMatriculaSeleccionada(mat);
                        setBusquedaEstudiante(`${mat.nombre} ${mat.apellido} - ${mat.cedula}`);
                    }
                };
                buscarMatricula();
            }
        } else {
            setForm(initialState);
            setSaldoInfo(null);
            setMatriculaSeleccionada(null);
            setBusquedaEstudiante("");
            setResultadosBusqueda([]);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!form.matricula) {
            Swal.fire('Error', 'Debe seleccionar un estudiante', 'error');
            setLoading(false);
            return;
        }

        if (!form.numero_recibo) {
            Swal.fire('Error', 'Debe ingresar el número de recibo', 'error');
            setLoading(false);
            return;
        }

        const monto = parseFloat(form.monto_pagado);
        if (!monto || monto <= 0) {
            Swal.fire('Error', 'Debe ingresar un monto válido', 'error');
            setLoading(false);
            return;
        }

        if (saldoInfo) {
            const saldoPendiente = parseFloat(saldoInfo.saldo_pendiente);
            const montoTotal = parseFloat(saldoInfo.monto_total);
            const cantidadPagos = saldoInfo.cantidad_pagos || 0;
            
            if (monto > montoTotal) {
                Swal.fire('Error', `El monto no puede exceder el total de C$${montoTotal.toFixed(2)}`, 'error');
                setLoading(false);
                return;
            }
            
            if (cantidadPagos === 1) {
                if (monto !== saldoPendiente) {
                    Swal.fire('Error', `Debes pagar exactamente el saldo pendiente: C$${saldoPendiente.toFixed(2)}`, 'error');
                    setLoading(false);
                    return;
                }
            }
            
            if (cantidadPagos >= 2) {
                Swal.fire('Error', 'Esta matrícula ya tiene los 2 pagos completos.', 'error');
                setLoading(false);
                return;
            }
        }

        const token = localStorage.getItem("token");
        const isEditing = !!initialData?.id;
        
        const url = isEditing 
            ? `http://127.0.0.1:8000/api/recibo/${initialData.id}/` 
            : "http://127.0.0.1:8000/api/recibo/";
        
        const method = isEditing ? "PUT" : "POST";

        const datosEnvio = {
            matricula: parseInt(form.matricula),
            numero_recibo: form.numero_recibo,
            monto_pagado: monto,
            metodo_pago: form.metodo_pago,
            estado: saldoInfo?.cantidad_pagos === 0 ? 'anticipo' : 'pagado',
            fecha_pago: form.fecha_pago,
            observaciones: form.observaciones || ""
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify(datosEnvio)
            });

            if (response.ok) {
                let mensaje = "";
                if (monto === PRECIO_BASE) {
                    mensaje = `¡Pago completado! La matrícula ha sido pagada totalmente. Total: C$${PRECIO_BASE.toFixed(2)}`;
                } else if (saldoInfo?.cantidad_pagos === 0 && monto < PRECIO_BASE) {
                    const saldoRestante = PRECIO_BASE - monto;
                    mensaje = `¡Anticipo registrado! Saldo pendiente: C$${saldoRestante.toFixed(2)}. El estudiante deberá pagar el resto en un segundo pago.`;
                } else if (saldoInfo?.cantidad_pagos === 1 && monto === saldoInfo.saldo_pendiente) {
                    mensaje = `¡Pago completado! La matrícula ha sido pagada totalmente. Total: C$${PRECIO_BASE.toFixed(2)}`;
                }

                Swal.fire({
                    title: '¡Recibo creado!',
                    text: mensaje,
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    if (onSave) onSave();
                    navigate("/dashboard/recibos");
                });
            } else {
                const data = await response.json();
                Swal.fire('Error', Object.values(data).flat().join('\n'), 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Precio base */}
            <div className="bg-gray-100 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Precio base de matrícula</p>
                <p className="text-2xl font-bold text-blue-600">C$ {PRECIO_BASE.toFixed(2)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Buscar Estudiante *</label>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Escribe nombre, apellido o cédula..." 
                            value={busquedaEstudiante} 
                            onChange={(e) => setBusquedaEstudiante(e.target.value)} 
                            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                            autoComplete="off" 
                        />
                        {busquedaEstudiante && (
                            <button type="button" onClick={limpiarSeleccion} className="absolute right-3 top-1/2 text-gray-400 hover:text-red-500">
                                <FiX size={18} />
                            </button>
                        )}
                    </div>

                    {mostrarResultados && busquedaEstudiante && (
                        <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto bg-white shadow-lg z-10">
                            {buscando ? (
                                <div className="p-4 text-center text-gray-500">Buscando...</div>
                            ) : resultadosBusqueda.length > 0 ? (
                                resultadosBusqueda.map(est => (
                                    <div key={est.id} onClick={() => seleccionarEstudiante(est)} className="p-3 hover:bg-blue-50 cursor-pointer border-b flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{est.nombre} {est.apellido}</p>
                                            <p className="text-sm text-gray-500">Cédula: {est.cedula}</p>
                                        </div>
                                        <FiUserCheck className="text-blue-500" />
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500">No se encontraron estudiantes</div>
                            )}
                        </div>
                    )}

                    {matriculaSeleccionada && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 font-medium">✓ Estudiante seleccionado:</p>
                            <p className="font-semibold">{matriculaSeleccionada.nombre} {matriculaSeleccionada.apellido}</p>
                            <p className="text-sm text-gray-600">Cédula: {matriculaSeleccionada.cedula}</p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">N° Recibo *</label>
                    <input type="text" name="numero_recibo" value={form.numero_recibo} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Monto Pagado *</label>
                    <input type="number" name="monto_pagado" value={form.monto_pagado} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Método de Pago</label>
                    <select name="metodo_pago" value={form.metodo_pago} onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="cheque">Cheque</option>
                    </select>
                </div>
            </div>

            {/* Información de pagos - SALDO PENDIENTE */}
            {saldoInfo && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold mb-3 text-blue-800">
                        Estado de Pagos - {saldoInfo.nombre} {saldoInfo.apellido}
                    </h3>
                    
                    <div className={`p-3 rounded-lg mb-3 ${
                        saldoInfo.saldo_pendiente === 0 
                            ? 'bg-green-100 border border-green-300' 
                            : saldoInfo.total_pagado > 0 
                                ? 'bg-yellow-100 border border-yellow-300' 
                                : 'bg-red-100 border border-red-300'
                    }`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium">Estado</p>
                                <p className="text-2xl font-bold">
                                    {saldoInfo.saldo_pendiente === 0 
                                        ? '✅ CANCELADO' 
                                        : saldoInfo.total_pagado > 0 
                                            ? '⚠️ ANTICIPO' 
                                            : '❌ PENDIENTE'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm">Saldo pendiente</p>
                                <p className="text-xl font-bold text-orange-600">
                                    C${saldoInfo.saldo_pendiente.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                        <div>
                            <p className="text-gray-600">Monto Total:</p>
                            <p className="font-bold">C${saldoInfo.monto_total.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Pagado:</p>
                            <p className="font-bold text-green-600">C${saldoInfo.total_pagado.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Saldo:</p>
                            <p className="font-bold text-orange-600">C${saldoInfo.saldo_pendiente.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Recibos:</p>
                            <p className="font-bold text-purple-600">{saldoInfo.cantidad_pagos} / {saldoInfo.pagos_permitidos}</p>
                        </div>
                    </div>
                    
                    {saldoInfo.saldo_pendiente > 0 && saldoInfo.total_pagado > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                            <p className="text-yellow-800 text-sm">
                                💰 <strong>Anticipo registrado:</strong> C${saldoInfo.total_pagado.toFixed(2)}
                            </p>
                            <p className="text-yellow-800 text-sm font-bold">
                                Saldo pendiente por pagar: C${saldoInfo.saldo_pendiente.toFixed(2)}
                            </p>
                        </div>
                    )}
                    
                    {saldoInfo.saldo_pendiente > 0 && saldoInfo.total_pagado === 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                            <p className="text-red-800 text-sm">
                                ❌ <strong>Sin pagos registrados</strong>
                            </p>
                            <p className="text-red-800 text-sm">
                                Deuda total: C${saldoInfo.saldo_pendiente.toFixed(2)}
                            </p>
                        </div>
                    )}
                    
                    {saldoInfo.saldo_pendiente === 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                            <p className="text-green-800 text-sm">
                                ✅ <strong>Matrícula pagada completamente</strong>
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-end gap-2">
                <button type="button" onClick={() => navigate("/dashboard/recibos")} className="px-4 py-2 border rounded hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    {loading ? "Guardando..." : "Guardar Recibo"}
                </button>
            </div>
        </form>
    );
}

export default RecibosForm;