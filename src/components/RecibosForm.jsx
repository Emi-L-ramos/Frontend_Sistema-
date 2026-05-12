import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiUserCheck, FiX } from "react-icons/fi";

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
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://127.0.0.1:8000/api/valores-curso/?activo=true",
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("No se pudieron cargar los valores de los cursos.");
            }

            const data = await response.json();
            setValoresCurso(data);
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
            const token = localStorage.getItem("token");

            const response = await fetch("http://127.0.0.1:8000/api/matricula/", {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("No se pudieron cargar las matrículas.");
            }

            const todasLasMatriculas = await response.json();
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
            const token = localStorage.getItem("token");
            const queryHoras = horas ? `&horas=${horas}` : "";

            const response = await fetch(
                `http://127.0.0.1:8000/api/saldo/?matricula=${matriculaId}${queryHoras}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSaldoInfo(data);
            }
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
                        const token = localStorage.getItem("token");

                        const response = await fetch(
                            `http://127.0.0.1:8000/api/matricula/${initialData.matricula}/`,
                            {
                                headers: {
                                    Authorization: `Token ${token}`,
                                },
                            }
                        );

                        if (response.ok) {
                            const mat = await response.json();
                            const tipo = normalizarTipoCurso(mat);
                            const valorCurso = obtenerValorCurso(tipo);

                            setMatriculaSeleccionada(mat);
                            setValorCursoActual(valorCurso || null);

                            setBusquedaEstudiante(
                                `${mat.estudiante_nombre || "Sin nombre"} - ${mat.estudiante_cedula || "Sin cédula"}`
                            );
                        }
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
            Swal.fire(
                "Monto excedido",
                `El monto no puede exceder el saldo pendiente: C$${Math.round(saldoPendiente)}.`,
                "error"
            );
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
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(datosEnvio),
            });

            if (response.ok) {
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
            } else {
                const contentType = response.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                    const data = await response.json();
                    const mensaje =
                        data.error ||
                        data.detail ||
                        Object.values(data).flat().join("\n");

                    Swal.fire("Error", mensaje, "error");
                } else {
                    const text = await response.text();
                    console.error("Respuesta HTML del backend:", text);
                    Swal.fire(
                        "Error",
                        "Error interno del servidor. Revisa la terminal de Django.",
                        "error"
                    );
                }
            }
        } catch (error) {
            console.error("Error guardando recibo:", error);
            Swal.fire("Error", "Error de conexión", "error");
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

    const saldoPendienteLocal =
        form.tipo_pago === "anticipo" && montoAnticipo > 0 && totalCurso > 0
            ? redondearMonto(totalCurso - montoAnticipo)
            : null;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <p className="text-sm text-gray-600 font-medium">
                            Total calculado
                        </p>

                        {tipoCurso === "principiante" ? (
                            <p className="text-xs text-gray-500">
                                Principiante: {horasActuales} horas · Total fijo{" "}
                                <strong>C${totalCurso}</strong>
                            </p>
                        ) : horasActuales > 0 ? (
                            <p className="text-xs text-gray-500">
                                {etiquetaTipoCurso(tipoCurso)}: {horasActuales} hora
                                {horasActuales !== 1 ? "s" : ""} × C$
                                {redondearMonto(valorCursoActual?.precio_hora || form.monto_unitario || 0)} ={" "}
                                <strong>C${totalCurso}</strong>
                            </p>
                        ) : (
                            <p className="text-xs text-gray-400 italic">
                                Seleccione un estudiante para ver el total
                            </p>
                        )}
                    </div>

                    <p className="text-3xl font-bold text-blue-600">
                        {totalCurso > 0 ? `C$ ${totalCurso}` : "—"}
                    </p>
                </div>

                {saldoPendienteLocal !== null && (
                    <div className="mt-3 pt-3 border-t border-blue-200 grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                            <p className="text-gray-500">Total</p>
                            <p className="font-bold text-gray-800">C$ {totalCurso}</p>
                        </div>

                        <div>
                            <p className="text-gray-500">Anticipo</p>
                            <p className="font-bold text-green-600">
                                C$ {redondearMonto(montoAnticipo)}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-500">Saldo pendiente</p>
                            <p
                                className={`font-bold text-lg ${
                                    saldoPendienteLocal > 0
                                        ? "text-orange-600"
                                        : "text-green-600"
                                }`}
                            >
                                C$ {saldoPendienteLocal}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                        Buscar Estudiante *
                    </label>

                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

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
                                <div className="p-4 text-center text-gray-500">
                                    Buscando...
                                </div>
                            ) : resultadosBusqueda.length > 0 ? (
                                resultadosBusqueda.map((mat) => {
                                    // ========== VALIDACIÓN CORREGIDA ==========
                                    const matriculaBloqueada =
                                        mat.estado === "matriculado" || // ← CAMBIADO de "aprobado" a "matriculado"
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
                                            className={`p-3 border-b flex justify-between items-center ${
                                                matriculaBloqueada
                                                    ? "bg-gray-100 cursor-not-allowed opacity-70"
                                                    : "hover:bg-blue-50 cursor-pointer"
                                            }`}
                                        >
                                            <div>
                                                <p className="font-semibold">
                                                    {mat.estudiante_nombre || "Sin nombre"}
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    Cédula: {mat.estudiante_cedula || "Sin cédula"}
                                                </p>

                                                <p className="text-xs text-blue-600">
                                                    Matrícula #{mat.id} · Tipo de curso:{" "}
                                                    {etiquetaTipoCurso(normalizarTipoCurso(mat))}
                                                    {normalizarTipoCurso(mat) !== "principiante" &&
                                                    mat.horas_reforzamiento
                                                        ? ` — ${mat.horas_reforzamiento} horas`
                                                        : ""}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    Categoría: {mat.categoria || "N/A"} · Horario:{" "}
                                                    {mat.horario || "N/A"} · Modalidad:{" "}
                                                    {mat.modalidad || "N/A"}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                {matriculaBloqueada ? (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                        {mat.estado === "matriculado"
                                                            ? "Pagado"
                                                            : mat.estado === "cancelado"
                                                            ? "Cancelado"
                                                            : "Finalizado"}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                                        Pendiente
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-center text-gray-500">
                                    No se encontraron estudiantes con matrículas pendientes
                                </div>
                            )}
                        </div>
                    )}

                    {matriculaSeleccionada && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 font-medium">
                                Estudiante seleccionado:
                            </p>

                            <p className="font-semibold">
                                {matriculaSeleccionada.estudiante_nombre}
                            </p>

                            <p className="text-sm text-gray-600">
                                Cédula: {matriculaSeleccionada.estudiante_cedula}
                            </p>

                            <p className="text-sm text-gray-600">
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

                            {/* Mostrar estado actual de la matrícula */}
                            <p className="text-sm mt-1">
                                Estado actual:{" "}
                                <span className={`font-semibold ${
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
                    <label className="block text-sm font-medium mb-1">
                        N° de Recibo/Factura *
                    </label>
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
                    <label className="block text-sm font-medium mb-1">
                        Tipo de Curso
                    </label>
                    <input
                        type="text"
                        value={etiquetaTipoCurso(tipoCurso)}
                        className="w-full p-2 border rounded bg-gray-100"
                        readOnly
                    />
                </div>

                {(tipoCurso === "intermedio" || tipoCurso === "avanzado") && (
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Horas del curso
                        </label>
                        <div className="w-full p-2 border rounded bg-gray-100 text-gray-700 font-semibold">
                            {form.horas_reforzamiento || 0} hora
                            {Number(form.horas_reforzamiento) !== 1 ? "s" : ""}
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-1">Cantidad de horas</label>
                    <input
                        type="number"
                        value={
                            tipoCurso === "principiante"
                                ? valorCursoActual?.cantidad_horas || form.cantidad || ""
                                : form.horas_reforzamiento || ""
                        }
                        className="w-full p-2 border rounded bg-gray-100"
                        readOnly
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Tipo de Pago *
                    </label>
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
                    <label className="block text-sm font-medium mb-1">
                        Monto Pagado *
                    </label>
                    <input
                        type="number"
                        step="1"
                        name="monto_pagado"
                        value={form.monto_pagado}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded ${
                            form.tipo_pago === "completo" || form.tipo_pago === "beneficio"
                                ? "bg-gray-100"
                                : ""
                        }`}
                        readOnly={form.tipo_pago === "completo" || form.tipo_pago === "beneficio"}
                        required={form.tipo_pago !== "beneficio"}
                    />
                </div>
                
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                        Observaciones
                    </label>
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
                        Estado de Pagos
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                            <p className="text-gray-600">Monto Total:</p>
                            <p className="font-bold text-gray-800">
                                C${redondearMonto(saldoInfo.monto_total || 0)}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-600">Pagado:</p>
                            <p className="font-bold text-green-600">
                                C${redondearMonto(saldoInfo.total_pagado || 0)}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-600">Saldo Pendiente:</p>
                            <p className="font-bold text-orange-600">
                                C${redondearMonto(saldoInfo.saldo_pendiente || 0)}
                            </p>
                        </div>

                        <div>
                            <p className="text-gray-600">Recibos:</p>
                            <p className="font-bold text-purple-600">
                                {saldoInfo.cantidad_pagos} /{" "}
                                {saldoInfo.pagos_permitidos}
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
