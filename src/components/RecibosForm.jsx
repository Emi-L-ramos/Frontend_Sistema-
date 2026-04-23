// src/components/RecibosForm.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiUserCheck, FiX } from "react-icons/fi";

const PRECIO_CURSO_REGULAR = 6500;
const HORAS_CURSO_REGULAR = 15;
const PRECIO_HORA_REFORZAMIENTO = 433.33;
const TASA_CAMBIO_DEFAULT = 36.6;
const redondearMonto = (valor) => Math.round(Number(valor || 0));
const HORAS_REFORZAMIENTO = Array.from({ length: 15 }, (_, index) => index + 1);

function normalizarTipoCurso(matricula) {
    const tipo = String(matricula?.tipo_curso || "").toLowerCase();

    if (tipo.includes("reforz")) {
        return "reforzamiento";
    }

    return "regular";
}

function RecibosForm({ onSave, initialData, matriculas = [] }) {
    const navigate = useNavigate();

    const initialState = {
        matricula: "",
        numero_recibo: "",
        fecha_pago: new Date().toISOString().split("T")[0],
        tipo_pago: "anticipo",
        monto_pagado: "",
        monto_cordobas: "",
        monto_dolares: "",
        tasa_cambio: TASA_CAMBIO_DEFAULT,
        metodo_pago: "efectivo",
        cantidad: HORAS_CURSO_REGULAR,
        monto_unitario: PRECIO_HORA_REFORZAMIENTO,
        concepto: "Pago de curso regular",
        horas_reforzamiento: "",
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

    const tipoCurso = matriculaSeleccionada ? normalizarTipoCurso(matriculaSeleccionada) : "regular";

    const calcularTotal = (tipo = tipoCurso, horas = form.horas_reforzamiento) => {
        if (tipo === "reforzamiento") {
            const horasNumero = Number(horas || 1);
            return redondearMonto(horasNumero * PRECIO_HORA_REFORZAMIENTO);
        }

        return PRECIO_CURSO_REGULAR;
    };

    const calcularDolares = (montoCordobas, tasaCambio = form.tasa_cambio) => {
        const monto = Number(montoCordobas || 0);
        const tasa = Number(tasaCambio || TASA_CAMBIO_DEFAULT);

        if (tasa <= 0) return "0.00";

        return (monto / tasa).toFixed(2);
    };

    const buscarEstudiantes = async (termino) => {
        if (!termino || termino.length < 2) {
            setResultadosBusqueda([]);
            setMostrarResultados(false);
            return;
        }

        setBuscando(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:8000/api/matricula/", {
                headers: { Authorization: `Token ${token}` }
            });

            if (response.ok) {
                const todasLasMatriculas = await response.json();
                const searchTerm = termino.toLowerCase();

                const filtrados = todasLasMatriculas.filter((mat) => {
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
            if (busquedaEstudiante && busquedaEstudiante.length >= 2 && !matriculaSeleccionada) {
                buscarEstudiantes(busquedaEstudiante);
            } else if (!busquedaEstudiante) {
                setResultadosBusqueda([]);
                setMostrarResultados(false);
            }
        }, 500);

        return () => clearTimeout(delay);
    }, [busquedaEstudiante, matriculaSeleccionada]);

    const cargarInfoMatricula = async (matriculaId, horas = "") => {
        if (!matriculaId) return;

        try {
            const token = localStorage.getItem("token");
            const queryHoras = horas ? `&horas=${horas}` : "";

            const response = await fetch(`http://127.0.0.1:8000/api/saldo/?matricula=${matriculaId}${queryHoras}`, {
                headers: { Authorization: `Token ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSaldoInfo(data);
            } else {
                console.error("Error al cargar saldo:", response.status);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const seleccionarEstudiante = (estudiante) => {
        const tipo = normalizarTipoCurso(estudiante);
        const horas = tipo === "reforzamiento" ? 1 : "";
        const total = calcularTotal(tipo, horas);

        setForm({
            ...form,
            matricula: estudiante.id,
            tipo_pago: "anticipo",
            cantidad: tipo === "reforzamiento" ? horas : HORAS_CURSO_REGULAR,
            monto_unitario: PRECIO_HORA_REFORZAMIENTO,
            concepto: tipo === "reforzamiento" ? "Pago de reforzamiento" : "Pago de curso regular",
            horas_reforzamiento: horas,
            monto_pagado: "",
            monto_cordobas: "",
            monto_dolares: ""
        });

        setMatriculaSeleccionada(estudiante);
        setBusquedaEstudiante(`${estudiante.nombre} ${estudiante.apellido} - ${estudiante.cedula}`);
        setMostrarResultados(false);
        cargarInfoMatricula(estudiante.id, horas);
        if (tipo === "reforzamiento") cargarHorasPrevias(estudiante.id);
    };

const cargarHorasPrevias = async (matriculaId) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://127.0.0.1:8000/api/recibo/`, {
            headers: { Authorization: `Token ${token}` }
        });
        if (response.ok) {
            const recibos = await response.json();
            const recibosDelEstudiante = recibos.filter(r => r.matricula === matriculaId);
            if (recibosDelEstudiante.length > 0) {
                const horasPrevias = recibosDelEstudiante[0].horas_reforzamiento;
                if (horasPrevias) {
                    setForm(prev => ({
                        ...prev,
                        horas_reforzamiento: horasPrevias,
                        cantidad: horasPrevias
                    }));
                    cargarInfoMatricula(matriculaId, horasPrevias);
                }
            }
        }
    } catch (error) {
        console.error("Error cargando horas previas:", error);
    }
};

    const limpiarSeleccion = () => {
        setForm(initialState);
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
                fecha_pago: initialData.fecha_pago
                    ? initialData.fecha_pago.split("T")[0]
                    : new Date().toISOString().split("T")[0],
                tipo_pago: initialData.tipo_pago || initialData.estado || "anticipo",
                monto_pagado: initialData.monto_pagado || "",
                monto_cordobas: initialData.monto_cordobas || initialData.monto_pagado || "",
                monto_dolares: initialData.monto_dolares || "",
                tasa_cambio: initialData.tasa_cambio || TASA_CAMBIO_DEFAULT,
                metodo_pago: initialData.metodo_pago || "efectivo",
                cantidad: initialData.cantidad || HORAS_CURSO_REGULAR,
                monto_unitario: initialData.monto_unitario || PRECIO_HORA_REFORZAMIENTO,
                concepto: initialData.concepto || "Pago de curso",
                horas_reforzamiento: initialData.horas_reforzamiento || "",
                observaciones: initialData.observaciones || ""
            });

            if (initialData.matricula) {
                cargarInfoMatricula(initialData.matricula, initialData.horas_reforzamiento);

                const buscarMatricula = async () => {
                    const token = localStorage.getItem("token");

                    const response = await fetch(`http://127.0.0.1:8000/api/matricula/${initialData.matricula}/`, {
                        headers: { Authorization: `Token ${token}` }
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

        setForm((prev) => {
            const nuevoForm = {
                ...prev,
                [name]: value
            };

           // 1. Si cambian las horas de reforzamiento
        if (name === "horas_reforzamiento") {
            const nuevoTotal = calcularTotal("reforzamiento", value);
            nuevoForm.cantidad = value;
            
            // Si es completo, actualizamos montos. 
            // Si es anticipo, reseteamos para obligar al usuario a ingresar el nuevo abono
            if (nuevoForm.tipo_pago === "completo") {
                nuevoForm.monto_pagado = String(nuevoTotal);
                nuevoForm.monto_cordobas = String(nuevoTotal);
            } else {
                nuevoForm.monto_pagado = "";
                nuevoForm.monto_cordobas = "";
            }
            
            nuevoForm.monto_dolares = calcularDolares(nuevoForm.monto_cordobas, nuevoForm.tasa_cambio);
            
            if (nuevoForm.matricula) {
                cargarInfoMatricula(nuevoForm.matricula, value);
            }
        }

        // 2. Si cambia el tipo de pago (Completo vs Anticipo)
        if (name === "tipo_pago") {
            const totalActual = calcularTotal(tipoCurso, nuevoForm.horas_reforzamiento);
            if (value === "completo") {
                nuevoForm.monto_pagado = String(totalActual);
                nuevoForm.monto_cordobas = String(totalActual);
            } else {
                nuevoForm.monto_pagado = "";
                nuevoForm.monto_cordobas = "";
            }
            nuevoForm.monto_dolares = calcularDolares(nuevoForm.monto_cordobas, nuevoForm.tasa_cambio);
        }

        // 3. Sincronización de montos y dólares
        if (name === "monto_cordobas" || name === "monto_pagado") {
            // Aseguramos que ambos campos reflejen lo mismo para evitar discrepancias en el JSON
            const valorLimpio = value; 
            nuevoForm.monto_pagado = valorLimpio;
            nuevoForm.monto_cordobas = valorLimpio;
            nuevoForm.monto_dolares = calcularDolares(valorLimpio, nuevoForm.tasa_cambio);
        }

        if (name === "tasa_cambio") {
            nuevoForm.monto_dolares = calcularDolares(nuevoForm.monto_cordobas, value);
        }

        return nuevoForm;
    });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!form.matricula) {
            Swal.fire("Error", "Debe seleccionar un estudiante", "error");
            setLoading(false);
            return;
        }

        if (!form.numero_recibo) {
            Swal.fire("Error", "Debe ingresar el número de recibo", "error");
            setLoading(false);
            return;
        }

        if (tipoCurso === "reforzamiento" && !form.horas_reforzamiento) {
            Swal.fire("Error", "Debe seleccionar las horas de reforzamiento", "error");
            setLoading(false);
            return;
        }

        if (!form.concepto) {
            Swal.fire("Error", "Debe ingresar el concepto", "error");
            setLoading(false);
            return;
        }

    const totalCurso = calcularTotal();
    const monto = parseFloat(form.monto_cordobas || form.monto_pagado);

    if (!monto || monto <= 0) {
        Swal.fire("Error", "Debe ingresar un monto válido", "error");
        setLoading(false);
        return;
    }

    // === BENEFICIO: monto libre, no se valida contra el total ===
    if (form.tipo_pago === "beneficio") {
        // No hay validaciones de monto. Se permite cualquier descuento.
    } else {
        // === Validaciones para COMPLETO y ANTICIPO ===
        if (monto > totalCurso) {
            SSwal.fire("Error", `El monto no puede exceder C$${totalCurso}`, "error");
            setLoading(false);
            return;
        }

        if (form.tipo_pago === "completo" && Math.round(monto) !== Math.round(totalCurso)) {
            Swal.fire("Error", `Para pago completo el monto debe ser C$${totalCurso}`, "error");
            setLoading(false);
            return;
        }

        // === Validaciones de cantidad de recibos (anticipo) ===
        if (form.tipo_pago === "anticipo" && saldoInfo) {
            const cantidadPagos = saldoInfo.cantidad_pagos || 0;
            const saldoPendiente = parseFloat(saldoInfo.saldo_pendiente || 0);

            if (cantidadPagos >= 2) {
                Swal.fire("Error", "Ya se registraron los 2 anticipos permitidos para esta matrícula.", "error");
                setLoading(false);
                return;
            }

            if (cantidadPagos === 1) {
                // Es el SEGUNDO anticipo → debe cubrir exactamente el saldo pendiente
                if (Math.round(monto) !== Math.round(saldoPendiente)) {
                    Swal.fire(
                        "Pago incompleto",
                        `El segundo pago debe cubrir exactamente el saldo pendiente: C$${Math.round(saldoPendiente)}. ` +
                        `No se permiten saldos pendientes después del segundo recibo.`,
                        "error"
                    );
                    setLoading(false);
                    return;
                }
            } else {
                // Primer anticipo: debe ser menor al total
                if (monto >= totalCurso) {
                    Swal.fire("Error", `Si el pago es anticipo, el monto debe ser menor que C$${totalCurso.toFixed(2)}.`, "error");
                    setLoading(false);
                    return;
                }
            }
        }
    }
        const token = localStorage.getItem("token");
        const isEditing = !!initialData?.id;

        const url = isEditing
            ? `http://127.0.0.1:8000/api/recibo/${initialData.id}/`
            : "http://127.0.0.1:8000/api/recibo/";

        const method = isEditing ? "PUT" : "POST";

        const montoFinal = parseFloat(form.monto_cordobas);

        const datosEnvio = {
            matricula: parseInt(form.matricula),
            numero_recibo: form.numero_recibo,
            fecha_pago: form.fecha_pago,
            tipo_pago: form.tipo_pago,
            cantidad: tipoCurso === "reforzamiento" ? parseInt(form.horas_reforzamiento) : HORAS_CURSO_REGULAR,
            monto_unitario: PRECIO_HORA_REFORZAMIENTO,
            concepto: form.concepto,
            monto_pagado: montoFinal,
            monto_cordobas: montoFinal,
            monto_dolares: parseFloat(form.monto_dolares || 0),
            tasa_cambio: parseFloat(form.tasa_cambio || TASA_CAMBIO_DEFAULT),
            metodo_pago: form.metodo_pago,
            horas_reforzamiento: tipoCurso === "reforzamiento" ? parseInt(form.horas_reforzamiento) : null,
            estado: form.tipo_pago === "completo" ? "pagado" : "anticipo",
            observaciones: form.observaciones || ""
        };

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`
                },
                body: JSON.stringify(datosEnvio)
            });

            if (response.ok) {
                Swal.fire({
                    title: isEditing ? "¡Recibo actualizado!" : "¡Recibo creado!",
                    text: `Monto registrado: C$${monto.toFixed(2)}`,
                    icon: "success",
                    confirmButtonText: "Aceptar"
                }).then(() => {
                    if (onSave) {
                        onSave();
                    } else {
                        navigate("/dashboard/recibos");
                    }
                });
                } else {
                    const data = await response.json();
                    const mensaje = data.error || Object.values(data).flat().join("\n");
                    Swal.fire("Error", mensaje, "error");
                }
        } catch (error) {
            Swal.fire("Error", "Error de conexión", "error");
        } finally {
            setLoading(false);
        }
    };

    const totalCurso = calcularTotal();

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-100 p-3 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total calculado del curso</p>
                <p className="text-2xl font-bold text-blue-600">C$ {totalCurso}</p>
                <p className="text-xs text-gray-500">
                    {tipoCurso === "regular"
                        ? "Curso regular: 15 horas por C$6500"
                        : `Reforzamiento: ${form.horas_reforzamiento || 1} hora(s) x C$433.33`}
                </p>
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
                            onChange={(e) => {
                                setBusquedaEstudiante(e.target.value);
                                if (matriculaSeleccionada) {
                                    setMatriculaSeleccionada(null);
                                    setForm((prev) => ({ ...prev, matricula: "" }));
                                }
                            }}
                            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            autoComplete="off"
                        />
                        {busquedaEstudiante && (
                            <button
                                type="button"
                                onClick={limpiarSeleccion}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                            >
                                <FiX size={18} />
                            </button>
                        )}
                    </div>

                    {mostrarResultados && busquedaEstudiante && (
                        <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto bg-white shadow-lg z-10">
                            {buscando ? (
                                <div className="p-4 text-center text-gray-500">Buscando...</div>
                            ) : resultadosBusqueda.length > 0 ? (
                                resultadosBusqueda.map((est) => (
                                    <div
                                        key={est.id}
                                        onClick={() => seleccionarEstudiante(est)}
                                        className="p-3 hover:bg-blue-50 cursor-pointer border-b flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-semibold">{est.nombre} {est.apellido}</p>
                                            <p className="text-sm text-gray-500">Cédula: {est.cedula}</p>
                                            <p className="text-xs text-blue-600">
                                                Tipo de curso: {normalizarTipoCurso(est) === "regular" ? "Curso regular" : "Reforzamiento"}
                                            </p>
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
                            <p className="text-sm text-green-800 font-medium">Estudiante seleccionado:</p>
                            <p className="font-semibold">{matriculaSeleccionada.nombre} {matriculaSeleccionada.apellido}</p>
                            <p className="text-sm text-gray-600">Cédula: {matriculaSeleccionada.cedula}</p>
                            <p className="text-sm text-gray-600">
                                Tipo de curso desde matrícula: {tipoCurso === "regular" ? "Curso regular" : "Reforzamiento"}
                            </p>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Fecha *</label>
                    <input
                        type="date"
                        name="fecha_pago"
                        value={form.fecha_pago}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">N° Recibo *</label>
                    <input
                        type="text"
                        name="numero_recibo"
                        value={form.numero_recibo}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Pago *</label>
                    <select
                        name="tipo_pago"
                        value={form.tipo_pago}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="completo">Completo</option>
                        <option value="anticipo">Anticipo</option>
                        <option value="beneficio">Beneficio</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Curso</label>
                    <input
                        type="text"
                        value={tipoCurso === "regular" ? "Curso regular" : "Reforzamiento"}
                        className="w-full p-2 border rounded bg-gray-100"
                        readOnly
                    />
                </div>

                {tipoCurso === "reforzamiento" && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Horas de Reforzamiento *</label>
                        <select
                            name="horas_reforzamiento"
                            value={form.horas_reforzamiento || 1}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        >
                            {HORAS_REFORZAMIENTO.map((hora) => (
                                <option key={hora} value={hora}>
                                    {hora} hora{hora > 1 ? "s" : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Cantidad *</label>
                    <input
                        type="number"
                        name="cantidad"
                        value={tipoCurso === "reforzamiento" ? form.horas_reforzamiento || 1 : HORAS_CURSO_REGULAR}
                        className="w-full p-2 border rounded bg-gray-100"
                        readOnly
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Monto Unitario *</label>
                    <input
                        type="number"
                        name="monto_unitario"
                        value={PRECIO_HORA_REFORZAMIENTO}
                        className="w-full p-2 border rounded bg-gray-100"
                        readOnly
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Concepto *</label>
                    <input
                        type="text"
                        name="concepto"
                        value={form.concepto}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Monto en Córdobas *</label>
                    <input
                        type="number"
                        step="0.01"
                        name="monto_cordobas"
                        value={form.monto_cordobas}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Monto en Dólares</label>
                    <input
                        type="number"
                        step="0.01"
                        name="monto_dolares"
                        value={form.monto_dolares}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Tasa de Cambio</label>
                    <input
                        type="number"
                        step="0.01"
                        name="tasa_cambio"
                        value={form.tasa_cambio}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Método de Pago</label>
                    <select
                        name="metodo_pago"
                        value={form.metodo_pago}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="cheque">Cheque</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Observaciones</label>
                    <textarea
                        name="observaciones"
                        value={form.observaciones}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        rows="3"
                    />
                </div>
            </div>

            {saldoInfo && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold mb-3 text-blue-800">
                        Estado de Pagos - {saldoInfo.nombre} {saldoInfo.apellido}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                            <p className="text-gray-600">Monto Total:</p>
                            <p className="font-bold">C${Number(saldoInfo.monto_total || 0).toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Pagado:</p>
                            <p className="font-bold text-green-600">C${Number(saldoInfo.total_pagado || 0).toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Saldo:</p>
                            <p className="font-bold text-orange-600">C${Number(saldoInfo.saldo_pendiente || 0).toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Recibos:</p>
                            <p className="font-bold text-purple-600">
                                {saldoInfo.cantidad_pagos} / {saldoInfo.pagos_permitidos}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                >
                    {loading ? "Guardando..." : "Guardar Recibo"}
                </button>
            </div>
        </form>
    );
}

export default RecibosForm;