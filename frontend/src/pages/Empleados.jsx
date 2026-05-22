import { useEffect, useState } from "react";
import api from "../services/api";

function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("CAJERO");
  const [mensaje, setMensaje] = useState("");
  const [modalEditar, setModalEditar] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRol, setEditRol] = useState("");
  const [editPassword, setEditPassword] = useState("");

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

  const abrirEditar = (empleado) => {
    setModalEditar(empleado);
    setEditNombre(empleado.nombre);
    setEditEmail(empleado.email);
    setEditRol(empleado.rol);
    setEditPassword("");
    setMensaje("");
  };

  const guardarEdicion = () => {
    if (!editNombre || !editEmail)
      return setMensaje("Nombre y email son obligatorios");
    const datos = {
      ...modalEditar,
      nombre: editNombre,
      email: editEmail,
      rol: editRol,
    };
    if (editPassword) {
      datos.passwordHash = editPassword;
      datos.cambiarPassword = true;
    }
    api
      .put(`/empleados/${modalEditar.id}`, datos)
      .then((res) => {
        setEmpleados(
          empleados.map((e) => (e.id === modalEditar.id ? res.data : e)),
        );
        setModalEditar(null);
        setMensaje("Empleado actualizado correctamente");
      })
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
            <th>Acciones</th>
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
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => abrirEditar(e)}
                    style={{
                      background: "#e8f0e0",
                      color: "#4a6030",
                      border: "1px solid #6b7c4a",
                      borderRadius: "6px",
                      padding: "0.3rem 0.8rem",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className={e.activo ? "btn-danger" : "btn-primary"}
                    onClick={() => toggleActivo(e)}
                    style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }}
                  >
                    {e.activo ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal editar empleado */}
      {modalEditar && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setModalEditar(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "2rem",
              width: "420px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>Editar empleado</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    color: "#9e8e7e",
                    display: "block",
                    marginBottom: "0.3rem",
                  }}
                >
                  Nombre *
                </label>
                <input
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  style={{ width: "100%", fontSize: "0.95rem" }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    color: "#9e8e7e",
                    display: "block",
                    marginBottom: "0.3rem",
                  }}
                >
                  Email *
                </label>
                <input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={{ width: "100%", fontSize: "0.95rem" }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    color: "#9e8e7e",
                    display: "block",
                    marginBottom: "0.3rem",
                  }}
                >
                  Rol
                </label>
                <select
                  value={editRol}
                  onChange={(e) => setEditRol(e.target.value)}
                  style={{ width: "100%", fontSize: "0.95rem" }}
                >
                  <option value="CAJERO">Cajero</option>
                  <option value="FLORISTA">Florista</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.82rem",
                    color: "#9e8e7e",
                    display: "block",
                    marginBottom: "0.3rem",
                  }}
                >
                  Nueva contraseña (dejar vacío para no cambiar)
                </label>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  style={{ width: "100%", fontSize: "0.95rem" }}
                />
              </div>
            </div>
            {mensaje && (
              <p
                style={{
                  color: "#c0392b",
                  fontSize: "0.85rem",
                  marginTop: "0.75rem",
                }}
              >
                {mensaje}
              </p>
            )}
            <div
              style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}
            >
              <button
                className="btn-primary"
                onClick={guardarEdicion}
                style={{ flex: 1, padding: "0.75rem" }}
              >
                Guardar cambios
              </button>
              <button
                onClick={() => setModalEditar(null)}
                style={{
                  flex: 1,
                  background: "#f0ece8",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.75rem",
                  cursor: "pointer",
                  color: "#7a6a5a",
                  fontFamily: "Georgia, serif",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Empleados;
