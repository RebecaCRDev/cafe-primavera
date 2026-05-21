import { useEffect, useState } from "react";
import api from "../services/api";

function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [modalReservas, setModalReservas] = useState(null);
  const [modalEditar, setModalEditar] = useState(null);
  const [nombreCliente, setNombreCliente] = useState("");
  const [numPersonas, setNumPersonas] = useState("1");
  const [mensaje, setMensaje] = useState("");
  const [vistaActiva, setVistaActiva] = useState("talleres");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoDescripcion, setNuevoDescripcion] = useState("");
  const [nuevoFecha, setNuevoFecha] = useState("");
  const [nuevoPlazas, setNuevoPlazas] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("TALLER");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editFecha, setEditFecha] = useState("");
  const [editPlazas, setEditPlazas] = useState("");
  const [editPrecio, setEditPrecio] = useState("");
  const [editTipo, setEditTipo] = useState("");

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    api.get("/eventos").then((res) => setEventos(res.data));
    api.get("/reservas").then((res) => setReservas(res.data));
    api.get("/clientes").then((res) => setClientes(res.data));
  }, []);

  const crearTaller = () => {
    if (!nuevoNombre || !nuevoFecha || !nuevoPlazas || !nuevoPrecio)
      return setMensaje("Nombre, fecha, plazas y precio son obligatorios");
    api
      .post("/eventos", {
        nombre: nuevoNombre,
        descripcion: nuevoDescripcion,
        fechaHora: nuevoFecha,
        plazasTotales: parseInt(nuevoPlazas),
        plazasDisponibles: parseInt(nuevoPlazas),
        precio: parseFloat(nuevoPrecio),
        tipo: nuevoTipo,
        empleado: { id: usuario?.id || 1 },
      })
      .then((res) => {
        setEventos([...eventos, res.data]);
        setNuevoNombre("");
        setNuevoDescripcion("");
        setNuevoFecha("");
        setNuevoPlazas("");
        setNuevoPrecio("");
        setNuevoTipo("TALLER");
        setMostrarFormulario(false);
        setMensaje("Taller creado correctamente");
      })
      .catch(() => setMensaje("Error al crear el taller"));
  };

  const abrirEditar = (evento) => {
    setModalEditar(evento);
    setEditNombre(evento.nombre);
    setEditDescripcion(evento.descripcion || "");
    setEditFecha(evento.fechaHora?.slice(0, 16));
    setEditPlazas(String(evento.plazasTotales));
    setEditPrecio(String(evento.precio));
    setEditTipo(evento.tipo);
    setMensaje("");
  };

  const guardarEdicion = () => {
    if (!editNombre || !editFecha || !editPlazas || !editPrecio)
      return setMensaje("Nombre, fecha, plazas y precio son obligatorios");
    api
      .put(`/eventos/${modalEditar.id}`, {
        ...modalEditar,
        nombre: editNombre,
        descripcion: editDescripcion,
        fechaHora: editFecha,
        plazasTotales: parseInt(editPlazas),
        precio: parseFloat(editPrecio),
        tipo: editTipo,
        empleado: { id: modalEditar.empleado?.id || usuario?.id || 1 },
      })
      .then((res) => {
        setEventos(
          eventos.map((e) => (e.id === modalEditar.id ? res.data : e)),
        );
        setModalEditar(null);
        setMensaje("Taller actualizado correctamente");
      })
      .catch(() => setMensaje("Error al actualizar el taller"));
  };

  const reservasDeEvento = (eventoId) =>
    reservas.filter(
      (r) => r.evento?.id === eventoId && r.estado !== "CANCELADA",
    );

  const crearReserva = () => {
    if (!eventoSeleccionado || !nombreCliente)
      return setMensaje("Introduce el nombre del cliente");

    const personas = parseInt(numPersonas) || 1;
    if (personas > eventoSeleccionado.plazasDisponibles)
      return setMensaje(
        `Solo quedan ${eventoSeleccionado.plazasDisponibles} plazas disponibles`,
      );

    const clienteExistente = clientes.find(
      (c) => c.nombre.toLowerCase() === nombreCliente.toLowerCase(),
    );

    const hacerReserva = (clienteId) => {
      api
        .post("/reservas", {
          cliente: { id: clienteId },
          evento: { id: eventoSeleccionado.id },
          numPersonas: personas,
        })
        .then((res) => {
          setReservas([...reservas, res.data]);
          setNombreCliente("");
          setNumPersonas("1");
          setEventoSeleccionado(null);
          setMensaje("Reserva creada correctamente");
          api.get("/eventos").then((r) => setEventos(r.data));
          api.get("/reservas").then((r) => setReservas(r.data));
        })
        .catch(() =>
          setMensaje(
            "Este cliente ya tiene una reserva activa para este taller",
          ),
        );
    };

    if (clienteExistente) {
      hacerReserva(clienteExistente.id);
    } else {
      api
        .post("/clientes", { nombre: nombreCliente })
        .then((res) => hacerReserva(res.data.id))
        .catch(() => setMensaje("Error al crear el cliente"));
    }
  };

  const cancelarReserva = (id) => {
    api
      .patch(`/reservas/${id}/cancelar`)
      .then((res) => {
        setReservas(reservas.map((r) => (r.id === id ? res.data : r)));
        api.get("/eventos").then((r) => setEventos(r.data));
        api.get("/reservas").then((r) => setReservas(r.data));
      })
      .catch(() => setMensaje("Error al cancelar"));
  };

  const semanaActual = () => {
    const hoy = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - hoy.getDay() + 1);
    lunes.setHours(0, 0, 0, 0);
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    domingo.setHours(23, 59, 59, 999);
    return { lunes, domingo };
  };

  const { lunes, domingo } = semanaActual();
  const talleresEstaSemana = eventos.filter((e) => {
    const fecha = new Date(e.fechaHora);
    return fecha >= lunes && fecha <= domingo;
  });

  const TarjetaTaller = ({ e, mostrarEditar = true }) => {
    const reservasEvento = reservasDeEvento(e.id);
    return (
      <div className="card" style={{ borderLeft: "4px solid #6b7c4a" }}>
        <h2 style={{ marginBottom: "0.5rem", color: "#3a3028" }}>{e.nombre}</h2>
        <p
          style={{ color: "#7a6a5a", fontSize: "0.9rem", marginBottom: "1rem" }}
        >
          {e.descripcion}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.4rem",
          }}
        >
          <span style={{ color: "#9e8e7e", fontSize: "0.85rem" }}>Fecha</span>
          <span style={{ color: "#3a3028", fontSize: "0.85rem" }}>
            {new Date(e.fechaHora).toLocaleString("es-ES")}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.4rem",
          }}
        >
          <span style={{ color: "#9e8e7e", fontSize: "0.85rem" }}>Plazas</span>
          <span
            style={{
              color: e.plazasDisponibles === 0 ? "#c0392b" : "#6b7c4a",
              fontSize: "0.85rem",
              fontWeight: "bold",
            }}
          >
            {e.plazasDisponibles} / {e.plazasTotales}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <span style={{ color: "#9e8e7e", fontSize: "0.85rem" }}>Precio</span>
          <span style={{ color: "#3a3028", fontSize: "0.85rem" }}>
            {e.precio}€
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <span className="badge badge-green">{e.tipo}</span>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setModalReservas(e)}
              style={{
                background: "#f0ece8",
                border: "none",
                borderRadius: "6px",
                padding: "0.3rem 0.8rem",
                cursor: "pointer",
                fontSize: "0.8rem",
                color: "#7a6a5a",
                fontFamily: "Georgia, serif",
              }}
            >
              Ver reservas ({reservasEvento.length})
            </button>
            {mostrarEditar && (
              <button
                onClick={() => abrirEditar(e)}
                style={{
                  background: "#e8f0e0",
                  border: "1px solid #6b7c4a",
                  borderRadius: "6px",
                  padding: "0.3rem 0.8rem",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  color: "#4a6030",
                  fontFamily: "Georgia, serif",
                }}
              >
                ✏️ Editar
              </button>
            )}
            <button
              onClick={() => {
                setEventoSeleccionado(e);
                setMensaje("");
              }}
              className="btn-primary"
              style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}
              disabled={e.plazasDisponibles === 0}
            >
              + Reservar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <h1>Talleres</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { id: "talleres", label: "Todos los talleres" },
          { id: "semana", label: "Esta semana" },
          { id: "reservas", label: "Reservas" },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setVistaActiva(v.id)}
            style={{
              padding: "0.5rem 1.2rem",
              borderRadius: "20px",
              border:
                vistaActiva === v.id
                  ? "2px solid #6b7c4a"
                  : "1px solid #e8ddd0",
              background: vistaActiva === v.id ? "#e8f0e0" : "#fff",
              color: vistaActiva === v.id ? "#4a6030" : "#7a6a5a",
              cursor: "pointer",
              fontFamily: "Georgia, serif",
              fontSize: "0.85rem",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1.5rem",
        }}
      >
        <button
          className="btn-primary"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? "Cancelar" : "+ Nuevo taller"}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>Nuevo taller</h2>
          <div className="form-row" style={{ marginBottom: "0.75rem" }}>
            <input
              placeholder="Nombre *"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              style={{ flex: 2 }}
            />
            <input
              placeholder="Precio *"
              type="number"
              value={nuevoPrecio}
              onChange={(e) => setNuevoPrecio(e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              placeholder="Plazas *"
              type="number"
              value={nuevoPlazas}
              onChange={(e) => setNuevoPlazas(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
          <div className="form-row" style={{ marginBottom: "0.75rem" }}>
            <input
              placeholder="Descripción"
              value={nuevoDescripcion}
              onChange={(e) => setNuevoDescripcion(e.target.value)}
              style={{ flex: 3 }}
            />
            <select
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="TALLER">Taller</option>
              <option value="EVENTO">Evento</option>
              <option value="CURSO">Curso</option>
            </select>
          </div>
          <div className="form-row">
            <input
              type="datetime-local"
              value={nuevoFecha}
              onChange={(e) => setNuevoFecha(e.target.value)}
              style={{ flex: 2 }}
            />
            <button className="btn-primary" onClick={crearTaller}>
              Crear taller
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
      )}

      {vistaActiva === "talleres" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {eventos.map((e) => (
            <TarjetaTaller key={e.id} e={e} />
          ))}
        </div>
      )}

      {vistaActiva === "semana" && (
        <div>
          <p
            style={{
              color: "#9e8e7e",
              fontSize: "0.85rem",
              textAlign: "center",
              marginBottom: "1.5rem",
            }}
          >
            {lunes.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
            })}{" "}
            —{" "}
            {domingo.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          {talleresEstaSemana.length === 0 ? (
            <p
              style={{
                color: "#b0a090",
                textAlign: "center",
                fontStyle: "italic",
              }}
            >
              No hay talleres programados esta semana
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {talleresEstaSemana.map((e) => (
                <TarjetaTaller key={e.id} e={e} />
              ))}
            </div>
          )}
        </div>
      )}

      {vistaActiva === "reservas" && (
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Taller</th>
              <th>Personas</th>
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
                <td style={{ color: "#7a6a5a" }}>{r.numPersonas || 1}</td>
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
      )}

      {eventoSeleccionado && (
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
          onClick={() => setEventoSeleccionado(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "2rem",
              width: "400px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "0.3rem" }}>Nueva reserva</h2>
            <p
              style={{
                color: "#7a6a5a",
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              {eventoSeleccionado.nombre}
            </p>
            <p
              style={{
                color: "#9e8e7e",
                fontSize: "0.82rem",
                marginBottom: "1.2rem",
              }}
            >
              Plazas disponibles:{" "}
              <span style={{ color: "#6b7c4a", fontWeight: "bold" }}>
                {eventoSeleccionado.plazasDisponibles}
              </span>
            </p>
            <div
              style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}
            >
              <input
                placeholder="Nombre del cliente *"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                style={{ flex: 2, fontSize: "0.95rem" }}
              />
              <input
                type="number"
                placeholder="Personas *"
                min="1"
                max={eventoSeleccionado?.plazasDisponibles}
                value={numPersonas}
                onChange={(e) => setNumPersonas(e.target.value)}
                style={{ flex: 1, fontSize: "0.95rem" }}
              />
            </div>
            {mensaje && (
              <p
                style={{
                  color: "#c0392b",
                  fontSize: "0.85rem",
                  marginBottom: "0.75rem",
                }}
              >
                {mensaje}
              </p>
            )}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="btn-primary"
                onClick={crearReserva}
                style={{ flex: 1, padding: "0.75rem" }}
              >
                Confirmar reserva
              </button>
              <button
                onClick={() => {
                  setEventoSeleccionado(null);
                  setMensaje("");
                }}
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

      {modalReservas && (
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
          onClick={() => setModalReservas(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "2rem",
              width: "480px",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "0.3rem" }}>{modalReservas.nombre}</h2>
            <p
              style={{
                color: "#9e8e7e",
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
              }}
            >
              {new Date(modalReservas.fechaHora).toLocaleString("es-ES")} ·{" "}
              {reservasDeEvento(modalReservas.id).length} reservas activas
            </p>
            {reservasDeEvento(modalReservas.id).length === 0 ? (
              <p
                style={{
                  color: "#b0a090",
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                No hay reservas activas para este taller
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Personas</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasDeEvento(modalReservas.id).map((r) => (
                    <tr key={r.id}>
                      <td>{r.cliente?.nombre || "—"}</td>
                      <td>{r.numPersonas || 1}</td>
                      <td>
                        <span
                          className={`badge ${r.estado === "CONFIRMADA" ? "badge-green" : "badge-gray"}`}
                        >
                          {r.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-danger"
                          onClick={() => cancelarReserva(r.id)}
                          style={{
                            fontSize: "0.8rem",
                            padding: "0.3rem 0.7rem",
                          }}
                        >
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button
              onClick={() => setModalReservas(null)}
              style={{
                width: "100%",
                background: "#f0ece8",
                border: "none",
                borderRadius: "6px",
                padding: "0.75rem",
                cursor: "pointer",
                color: "#7a6a5a",
                fontFamily: "Georgia, serif",
                marginTop: "1.5rem",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

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
              width: "480px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>Editar taller</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div className="form-row">
                <input
                  placeholder="Nombre *"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  placeholder="Precio *"
                  type="number"
                  value={editPrecio}
                  onChange={(e) => setEditPrecio(e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  placeholder="Plazas *"
                  type="number"
                  value={editPlazas}
                  onChange={(e) => setEditPlazas(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
              <div className="form-row">
                <input
                  placeholder="Descripción"
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  style={{ flex: 3 }}
                />
                <select
                  value={editTipo}
                  onChange={(e) => setEditTipo(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="TALLER">Taller</option>
                  <option value="EVENTO">Evento</option>
                  <option value="CURSO">Curso</option>
                </select>
              </div>
              <input
                type="datetime-local"
                value={editFecha}
                onChange={(e) => setEditFecha(e.target.value)}
              />
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

export default Eventos;
