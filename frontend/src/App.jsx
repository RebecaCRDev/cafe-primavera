import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import TPV from "./pages/TPV";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";
import Eventos from "./pages/Eventos";
import Reservas from "./pages/Reservas";
import Empleados from "./pages/Empleados";

function App() {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario")) || null,
  );

  const handleLogin = (datos) => {
    localStorage.setItem("usuario", JSON.stringify(datos));
    setUsuario(datos);
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Navbar usuario={usuario} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<TPV />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route
          path="/empleados"
          element={
            usuario.rol === "ADMIN" ? <Empleados /> : <Navigate to="/" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
