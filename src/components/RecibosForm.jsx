import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import api from "../api/axios";

const redondearMonto = (valor) => Math.round(Number(valor || 0));


function normalizarTipoCurso(matricula) {
    const tipo = String(matricula?.tipo_curso || "").toLowerCase();

    if (tipo.includes("avanzado")) return "avanzado";
    if (tipo.includes("intermedio")) return "intermedio";
    if (tipo.includes("principiante")) return "principiante";

    return "principiante";
}

function etiquetaTipoCurso(tipo) {
    if (tipo === "intermedio") return "Intermedio";
    if (tipo === "avanzado") return "Avanzado";
    return "Principiante";
}

function conceptoPorTipo(tipo) {
    if (tipo === "intermedio") return "Pago de curso intermedio";
    if (tipo === "avanzado") return "Pago de curso avanzado";
    return "Pago de curso principiante";
}

function RecibosForm({ onSave, initialData }) {
    const navigate = useNavigate();

    const initialState = {
        matricula: "",
        numero_recibo: "",
        fecha_pago: new Date().toISOString().split("T")[0],
        tipo_pago: "anticipo",
        monto_pagado: "",
        cantidad: "",
        monto_unitario: "",
        concepto: "Pago de curso principiante",
        horas_reforzamiento: "",
        observaciones: "",
    };

    const [form, setForm] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [saldoInfo, setSaldoInfo] = useState(null);
    const [matriculaSeleccionada, setMatriculaSeleccionada] = useState(null);
    const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
    const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [buscando, setBuscando] = useState(false);
    const [valoresCurso, setValoresCurso] = useState([]);
    const [valorCursoActual, setValorCursoActual] = useState(null);

    const tipoCurso = matriculaSeleccionada
        ? normalizarTipoCurso(matriculaSeleccionada)
        : "principiante";

    const obtenerValorCurso = (tipo) => {
        return valoresCurso.find(
            (valor) => String(valor.tipo_curso).toLowerCase() === tipo
        );
    };

    const calcularTotal = (tipo = tipoCurso, horas = form.horas_reforzamiento) => {
        const valorCurso = obtenerValorCurso(tipo);

        if (!valorCurso) return 0;

        if (tipo === "principiante") {
            return redondearMonto(valorCurso.precio_total);
        }

        const h = Number(horas || 0);

        if (h <= 0) return 0;

        return redondearMonto(h * Number(valorCurso.precio_hora || 0));
    };

    const cargarValoresCurso = async () => {
        try {
            const response = await api.get("/valores-curso/?activo=true");
            const data = response.data;

            setValoresCurso(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error("Error cargando valores de curso:", error);
            Swal.fire("Error", "No se pudieron cargar los valores de los cursos.", "error");
        }
    };

    useEffect(() => {
        cargarValoresCurso();
    }, []);

    const buscarEstudiantes = async (termino) => {
        if (!termino || termino.length < 2) {
            setResultadosBusqueda([]);
            setMostrarResultados(false);
            return;
        }

        setBuscando(true);

        try {
            const response = await api.get("/matricula/");
            const data = response.data;

            const todasLasMatriculas = Array.isArray(data) ? data : data.results || [];
            const searchTerm = termino.toLowerCase();

            // ========== FILTRO CORREGIDO ==========
            // Solo mostrar matrículas que NO están pagadas (estado NO es "matriculado")
            const filtrados = todasLasMatriculas.filter((mat) => {
                const nombreCoincide = mat.estudiante_nombre?.toLowerCase().includes(searchTerm);
                const cedulaCoincide = mat.estudiante_cedula?.toLowerCase().includes(searchTerm);
                const estaPagada = mat.estado === "matriculado"; // ← CAMBIADO de "aprobado" a "matriculado"
                
                // Mostrar solo si coincide el nombre/cedula Y NO está pagada
                return (nombreCoincide || cedulaCoincide) && !estaPagada;
            });

            setResultadosBusqueda(filtrados);
            setMostrarResultados(true);
        } catch (error) {
            console.error("Error buscando estudiantes:", error);
            Swal.fire("Error", "No se pudieron buscar las matrículas.", "error");
        } finally {
            setBuscando(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            if (
                busquedaEstudiante &&
                busquedaEstudiante.length >= 2 &&
                !matriculaSeleccionada
            ) {
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
            const queryHoras = horas ? `&horas=${horas}` : "";

            const response = await api.get(
                `/saldo/?matricula=${matriculaId}${queryHoras}`
            );

            setSaldoInfo(response.data);
        } catch (error) {
            console.error("Error cargando saldo:", error);
        }
    };

    const seleccionarEstudiante = (matricula) => {
        // ========== VALIDACIÓN CORREGIDA ==========
        // Verificar si la matrícula ya está pagada
        if (matricula.estado === "matriculado") { // ← CAMBIADO de "aprobado" a "matriculado"
            Swal.fire(
                "Matrícula ya pagada",
                `Este estudiante ya completó el pago del curso ${etiquetaTipoCurso(normalizarTipoCurso(matricula))}. No se pueden registrar más pagos para esta matrícula.`,
                "warning"
            );
            return;
        }

        const tipo = normalizarTipoCurso(matricula);

        const horas =
            tipo === "principiante"
                ? ""
                : matricula.horas_reforzamiento || "";

        const valorCurso = obtenerValorCurso(tipo);

        if (!valorCurso) {
            Swal.fire(
                "Valor de curso no encontrado",
                `No existe un valor activo para el curso ${etiquetaTipoCurso(tipo)}.`,
                "error"
            );
            return;
        }

        setValorCursoActual(valorCurso);

        setForm({
            ...initialState,
            matricula: matricula.id,
            tipo_pago: "anticipo",
            cantidad: tipo === "principiante"
                ? valorCurso.cantidad_horas
                : Number(horas),
            monto_unitario: tipo === "principiante"
                ? valorCurso.precio_total
                : valorCurso.precio_hora,
            concepto: conceptoPorTipo(tipo),
            horas_reforzamiento: horas,
        });

        setMatriculaSeleccionada(matricula);
        setBusquedaEstudiante(
            `${matricula.estudiante_nombre || "Sin nombre"} - ${matricula.estudiante_cedula || "Sin cédula"}`
        );
        setMostrarResultados(false);
        cargarInfoMatricula(matricula.id, horas);
    };

    const limpiarSeleccion = () => {
        setForm(initialState);
        setMatriculaSeleccionada(null);
        setValorCursoActual(null);
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
                tipo_pago: initialData.tipo_pago || "anticipo",
                monto_pagado: initialData.monto_pagado || "",
                cantidad: initialData.cantidad || "",
                monto_unitario: initialData.monto_unitario || "",
                concepto: initialData.concepto || "Pago de curso principiante",
                horas_reforzamiento: initialData.horas_reforzamiento || "",
                observaciones: initialData.observaciones || "",
            });

            if (initialData.matricula) {
                cargarInfoMatricula(initialData.matricula, initialData.horas_reforzamiento);

                const buscarMatricula = async () => {
                    try {
                        const response = await api.get(`/matricula/${initialData.matricula}/`);
                        const mat = response.data;

                        const tipo = normalizarTipoCurso(mat);
                        const valorCurso = obtenerValorCurso(tipo);

                        setMatriculaSeleccionada(mat);
                        setValorCursoActual(valorCurso || null);

                        setBusquedaEstudiante(
                            `${mat.estudiante_nombre || "Sin nombre"} - ${mat.estudiante_cedula || "Sin cédula"}`
                        );
                    } catch (error) {
                        console.error("Error cargando matrícula:", error);
                    }
                };

                buscarMatricula();
            }
        } else {
            limpiarSeleccion();
        }
    }, [initialData, valoresCurso]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => {
            const nuevoForm = {
                ...prev,
                [name]: value,
            };

            if (name === "tipo_pago") {
                const totalActual = calcularTotal(tipoCurso, nuevoForm.horas_reforzamiento);

                if (value === "completo") {
                    nuevoForm.monto_pagado = String(totalActual);
                } else if (value === "beneficio") {
                    nuevoForm.monto_pagado = "0";
                } else {
                    nuevoForm.monto_pagado = "";
                }
            }

            return nuevoForm;
        });
    };

    useEffect(() => {
        if (
            form.tipo_pago === "anticipo" &&
            saldoInfo &&
            Number(saldoInfo.total_pagado || 0) > 0 &&
            Number(saldoInfo.saldo_pendiente || 0) > 0
        ) {
            setForm((prev) => ({
                ...prev,
                monto_pagado: String(redondearMonto(saldoInfo.saldo_pendiente || 0)),
            }));
        }
    }, [form.tipo_pago, saldoInfo]);

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

        if (
            (tipoCurso === "intermedio" || tipoCurso === "avanzado") &&
            !form.horas_reforzamiento
        ) {
            Swal.fire(
                "Error",
                "La matrícula no tiene horas asignadas. Verifique la matrícula del estudiante.",
                "error"
            );
            setLoading(false);
            return;
        }

        if (!form.concepto) {
            Swal.fire("Error", "Debe ingresar el concepto", "error");
            setLoading(false);
            return;
        }

        const totalCurso = calcularTotal();
        const monto = parseFloat(form.monto_pagado || 0);

        if (form.tipo_pago !== "beneficio" && (!monto || monto <= 0)) {
            Swal.fire("Error", "Debe ingresar un monto válido", "error");
            setLoading(false);
            return;
        }

        if (monto < 0) {
            Swal.fire("Error", "El monto no puede ser negativo", "error");
            setLoading(false);
            return;
        }

        if (form.tipo_pago === "completo") {
            if (Math.round(monto) !== Math.round(totalCurso)) {
                Swal.fire(
                    "Error",
                    `Para pago completo el monto debe ser C$${totalCurso}`,
                    "error"
                );
                setLoading(false);
                return;
            }
        }

        if (form.tipo_pago === "anticipo" && monto >= totalCurso) {
    Swal.fire(
        "Monto inválido",
        `Un anticipo no puede ser igual ni mayor al total del curso. Si pagará C$${totalCurso}, seleccione pago completo.`,
        "error"
    );
    setLoading(false);
    return;
}

    if (form.tipo_pago === "anticipo" && saldoInfo) {
        const saldoPendiente = parseFloat(saldoInfo.saldo_pendiente || 0);

        if (saldoPendiente <= 0) {
            Swal.fire(
                "Matrícula pagada",
                "Esta matrícula ya fue pagada completamente.",
                "warning"
            );
            setLoading(false);
            return;
        }

        if (monto > saldoPendiente) {
            
            const totalPagadoPrevio = Number(saldoInfo.total_pagado || 0);

            if (totalPagadoPrevio > 0 && Math.round(monto) !== Math.round(saldoPendiente)) {
                Swal.fire(
                    "Monto incorrecto",
                    `El segundo anticipo debe ser exactamente el saldo pendiente: C$${Math.round(saldoPendiente)}.`,
                    "error"
                );
                setLoading(false);
                return;
            }
        }
    }
        const isEditing = !!initialData?.id;

        const montoFinal = parseFloat(form.monto_pagado || 0);

        const cantidadEnvio =
            tipoCurso === "principiante"
                ? Number(valorCursoActual?.cantidad_horas || form.cantidad || 0)
                : Number(form.horas_reforzamiento || 0);

        const horasEnvio =
            tipoCurso === "principiante"
                ? null
                : parseInt(form.horas_reforzamiento);

        const datosEnvio = {
            matricula: parseInt(form.matricula),
            numero_recibo: form.numero_recibo,
            fecha_pago: form.fecha_pago,
            tipo_pago: form.tipo_pago,
            cantidad: cantidadEnvio,
            monto_unitario: Number(form.monto_unitario || 0),
            concepto: form.concepto,
            monto_pagado: montoFinal,
            horas_reforzamiento: horasEnvio,
            estado: "pagado",
            observaciones: form.observaciones || "",
        };

        console.log("DATOS ENVIADOS RECIBO:", datosEnvio);

        try {
            if (isEditing) {
                await api.put(`/recibo/${initialData.id}/`, datosEnvio);
            } else {
                await api.post("/recibo/", datosEnvio);
            }

            Swal.fire({
                title: isEditing ? "¡Recibo actualizado!" : "¡Recibo creado!",
                text: `Monto registrado: C$${redondearMonto(montoFinal)}`,
                icon: "success",
                confirmButtonText: "Aceptar",
            }).then(() => {
                if (onSave) {
                    onSave();
                } else {
                    navigate("/dashboard/recibos");
                }
            });
        } catch (error) {
            console.error("Error guardando recibo:", error);

            const data = error.response?.data;

            const mensaje =
                data?.error ||
                data?.detail ||
                (data && typeof data === "object"
                    ? Object.values(data).flat().join("\n")
                    : "Error de conexión");

            Swal.fire("Error", mensaje, "error");
        } finally {
            setLoading(false);
        }
    };

    const totalCurso = calcularTotal();
    const horasActuales =
        tipoCurso === "principiante"
            ? Number(valorCursoActual?.cantidad_horas || form.cantidad || 0)
            : Number(form.horas_reforzamiento || 0);

   const montoAnticipo = parseFloat(form.monto_pagado || 0);
    const cantidadPagos = Number(saldoInfo?.cantidad_pagos || 0);
    const totalPagadoPrevio = Number(saldoInfo?.total_pagado || 0);
    const saldoPendienteBackend = Number(saldoInfo?.saldo_pendiente || 0);

    const esSegundoAnticipo =
        form.tipo_pago === "anticipo" &&
        saldoInfo &&
        Number(saldoInfo.total_pagado || 0) > 0 &&
        Number(saldoInfo.saldo_pendiente || 0) > 0;

    const saldoBase =
        saldoInfo && saldoPendienteBackend > 0
            ? saldoPendienteBackend
            : totalCurso;

    const montoMostrado =
        form.tipo_pago === "beneficio"
            ? 0
            : montoAnticipo;

    const saldoPendienteLocal =
        saldoInfo
            ? redondearMonto(saldoPendienteBackend)
            : totalCurso > 0
                ? redondearMonto(totalCurso - montoMostrado)
                : null;
   return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 text-white">
                <h2 className="text-xl font-bold">Registro de recibo</h2>
                <p className="text-sm text-blue-100">
                    Seleccioná una matrícula pendiente y registrá el pago correspondiente.
                </p>
            </div>

            <div className="p-6 space-y-6">
                <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">
                                Total calculado del curso
                            </p>

                            {tipoCurso === "principiante" ? (
                                <p className="text-sm text-gray-500 mt-1">
                                    Principiante: {horasActuales} horas · Total fijo{" "}
                                    <strong>C${totalCurso}</strong>
                                </p>
                            ) : horasActuales > 0 ? (
                                <p className="text-sm text-gray-500 mt-1">
                                    {etiquetaTipoCurso(tipoCurso)}: {horasActuales} hora
                                    {horasActuales !== 1 ? "s" : ""} × C$
                                    {redondearMonto(valorCursoActual?.precio_hora || form.monto_unitario || 0)} ={" "}
                                    <strong>C${totalCurso}</strong>
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400 italic mt-1">
                                    Seleccione un estudiante para ver el total.
                                </p>
                            )}
                        </div>

                        <div className="text-right">
                            <p className="text-xs uppercase tracking-wide text-blue-500 font-semibold">
                                Monto total
                            </p>
                            <p className="text-4xl font-extrabold text-blue-700">
                                {totalCurso > 0 ? `C$ ${totalCurso}` : "—"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Buscar estudiante *
                    </label>

                    <div className="relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                        <input
                            type="text"
                            placeholder="Escribe nombre o cédula..."
                            value={busquedaEstudiante}
                            onChange={(e) => {
                                setBusquedaEstudiante(e.target.value);

                                if (matriculaSeleccionada) {
                                    setMatriculaSeleccionada(null);
                                    setForm((prev) => ({
                                        ...prev,
                                        matricula: "",
                                    }));
                                }
                            }}
                            className="w-full pl-11 pr-11 py-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            autoComplete="off"
                        />

                        {busquedaEstudiante && (
                            <button
                                type="button"
                                onClick={limpiarSeleccion}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                            >
                                <FiX size={18} />
                            </button>
                        )}
                    </div>

                    {mostrarResultados && busquedaEstudiante && (
                        <div className="mt-3 border border-slate-200 rounded-xl max-h-72 overflow-y-auto bg-white shadow-lg z-10">
                            {buscando ? (
                                <div className="p-5 text-center text-gray-500">
                                    Buscando...
                                </div>
                            ) : resultadosBusqueda.length > 0 ? (
                                resultadosBusqueda.map((mat) => {
                                    const matriculaBloqueada =
                                        mat.estado === "matriculado" ||
                                        mat.estado === "finalizado" ||
                                        mat.estado === "cancelado";

                                    return (
                                        <div
                                            key={mat.id}
                                            onClick={() => {
                                                if (matriculaBloqueada) {
                                                    Swal.fire(
                                                        "Matrícula no disponible",
                                                        `Esta matrícula ya está ${mat.estado === "matriculado" ? "pagada" : mat.estado}. No se pueden registrar más pagos.`,
                                                        "warning"
                                                    );
                                                    return;
                                                }

                                                seleccionarEstudiante(mat);
                                            }}
                                            className={`p-4 border-b last:border-b-0 flex justify-between items-start gap-4 transition ${
                                                matriculaBloqueada
                                                    ? "bg-gray-100 cursor-not-allowed opacity-70"
                                                    : "hover:bg-blue-50 cursor-pointer"
                                            }`}
                                        >
                                            <div>
                                                <p className="font-bold text-gray-800">
                                                    {mat.estudiante_nombre || "Sin nombre"}
                                                </p>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Cédula: {mat.estudiante_cedula || "Sin cédula"}
                                                </p>

                                                <p className="text-xs text-blue-600 font-medium mt-1">
                                                    Matrícula #{mat.id} · Tipo de curso:{" "}
                                                    {etiquetaTipoCurso(normalizarTipoCurso(mat))}
                                                    {normalizarTipoCurso(mat) !== "principiante" &&
                                                    mat.horas_reforzamiento
                                                        ? ` — ${mat.horas_reforzamiento} horas`
                                                        : ""}
                                                </p>

                                                <p className="text-xs text-gray-500 mt-1">
                                                    Categoría: {mat.categoria || "N/A"} · Horario:{" "}
                                                    {mat.horario || "N/A"} · Modalidad:{" "}
                                                    {mat.modalidad || "N/A"}
                                                </p>
                                            </div>

                                            <div className="text-right shrink-0">
                                                {matriculaBloqueada ? (
                                                    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                                                        {mat.estado === "matriculado"
                                                            ? "Pagado"
                                                            : mat.estado === "cancelado"
                                                            ? "Cancelado"
                                                            : "Finalizado"}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                                                        Pendiente
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-5 text-center text-gray-500">
                                    No se encontraron estudiantes con matrículas pendientes.
                                </div>
                            )}
                        </div>
                    )}

                    {matriculaSeleccionada && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-sm text-green-800 font-semibold">
                                Estudiante seleccionado
                            </p>

                            <p className="font-bold text-gray-800 mt-1">
                                {matriculaSeleccionada.estudiante_nombre}
                            </p>

                            <p className="text-sm text-gray-600 mt-1">
                                Cédula: {matriculaSeleccionada.estudiante_cedula}
                            </p>

                            <p className="text-sm text-gray-600 mt-1">
                                Tipo de curso:{" "}
                                <span className="font-semibold">
                                    {etiquetaTipoCurso(tipoCurso)}
                                </span>

                                {tipoCurso !== "principiante" &&
                                form.horas_reforzamiento ? (
                                    <span className="ml-1 text-blue-600 font-semibold">
                                        — {form.horas_reforzamiento} horas
                                    </span>
                                ) : null}
                            </p>

                            <p className="text-sm mt-2">
                                Estado actual:{" "}
                                <span className={`font-bold ${
                                    matriculaSeleccionada.estado === "matriculado"
                                        ? "text-green-600"
                                        : "text-yellow-600"
                                }`}>
                                    {matriculaSeleccionada.estado === "matriculado"
                                        ? "MATRICULADO (Curso pagado)"
                                        : matriculaSeleccionada.estado === "pendiente"
                                        ? "PENDIENTE (Pago incompleto)"
                                        : matriculaSeleccionada.estado}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha *</label>
                        <input
                            type="date"
                            name="fecha_pago"
                            value={form.fecha_pago}
                            onChange={handleChange}
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            N° de Recibo/Factura *
                        </label>
                        <input
                            type="text"
                            name="numero_recibo"
                            value={form.numero_recibo}
                            onChange={handleChange}
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Tipo de Curso
                        </label>
                        <input
                            type="text"
                            value={etiquetaTipoCurso(tipoCurso)}
                            className="w-full p-3 border border-slate-300 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                            readOnly
                        />
                    </div>

                    {(tipoCurso === "intermedio" || tipoCurso === "avanzado") && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Horas del curso
                            </label>
                            <div className="w-full p-3 border border-slate-300 rounded-xl bg-gray-100 text-gray-700 font-semibold">
                                {form.horas_reforzamiento || 0} hora
                                {Number(form.horas_reforzamiento) !== 1 ? "s" : ""}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Cantidad de horas
                        </label>
                        <input
                            type="number"
                            value={
                                tipoCurso === "principiante"
                                    ? valorCursoActual?.cantidad_horas || form.cantidad || ""
                                    : form.horas_reforzamiento || ""
                            }
                            className="w-full p-3 border border-slate-300 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                            readOnly
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Tipo de Pago *
                        </label>
                        <select
                            name="tipo_pago"
                            value={form.tipo_pago}
                            onChange={handleChange}
                            className="w-full p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="completo">Completo</option>
                            <option value="anticipo">Anticipo</option>
                            <option value="beneficio">Beneficio</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Monto Pagado *
                        </label>
                        <input
                            type="number"
                            step="1"
                            name="monto_pagado"
                            value={form.monto_pagado}
                            onChange={handleChange}
                            className={`w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                form.tipo_pago === "completo" || form.tipo_pago === "beneficio" || esSegundoAnticipo
                                    ? "bg-gray-100 text-gray-700 font-semibold"
                                    : "bg-white"
                            }`}
                            readOnly={form.tipo_pago === "completo" || esSegundoAnticipo}
                            required={form.tipo_pago !== "beneficio"}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Observaciones
                        </label>
                        <textarea
                            name="observaciones"
                            value={form.observaciones}
                            onChange={handleChange}
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                            rows="3"
                            placeholder="Escriba una observación si es necesario..."
                        />
                    </div>
                </div>

                {saldoInfo && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">
                            Estado de pagos
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <p className="text-gray-500">Monto total</p>
                                <p className="font-extrabold text-gray-800 text-xl mt-1">
                                    C${redondearMonto(saldoInfo.monto_total || 0)}
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <p className="text-gray-500">Pagado</p>
                                <p className="font-extrabold text-green-600 text-xl mt-1">
                                    C${redondearMonto(saldoInfo.total_pagado || 0)}
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <p className="text-gray-500">Saldo pendiente</p>
                                <p className="font-extrabold text-orange-600 text-xl mt-1">
                                    C${redondearMonto(saldoInfo.saldo_pendiente || 0)}
                                </p>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                                <p className="text-gray-500">Recibos</p>
                                <p className="font-extrabold text-purple-600 text-xl mt-1">
                                    {saldoInfo.cantidad_pagos} / {saldoInfo.pagos_permitidos}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition"
                    >
                        {loading ? "Guardando..." : "Guardar Recibo"}
                    </button>
                </div>
            </div>
        </div>
    </form>
);
}

export default RecibosForm;
