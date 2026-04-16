import { Link, useLocation } from "react-router-dom";

function Navbar({ usuario, onLogout }) {
  const location = useLocation();

  const linkStyle = (path) => ({
    color: location.pathname === path ? "#6b7c4a" : "#7a6a5a",
    textDecoration: "none",
    fontSize: "0.85rem",
    letterSpacing: "0.12em",
    paddingBottom: "0.25rem",
    borderBottom:
      location.pathname === path
        ? "2px solid #6b7c4a"
        : "2px solid transparent",
    transition: "all 0.2s",
    textTransform: "uppercase",
  });

  return (
    <nav
      style={{
        background: "#fff",
        borderBottom: "1px solid #e8ddd0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 3rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              color: "#6b7c4a",
              fontSize: "1.2rem",
              letterSpacing: "0.1em",
              fontFamily: "Georgia, serif",
            }}
          >
            🌸 Café Primavera
          </span>
        </Link>

        <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
          <Link to="/" style={linkStyle("/")}>
            TPV
          </Link>
          <Link to="/productos" style={linkStyle("/productos")}>
            Productos
          </Link>
          <Link to="/clientes" style={linkStyle("/clientes")}>
            Clientes
          </Link>
          <Link to="/eventos" style={linkStyle("/eventos")}>
            Talleres
          </Link>
          <Link to="/reservas" style={linkStyle("/reservas")}>
            Reservas
          </Link>
          {usuario?.rol === "ADMIN" && (
            <Link to="/empleados" style={linkStyle("/empleados")}>
              Empleados
            </Link>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#7a6a5a", fontSize: "0.85rem" }}>
            {usuario?.nombre}
            <span
              style={{
                marginLeft: "0.5rem",
                background: "#e8f0e0",
                color: "#4a6030",
                padding: "0.1rem 0.5rem",
                borderRadius: "10px",
                fontSize: "0.75rem",
              }}
            >
              {usuario?.rol}
            </span>
          </span>
          <button
            onClick={onLogout}
            style={{
              background: "none",
              border: "1px solid #c8b89a",
              borderRadius: "6px",
              padding: "0.3rem 0.8rem",
              color: "#7a6a5a",
              fontSize: "0.8rem",
              cursor: "pointer",
              fontFamily: "Georgia, serif",
            }}
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
