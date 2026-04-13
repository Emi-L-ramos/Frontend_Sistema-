import { useState, useEffect } from "react";
import { FiUserPlus, FiSearch, FiX } from "react-icons/fi";
import MatriculaForm from "../../components/matriculaForm";
import { RiDeleteBinLine } from "react-icons/ri";
import { CiEdit } from "react-icons/ci";

function MatriculaPage() {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editData, setEditData] = useState(null);

    const closeModal = () => {
    setEditData(null);
    setShowModal(false);
    };
    

    // 🔥 Traer datos desde Django
    const fetchMatriculas = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:8000/api/matricula/matricula/", {
                headers: {
                    "Authorization": `Token ${token}`
                }
            });

            const result = await response.json();
            setData(Array.isArray(result) ? result : []);

        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const eliminarMatricula = async (id) => {
        const confirmacion = confirm("¿Seguro que quieres eliminar?");
        if (!confirmacion) return;

        try {
            const token = localStorage.getItem("token");

            await fetch(`http://localhost:8000/api/matricula/matricula/${id}/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Token ${token}`
                }
            });

            // actualizar UI
            setData(prev => prev.filter(item => item.id !== id));

        } catch (error) {
            console.error("Error eliminando:", error);
        }
    };

    useEffect(() => {
        fetchMatriculas();
    }, []);

    // 🔍 FILTRO
    const filteredData = data.filter(item =>
        (item.nombre?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (item.cedula || "").includes(search)
    );

    const displayData = search ? filteredData : data;

    return (
        <div className="min-h-screens ">

            {/* HEADER */}
            <div className="max-w-7xl mx-auto mb-4 space-y-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold ">
                  Matrículas
                    </h1>
                    <p className="">
                        Registro y gestión de nuevas matrículas
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:justify-between  rounded-xl space-y-8 md:space-y-0">

                    {/* BUSCADOR */}
                    <div className="relative w-full md:w-1/3">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-3xl focus:outline-none  bg-white border-blue-500 hover:outline-2 hover:outline-offset-2 hover:outline-dashed ---  hover:border-blue-900 transition"
                        />
                    </div>

                    {/* BOTÓN */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 text-blue-600 px-5 py-2 cursor-pointer rounded-lg outline-2 outline-offset-2 outline-dashed --- hover:outline-emerald-500 hover:bg-green-400 hover:text-white transition  "
                    >
                        <FiUserPlus />
                        Nueva Matrícula
                    </button>

                </div>
            </div>

            {/* TABLA */}
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        {/* ✅ SOLO UN THEAD */}
                        <thead className="bg-gray-50">
                            <tr className="border-gray-300">
                                <th className="p-3 border-gray-300">Nombre</th>
                                <th className="p-3 border-gray-300">Cédula</th>
                                <th className="p-3 border-gray-300">Sexo</th>
                            
                                <th className="p-3 border-gray-300">Teléfono</th>
                                <th className="p-3 border-gray-300">Categoría</th>
                                <th className="p-3 border-gray-300">Pago</th>
                                <th className="p-3 border-gray-300">Curso</th>
                                <th className="p-3 border-gray-300">Descripción</th>
                                <th className="p-3 border-gray-300">Monto</th>
                                <th className="p-3 border-gray-300">Opciones</th>

                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="18" className="p-6 text-center">
                                        Cargando...
                                    </td>
                                </tr>
                            ) : displayData.length > 0 ? (
                                displayData.map(item => (
                                    <tr key={item.id} className=" hover:bg-blue-200 transition">
                                        <td className="p-2 font-medium border-gray-950">{item.nombre} {item.apellido}</td>
                                        <td className="p-2 border-gray-300">{item.cedula}</td>
                                        <td className="p-2 border-gray-300">{item.sexo}</td>
                                        <td className="p-2 border-gray-300">{item.numero_telefono}</td>
                                        <td className="p-2 border-gray-300">{item.categoria}</td>
                                        <td className="p-2 border-gray-300">{item.tipo_pago}</td>
                                        <td className="p-2 border-gray-300">{item.tipo_curso}</td>
                                        <td className="p-2 border-gray-300">{item.descripcion}</td>
                                        <td className="p-2 font-bold text-blue-600 border-gray-300">${item.monto_total}</td>
                                        <td className="p-2 border-gray-300 flex gap-4 text-xl">
                                            <div className="flex items-center gap-3 p-2 py-4">

                                            {/* ELIMINAR */}
                                            <button
                                                onClick={() => eliminarMatricula(item.id)}
                                                className="p-2 rounded-lg hover:bg-red-100 transition"
                                                title="Eliminar"
                                            >
                                                <RiDeleteBinLine className="text-red-500 text-xl hover:text-red-700" />
                                            </button>

                                            {/* EDITAR */}
                                            <button
                                                onClick={() => {
                                                    setEditData(item);
                                                    setShowModal(true);
                                                    console.log("Datos que paso al modal:", item); // <--- ESTO ES VITAL
                                                }}
                                                className="p-2 rounded-lg hover:bg-blue-100 transition"
                                                title="Editar"
                                            >
                                                <CiEdit className="text-blue-500 text-xl hover:text-blue-700" />
                                            </button>

                                        </div>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="18" className="p-6 text-center text-gray-400">
                                        No hay registros
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 ">

                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl aspect-video">
 
                        <div className="flex justify-between p-4">
                            <h2 className="font-bold text-4xl">Nueva Matrícula</h2>

                           {/* BOTÓN CERRAR  //Icon de cerraR el formulario */}
                            <button onClick={() => setShowModal(false)} className="w-12 text-red-700 text-2xl hover:bg-red-100 rounded-full flex items-center justify-center transition w-12 h-12 hover:cursor-pointer">
                                <FiX />
                            </button>
                        </div>

                        <div className="p-4 ">
                            <MatriculaForm
                                onSave={() => {
                                    fetchMatriculas();
                                    setShowModal(false);
                                }}
                            />
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default MatriculaPage;