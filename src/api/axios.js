import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
});

let redireccionandoPorSesionInvalida = false;

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    const url = String(
      config.url || ""
    );

    const esSolicitudLogin = url.includes(
      "/login/"
    );

    if (token && !esSolicitudLogin) {
      config.headers.Authorization = `Token ${token}`;
    } else if (esSolicitudLogin) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = String(
      error.config?.url || ""
    );

    const esSolicitudLogin = url.includes(
      "/login/"
    );

    const existeSesion = Boolean(
      localStorage.getItem("token")
    );

    if (
      status === 401 &&
      existeSesion &&
      !esSolicitudLogin &&
      !redireccionandoPorSesionInvalida
    ) {
      redireccionandoPorSesionInvalida = true;

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      sessionStorage.setItem(
        "sesion_expirada",
        "1"
      );

      window.location.replace("/login");
    }

    if (import.meta.env.DEV) {
      if (error.response) {
        console.error(
          "Error del servidor:",
          error.response.data
        );

        console.error(
          "Status:",
          error.response.status
        );
      } else if (error.request) {
        console.error(
          "No hubo respuesta del servidor"
        );
      } else {
        console.error(
          "Error:",
          error.message
        );
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
