import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import TPV from "./pages/TPV";
import Productos from "./pages/Productos";
import Clientes from "./pages/Clientes";
import Eventos from "./pages/Eventos";
import Reservas from "./pages/Reservas";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<TPV />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/reservas" element={<Reservas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
