// src/pages/admin/UsuariosPage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

function UsuariosPage() {
    const { token, user: usuarioActual } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [form, setForm] = useState({
        username: "",
        password: "",
        confirm_password: "",
        email: "",
        first_name: "",
        last_name: "",
        rol: "consulta"
    });

    const roles = [
        { value: "admin", label: "Administrador", color: "bg-red-100 text-red-700" },
        { value: "secretaria", label: "Secretaria", color: "bg-blue-100 text-blue-700" },
        { value: "cajero", label: "Cajero", color: "bg-green-100 text-green-700" },
        { value: "instructor", label: "Instructor", color: "bg-purple-100 text-purple-700" },
        { value: "consulta", label: "Solo Consulta", color: "bg-gray-100 text-gray-700" }
    ];

    // Cargar usuarios
    const fetchUsuarios = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/usuarios/", {
                headers: { "Authorization": `Token ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsuarios(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Crear/Actualizar usuario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (form.password !== form.confirm_password) {
            Swal.fire("Error", "Las contraseñas no coinciden", "error");
            return;
        }

        const userData = {
            username: form.username,
            email: form.email,
            first_name: form.first_name,
            last_name: form.last_name,
            rol: form.rol
        };
        
        if (form.password) userData.password = form.password;

        const url = editData 
            ? `http://127.0.0.1:8000/api/usuarios/${editData.id}/`
            : "http://127.0.0.1:8000/api/usuarios/";
        
        const method = editData ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                Swal.fire("Éxito", editData ? "Usuario actualizado" : "Usuario creado", "success");
                fetchUsuarios();
                setShowModal(false);
                resetForm();
            } else {
                const data = await response.json();
                Swal.fire("Error", Object.values(data).flat().join("\n"), "error");
            }
        } catch (error) {
            Swal.fire("Error", "Error de conexión", "error");
        }
    };

    // Eliminar usuario
    const eliminarUsuario = async (id, username) => {
        if (id === usuarioActual?.id) {
            Swal.fire("Error", "No puedes eliminar tu propio usuario", "error");
            return;
        }
        
        const confirm = await Swal.fire({
            title: "¿Eliminar?",
            text: `Eliminar a ${username}?`,
            icon: "warning",
            showCancelButton: true
        });
        
        if (confirm.isConfirmed) {
            const response = await fetch(`http://127.0.0.1:8000/api/usuarios/${id}/`, {
                method: "DELETE",
                headers: { "Authorization": `Token ${token}` }
            });
            if (response.ok) {
                Swal.fire("Eliminado", "", "success");
                fetchUsuarios();
            }
        }
    };

    const resetForm = () => {
        setForm({
            username: "", password: "", confirm_password: "",
            email: "", first_name: "", last_name: "", rol: "consulta"
        });
        setEditData(null);
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className=" text-blue-800 px-4 py-2 rounded-lg flex items-center gap-2 outline-2 outline-offset-2 outline-dashed hover:cursor-pointer hover:bg-green-200 hover:text-green-700"
                >
                    + Nuevo Usuario
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left">Usuario</th>
                            <th className="p-3 text-left">Nombre</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Rol</th>
                            <th className="p-3 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(u => (
                            <tr key={u.id} className="border-t">
                                <td className="p-3">{u.username}</td>
                                <td className="p-3">{u.first_name} {u.last_name}</td>
                                <td className="p-3">{u.email || "-"}</td>
                                <td className="p-3">
                                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                                        {u.rol}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <button onClick={() => {
                                        setEditData(u);
                                        setForm({
                                            username: u.username, password: "", confirm_password: "",
                                            email: u.email || "", first_name: u.first_name || "",
                                            last_name: u.last_name || "", rol: u.rol
                                        });
                                        setShowModal(true);
                                    }} className="text-blue-500 mr-2">Editar</button>
                                    <button onClick={() => eliminarUsuario(u.id, u.username)} className="text-red-500">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{editData ? "Editar" : "Nuevo"} Usuario</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" placeholder="Usuario" value={form.username}
                                onChange={e => setForm({...form, username: e.target.value})}
                                className="w-full p-2 border rounded mb-2" required />
                            <input type="password" placeholder="Contraseña" value={form.password}
                                onChange={e => setForm({...form, password: e.target.value})}
                                className="w-full p-2 border rounded mb-2" />
                            <input type="password" placeholder="Confirmar" value={form.confirm_password}
                                onChange={e => setForm({...form, confirm_password: e.target.value})}
                                className="w-full p-2 border rounded mb-2" />
                            <input type="email" placeholder="Email" value={form.email}
                                onChange={e => setForm({...form, email: e.target.value})}
                                className="w-full p-2 border rounded mb-2" />
                            <input type="text" placeholder="Nombres" value={form.first_name}
                                onChange={e => setForm({...form, first_name: e.target.value})}
                                className="w-full p-2 border rounded mb-2" />
                            <input type="text" placeholder="Apellidos" value={form.last_name}
                                onChange={e => setForm({...form, last_name: e.target.value})}
                                className="w-full p-2 border rounded mb-2" />
                            <select value={form.rol} onChange={e => setForm({...form, rol: e.target.value})}
                                className="w-full p-2 border rounded mb-4">
                                {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UsuariosPage;