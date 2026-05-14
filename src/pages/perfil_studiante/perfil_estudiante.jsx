import { useEffect, useState } from "react";
import Swal from "sweetalert2";

function PerfilEstudiante() {
    const token = localStorage.getItem("token");

    const [instructores, setInstructores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editData, setEditData] = useState(null);

    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        numero_telefono: "",
        direccion: "",
        categoria_vehiculo: "",
        experiencia: "",
        edad: "",
        foto: null,
    });

    const cargarInstructores = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/instructores/", {
                headers: { Authorization: `Token ${token}` },
            });

            const data = await response.json();
            setInstructores(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const cargarCategorias = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/categorias/", {
                headers: { Authorization: `Token ${token}` },
            });

            const data = await response.json();
            setCategorias(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        cargarInstructores();
        cargarCategorias();
    }, []);

    const abrirEditar = (instructor) => {
        setEditData(instructor);

        setForm({
            nombre: instructor.nombre || "",
            apellido: instructor.apellido || "",
            numero_telefono: instructor.numero_telefono || "",
            direccion: instructor.direccion || "",
            categoria_vehiculo: instructor.categoria_vehiculo || "",
            experiencia: instructor.experiencia || "",
            edad: instructor.edad || "",
            foto: null,
        });

        setModal(true);
    };

    const cerrarModal = () => {
        setModal(false);
        setEditData(null);
        setForm({
            nombre: "",
            apellido: "",
            numero_telefono: "",
            direccion: "",
            categoria_vehiculo: "",
            experiencia: "",
            edad: "",
            foto: null,
        });
    };

    const guardarPerfil = async (e) => {
        e.preventDefault();

        if (!editData) return;

        const formData = new FormData();

        formData.append("nombre", form.nombre);
        formData.append("apellido", form.apellido);
        formData.append("numero_telefono", form.numero_telefono);
        formData.append("direccion", form.direccion);
        formData.append("categoria_vehiculo", form.categoria_vehiculo || "");
        formData.append("experiencia", form.experiencia);
        formData.append("edad", form.edad || "");

        if (form.foto) {
            formData.append("foto", form.foto);
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/instructores/${editData.id}/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Token ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                const mensaje = Object.values(data).flat().join("\n");
                Swal.fire("Error", mensaje || "No se pudo actualizar el perfil", "error");
                return;
            }

            Swal.fire("Éxito", "Perfil actualizado correctamente", "success");
            cerrarModal();
            cargarInstructores();
        } catch (error) {
            Swal.fire("Error", "Error de conexión", "error");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">
                    Perfiles de Instructores
                </h1>
                <p className="text-gray-500 mt-1">
                    Información profesional de los instructores registrados.
                </p>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
                    Cargando perfiles...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {instructores.map((inst) => (
                        <div
                            key={inst.id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                        >
                            <div className="h-32 bg-gradient-to-r from-green-500 to-emerald-600" />

                            <div className="p-6 -mt-16">
                                <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow">
                                    {inst.foto_url ? (
                                        <img
                                            src={inst.foto_url}
                                            alt={inst.nombre_completo}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                                            {(inst.nombre || "I").charAt(0)}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {inst.nombre_completo}
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Categoría: {inst.categoria_nombre || "No asignada"}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Teléfono: {inst.numero_telefono || "No registrado"}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        Edad: {inst.edad || "No registrada"}
                                    </p>

                                    <p className="text-sm text-gray-500 mt-2">
                                        Dirección: {inst.direccion || "No registrada"}
                                    </p>

                                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                                        {inst.experiencia || "Sin experiencia registrada."}
                                    </p>
                                </div>

                                <button
                                    onClick={() => abrirEditar(inst)}
                                    className="mt-5 w-full px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition"
                                >
                                    Editar perfil
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Editar perfil del instructor
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Complete la información profesional.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={cerrarModal}
                                className="text-gray-400 hover:text-red-500 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={guardarPerfil} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full p-3 border rounded-xl"
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Apellido"
                                    value={form.apellido}
                                    onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                                    className="w-full p-3 border rounded-xl"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Número telefónico"
                                    value={form.numero_telefono}
                                    onChange={(e) => setForm({ ...form, numero_telefono: e.target.value })}
                                    className="w-full p-3 border rounded-xl"
                                />

                                <input
                                    type="number"
                                    placeholder="Edad"
                                    value={form.edad}
                                    onChange={(e) => setForm({ ...form, edad: e.target.value })}
                                    className="w-full p-3 border rounded-xl"
                                />
                            </div>

                            <input
                                type="text"
                                placeholder="Dirección"
                                value={form.direccion}
                                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                                className="w-full p-3 border rounded-xl"
                            />

                            <select
                                value={form.categoria_vehiculo}
                                onChange={(e) => setForm({ ...form, categoria_vehiculo: e.target.value })}
                                className="w-full p-3 border rounded-xl"
                            >
                                <option value="">Seleccionar categoría vehicular</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nombre}
                                    </option>
                                ))}
                            </select>

                            <textarea
                                placeholder="Experiencia"
                                value={form.experiencia}
                                onChange={(e) => setForm({ ...form, experiencia: e.target.value })}
                                className="w-full p-3 border rounded-xl"
                                rows="4"
                            />

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setForm({ ...form, foto: e.target.files[0] })}
                                className="w-full p-3 border rounded-xl"
                            />

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="px-5 py-2.5 border rounded-xl text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                                >
                                    Guardar perfil
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PerfilEstudiante;