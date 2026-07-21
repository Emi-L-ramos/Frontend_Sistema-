// src/context/AuthContext.jsx

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import api from "../api/axios";

const AuthContext = createContext();

const normalizarUsuario = (userData) => {
    const usuarioBase = userData?.user
        ? userData.user
        : userData || {};

    const usuario = {
        ...usuarioBase,
        rol: String(
            usuarioBase?.rol || ""
        )
            .trim()
            .toLowerCase(),
    };

    // El token se guarda por separado. No debe quedar duplicado dentro del objeto del usuario.
    Reflect.deleteProperty(usuario, "token");

    return usuario;
};

const limpiarSesionLocal = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth debe usarse dentro de un AuthProvider"
        );
    }

    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!savedToken || !savedUser) {
            limpiarSesionLocal();
            setToken(null);
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const usuarioGuardado = JSON.parse(savedUser);
            const usuario = normalizarUsuario(
                usuarioGuardado
            );

            setToken(savedToken);
            setUser(usuario);
        } catch (error) {
            console.error(
                "No se pudo recuperar la sesión guardada:",
                error
            );

            limpiarSesionLocal();
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (userData, accessToken) => {
        if (!accessToken) {
            throw new Error(
                "El servidor no devolvió un token de acceso."
            );
        }

        const usuario = normalizarUsuario(userData);

        localStorage.setItem("token", accessToken);
        localStorage.setItem(
            "user",
            JSON.stringify(usuario)
        );

        setToken(accessToken);
        setUser(usuario);
    };

    const logout = async () => {
        const tokenActual =
            localStorage.getItem("token") || token;

        /*
         * Se limpia primero la sesión local para que la interfaz responda inmediatamente, aunque el servidor tarde o no esté disponible.
         */
        limpiarSesionLocal();
        setToken(null);
        setUser(null);

        if (!tokenActual) {
            return;
        }

        try {
            await api.post(
                "/logout/",
                null,
                {
                    headers: {
                        Authorization: `Token ${tokenActual}`,
                    },
                }
            );
        } catch (error) {
            /*
             * Si el token ya era inválido, la sesión local ya quedó cerrada y no es necesario mostrar otro error.
             */
            if (error.response?.status !== 401) {
                console.error(
                    "No se pudo invalidar la sesión en el servidor:",
                    error
                );
            }
        }
    };

    const esRol = (...roles) => {
        const rolUsuario = String(
            user?.rol || ""
        )
            .trim()
            .toLowerCase();

        return roles
            .map((rol) =>
                String(rol)
                    .trim()
                    .toLowerCase()
            )
            .includes(rolUsuario);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                esRol,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;