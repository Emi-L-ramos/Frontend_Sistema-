// src/components/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, rolesPermitidos = [] }) {
    const { user, token, loading } = useAuth();

    if (loading) {
        return null;
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    const rolUsuario = user?.rol?.toLowerCase() || "";

    const rolesNormalizados = rolesPermitidos.map((rol) =>
        rol.toLowerCase()
    );

    if (
        rolesNormalizados.length > 0 &&
        !rolesNormalizados.includes(rolUsuario)
    ) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;
