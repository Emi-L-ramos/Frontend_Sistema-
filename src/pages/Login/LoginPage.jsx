// src/pages/login/LoginPage.jsx

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from "../../api/axios";

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post("/login/", {
                username: username.trim(),
                password: password,
            });

            const data = response.data;

            login(data, data.token);

            Swal.fire({
                title: '¡Bienvenido!',
                text: `Has iniciado sesión como ${data.rol}`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
            });

            navigate('/dashboard');

        } catch (error) {
            Swal.fire(
                'Error',
                error.response?.data?.error || 'Error de conexión con el servidor',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5 bg-gray-100">
            <div className="p-8 rounded-lg shadow-md border-b-cyan-950 w-full max-w-md">
                <img
                    src="/Logo.png"
                    alt="Logo"
                    className="w-30 h-30 mx-auto mb-4"
                />


                <form onSubmit={handleSubmit}>
                    <label className="block text-gray-700 mb-2 font-bold">Ingrese su usuario</label>
                    <input
                        type="text"
                        placeholder="Por ejemplo: admin"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    <label className="block text-gray-700 mb-2 font-bold">Ingrese su contraseña</label>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 hover:cursor-pointer"
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
