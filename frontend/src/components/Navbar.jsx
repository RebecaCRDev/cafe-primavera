import { Link, useLocation } from "react-router-dom";

function Navbar({ usuario, onLogout }) {
  const location = useLocation();
  const rol = usuario?.rol;

  const linkClass = (path) =>
    location.pathname === path
      ? "navbar-link navbar-link-activo"
      : "navbar-link navbar-link-inactivo";

  const rolClass = () => {
    if (rol === "ADMIN") return "navbar-rol-admin";
    if (rol === "FLORISTA") return "navbar-rol-florista";
    return "navbar-rol-cajero";
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link
          to={rol === "FLORISTA" ? "/eventos" : "/salon"}
          className="navbar-logo"
        >
          <span className="navbar-logo-texto">🌸 Café Primavera</span>
        </Link>

        <div className="navbar-links">
          {(rol === "CAJERO" || rol === "ADMIN") && (
            <Link to="/salon" className={linkClass("/salon")}>
              Salón
            </Link>
          )}
          <Link to="/productos" className={linkClass("/productos")}>
            Inventario
          </Link>
          {(rol === "FLORISTA" || rol === "ADMIN") && (
            <Link to="/eventos" className={linkClass("/eventos")}>
              Talleres
            </Link>
          )}
          <Link to="/appcc" className={linkClass("/appcc")}>
            APPCC
          </Link>
          <Link to="/cierre-caja" className={linkClass("/cierre-caja")}>
            Caja
          </Link>
          {rol === "ADMIN" && (
            <Link to="/empleados" className={linkClass("/empleados")}>
              Empleados
            </Link>
          )}
        </div>

        <div className="navbar-usuario">
          <span className="navbar-nombre">
            {usuario?.nombre}
            <span className={rolClass()}>{rol}</span>
          </span>
          <button className="navbar-btn-salir" onClick={onLogout}>
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
