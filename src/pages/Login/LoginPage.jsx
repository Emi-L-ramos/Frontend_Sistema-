// src/pages/login/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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
            const response = await fetch('http://127.0.0.1:8000/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                login(data, data.token);
                Swal.fire({
                    title: 'Â¡Bienvenido!',
                    text: `Has iniciado sesiÃ³n como ${data.rol}`,
                    icon: 'success',
                    timer: 2000
                });
                navigate('/dashboard');
            } else {
                Swal.fire('Error', data.error || 'Credenciales invÃ¡lidas', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Error de conexiÃ³n con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className=" p-15 rounded-lg shadow-md w-full max-w-md">
                <img src="Logo.png" alt="Logo" className="w-40 h-40 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Sistema CACIQUE ADIACT
                </h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <input
                        type="password"
                        placeholder="ContraseÃ±a"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;