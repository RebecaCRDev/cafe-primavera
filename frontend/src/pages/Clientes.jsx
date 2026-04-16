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
    <div style={{ padding: "2rem" }}>
      <h1>Clientes</h1>

      <div
        style={{
          background: "#1a1a1a",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ color: "#f5e6d3", marginBottom: "1rem" }}>
          Nuevo cliente
        </h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <input
            placeholder="Nombre *"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "none",
              flex: 1,
            }}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "none",
              flex: 1,
            }}
          />
          <input
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "none",
              flex: 1,
            }}
          />
          <button
            onClick={crearCliente}
            style={{
              background: "#2d5016",
              color: "white",
              padding: "0.5rem 1.5rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Añadir
          </button>
        </div>
        {mensaje && (
          <p style={{ color: "#69db7c", marginTop: "0.5rem" }}>{mensaje}</p>
        )}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#2d5016", color: "white" }}>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Nombre</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Email</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Teléfono</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>
              Fecha registro
            </th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c, i) => (
            <tr
              key={c.id}
              style={{ background: i % 2 === 0 ? "#1a1a1a" : "#222" }}
            >
              <td style={{ padding: "0.75rem", color: "white" }}>{c.nombre}</td>
              <td style={{ padding: "0.75rem", color: "#aaa" }}>
                {c.email || "-"}
              </td>
              <td style={{ padding: "0.75rem", color: "#aaa" }}>
                {c.telefono || "-"}
              </td>
              <td style={{ padding: "0.75rem", color: "#aaa" }}>
                {c.fechaRegistro}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Clientes;
