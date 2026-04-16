import { useEffect, useState } from "react";
import api from "../services/api";

function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("CAJERO");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    api.get("/empleados").then((res) => setEmpleados(res.data));
  }, []);

  const crearEmpleado = () => {
    if (!nombre || !email) return setMensaje("Nombre y email son obligatorios");
    api
      .post("/empleados", {
        nombre,
        email,
        rol,
        passwordHash: "$2a$10$hashEjemplo",
        activo: true,
      })
      .then((res) => {
        setEmpleados([...empleados, res.data]);
        setNombre("");
        setEmail("");
        setRol("CAJERO");
        setMensaje("Empleado creado correctamente");
      })
      .catch(() => setMensaje("Error al crear el empleado"));
  };

  const toggleActivo = (empleado) => {
    api
      .put(`/empleados/${empleado.id}`, {
        ...empleado,
        activo: !empleado.activo,
      })
      .then((res) =>
        setEmpleados(
          empleados.map((e) => (e.id === empleado.id ? res.data : e)),
        ),
      )
      .catch(() => setMensaje("Error al actualizar el empleado"));
  };

  const rolColor = (rol) => {
    if (rol === "ADMIN") return "badge-red";
    if (rol === "FLORISTA") return "badge-green";
    return "badge-gray";
  };

  return (
    <div className="page">
      <h1>Empleados</h1>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Nuevo empleado</h2>
        <div className="form-row">
          <input
            placeholder="Nombre *"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ flex: 2 }}
          />
          <input
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: 2 }}
          />
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="CAJERO">Cajero</option>
            <option value="FLORISTA">Florista</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="btn-primary" onClick={crearEmpleado}>
            Añadir
          </button>
        </div>
        {mensaje && (
          <p
            style={{
              color: "#6b7c4a",
              marginTop: "0.75rem",
              fontSize: "0.9rem",
            }}
          >
            {mensaje}
          </p>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((e) => (
            <tr key={e.id}>
              <td>{e.nombre}</td>
              <td style={{ color: "#7a6a5a" }}>{e.email}</td>
              <td>
                <span className={`badge ${rolColor(e.rol)}`}>{e.rol}</span>
              </td>
              <td>
                <span
                  className={
                    e.activo ? "badge badge-green" : "badge badge-gray"
                  }
                >
                  {e.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td>
                <button
                  className={e.activo ? "btn-danger" : "btn-primary"}
                  onClick={() => toggleActivo(e)}
                  style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }}
                >
                  {e.activo ? "Desactivar" : "Activar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Empleados;
