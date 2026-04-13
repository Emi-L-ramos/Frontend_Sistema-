// src/pages/matricula/MatriculaForm.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const PRECIO_BASE = 6500;

function MatriculaForm({ onSave, initialData }) {
    const navigate = useNavigate();

    const initialState = {
        nombre: "", apellido: "", cedula: "", sexo: "", direccion: "",
        correo_electronico: "", nivel_educativo: "", oficio: "",
        numero_telefono: "", fecha_nacimiento: "", grado: "",
        nombre_padre: "", n_emergencia: "", apariconia: "",
        categoria: "", tipo_pago: "", tipo_curso: "",
        descripcion: "", monto_total: PRECIO_BASE
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
                onSave(data);
                if (!isEditing) setForm(initialState);

                Swal.fire({
                    title: isEditing ? '¡Matrícula actualizada!' : '¡Matrícula guardada!',
                    text: 'Exitosamente 🚀',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    navigate("/dashboard/matricula");
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
                        <input name="nombre" placeholder="Nombre" value={form.nombre || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                        <input name="apellido" placeholder="Apellido" value={form.apellido || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                    <input name="cedula" placeholder="Cédula" value={form.cedula || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="correo_electronico" placeholder="Correo" value={form.correo_electronico || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="direccion" placeholder="Dirección" value={form.direccion || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="nivel_educativo" placeholder="Nivel Educativo" value={form.nivel_educativo || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="oficio" placeholder="Oficio" value={form.oficio || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="numero_telefono" placeholder="Teléfono" value={form.numero_telefono || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <select name="sexo" value={form.sexo || ""} onChange={handleChange} className="w-full p-2 border rounded" required>
                        <option value="">Género</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </select>
                </div>
            </div>

            <div className="space-y-3">
                <label className="block text-gray-700 text-2xl font-semibold">Detalles Académicos</label>
                <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input name="grado" placeholder="Grado" value={form.grado || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input name="nombre_padre" placeholder="Padre/Tutor" value={form.nombre_padre || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                <input name="n_emergencia" placeholder="Emergencia" value={form.n_emergencia || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
                <select name="apariconia" value={form.apariconia || ""} onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="">Donde se enteró</option>
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Referido">Referido</option>
                    <option value="Boletas">Boleta</option>
                    <option value="Amigo">Amigo</option>
                    <option value="otro">Otro</option>
                </select>
                <select name="categoria" value={form.categoria || ""} onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="">Categoría</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="A3">A3</option>
                </select>
                <select name="tipo_pago" value={form.tipo_pago || ""} onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="">Tipo de Pago</option>
                    <option value="pago_completo">Completo</option>
                    <option value="Anticipo">Anticipo</option>
                    <option value="Beneficio">Beneficio</option>
                </select>
                <select name="tipo_curso" value={form.tipo_curso || ""} onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="">Tipo de Curso</option>
                    <option value="curso_completo">Curso Completo</option>
                    <option value="Reforzamiento">Reforzamiento</option>
                </select>
                <input name="descripcion" placeholder="Descripción" value={form.descripcion || ""} onChange={handleChange} className="w-full p-2 border rounded" required />
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