// src/components/MatriculaForm.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const PRECIO_BASE = 1000;

function MatriculaForm({ onSave, initialData }) {
    const navigate = useNavigate();

    const initialState = {
        f_matricula: "", nombre: "", apellido: "", edad: "", sexo: "", nacionalidad: "", fecha_nacimiento: "",
        cedula: "", direccion: "", correo_electronico: "",
        telefono_movil: "", nivel_educativo: "", profesion_u_oficio: "",
        en_caso_de_emrgencia: "", telefono_emergencia: "", modalidad: "", horario: "",
        tipo_pago: "", tipo_curso: "", categoria: "", apariconia: "",
        monto_total: PRECIO_BASE
    };

    const [form, setForm] = useState(initialData || initialState);

    useEffect(() => {
        if (initialData && initialData.id) {
            setForm({
                ...initialState,
                ...initialData,
                monto_total: initialData.monto_total !== undefined && initialData.monto_total !== null 
                    ? initialData.monto_total 
                    : PRECIO_BASE
            });
        } else if (!initialData) {
            setForm(initialState);
        }
    }, [initialData]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === "monto_total" ? (value === "" ? "" : parseFloat(value)) : value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const token = localStorage.getItem("token");
        const isEditing = !!initialData?.id;
        
        const url = isEditing 
            ? `http://127.0.0.1:8000/api/matricula/${initialData.id}/` 
            : "http://127.0.0.1:8000/api/matricula/";
        
        const method = isEditing ? "PUT" : "POST";

        const datosEnvio = {
            ...form,
            monto_pagado: initialData?.monto_pagado || 0,
            estado_pagado: initialData?.estado_pagado || 'pendiente'
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

            const data = await response.json();

            if (response.ok) {
                if (onSave) onSave(data);
                if (!isEditing) setForm(initialState);

                Swal.fire({
                    title: isEditing ? '¡Matrícula actualizada!' : '¡Matrícula guardada!',
                    text: 'Exitosamente 🚀',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    navigate("/dashboard");
                });

            } else {
                Swal.fire({
                    title: 'Error',
                    text: typeof data === 'object' ? JSON.stringify(data) : data,
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor',
                icon: 'error'
            });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 bg-amber-500 p-4 rounded-lg">
                <div className="p-4 rounded-lg bg-emerald-100 space-y-2">
                    <label className="block text-gray-700 text-2xl font-bold">Datos Personales</label>
                    <div className="flex gap-2">
                        <label htmlFor="Fecha de Inscripcion">Fecha de Nacimiento:</label>
                        <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                        <label htmlFor="Nombre">Nombre:</label>
                        <input name="nombre" placeholder="Nombre" value={form.nombre || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                    <label htmlFor="Apellido">Apellido:</label>
                    <input name="apellido" placeholder="Apellido" value={form.apellido || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <label htmlFor="Edad">Edad:</label>
                    <input name="edad" type="number" placeholder="Edad" value={form.edad || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <label htmlFor="Correo Electrónico">Correo Electrónico:</label>
                    <input name="correo_electronico" placeholder="Correo Electrónico" value={form.correo_electronico || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <label htmlFor="Dirección">Dirección:</label>
                    <input name="direccion" placeholder="Dirección" value={form.direccion || ""} onChange={handleChange} className="w-full p-2 border rounded" required />

                    <label htmlFor="Nivel Educativo">Nivel educativo:</label>
                     <select name="nivel_educativo" value={form.nivel_educativo || ""} onChange={handleChange} className="w-full p-2 border rounded" required>
                        <option value="">Nivel educativo</option>
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                        <option value="Universidad">Universidad</option>
                        <option value="Profecional">Profecional</option>
                    </select>

                    <label htmlFor="Profesión u Oficio">Profesión u Oficio:</label>
                    <input name="profesion_u_oficio" placeholder="Profesión u Oficio" value={form.profesion_u_oficio || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <label htmlFor="Teléfono Móvil">Teléfono Móvil:</label>
                    <input name="telefono_movil" placeholder="Teléfono Móvil" value={form.telefono_movil || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <label htmlFor="Género">Género:</label>
                    <select name="sexo" value={form.sexo || ""} onChange={handleChange} className="w-full p-2 border rounded" required>
                        <option value="">Género</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </select>
                    
                    <label htmlFor="Nacionalidad">Nacionalidad:</label>
                    <input name="nacionalidad" placeholder="Nacionalidad" value={form.nacionalidad || ""} onChange={handleChange} className="w-full p-2 border rounded" />
                    <label htmlFor="Cédula">Cédula:</label>
                    <input name="cedula" placeholder="Cédula" value={form.cedula || ""} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
            </div>

            <div className="space-y-3">
                <label className="block text-gray-700 text-4xl font-semibold">Detalles Académicos</label>
                <label htmlFor="Fecha de Nacimiento">Fecha de Inscripción:</label>
                <input type="date" name="f_matricula" value={form.f_matricula || ""} onChange={handleChange} className="w-full p-2 border rounded" />
                
                
                <label htmlFor="Modalidad">Modalidad:</label>
                <select name="modalidad" value={form.modalidad || ""} onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="">Modalidad</option>
                    <option value="Regular">Regular</option>
                    <option value="Extraordinario">Extraordinario</option>
                </select>
                
                <label htmlFor="Horario">Horario:</label>
                <select name="horario" value={form.horario || ""} onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="">Horario</option>
                    <option value="06AM A 08AM">06AM A 08AM</option>
                    <option value="08AM A 10AM">08AM A 10AM</option>
                    <option value="10AM A 12PM">10AM A 12PM</option>
                    <option value="12PM A 02PM">12PM A 02PM</option>
                    <option value="04PM A 06PM">04PM A 06PM</option>
                </select>
        
                <label htmlFor="Contacto de Emergencia">Contacto de Emergencia:</label>
                <input name="en_caso_de_emrgencia" placeholder="Contacto Emergencia" value={form.en_caso_de_emrgencia || ""} onChange={handleChange} className="w-full p-2 border rounded" />
                <label htmlFor="Teléfono de Emergencia">Teléfono de Emergencia:</label>
                <input name="telefono_emergencia" placeholder="Teléfono Emergencia" value={form.telefono_emergencia || ""} onChange={handleChange} className="w-full p-2 border rounded" />
                
                
                <label htmlFor="Aparición">¿Dónde se enteró?</label>
                <select name="apariconia" value={form.apariconia || ""} onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="">¿Dónde se enteró?</option>
                    <option value="Sitio_web _oficial">Sitio web oficial</option>
                    <option value="Redes_sociales">Redes sociales</option>
                    <option value="Referido">Referido</option>
                    <option value="Volante/Promoción impresa">Volante/Promoción impresa</option>
                    <option value="otro">Otro</option>
                </select>
                
                <label htmlFor="Categoria">Categoría:</label>
                <select name="categoria" value={form.categoria || ""} onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="">Categoría</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </select>
                
                <label htmlFor="Tipo de Pago">Tipo de Pago:</label>
                <select name="tipo_pago" value={form.tipo_pago || ""} onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="">Tipo de Pago</option>
                    <option value="Completo">Completo</option>
                    <option value="Anticipo">Anticipo</option>
                    <option value="Beneficio">Beneficio</option>
                </select>
                
                <label htmlFor="Tipo de Curso">Tipo de Curso:</label>
                <select name="tipo_curso" value={form.tipo_curso || ""} onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="">Tipo de Curso</option>
                    <option value="Curso_avanzado">Curso avanzado</option>
                    <option value="Reforzamiento">Reforzamiento</option>
                </select>
                
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Monto Total (C$)</label>
                    <input type="number" name="monto_total" placeholder="Monto Total" value={form.monto_total || ""} onChange={handleChange} className="w-full p-2 border rounded font-bold text-blue-600" step="0.01" min="0" required />
                    <p className="text-xs text-gray-500 mt-1">Precio base sugerido: C$ {PRECIO_BASE.toFixed(2)}</p>
                </div>
            </div>

            <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="px-6 py-3 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600 transition">
                    Guardar Matrícula
                </button>
            </div>
        </form>
    );
}

export default MatriculaForm;