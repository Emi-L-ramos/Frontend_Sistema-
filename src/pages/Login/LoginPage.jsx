// src/pages/login/LoginPage.jsx

import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/axios";
import { User, Lock, Eye, EyeOff, LogIn } from "lucide-react";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const sesionExpirada = sessionStorage.getItem(
      "sesion_expirada"
    );

    if (sesionExpirada !== "1") {
      return;
    }

    sessionStorage.removeItem(
      "sesion_expirada"
    );

    Swal.fire({
      title: "Sesión finalizada",
      text: (
        "Tu sesión dejó de ser válida. "
        + "Inicia sesión nuevamente."
      ),
      icon: "warning",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#2563eb",
    });
  }, []);

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
        title: "¡Bienvenido!",
        text: `Has iniciado sesión como ${data.rol}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/dashboard");
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.error || "Error de conexión con el servidor",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-100 via-white to-blue-100">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-28 h-28 mx-auto mb-4 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm">
              <img
                src="/Logo.png"
                alt="EMCA | Escuela de Manejo CACIQUE ADIACT"
                className="w-24 h-24 object-contain"
              />
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              EMCA
            </h1>

            <p className="text-sm font-semibold text-slate-600 mt-1">
              Escuela de Manejo CACIQUE ADIACT
            </p>

            <h2 className="text-xl font-bold text-slate-800 mt-5">
              Iniciar Sesión
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Accede al sistema académico y administrativo con tu usuario y contraseña.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Usuario
              </label>

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input
                  type="text"
                  placeholder="Por ejemplo: admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-13 pl-12 pr-4 py-3 border border-slate-300 rounded-2xl text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input
                  type={mostrarPassword ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-13 pl-12 pr-12 py-3 border border-slate-300 rounded-2xl text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {mostrarPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className=" cursor-pointer relative group w-full h-13 rounded-2xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
            >
              <span className="absolute top-0 left-[-75%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 group-hover:left-[125%] transition-all duration-700"></span>

              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                    Ingresando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Ingresar
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          EMCA | Sistema de la Escuela de Manejo CACIQUE ADIACT
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
