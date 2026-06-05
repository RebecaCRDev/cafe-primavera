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

      <div className="card card-formulario">
        <h2>Nuevo empleado</h2>
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
        {mensaje && <p className="mensaje-exito">{mensaje}</p>}
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
              <td className="td-secundario">{e.email}</td>
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
                <div className="empleados-acciones">
                  <button className="btn-editar" onClick={() => abrirEditar(e)}>
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

      {modalEditar && (
        <div className="modal-overlay" onClick={() => setModalEditar(null)}>
          <div className="empleados-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Editar empleado</h2>
            <div className="empleados-modal-campos">
              <div>
                <label className="form-label">Nombre *</label>
                <input
                  className="form-input-full"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input
                  className="form-input-full"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Rol</label>
                <select
                  className="form-input-full"
                  value={editRol}
                  onChange={(e) => setEditRol(e.target.value)}
                >
                  <option value="CAJERO">Cajero</option>
                  <option value="FLORISTA">Florista</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="form-label">
                  Nueva contraseña (dejar vacío para no cambiar)
                </label>
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="form-input-full"
                />
              </div>
            </div>
            {mensaje && <p className="mensaje-error">{mensaje}</p>}
            <div className="empleados-modal-acciones">
              <button
                className="btn-primary"
                onClick={guardarEdicion}
                style={{ flex: 1, padding: "0.75rem" }}
              >
                Guardar cambios
              </button>
              <button
                className="btn-cancelar"
                onClick={() => setModalEditar(null)}
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
