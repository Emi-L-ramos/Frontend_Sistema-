// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, rolesPermitidos = [] }) {
    const { user, token } = useAuth();

    // Si no hay token, redirigir al login
    // Si est aes una ruta protegida mia
    //eres un cabron bro

    //heee
    if (!token) {
        return <Navigate to="/login" />;
    }

    // Si se requieren roles especÃ­ficos y el usuario no tiene uno permitido
    if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(user?.rol)) {
        return <Navigate to="/dashboard" />;
    }

    return children;
}

export default ProtectedRoute;
