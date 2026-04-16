// src/components/MatriculaForm.jsx
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';

function MatriculaForm({ initialData, onSave, onError }) {
    const [formData, setFormData] = useState({
        f_matricula: '',
        nombre: '',
        apellido: '',
        edad: '',
        sexo: '',
        nacionalidad: '',
        fecha_nacimiento: '',
        cedula: '',
        direccion: '',
        correo_electronico: '',
        telefono_movil: '',
        nivel_educativo: '',
        profesion_u_oficio: '',
        en_caso_de_emrgencia: '',
        telefono_emergencia: '',
        modalidad: '',
        horario: '',
        tipo_pago: '',
        tipo_curso: '',
        categoria: '',
        apariconia: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverErrors, setServerErrors] = useState({});

    // Opciones para los selects
    const SEXO_OPTIONS = [
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Femenino' }
    ];

    const MODALIDAD_OPTIONS = [
        { value: 'Regular', label: 'Regular' },
        { value: 'Extraordinario', label: 'Extraordinario' }
    ];

    const HORARIO_OPTIONS = [
        { value: '6AM A 8AM', label: '6:00 AM - 8:00 AM' },
        { value: '8AM A 10AM', label: '8:00 AM - 10:00 AM' },
        { value: '10AM A 12PM', label: '10:00 AM - 12:00 PM' },
        { value: '12PM A 2PM', label: '12:00 PM - 2:00 PM' },
        { value: '4PM A 6PM', label: '4:00 PM - 6:00 PM' }
    ];

    const TIPO_PAGO_OPTIONS = [
        { value: 'Pago_completo', label: 'Pago Completo' },
        { value: 'Anticipo', label: 'Anticipo' },
        { value: 'Beneficio', label: 'Beneficio' }
    ];

    const TIPO_CURSO_OPTIONS = [
        { value: 'Curso_avanzado', label: 'Curso Avanzado' },
        { value: 'Reforzamiento', label: 'Reforzamiento' }
    ];

    const CATEGORIA_OPTIONS = [
        { value: '1', label: 'Categoría 1' },
        { value: '2', label: 'Categoría 2' },
        { value: '3', label: 'Categoría 3' }
    ];

    const NIVEL_EDUCATIVO_OPTIONS = [
        { value: 'Primaria', label: 'Primaria' },
        { value: 'Secundaria', label: 'Secundaria' },
        { value: 'Universidad', label: 'Universidad' },
        { value: 'Profesional', label: 'Profesional' }
    ];

    const APARICIONIA_OPTIONS = [
        { value: 'Redes_Sociales', label: 'Redes Sociales' },
        { value: 'Referido', label: 'Referido' },
        { value: 'Sitio_Web', label: 'Sitio Web' },
        { value: 'otro', label: 'Otro' }
    ];

    useEffect(() => {
        if (initialData) {
            let fechaNacimiento = '';
            if (initialData.fecha_nacimiento) {
                const date = new Date(initialData.fecha_nacimiento);
                fechaNacimiento = date.toISOString().split('T')[0];
            }
            
            setFormData({
                f_matricula: initialData.f_matricula || '',
                nombre: initialData.nombre || '',
                apellido: initialData.apellido || '',
                edad: initialData.edad || '',
                sexo: initialData.sexo || '',
                nacionalidad: initialData.nacionalidad || '',
                fecha_nacimiento: fechaNacimiento,
                cedula: initialData.cedula || '',
                direccion: initialData.direccion || '',
                correo_electronico: initialData.correo_electronico || '',
                telefono_movil: initialData.telefono_movil || '',
                nivel_educativo: initialData.nivel_educativo || '',
                profesion_u_oficio: initialData.profesion_u_oficio || '',
                en_caso_de_emrgencia: initialData.en_caso_de_emrgencia || '',
                telefono_emergencia: initialData.telefono_emergencia || '',
                modalidad: initialData.modalidad || '',
                horario: initialData.horario || '',
                tipo_pago: initialData.tipo_pago || '',
                tipo_curso: initialData.tipo_curso || '',
                categoria: initialData.categoria || '',
                apariconia: initialData.apariconia || '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (serverErrors[name]) {
            setServerErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
        if (!formData.cedula.trim()) newErrors.cedula = 'La cédula es requerida';
        if (!formData.correo_electronico.trim()) {
            newErrors.correo_electronico = 'El correo es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.correo_electronico)) {
            newErrors.correo_electronico = 'Correo electrónico inválido';
        }
        if (!formData.horario) newErrors.horario = 'El horario es requerido';
        if (!formData.modalidad) newErrors.modalidad = 'La modalidad es requerida';
        if (!formData.tipo_curso) newErrors.tipo_curso = 'El tipo de curso es requerido';
        if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            await Swal.fire({
                title: 'Campos incompletos',
                text: 'Por favor complete todos los campos requeridos',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            if (onError) onError(new Error('Por favor complete todos los campos requeridos'));
            return;
        }
        
        setLoading(true);
        setServerErrors({});
        
        const dataToSend = {
            ...formData,
            edad: formData.edad ? parseInt(formData.edad) : null,
        };
        
        try {
            const token = localStorage.getItem("token");
            const url = initialData 
                ? `http://localhost:8000/api/matricula/${initialData.id}/`
                : "http://localhost:8000/api/matricula/";
            
            const method = initialData ? "PUT" : "POST";
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify(dataToSend)
            });
            
            const responseData = await response.json();
            
            if (!response.ok) {
                if (responseData) {
                    setServerErrors(responseData);
                    let errorMessage = "Error al guardar:\n";
                    for (const [field, errors] of Object.entries(responseData)) {
                        errorMessage += `- ${field}: ${errors.join(', ')}\n`;
                    }
                    await Swal.fire({
                        title: 'Error',
                        text: errorMessage,
                        icon: 'error',
                        confirmButtonColor: '#d33'
                    });
                    throw new Error(errorMessage);
                } else {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            }
            
            await Swal.fire({
                title: '¡Éxito!',
                text: initialData ? 'Matrícula actualizada correctamente' : 'Matrícula guardada correctamente',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                timer: 2000,
                timerProgressBar: true
            });
            
            if (onSave) onSave(responseData);
            
        } catch (error) {
            console.error("Error:", error);
            if (onError) onError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Mostrar errores del servidor */}
            {Object.keys(serverErrors).length > 0 && (
                <div className="bg-red-50 border border-red-500 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base">
                    <h4 className="font-bold mb-2">Errores de validación:</h4>
                    <ul className="list-disc list-inside">
                        {Object.entries(serverErrors).map(([field, errors]) => (
                            <li key={field}>
                                <strong>{field}:</strong> {Array.isArray(errors) ? errors.join(', ') : errors}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {/* Grid responsivo: 1 columna en móvil, 2 en tablet, 3 en desktop grande */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                
                {/* Título - ocupa todas las columnas */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 pb-2 border-b-2 border-blue-500 inline-block">
                        📋 Datos Personales
                    </h3>
                </div>
                
                {/* Campos del formulario con tamaños responsivos */}
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                            errors.nombre || serverErrors.nombre ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                    {serverErrors.nombre && <p className="text-red-500 text-xs mt-1">{serverErrors.nombre}</p>}
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                            errors.apellido || serverErrors.apellido ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>}
                    {serverErrors.apellido && <p className="text-red-500 text-xs mt-1">{serverErrors.apellido}</p>}
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Cédula <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="cedula"
                        value={formData.cedula}
                        onChange={handleChange}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                            errors.cedula || serverErrors.cedula ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
                    {serverErrors.cedula && <p className="text-red-500 text-xs mt-1">{serverErrors.cedula}</p>}
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Edad
                    </label>
                    <input
                        type="number"
                        name="edad"
                        value={formData.edad}
                        onChange={handleChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Sexo
                    </label>
                    <select
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="">Seleccionar</option>
                        {SEXO_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Nacionalidad
                    </label>
                    <input
                        type="text"
                        name="nacionalidad"
                        value={formData.nacionalidad}
                        onChange={handleChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Fecha de Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="fecha_nacimiento"
                        value={formData.fecha_nacimiento}
                        onChange={handleChange}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                            errors.fecha_nacimiento || serverErrors.fecha_nacimiento ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.fecha_nacimiento && <p className="text-red-500 text-xs mt-1">{errors.fecha_nacimiento}</p>}
                    {serverErrors.fecha_nacimiento && <p className="text-red-500 text-xs mt-1">{serverErrors.fecha_nacimiento}</p>}
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="correo_electronico"
                        value={formData.correo_electronico}
                        onChange={handleChange}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                            errors.correo_electronico || serverErrors.correo_electronico ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.correo_electronico && <p className="text-red-500 text-xs mt-1">{errors.correo_electronico}</p>}
                    {serverErrors.correo_electronico && <p className="text-red-500 text-xs mt-1">{serverErrors.correo_electronico}</p>}
                </div>
                
                <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Dirección
                    </label>
                    <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Teléfono Móvil
                    </label>
                    <input
                        type="tel"
                        name="telefono_movil"
                        value={formData.telefono_movil}
                        onChange={handleChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Nivel Educativo
                    </label>
                    <select
                        name="nivel_educativo"
                        value={formData.nivel_educativo}
                        onChange={handleChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="">Seleccionar</option>
                        {NIVEL_EDUCATIVO_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Profesión u Oficio
                    </label>
                    <input
                        type="text"
                        name="profesion_u_oficio"
                        value={formData.profesion_u_oficio}
                        onChange={handleChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Contacto de Emergencia
                    </label>
                    <input
                        type="text"
                        name="en_caso_de_emrgencia"
                        value={formData.en_caso_de_emrgencia}
                        onChange={handleChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Teléfono de Emergencia
                    </label>
                    <input
                        type="tel"
                        name="telefono_emergencia"
                        value={formData.telefono_emergencia}
                        onChange={handleChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>



                
                
                
                {/* Datos Académicos */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 pb-2 border-b-2 border-green-500 inline-block mt-4">
                        🎓 Datos Académicos
                    </h3>
                </div>


                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Fecha de Matricula
                    </label>
                    <input
                        type="date"
                        name="f_matricula"
                        value={formData.f_matricula}
                         onChange={handleChange}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                            errors.f_matricula || serverErrors.f_matricula ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Modalidad <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="modalidad"
                        value={formData.modalidad}
                        onChange={handleChange}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                            errors.modalidad || serverErrors.modalidad ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Seleccionar</option>
                        {MODALIDAD_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    {errors.modalidad && <p className="text-red-500 text-xs mt-1">{errors.modalidad}</p>}
                    {serverErrors.modalidad && <p className="text-red-500 text-xs mt-1">{serverErrors.modalidad}</p>}
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Horario <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="horario"
                        value={formData.horario}
                        onChange={handleChange}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                            errors.horario || serverErrors.horario ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Seleccionar horario</option>
                        {HORARIO_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    {errors.horario && <p className="text-red-500 text-xs mt-1">{errors.horario}</p>}
                    {serverErrors.horario && <p className="text-red-500 text-xs mt-1">{serverErrors.horario}</p>}
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Tipo de Curso <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="tipo_curso"
                        value={formData.tipo_curso}
                        onChange={handleChange}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                            errors.tipo_curso || serverErrors.tipo_curso ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Seleccionar</option>
                        {TIPO_CURSO_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    {errors.tipo_curso && <p className="text-red-500 text-xs mt-1">{errors.tipo_curso}</p>}
                    {serverErrors.tipo_curso && <p className="text-red-500 text-xs mt-1">{serverErrors.tipo_curso}</p>}
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Categoría
                    </label>
                    <select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="">Seleccionar</option>
                        {CATEGORIA_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Tipo de Pago
                    </label>
                    <select
                        name="tipo_pago"
                        value={formData.tipo_pago}
                        onChange={handleChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="">Seleccionar</option>
                        {TIPO_PAGO_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        ¿Cómo se enteró?
                    </label>
                    <select
                        name="apariconia"
                        value={formData.apariconia}
                        onChange={handleChange}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value="">Seleccionar</option>
                        {APARICIONIA_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            {/* Botones responsivos */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t mt-4 sm:mt-6">
                <button
                    type="button"
                    onClick={() => onSave && onSave(null)}
                    className="px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition order-2 sm:order-1"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-sm sm:text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 order-1 sm:order-2"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Guardando...
                        </span>
                    ) : (initialData ? 'Actualizar' : 'Guardar')}
                </button>
            </div>
        </form>
    );
}

export default MatriculaForm;