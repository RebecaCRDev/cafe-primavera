import { useEffect, useState } from "react";
import api from "../services/api";

function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [modalReservas, setModalReservas] = useState(null);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalEditarPersonas, setModalEditarPersonas] = useState(null);
  const [nuevasPersonas, setNuevasPersonas] = useState("1");
  const [nombreCliente, setNombreCliente] = useState("");
  const [numPersonas, setNumPersonas] = useState("1");
  const [telefonoCliente, setTelefonoCliente] = useState("");
  const [emailCliente, setEmailCliente] = useState("");
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
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const reservasPorPagina = 8;

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    api.get("/eventos").then((res) => setEventos(res.data));
    api.get("/reservas").then((res) => setReservas(res.data));
    api.get("/clientes").then((res) => setClientes(res.data));
  }, []);

  const recargarTodo = () => {
    api.get("/eventos").then((r) => setEventos(r.data));
    api.get("/reservas").then((r) => setReservas(r.data));
    api.get("/clientes").then((r) => setClientes(r.data));
  };

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

  const eliminarTaller = (evento) => {
    if (
      !window.confirm(
        `¿Eliminar el taller "${evento.nombre}"? Esta acción no se puede deshacer.`,
      )
    )
      return;
    api
      .delete(`/eventos/${evento.id}`)
      .then(() => {
        setEventos(eventos.filter((e) => e.id !== evento.id));
        setMensaje("Taller eliminado correctamente");
      })
      .catch(() => setMensaje("Error al eliminar el taller"));
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
        .then(() => {
          setNombreCliente("");
          setNumPersonas("1");
          setTelefonoCliente("");
          setEmailCliente("");
          setEventoSeleccionado(null);
          setMensaje("Reserva creada correctamente");
          recargarTodo();
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
        .post("/clientes", {
          nombre: nombreCliente,
          telefono: telefonoCliente || null,
          email: emailCliente || null,
        })
        .then((res) => hacerReserva(res.data.id))
        .catch(() => setMensaje("Error al crear el cliente"));
    }
  };

  const cancelarReserva = (id) => {
    api
      .patch(`/reservas/${id}/cancelar`)
      .then(() => {
        recargarTodo();
        setMensaje("Reserva cancelada");
      })
      .catch(() => setMensaje("Error al cancelar"));
  };

  const confirmarReserva = (id) => {
    api
      .patch(`/reservas/${id}/confirmar`)
      .then(() => {
        recargarTodo();
        setMensaje("Reserva confirmada");
      })
      .catch(() => setMensaje("Error al confirmar"));
  };

  const abrirEditarPersonas = (reserva) => {
    setModalEditarPersonas(reserva);
    setNuevasPersonas(String(reserva.numPersonas || 1));
    setMensaje("");
  };

  const guardarPersonas = () => {
    const num = parseInt(nuevasPersonas);
    if (!num || num < 1) return setMensaje("Número de personas inválido");
    api
      .patch(`/reservas/${modalEditarPersonas.id}/personas?numPersonas=${num}`)
      .then(() => {
        setModalEditarPersonas(null);
        recargarTodo();
        setMensaje("Reserva actualizada");
      })
      .catch(() => setMensaje("No hay suficientes plazas disponibles"));
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

  const reservasFiltradas = reservas.filter((r) => {
    const texto = busqueda.toLowerCase();
    return (
      r.cliente?.nombre?.toLowerCase().includes(texto) ||
      r.evento?.nombre?.toLowerCase().includes(texto) ||
      r.cliente?.email?.toLowerCase().includes(texto) ||
      r.cliente?.telefono?.includes(texto)
    );
  });

  const totalPaginas = Math.ceil(reservasFiltradas.length / reservasPorPagina);
  const reservasPaginadas = reservasFiltradas.slice(
    (paginaActual - 1) * reservasPorPagina,
    paginaActual * reservasPorPagina,
  );

  const TarjetaTaller = ({ e, mostrarEditar = true }) => {
    const reservasEvento = reservasDeEvento(e.id);
    const hoy = new Date();
    const fechaTaller = new Date(e.fechaHora);
    const esPassado = fechaTaller < hoy;
    const estaCompleto = e.plazasDisponibles === 0;

    return (
      <div className="card tarjeta-taller">
        <h2 className="tarjeta-taller-titulo">{e.nombre}</h2>
        <p className="tarjeta-taller-desc">{e.descripcion}</p>
        <div className="tarjeta-taller-fila">
          <span className="tarjeta-taller-label">Fecha</span>
          <span className="tarjeta-taller-valor">
            {new Date(e.fechaHora).toLocaleString("es-ES")}
          </span>
        </div>
        <div className="tarjeta-taller-fila">
          <span className="tarjeta-taller-label">Plazas</span>
          <span
            style={{
              color: estaCompleto ? "#c0392b" : "#6b7c4a",
              fontSize: "0.85rem",
              fontWeight: "bold",
            }}
          >
            {e.plazasDisponibles} / {e.plazasTotales}
          </span>
        </div>
        <div className="tarjeta-taller-fila" style={{ marginBottom: "1rem" }}>
          <span className="tarjeta-taller-label">Precio</span>
          <span className="tarjeta-taller-valor">{e.precio}€</span>
        </div>
        <div className="tarjeta-taller-footer">
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span className="badge badge-green">{e.tipo}</span>
            {esPassado && <span className="badge badge-red">REALIZADO</span>}
            {estaCompleto && !esPassado && (
              <span className="badge badge-red">COMPLETO</span>
            )}
          </div>
          <div className="tarjeta-taller-acciones">
            <button
              className="btn-ver-reservas"
              onClick={() => setModalReservas(e)}
            >
              Ver reservas ({reservasEvento.length})
            </button>
            {mostrarEditar && (
              <>
                <button className="btn-editar" onClick={() => abrirEditar(e)}>
                  ✏️ Editar
                </button>
                <button
                  className="btn-danger"
                  onClick={() => eliminarTaller(e)}
                  style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }}
                >
                  🗑️ Eliminar
                </button>
              </>
            )}
            <button
              className="btn-primary"
              style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}
              onClick={() => {
                setEventoSeleccionado(e);
                setMensaje("");
              }}
              disabled={estaCompleto || esPassado}
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

      <div className="talleres-vistas">
        {[
          { id: "talleres", label: "Todos los talleres" },
          { id: "semana", label: "Esta semana" },
          { id: "reservas", label: "Reservas" },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setVistaActiva(v.id)}
            className={
              vistaActiva === v.id
                ? "talleres-vista-btn-activo"
                : "talleres-vista-btn-inactivo"
            }
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="talleres-nuevo-btn">
        <button
          className="btn-primary"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? "Cancelar" : "+ Nuevo taller"}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="card card-formulario">
          <h2>Nuevo taller</h2>
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
          {mensaje && <p className="mensaje-exito">{mensaje}</p>}
        </div>
      )}

      {vistaActiva === "talleres" && (
        <div className="talleres-grid">
          {eventos.map((e) => (
            <TarjetaTaller key={e.id} e={e} />
          ))}
        </div>
      )}

      {vistaActiva === "semana" && (
        <div>
          <p className="talleres-semana-info">
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
            <p className="talleres-semana-vacio">
              No hay talleres programados esta semana
            </p>
          ) : (
            <div className="talleres-grid">
              {talleresEstaSemana.map((e) => (
                <TarjetaTaller key={e.id} e={e} />
              ))}
            </div>
          )}
        </div>
      )}

      {vistaActiva === "reservas" && (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <input
              placeholder="Buscar por cliente, taller, email o teléfono..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              style={{
                width: "100%",
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "0.95rem",
              }}
            />
          </div>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Taller</th>
                <th>Personas</th>
                <th>Fecha reserva</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservasPaginadas.map((r) => (
                <tr key={r.id}>
                  <td>{r.cliente?.nombre || "—"}</td>
                  <td className="td-secundario">
                    {r.cliente?.telefono || "—"}
                  </td>
                  <td className="td-secundario">{r.cliente?.email || "—"}</td>
                  <td className="td-secundario">{r.evento?.nombre}</td>
                  <td className="td-secundario">{r.numPersonas || 1}</td>
                  <td className="td-secundario">
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
                    <div
                      style={{
                        display: "flex",
                        gap: "0.3rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {r.estado !== "CANCELADA" && (
                        <>
                          {r.estado !== "CONFIRMADA" && (
                            <button
                              className="btn-primary"
                              onClick={() => confirmarReserva(r.id)}
                              style={{
                                fontSize: "0.75rem",
                                padding: "0.25rem 0.6rem",
                              }}
                            >
                              ✓ Confirmar
                            </button>
                          )}
                          <button
                            className="btn-editar"
                            onClick={() => abrirEditarPersonas(r)}
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.25rem 0.6rem",
                            }}
                          >
                            ✏️ Personas
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => cancelarReserva(r.id)}
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.25rem 0.6rem",
                            }}
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPaginas > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "1rem",
              }}
            >
              <button
                className="btn-cancelar"
                onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                disabled={paginaActual === 1}
              >
                ← Anterior
              </button>
              <span style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}>
                {paginaActual} / {totalPaginas}
              </span>
              <button
                className="btn-cancelar"
                onClick={() =>
                  setPaginaActual((p) => Math.min(p + 1, totalPaginas))
                }
                disabled={paginaActual === totalPaginas}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {eventoSeleccionado && (
        <div
          className="modal-overlay"
          onClick={() => setEventoSeleccionado(null)}
        >
          <div className="modal-taller" onClick={(e) => e.stopPropagation()}>
            <h2>Nueva reserva</h2>
            <p className="modal-taller-subtitulo">
              {eventoSeleccionado.nombre}
            </p>
            <p className="modal-taller-plazas">
              Plazas disponibles:{" "}
              <span className="modal-taller-plazas-valor">
                {eventoSeleccionado.plazasDisponibles}
              </span>
            </p>
            <div className="modal-taller-inputs">
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
            <div
              className="modal-taller-inputs"
              style={{ marginTop: "0.5rem", flexDirection: "column" }}
            >
              <input
                placeholder="Teléfono"
                value={telefonoCliente}
                onChange={(e) => setTelefonoCliente(e.target.value)}
                style={{ fontSize: "0.95rem", width: "100%" }}
              />
              <input
                placeholder="Email"
                value={emailCliente}
                onChange={(e) => setEmailCliente(e.target.value)}
                style={{
                  fontSize: "0.95rem",
                  width: "100%",
                  marginTop: "0.5rem",
                }}
              />
            </div>
            {mensaje && <p className="mensaje-error">{mensaje}</p>}
            <div className="modal-taller-acciones">
              <button
                className="btn-primary"
                onClick={crearReserva}
                style={{ flex: 1, padding: "0.75rem" }}
              >
                Confirmar reserva
              </button>
              <button
                className="btn-cancelar"
                onClick={() => {
                  setEventoSeleccionado(null);
                  setMensaje("");
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalReservas && (
        <div className="modal-overlay" onClick={() => setModalReservas(null)}>
          <div className="modal-reservas" onClick={(e) => e.stopPropagation()}>
            <h2>{modalReservas.nombre}</h2>
            <p className="modal-reservas-info">
              {new Date(modalReservas.fechaHora).toLocaleString("es-ES")} ·{" "}
              {reservasDeEvento(modalReservas.id).length} reservas activas
            </p>
            {reservasDeEvento(modalReservas.id).length === 0 ? (
              <p className="modal-reservas-vacio">
                No hay reservas activas para este taller
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Personas</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasDeEvento(modalReservas.id).map((r) => (
                    <tr key={r.id}>
                      <td>{r.cliente?.nombre || "—"}</td>
                      <td className="td-secundario">
                        {r.cliente?.telefono || "—"}
                      </td>
                      <td className="td-secundario">
                        {r.cliente?.email || "—"}
                      </td>
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
              className="modal-reservas-cerrar"
              onClick={() => setModalReservas(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {modalEditar && (
        <div className="modal-overlay" onClick={() => setModalEditar(null)}>
          <div
            className="modal-editar-taller"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Editar taller</h2>
            <div className="modal-editar-campos">
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
            {mensaje && <p className="mensaje-error">{mensaje}</p>}
            <div className="modal-editar-acciones">
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

      {modalEditarPersonas && (
        <div
          className="modal-overlay"
          onClick={() => setModalEditarPersonas(null)}
        >
          <div className="modal-taller" onClick={(e) => e.stopPropagation()}>
            <h2>Editar personas</h2>
            <p className="modal-taller-subtitulo">
              {modalEditarPersonas.evento?.nombre}
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#666",
                marginBottom: "1rem",
              }}
            >
              Cliente: {modalEditarPersonas.cliente?.nombre}
            </p>
            <div className="modal-taller-inputs">
              <input
                type="number"
                min="1"
                placeholder="Número de personas *"
                value={nuevasPersonas}
                onChange={(e) => setNuevasPersonas(e.target.value)}
                style={{ flex: 1, fontSize: "0.95rem" }}
              />
            </div>
            {mensaje && <p className="mensaje-error">{mensaje}</p>}
            <div className="modal-taller-acciones">
              <button
                className="btn-primary"
                onClick={guardarPersonas}
                style={{ flex: 1, padding: "0.75rem" }}
              >
                Guardar
              </button>
              <button
                className="btn-cancelar"
                onClick={() => setModalEditarPersonas(null)}
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
