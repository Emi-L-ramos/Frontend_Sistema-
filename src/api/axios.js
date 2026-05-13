import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Token ${token}`;
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
    if (error.response) {
      console.error("Error del servidor:", error.response.data);
      console.error("Status:", error.response.status);
    } else if (error.request) {
      console.error("No hubo respuesta del servidor");
    } else {
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
