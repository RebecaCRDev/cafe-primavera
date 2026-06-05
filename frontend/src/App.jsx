import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import { CarritoProvider } from "./context/CarritoContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Salon from "./pages/Salon";
import TPV from "./pages/TPV";
import Carta from "./pages/Carta";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";
import Eventos from "./pages/Eventos";
import Reservas from "./pages/Reservas";
import Appcc from "./pages/Appcc";
import Empleados from "./pages/Empleados";
import CierreCaja from "./pages/CierreCaja";

function App() {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario")) || null,
  );
  const [mostrarDashboard, setMostrarDashboard] = useState(false);

  const handleLogin = (datos) => {
    localStorage.setItem("usuario", JSON.stringify(datos));
    setUsuario(datos);
    setMostrarDashboard(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    setMostrarDashboard(false);
  };

  if (!usuario) return <Login onLogin={handleLogin} />;

  if (mostrarDashboard) {
    return (
      <Dashboard
        usuario={usuario}
        onEntrar={() => setMostrarDashboard(false)}
      />
    );
  }

  const rol = usuario.rol;
  const rutaInicio = rol === "FLORISTA" ? "/eventos" : "/salon";

  const soloAdmin = (elemento) =>
    rol === "ADMIN" ? elemento : <Navigate to={rutaInicio} />;
  const cajeroOAdmin = (elemento) =>
    rol === "CAJERO" || rol === "ADMIN" ? (
      elemento
    ) : (
      <Navigate to={rutaInicio} />
    );
  const floristaOAdmin = (elemento) =>
    rol === "FLORISTA" || rol === "ADMIN" ? (
      elemento
    ) : (
      <Navigate to={rutaInicio} />
    );

  return (
    <BrowserRouter>
      <CarritoProvider>
        <Navbar usuario={usuario} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Navigate to={rutaInicio} />} />
          <Route path="/salon" element={cajeroOAdmin(<Salon />)} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/eventos" element={floristaOAdmin(<Eventos />)} />
          <Route path="/appcc" element={<Appcc />} />
          <Route path="/cierre-caja" element={cajeroOAdmin(<CierreCaja />)} />
          <Route path="/empleados" element={soloAdmin(<Empleados />)} />
          <Route path="/carta" element={cajeroOAdmin(<Carta />)} />
          <Route path="/tpv" element={cajeroOAdmin(<TPV />)} />
          <Route path="/clientes" element={cajeroOAdmin(<Clientes />)} />
          <Route path="/reservas" element={floristaOAdmin(<Reservas />)} />
        </Routes>
      </CarritoProvider>
    </BrowserRouter>
  );
}

export default App;
