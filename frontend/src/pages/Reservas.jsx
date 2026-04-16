import { useEffect, useState } from "react";
import api from "../services/api";

function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [eventoId, setEventoId] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    api.get("/reservas").then((res) => setReservas(res.data));
    api.get("/clientes").then((res) => setClientes(res.data));
    api.get("/eventos").then((res) => setEventos(res.data));
  }, []);

  const crearReserva = () => {
    if (!clienteId || !eventoId)
      return setMensaje("Selecciona un cliente y un taller");
    api
      .post("/reservas", {
        cliente: { id: parseInt(clienteId) },
        evento: { id: parseInt(eventoId) },
      })
      .then((res) => {
        setReservas([...reservas, res.data]);
        setClienteId("");
        setEventoId("");
        setMensaje("Reserva creada correctamente");
      })
      .catch(() => setMensaje("Error al crear la reserva"));
  };

  const cancelarReserva = (id) => {
    api
      .patch(`/reservas/${id}/cancelar`)
      .then((res) => {
        setReservas(reservas.map((r) => (r.id === id ? res.data : r)));
        setMensaje("Reserva cancelada");
      })
      .catch(() => setMensaje("Error al cancelar la reserva"));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Reservas</h1>

      <div
        style={{
          background: "#1a1a1a",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ color: "#f5e6d3", marginBottom: "1rem" }}>
          Nueva reserva
        </h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "none",
              flex: 1,
            }}
          >
            <option value="">Selecciona un cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <select
            value={eventoId}
            onChange={(e) => setEventoId(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "none",
              flex: 1,
            }}
          >
            <option value="">Selecciona un taller</option>
            {eventos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre} ({e.plazasDisponibles} plazas)
              </option>
            ))}
          </select>
          <button
            onClick={crearReserva}
            style={{
              background: "#2d5016",
              color: "white",
              padding: "0.5rem 1.5rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reservar
          </button>
        </div>
        {mensaje && (
          <p style={{ color: "#69db7c", marginTop: "0.5rem" }}>{mensaje}</p>
        )}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#2d5016", color: "white" }}>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Cliente</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Taller</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>
              Fecha reserva
            </th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Estado</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((r, i) => (
            <tr
              key={r.id}
              style={{ background: i % 2 === 0 ? "#1a1a1a" : "#222" }}
            >
              <td style={{ padding: "0.75rem", color: "white" }}>
                {r.cliente?.nombre}
              </td>
              <td style={{ padding: "0.75rem", color: "#aaa" }}>
                {r.evento?.nombre}
              </td>
              <td style={{ padding: "0.75rem", color: "#aaa" }}>
                {new Date(r.fechaReserva).toLocaleString("es-ES")}
              </td>
              <td style={{ padding: "0.75rem" }}>
                <span
                  style={{
                    background:
                      r.estado === "CANCELADA" ? "#5c1a1a" : "#2d5016",
                    color: "white",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                  }}
                >
                  {r.estado}
                </span>
              </td>
              <td style={{ padding: "0.75rem" }}>
                {r.estado !== "CANCELADA" && (
                  <button
                    onClick={() => cancelarReserva(r.id)}
                    style={{
                      background: "#5c1a1a",
                      color: "white",
                      padding: "0.3rem 0.8rem",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Reservas;
