import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario?.id) {
    config.headers["X-Empleado-Id"] = usuario.id;
  }
  return config;
});

export default api;
