import { useEffect, useState } from "react";
import Swal from "sweetalert2";

function MatriculaForm({ initialData, onSave, onError }) {
    const [estudiantes, setEstudiantes] = useState([]);
    const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
    const [loading, setLoading] = useState(false);
    const [serverErrors, setServerErrors] = useState({});
    const [categorias, setCategorias] = useState([]);

    const [formData, setFormData] = useState({
        estudiante: "",
        modalidad: "",
        horario: "",
        tipo_curso: "",
        horas_reforzamiento: "",
        categoria: "",
        aparicion: "",
        observaciones: "",
    });

    const MODALIDAD_OPTIONS = [
        { value: "Regular", label: "Regular" },
        { value: "Extraordinario", label: "Extraordinario" },
    ];

    const HORARIO_OPTIONS = [
        { value: "06AM", label: "06:00 AM" },
        { value: "08AM", label: "08:00 AM" },
        { value: "10AM", label: "10:00 AM" },
        { value: "12PM", label: "12:00 PM" },
        { value: "04PM", label: "04:00 PM" },
    ];

    const TIPO_CURSO_OPTIONS = [
        { value: "Principiante", label: "Principiante" },
        { value: "Intermedio", label: "Intermedio" },
        { value: "Avanzado", label: "Avanzado" },
    ];


    const APARICION_OPTIONS = [
        { value: "Redes_Sociales", label: "Redes Sociales" },
        { value: "Referido", label: "Referido" },
        { value: "Sitio_Web", label: "Sitio Web" },
        { value: "otro", label: "otro" },
    ];

    const token = localStorage.getItem("token");

    useEffect(() => {
        cargarEstudiantes();
        cargarcategorias();

    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                estudiante: initialData.estudiante || "",
                modalidad: initialData.modalidad || "",
                horario: initialData.horario || "",
                tipo_curso: initialData.tipo_curso || "",
                horas_reforzamiento: initialData.horas_reforzamiento || "",
                categoria: initialData.categoria || "",
                aparicion: initialData.aparicion || "",
                observaciones: initialData.observaciones || "",
            });

            setBusquedaEstudiante(
                `${initialData.estudiante_nombre || ""} ${initialData.estudiante_apellido || ""} - ${initialData.estudiante_cedula || ""}`
            );
        }
    }, [initialData]);

    const cargarcategorias = async () => {
        try {
             
            const token = localStorage.getItem("token");

            const response = await fetch("http://127.0.0.1:8000/api/categorias/",{
                headers: {
                    Authorization: `Token ${token}`,
                }
            });
            const contentType = response.headers.get("content-type");
            if(!response.ok){
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error(
                    "La API no devolvió JSON. Verifique que el backend esté funcionando correctamente."
                );
            }
            const data = await response.json();
            setCategorias(Array.isArray(data) ? data : [])
        } catch (error) { 
            console.error("Error al cargar las categorias:",error);
            Swal.fire(
                "Error",
                "No pudieron cargas las categorias: ", + error.message,
                "error"
            )
        }
    };

      
    const cargarEstudiantes = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/estudiantes/", {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });
            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error(
                    "La API no devolvió JSON. Verifique que el backend esté funcionando correctamente."
                );
            }
            const data = await response.json();
            setEstudiantes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando estudiantes:", error);
            Swal.fire(
                "Error",
                "No se pudieron cargar los estudiantes: " + error.message,
                "error"
            );
        }
    };

    const estudianteSeleccionado = estudiantes.find(
        (e) => String(e.id) === String(formData.estudiante)
    );

    const estudiantesFiltrados = estudiantes.filter((estudiante) => {
        const texto = `
            ${estudiante.nombre || ""}
            ${estudiante.apellido || ""}
            ${estudiante.cedula || ""}
            ${estudiante.telefono_movil || ""}
        `.toLowerCase();

        return texto.includes(busquedaEstudiante.toLowerCase());
    });

    const seleccionarEstudiante = (estudiante) => {
        setFormData((prev) => ({
            ...prev,
            estudiante: estudiante.id,
        }));

        setBusquedaEstudiante(
            `${estudiante.nombre} ${estudiante.apellido} - ${estudiante.cedula}`
        );

        Swal.fire({
            title: "Estudiante seleccionado",
            text: "Ahora puedes completar los datos de matrícula.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "tipo_curso" && value === "Principiante"
                ? { horas_reforzamiento: "" }
                : {}),
        }));

        if (serverErrors[name]) {
            setServerErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validarFormulario = () => {
        if (!formData.estudiante) {
            Swal.fire("Campo requerido", "Debe seleccionar un estudiante.", "warning");
            return false;
        }

        if (!formData.modalidad) {
            Swal.fire("Campo requerido", "Debe seleccionar la modalidad.", "warning");
            return false;
        }

        if (!formData.horario) {
            Swal.fire("Campo requerido", "Debe seleccionar el horario.", "warning");
            return false;
        }

        if (!formData.tipo_curso) {
            Swal.fire("Campo requerido", "Debe seleccionar el tipo de curso.", "warning");
            return false;
        }

        if (!formData.categoria) {
            Swal.fire("Campo requerido", "Debe seleccionar la categoría.", "warning");
            return false;
        }

        if (!formData.aparicion) {
            Swal.fire("Campo requerido", "Debe seleccionar cómo se enteró.", "warning");
            return false;
        }

        if (
            ["Intermedio", "Avanzado"].includes(formData.tipo_curso) &&
            !formData.horas_reforzamiento
        ) {
            Swal.fire(
                "Campo requerido",
                "Debe seleccionar las horas de reforzamiento.",
                "warning"
            );
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        setLoading(true);
        setServerErrors({});

        const dataToSend = {
            estudiante: parseInt(formData.estudiante),
            modalidad: formData.modalidad,
            horario: formData.horario,
            tipo_curso: formData.tipo_curso,
            horas_reforzamiento: formData.horas_reforzamiento
                ? parseInt(formData.horas_reforzamiento)
                : null,
            categoria: formData.categoria,
            aparicion: formData.aparicion,
            observaciones: formData.observaciones,
        };

        try {
            const url = initialData
                ? `http://127.0.0.1:8000/api/matricula/${initialData.id}/`
                : "http://127.0.0.1:8000/api/matricula/";

            const method = initialData ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(dataToSend),
            });

            const contentType = response.headers.get("content-type");
            let responseData;

            if (contentType && contentType.includes("application/json")) {
                responseData = await response.json();
            } else {
                const textResponse = await response.text();
                console.error("Respuesta no JSON:", textResponse.substring(0, 200));

                if (response.status === 500) {
                    throw new Error(
                        "Error interno del servidor (500). Verifique los logs de Django."
                    );
                }

                if (response.status === 404) {
                    throw new Error(
                        "Endpoint de API no encontrado. Verifique la configuración de URLs."
                    );
                }

                if (response.status === 401 || response.status === 403) {
                    throw new Error(
                        "Error de autenticación. Por favor, inicie sesión nuevamente."
                    );
                }

                throw new Error(`Error del servidor (${response.status}): ${response.statusText}`);
            }

            if (!response.ok) {
                setServerErrors(responseData);

                const mensaje =
                    typeof responseData === "object"
                        ? Object.entries(responseData)
                              .map(([campo, errores]) => {
                                  const texto = Array.isArray(errores)
                                      ? errores.join(", ")
                                      : errores;
                                  return `${campo}: ${texto}`;
                              })
                              .join("\n")
                        : "No se pudo guardar la matrícula.";

                Swal.fire("Error", mensaje, "error");
                return;
            }

            Swal.fire({
                title: "¡Éxito!",
                text: initialData
                    ? "Matrícula actualizada correctamente."
                    : "Matrícula guardada correctamente.",
                icon: "success",
                timer: 1800,
                showConfirmButton: false,
            });

            if (onSave) onSave(responseData);
        } catch (error) {
            console.error("Error:", error);

            Swal.fire(
                "Error",
                error.message || "Error de conexión con el servidor.",
                "error"
            );

            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {Object.keys(serverErrors).length > 0 && (
                <div className="bg-red-50 border border-red-400 text-red-700 p-4 rounded-xl">
                    <p className="font-bold mb-2">Errores de validación:</p>

                    {Object.entries(serverErrors).map(([campo, errores]) => (
                        <p key={campo} className="text-sm">
                            <strong>{campo}:</strong>{" "}
                            {Array.isArray(errores) ? errores.join(", ") : errores}
                        </p>
                    ))}
                </div>
            )}

            <div>
                <h3 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 inline-block pb-1">
                    Buscar estudiante
                </h3>
            </div>

            {!initialData && (
                <div className="relative bg-blue-50 border border-blue-200 p-4 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estudiante registrado <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="text"
                        value={busquedaEstudiante}
                        onChange={(e) => {
                            setBusquedaEstudiante(e.target.value);
                            setFormData((prev) => ({
                                ...prev,
                                estudiante: "",
                            }));
                        }}
                        placeholder="Buscar por nombre, apellido, cédula o teléfono..."
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {busquedaEstudiante && !formData.estudiante && (
                        <div className="absolute left-4 right-4 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20">
                            {estudiantesFiltrados.length > 0 ? (
                                estudiantesFiltrados.map((estudiante) => (
                                    <button
                                        key={estudiante.id}
                                        type="button"
                                        onClick={() => seleccionarEstudiante(estudiante)}
                                        className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-b-0"
                                    >
                                        <p className="font-semibold text-gray-800">
                                            {estudiante.nombre} {estudiante.apellido}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Cédula: {estudiante.cedula} | Teléfono:{" "}
                                            {estudiante.telefono_movil || "N/A"}
                                        </p>
                                    </button>
                                ))
                            ) : (
                                <div className="p-3 text-sm text-gray-400">
                                    No se encontraron estudiantes.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {estudianteSeleccionado && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-gray-200 rounded-xl p-4">
                    <div>
                        <p className="text-xs text-gray-500">Nombre</p>
                        <p className="font-semibold">
                            {estudianteSeleccionado.nombre} {estudianteSeleccionado.apellido}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">Cédula</p>
                        <p className="font-semibold">{estudianteSeleccionado.cedula}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">Teléfono</p>
                        <p className="font-semibold">
                            {estudianteSeleccionado.telefono_movil || "N/A"}
                        </p>
                    </div>
                </div>
            )}

            <div>
                <h3 className="text-xl font-bold text-gray-800 border-b-2 border-green-500 inline-block pb-1">
                    Datos de matrícula
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modalidad <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="modalidad"
                        value={formData.modalidad}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Seleccionar</option>

                        {MODALIDAD_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Horario <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="horario"
                        value={formData.horario}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Seleccionar horario</option>

                        {HORARIO_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de curso <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="tipo_curso"
                        value={formData.tipo_curso}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Seleccionar</option>

                        {TIPO_CURSO_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {(formData.tipo_curso === "Intermedio" ||
                    formData.tipo_curso === "Avanzado") && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Horas de reforzamiento <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="horas_reforzamiento"
                            value={formData.horas_reforzamiento}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccionar horas</option>

                            {formData.tipo_curso === "Intermedio" ? (
                                <>
                                    <option value="6">6 horas</option>
                                    <option value="7">7 horas</option>
                                    <option value="8">8 horas</option>
                                    <option value="9">9 horas</option>
                                    <option value="10">10 horas</option>
                                </>
                            ) : (
                                <>
                                    <option value="2">2 horas</option>
                                    <option value="3">3 horas</option>
                                    <option value="4">4 horas</option>
                                    <option value="5">5 horas</option>
                                </>
                            )}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría <span className="text-red-500">*</span>
                    </label>
                   <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Seleccionar categoría</option>

                    {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                        </option>
                    ))}
                </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        ¿Cómo se enteró? <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="aparicion"
                        value={formData.aparicion}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Seleccionar</option>

                        {APARICION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observaciones
                    </label>
                    <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
                <button
                    type="button"
                    onClick={() => onSave && onSave(null)}
                    className="px-5 py-2.5 border rounded-xl text-gray-700 hover:bg-gray-100 transition"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? "Guardando..." : initialData ? "Actualizar" : "Guardar"}
                </button>
            </div>
        </form>
    );
}

export default MatriculaForm;
