import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        background: "#2d5016",
        padding: "1rem 2rem",
        display: "flex",
        gap: "2rem",
        alignItems: "center",
      }}
    >
      <span
        style={{ color: "#f5e6d3", fontSize: "1.2rem", fontWeight: "bold" }}
      >
        🌸 Café Primavera
      </span>
      <Link to="/" style={{ color: "#f5e6d3", textDecoration: "none" }}>
        TPV
      </Link>
      <Link
        to="/productos"
        style={{ color: "#f5e6d3", textDecoration: "none" }}
      >
        Productos
      </Link>
      <Link to="/clientes" style={{ color: "#f5e6d3", textDecoration: "none" }}>
        Clientes
      </Link>
      <Link to="/eventos" style={{ color: "#f5e6d3", textDecoration: "none" }}>
        Talleres
      </Link>
      <Link to="/reservas" style={{ color: "#f5e6d3", textDecoration: "none" }}>
        Reservas
      </Link>
    </nav>
  );
}

export default Navbar;
