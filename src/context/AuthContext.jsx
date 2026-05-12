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

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }

        setLoading(false);
    }, []);

    const login = (userData, token) => {
        const usuario = userData.user ? userData.user : userData;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(usuario));

        setToken(token);
        setUser(usuario);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setToken(null);
        setUser(null);
    };

    const tienePermiso = (permiso) => {
        const permisos = {
            admin: ['*'],
            Admin: ['*'],
            secretaria: [
                'ver_matriculas',
                'crear_matriculas',
                'editar_matriculas',
                'ver_recibos',
                'crear_recibos',
                'exportar',
            ],
            cajero: [
                'ver_matriculas',
                'ver_recibos',
                'crear_recibos',
                'editar_recibos',
                'exportar',
            ],
            consulta: ['ver_matriculas', 'ver_recibos'],
            instructor: ['ver_calendario', 'marcar_asistencia'],
            estudiante: ['ver_calendario'],
        };

        const userRol = user?.rol || '';

        return (
            permisos[userRol]?.includes('*') ||
            permisos[userRol]?.includes(permiso)
        );
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                tienePermiso,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
