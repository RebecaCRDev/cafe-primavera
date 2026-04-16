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
      .catch(() => setMensaje("Error al cancelar"));
  };

  return (
    <div className="page">
      <h1>Reservas</h1>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Nueva reserva</h2>
        <div className="form-row">
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            style={{ flex: 1 }}
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
            style={{ flex: 1 }}
          >
            <option value="">Selecciona un taller</option>
            {eventos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre} ({e.plazasDisponibles} plazas)
              </option>
            ))}
          </select>
          <button className="btn-primary" onClick={crearReserva}>
            Reservar
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
            <th>Cliente</th>
            <th>Taller</th>
            <th>Fecha reserva</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((r) => (
            <tr key={r.id}>
              <td>{r.cliente?.nombre || "—"}</td>
              <td style={{ color: "#7a6a5a" }}>{r.evento?.nombre}</td>
              <td style={{ color: "#7a6a5a" }}>
                {new Date(r.fechaReserva).toLocaleString("es-ES")}
              </td>
              <td>
                <span
                  className={`badge ${r.estado === "CANCELADA" ? "badge-red" : r.estado === "CONFIRMADA" ? "badge-green" : "badge-gray"}`}
                >
                  {r.estado}
                </span>
              </td>
              <td>
                {r.estado !== "CANCELADA" && (
                  <button
                    className="btn-danger"
                    onClick={() => cancelarReserva(r.id)}
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
