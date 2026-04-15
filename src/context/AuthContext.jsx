// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        console.log("🔍 Cargando sesión guardada:", { savedToken, savedUser });
        
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        console.log("🔍 LOGIN - Datos recibidos:", userData);
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(token);
        setUser(userData);
        
        console.log("🔍 LOGIN - Guardado en localStorage");
        console.log("Token guardado:", localStorage.getItem('token'));
        console.log("User guardado:", localStorage.getItem('user'));
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        console.log("🔍 LOGOUT - Sesión cerrada");
    };

    const tienePermiso = (permiso) => {
        const permisos = {
            'admin': ['*'],
            'secretaria': ['ver_matriculas', 'crear_matriculas', 'editar_matriculas', 'ver_recibos', 'crear_recibos', 'exportar'],
            'cajero': ['ver_matriculas', 'ver_recibos', 'crear_recibos', 'editar_recibos', 'exportar'],
            'consulta': ['ver_matriculas', 'ver_recibos'],
            'instructor': ['']
        };
        
        const userRol = user?.rol || 'admin';
        return permisos[userRol]?.includes('*') || permisos[userRol]?.includes(permiso);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, tienePermiso }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;