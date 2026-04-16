import { useEffect, useState } from "react";
import api from "../services/api";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    api.get("/clientes").then((res) => setClientes(res.data));
  }, []);

  const crearCliente = () => {
    if (!nombre) return setMensaje("El nombre es obligatorio");
    api
      .post("/clientes", { nombre, email, telefono })
      .then((res) => {
        setClientes([...clientes, res.data]);
        setNombre("");
        setEmail("");
        setTelefono("");
        setMensaje("Cliente creado correctamente");
      })
      .catch(() => setMensaje("Error al crear el cliente"));
  };

  return (
    <div className="page">
      <h1>Clientes</h1>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Nuevo cliente</h2>
        <div className="form-row">
          <input
            placeholder="Nombre *"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ flex: 2 }}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: 2 }}
          />
          <input
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn-primary" onClick={crearCliente}>
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
            <th>Teléfono</th>
            <th>Fecha registro</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td style={{ color: "#7a6a5a" }}>{c.email || "—"}</td>
              <td style={{ color: "#7a6a5a" }}>{c.telefono || "—"}</td>
              <td style={{ color: "#7a6a5a" }}>{c.fechaRegistro}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Clientes;
