import { useEffect, useState } from "react";
import api from "../services/api";

function Salon() {
  const [nombreReserva, setNombreReserva] = useState("");
  const [horaReserva, setHoraReserva] = useState("");
  const [personasReserva, setPersonasReserva] = useState("");
  const [mesas, setMesas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [modal, setModal] = useState(null);
  const [mesaActiva, setMesaActiva] = useState(null);
  const [pedidoActivo, setPedidoActivo] = useState(null);
  const [lineasPedido, setLineasPedido] = useState([]);
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [importeEntregado, setImporteEntregado] = useState("");
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [facturaLineas, setFacturaLineas] = useState([]);
  const [facturaPedido, setFacturaPedido] = useState(null);

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    cargarMesas();
    api.get("/productos/activos").then((res) => setProductos(res.data));
    api.get("/categorias").then((res) => setCategorias(res.data));
  }, []);

  const cargarMesas = () => {
    api.get("/mesas").then((res) => setMesas(res.data));
  };

  const getMesa = (numero) => mesas.find((m) => m.numero === numero);

  const abrirModal = async (mesa) => {
    if (!mesa) return;
    setMesaActiva(mesa);
    setMensaje("");
    setMotivoCancelacion("");
    setImporteEntregado("");
    setMetodoPago("EFECTIVO");

    if (mesa.estado === "LIBRE") {
      setModal(mesa.numero === "LLEVAR" ? "llevar" : "opciones");
      return;
    }
    if (mesa.estado === "RESERVADA") {
      setModal("reservada");
      return;
    }
    if (mesa.estado === "OCUPADA") {
      setCargando(true);
      setModal("pedido");
      try {
        const res = await api.get(`/pedidos/mesa/${mesa.id}`);
        if (res.data) {
          setPedidoActivo(res.data);
          const lineas = await api.get(`/pedidos/${res.data.id}/lineas`);
          setLineasPedido(lineas.data);
        } else {
          setPedidoActivo(null);
          setLineasPedido([]);
        }
      } catch {
        setPedidoActivo(null);
        setLineasPedido([]);
      }
      setCargando(false);
    }
  };

  const cerrarModal = () => {
    setModal(null);
    setMesaActiva(null);
    setPedidoActivo(null);
    setLineasPedido([]);
    setMensaje("");
    setFiltroCategoria("");
    setImporteEntregado("");
    setMetodoPago("EFECTIVO");
  };

  const ocuparMesa = async () => {
    const resMesa = await api.patch(
      `/mesas/${mesaActiva.id}/estado?estado=OCUPADA`,
    );
    const resPedido = await api.post("/pedidos", {
      metodoPago: "EFECTIVO",
      estado: "ABIERTO",
      empleado: { id: usuario.id },
      mesa: { id: mesaActiva.id },
    });
    setMesas(mesas.map((m) => (m.id === mesaActiva.id ? resMesa.data : m)));
    setMesaActiva(resMesa.data);
    setPedidoActivo(resPedido.data);
    setLineasPedido([]);
    setModal("pedido");
  };

  const iniciarLlevar = async () => {
    const resMesa = await api.patch(
      `/mesas/${mesaActiva.id}/estado?estado=OCUPADA`,
    );
    const resPedido = await api.post("/pedidos", {
      metodoPago: "EFECTIVO",
      estado: "ABIERTO",
      empleado: { id: usuario.id },
      mesa: { id: mesaActiva.id },
    });
    setMesas(mesas.map((m) => (m.id === mesaActiva.id ? resMesa.data : m)));
    setMesaActiva(resMesa.data);
    setPedidoActivo(resPedido.data);
    setLineasPedido([]);
    setModal("pedido");
  };

  const reservarMesa = async () => {
    if (!nombreReserva || !personasReserva) {
      setMensaje("Introduce nombre y número de personas");
      return;
    }
    try {
      const res = await api.patch(`/mesas/${mesaActiva.id}/reservar`, {
        nombreReserva,
        horaReserva,
        personasReserva: String(personasReserva),
      });
      setMesas(mesas.map((m) => (m.id === mesaActiva.id ? res.data : m)));
      setNombreReserva("");
      setHoraReserva("");
      setPersonasReserva("");
      cerrarModal();
    } catch {
      setMensaje("Error al reservar la mesa");
    }
  };

  const confirmarReserva = async () => {
    const resMesa = await api.patch(
      `/mesas/${mesaActiva.id}/estado?estado=OCUPADA`,
    );
    const resPedido = await api.post("/pedidos", {
      metodoPago: "EFECTIVO",
      estado: "ABIERTO",
      empleado: { id: usuario.id },
      mesa: { id: mesaActiva.id },
    });
    setMesas(mesas.map((m) => (m.id === mesaActiva.id ? resMesa.data : m)));
    setMesaActiva(resMesa.data);
    setPedidoActivo(resPedido.data);
    setLineasPedido([]);
    setModal("pedido");
  };

  const cancelarReserva = async () => {
    const res = await api.patch(`/mesas/${mesaActiva.id}/estado?estado=LIBRE`);
    setMesas(mesas.map((m) => (m.id === mesaActiva.id ? res.data : m)));
    cerrarModal();
  };

  const añadirProducto = async (producto) => {
    if (!pedidoActivo) return;
    const lineaExistente = lineasPedido.find(
      (l) => l.producto?.id === producto.id,
    );
    if (lineaExistente) {
      const res = await api.put(`/lineas-pedido/${lineaExistente.id}`, {
        ...lineaExistente,
        cantidad: lineaExistente.cantidad + 1,
      });
      setLineasPedido(
        lineasPedido.map((l) => (l.id === lineaExistente.id ? res.data : l)),
      );
    } else {
      const res = await api.post(`/pedidos/${pedidoActivo.id}/lineas`, {
        cantidad: 1,
        precioUnitario: producto.precio,
        producto: { id: producto.id },
      });
      setLineasPedido([...lineasPedido, res.data]);
    }
  };

  const quitarProducto = async (linea) => {
    if (linea.cantidad === 1) {
      await api.delete(`/lineas-pedido/${linea.id}`);
      setLineasPedido(lineasPedido.filter((l) => l.id !== linea.id));
    } else {
      const res = await api.put(`/lineas-pedido/${linea.id}`, {
        ...linea,
        cantidad: linea.cantidad - 1,
      });
      setLineasPedido(
        lineasPedido.map((l) => (l.id === linea.id ? res.data : l)),
      );
    }
  };

  const cobrar = async () => {
    if (!pedidoActivo || lineasPedido.length === 0)
      return setMensaje("No hay productos en el pedido");
    if (
      metodoPago === "EFECTIVO" &&
      (!importeEntregado || parseFloat(importeEntregado) < totalPedido)
    )
      return setMensaje("El importe entregado debe ser igual o mayor al total");
    try {
      await api.patch(
        `/pedidos/${pedidoActivo.id}/cerrar?metodoPago=${metodoPago}`,
      );
      cargarMesas();
      cerrarModal();
    } catch {
      setMensaje("Error al cobrar el pedido");
    }
  };

  const cobrarYFactura = async () => {
    if (!pedidoActivo || lineasPedido.length === 0)
      return setMensaje("No hay productos en el pedido");
    if (
      metodoPago === "EFECTIVO" &&
      (!importeEntregado || parseFloat(importeEntregado) < totalPedido)
    )
      return setMensaje("El importe entregado debe ser igual o mayor al total");
    try {
      await api.patch(
        `/pedidos/${pedidoActivo.id}/cerrar?metodoPago=${metodoPago}`,
      );
      setFacturaPedido({ ...pedidoActivo, metodoPago, total: totalPedido });
      setFacturaLineas([...lineasPedido]);
      cargarMesas();
      setModal("factura");
      setMesaActiva(null);
      setPedidoActivo(null);
      setLineasPedido([]);
      setImporteEntregado("");
    } catch {
      setMensaje("Error al cobrar el pedido");
    }
  };

  const cancelarPedido = async () => {
    if (!pedidoActivo) {
      await api.patch(`/mesas/${mesaActiva.id}/estado?estado=LIBRE`);
      cargarMesas();
      cerrarModal();
      return;
    }
    try {
      await api.patch(`/pedidos/${pedidoActivo.id}/cancelar`, {
        motivo: motivoCancelacion || "Sin motivo especificado",
      });
      cargarMesas();
      cerrarModal();
    } catch {
      setMensaje("Error al cancelar el pedido");
    }
  };

  const imprimirFactura = () => {
    window.print();
  };

  const totalPedido = lineasPedido.reduce(
    (sum, l) => sum + l.precioUnitario * l.cantidad,
    0,
  );
  const cambio = importeEntregado
    ? Math.max(0, parseFloat(importeEntregado) - totalPedido)
    : null;
  const productosFiltrados = filtroCategoria
    ? productos.filter((p) => p.categoria?.id === parseInt(filtroCategoria))
    : productos;

  const colorMesa = (estado) => {
    if (estado === "LIBRE")
      return { bg: "#e8f0e0", border: "#6b7c4a", color: "#4a6030" };
    if (estado === "OCUPADA")
      return { bg: "#f5e8e8", border: "#c0392b", color: "#c0392b" };
    return { bg: "#fef3e2", border: "#e67e22", color: "#e67e22" };
  };

  const Mesa = ({ numero, top, left }) => {
    const mesa = getMesa(numero);
    if (!mesa) return null;
    const c = colorMesa(mesa.estado);
    return (
      <div
        onClick={() => abrirModal(mesa)}
        style={{
          position: "absolute",
          top,
          left,
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: c.bg,
          border: `2px solid ${c.border}`,
          color: c.color,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "0.72rem",
          fontWeight: "bold",
          transition: "all 0.2s",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          userSelect: "none",
        }}
        title={`${numero} - ${mesa.estado}`}
      >
        {numero}
      </div>
    );
  };

  const SillaBarra = ({ numero, top, left }) => {
    const mesa = getMesa(numero);
    if (!mesa) return null;
    const c = colorMesa(mesa.estado);
    return (
      <div
        onClick={() => abrirModal(mesa)}
        style={{
          position: "absolute",
          top,
          left,
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: c.bg,
          border: `2px solid ${c.border}`,
          color: c.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "0.6rem",
          fontWeight: "bold",
          transition: "all 0.2s",
          userSelect: "none",
        }}
      >
        {numero}
      </div>
    );
  };

  const BotoLlevar = () => {
    const mesa = getMesa("LLEVAR");
    if (!mesa) return null;
    const c = colorMesa(mesa.estado);
    return (
      <div
        onClick={() => abrirModal(mesa)}
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          width: "100px",
          height: "44px",
          borderRadius: "8px",
          background: c.bg,
          border: `2px solid ${c.border}`,
          color: c.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "0.75rem",
          fontWeight: "bold",
          transition: "all 0.2s",
          userSelect: "none",
          gap: "0.3rem",
        }}
        title={`Para llevar - ${mesa.estado}`}
      >
        🛍️ Llevar
      </div>
    );
  };

  const libres = mesas.filter((m) => m.estado === "LIBRE").length;
  const ocupadas = mesas.filter((m) => m.estado === "OCUPADA").length;
  const reservadas = mesas.filter((m) => m.estado === "RESERVADA").length;

  return (
    <div className="page">
      <h1>Salón</h1>

      <div className="salon-leyenda">
        {[
          { color: "#6b7c4a", bg: "#e8f0e0", label: `Libre (${libres})` },
          { color: "#c0392b", bg: "#f5e8e8", label: `Ocupada (${ocupadas})` },
          {
            color: "#e67e22",
            bg: "#fef3e2",
            label: `Reservada (${reservadas})`,
          },
        ].map((item) => (
          <span key={item.label} className="salon-leyenda-item">
            <span
              className="salon-leyenda-circulo"
              style={{ background: item.bg, border: `2px solid ${item.color}` }}
            ></span>
            {item.label}
          </span>
        ))}
      </div>

      <div className="salon-wrapper">
        <div className="salon-inner">
          <div className="salon-terraza">
            <span className="salon-terraza-label">🌿 Terraza</span>
            <div className="salon-puerta">🚪 PUERTA</div>
            <Mesa numero="T1" top="24px" left="80px" />
            <Mesa numero="T2" top="24px" left="550px" />
          </div>
          <div className="salon-interior">
            <span className="salon-interior-label">🏠 Interior</span>
            <div className="salon-barra">
              <span className="salon-barra-label">☕ Barra</span>
            </div>
            <SillaBarra numero="B1" top="38px" left="588px" />
            <SillaBarra numero="B2" top="82px" left="588px" />
            <SillaBarra numero="B3" top="126px" left="588px" />
            <SillaBarra numero="B4" top="170px" left="588px" />
            <SillaBarra numero="B5" top="214px" left="588px" />
            <div className="salon-escaleras">
              🪜 Escaleras
              <br />
              talleres
            </div>
            <Mesa numero="I1" top="50px" left="50px" />
            <Mesa numero="I2" top="50px" left="130px" />
            <Mesa numero="I3" top="50px" left="210px" />
            <Mesa numero="I4" top="50px" left="290px" />
            <Mesa numero="I5" top="50px" left="370px" />
            <Mesa numero="I6" top="150px" left="50px" />
            <Mesa numero="I7" top="150px" left="130px" />
            <Mesa numero="I8" top="150px" left="210px" />
            <Mesa numero="I9" top="150px" left="290px" />
            <Mesa numero="I10" top="150px" left="370px" />
            <Mesa numero="I11" top="250px" left="50px" />
            <Mesa numero="I12" top="250px" left="130px" />
            <Mesa numero="I13" top="250px" left="210px" />
            <Mesa numero="I14" top="250px" left="290px" />
            <Mesa numero="I15" top="250px" left="370px" />
            <BotoLlevar />
          </div>
        </div>
      </div>

      {/* MODAL LLEVAR */}
      {modal === "llevar" && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-salon" onClick={(e) => e.stopPropagation()}>
            <h2>🛍️ Para llevar</h2>
            <p className="modal-salon-desc">
              Pedido para llevar — sin mesa asignada
            </p>
            <button
              className="btn-primary"
              onClick={iniciarLlevar}
              style={{ width: "100%", padding: "0.85rem" }}
            >
              🛍️ Iniciar pedido para llevar
            </button>
            <button
              className="btn-cancelar"
              onClick={cerrarModal}
              style={{ width: "100%", marginTop: "0.75rem" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL OPCIONES */}
      {modal === "opciones" && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-salon" onClick={(e) => e.stopPropagation()}>
            <h2>Mesa {mesaActiva?.numero}</h2>
            <p className="modal-salon-desc">
              ¿Qué quieres hacer con esta mesa?
            </p>
            <button
              className="btn-primary"
              onClick={ocuparMesa}
              style={{
                width: "100%",
                padding: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              🪑 Ocupar mesa
            </button>
            <div style={{ borderTop: "1px solid #e8ddd0", paddingTop: "1rem" }}>
              <p className="modal-salon-reservar-titulo">📅 Reservar mesa</p>
              <div className="modal-salon-reservar-campos">
                <input
                  placeholder="Nombre del cliente *"
                  value={nombreReserva}
                  onChange={(e) => setNombreReserva(e.target.value)}
                  style={{ fontSize: "0.9rem" }}
                />
                <div className="modal-salon-reservar-fila">
                  <input
                    type="time"
                    value={horaReserva}
                    onChange={(e) => setHoraReserva(e.target.value)}
                    style={{ flex: 1, fontSize: "0.9rem" }}
                  />
                  <input
                    type="number"
                    placeholder="Personas *"
                    min="1"
                    max="10"
                    value={personasReserva}
                    onChange={(e) => setPersonasReserva(e.target.value)}
                    style={{ flex: 1, fontSize: "0.9rem" }}
                  />
                </div>
              </div>
              {mensaje && (
                <p className="mensaje-error" style={{ marginBottom: "0.5rem" }}>
                  {mensaje}
                </p>
              )}
              <button className="btn-reservar-confirmar" onClick={reservarMesa}>
                Confirmar reserva
              </button>
            </div>
            <button
              className="btn-cancelar"
              onClick={cerrarModal}
              style={{ width: "100%", marginTop: "0.75rem" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL RESERVADA */}
      {modal === "reservada" && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-reservada" onClick={(e) => e.stopPropagation()}>
            <h2>Mesa {mesaActiva?.numero}</h2>
            <span className="modal-reservada-badge">RESERVADA</span>
            <p className="modal-reservada-desc">¿Qué quieres hacer?</p>
            <div className="modal-reservada-acciones">
              <button
                className="btn-ver-reserva"
                onClick={() => setModal("verReserva")}
              >
                👁 Ver datos de la reserva
              </button>
              <button
                className="btn-primary"
                onClick={confirmarReserva}
                style={{ padding: "0.85rem" }}
              >
                ✅ Confirmar — Ocupar mesa
              </button>
              <button
                className="btn-danger"
                onClick={cancelarReserva}
                style={{ padding: "0.85rem" }}
              >
                ✕ Cancelar reserva
              </button>
              <button
                className="btn-cancelar"
                onClick={cerrarModal}
                style={{ width: "100%" }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER RESERVA */}
      {modal === "verReserva" && (
        <div
          className="modal-overlay"
          style={{ zIndex: 1001 }}
          onClick={() => setModal("reservada")}
        >
          <div
            className="modal-ver-reserva"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Datos de la reserva</h2>
            <div className="modal-ver-reserva-campos">
              {[
                { label: "Mesa", valor: mesaActiva?.numero },
                { label: "Nombre", valor: mesaActiva?.nombreReserva || "—" },
                {
                  label: "Hora prevista",
                  valor: mesaActiva?.horaReserva || "—",
                },
                {
                  label: "Personas",
                  valor: mesaActiva?.personasReserva || "—",
                },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  className="modal-ver-reserva-fila"
                  style={{
                    borderBottom:
                      i < arr.length - 1 ? "1px solid #f0e8dc" : "none",
                    paddingBottom: i < arr.length - 1 ? "0.75rem" : 0,
                  }}
                >
                  <span className="modal-ver-reserva-label">{item.label}</span>
                  <span
                    style={{
                      color: "#3a3028",
                      fontWeight: i === 0 ? "bold" : "normal",
                    }}
                  >
                    {item.valor}
                  </span>
                </div>
              ))}
            </div>
            <button
              className="btn-cancelar"
              onClick={() => setModal("reservada")}
              style={{ width: "100%" }}
            >
              Volver
            </button>
          </div>
        </div>
      )}

      {/* MODAL PEDIDO */}
      {modal === "pedido" && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-pedido" onClick={(e) => e.stopPropagation()}>
            <div className="modal-pedido-productos">
              <h2 className="modal-pedido-titulo">Añadir productos</h2>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                style={{
                  width: "100%",
                  marginBottom: "1rem",
                  fontSize: "0.85rem",
                }}
              >
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <div className="modal-pedido-grid">
                {productosFiltrados.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => añadirProducto(p)}
                    className="modal-pedido-btn-producto"
                  >
                    <div className="modal-pedido-btn-nombre">{p.nombre}</div>
                    <div className="modal-pedido-btn-precio">{p.precio}€</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-pedido-panel">
              <div className="modal-pedido-header">
                <h2 className="modal-pedido-header-titulo">
                  {mesaActiva?.numero === "LLEVAR"
                    ? "🛍️ Para llevar"
                    : `Mesa ${mesaActiva?.numero}`}
                </h2>
                <span className="badge-ocupada">OCUPADA</span>
              </div>
              {cargando && (
                <p
                  style={{
                    color: "#9e8e7e",
                    textAlign: "center",
                    fontSize: "0.85rem",
                  }}
                >
                  Cargando...
                </p>
              )}
              <div className="modal-pedido-lineas">
                {lineasPedido.length === 0 ? (
                  <p className="modal-pedido-vacio">
                    Pulsa un producto para añadirlo
                  </p>
                ) : (
                  lineasPedido.map((l) => (
                    <div key={l.id} className="modal-pedido-linea">
                      <div>
                        <div className="modal-pedido-linea-info">
                          {l.producto?.nombre}
                        </div>
                        <div className="modal-pedido-linea-precio">
                          {l.precioUnitario}€ × {l.cantidad}
                        </div>
                      </div>
                      <div className="modal-pedido-linea-controles">
                        <button
                          className="btn-quitar"
                          onClick={() => quitarProducto(l)}
                        >
                          −
                        </button>
                        <span className="modal-pedido-cantidad">
                          {l.cantidad}
                        </span>
                        <button
                          className="btn-añadir"
                          onClick={() => añadirProducto(l.producto)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="modal-pedido-footer">
                <div className="modal-pedido-total-row">
                  <span className="modal-pedido-total-label">Total</span>
                  <span className="modal-pedido-total-valor">
                    {totalPedido.toFixed(2)}€
                  </span>
                </div>
                <div className="modal-pedido-metodos">
                  {["EFECTIVO", "TARJETA"].map((mp) => (
                    <button
                      key={mp}
                      onClick={() => {
                        setMetodoPago(mp);
                        setImporteEntregado("");
                      }}
                      className={
                        metodoPago === mp
                          ? "modal-pedido-metodo-activo"
                          : "modal-pedido-metodo-inactivo"
                      }
                    >
                      {mp === "EFECTIVO" ? "💵 Efectivo" : "💳 Tarjeta"}
                    </button>
                  ))}
                </div>
                {metodoPago === "EFECTIVO" && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <input
                      type="number"
                      placeholder="Importe entregado"
                      min={totalPedido}
                      step="0.01"
                      value={importeEntregado}
                      onChange={(e) => setImporteEntregado(e.target.value)}
                      style={{
                        width: "100%",
                        fontSize: "0.95rem",
                        marginBottom: "0.4rem",
                      }}
                    />
                    {importeEntregado &&
                      parseFloat(importeEntregado) >= totalPedido && (
                        <div className="modal-pedido-cambio">
                          <span className="modal-pedido-cambio-label">
                            Cambio
                          </span>
                          <span className="modal-pedido-cambio-valor">
                            {cambio?.toFixed(2)}€
                          </span>
                        </div>
                      )}
                  </div>
                )}
                <button
                  onClick={cobrar}
                  className="btn-primary"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  Cobrar {totalPedido.toFixed(2)}€
                </button>
                <button
                  onClick={cobrarYFactura}
                  className="btn-gestionar"
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  🧾 Cobrar y generar factura
                </button>
                <button
                  onClick={() => setModal("cancelar")}
                  className="btn-danger"
                  style={{ width: "100%", padding: "0.6rem" }}
                >
                  Cancelar / Invitar
                </button>
                {mensaje && <p className="modal-pedido-error">{mensaje}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CANCELAR */}
      {modal === "cancelar" && (
        <div
          className="modal-overlay"
          style={{ zIndex: 1001 }}
          onClick={() => setModal("pedido")}
        >
          <div className="modal-cancelar" onClick={(e) => e.stopPropagation()}>
            <h2>Cancelar pedido</h2>
            <p className="modal-cancelar-desc">
              El pedido se registrará como pérdida. Indica el motivo:
            </p>
            <div className="modal-cancelar-motivos">
              {[
                "Cliente se fue sin pagar",
                "Invitación de la casa",
                "Error en el pedido",
                "Otro motivo",
              ].map((m) => (
                <button
                  key={m}
                  onClick={() => setMotivoCancelacion(m)}
                  className={
                    motivoCancelacion === m
                      ? "modal-cancelar-motivo-activo"
                      : "modal-cancelar-motivo-inactivo"
                  }
                >
                  {m}
                </button>
              ))}
              <input
                placeholder="Otro motivo..."
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                style={{ fontSize: "0.85rem" }}
              />
            </div>
            <div className="modal-cancelar-acciones">
              <button
                className="btn-danger"
                onClick={cancelarPedido}
                style={{ flex: 1, padding: "0.75rem" }}
              >
                Confirmar cancelación
              </button>
              <button
                className="btn-cancelar"
                onClick={() => setModal("pedido")}
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FACTURA */}
      {modal === "factura" && facturaPedido && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div
            className="modal-caja"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "480px" }}
          >
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌸</div>
              <h2 style={{ marginBottom: "0.2rem" }}>Café Primavera</h2>
              <p style={{ color: "#9e8e7e", fontSize: "0.85rem" }}>
                Cafetería & Floristería
              </p>
              <p
                style={{
                  color: "#9e8e7e",
                  fontSize: "0.8rem",
                  marginTop: "0.5rem",
                }}
              >
                {new Date().toLocaleString("es-ES")}
              </p>
            </div>

            <div
              style={{
                borderTop: "1px dashed #e8ddd0",
                borderBottom: "1px dashed #e8ddd0",
                padding: "1rem 0",
                marginBottom: "1rem",
              }}
            >
              {facturaLineas.map((l) => (
                <div
                  key={l.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.4rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <span>
                    {productos.find((p) => p.id === l.producto?.id)?.nombre ||
                      l.producto?.nombre ||
                      "Producto"}{" "}
                    × {l.cantidad}
                  </span>
                  <span>{(l.precioUnitario * l.cantidad).toFixed(2)}€</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  marginBottom: "0.5rem",
                }}
              >
                <span>TOTAL</span>
                <span>{facturaPedido.total.toFixed(2)}€</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  color: "#7a6a5a",
                }}
              >
                <span>Método de pago</span>
                <span>
                  {facturaPedido.metodoPago === "EFECTIVO"
                    ? "💵 Efectivo"
                    : "💳 Tarjeta"}
                </span>
              </div>
              {facturaPedido.metodoPago === "EFECTIVO" && importeEntregado && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      color: "#7a6a5a",
                    }}
                  >
                    <span>Entregado</span>
                    <span>{parseFloat(importeEntregado).toFixed(2)}€</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      color: "#6b7c4a",
                      fontWeight: "bold",
                    }}
                  >
                    <span>Cambio</span>
                    <span>
                      {(
                        parseFloat(importeEntregado) - facturaPedido.total
                      ).toFixed(2)}
                      €
                    </span>
                  </div>
                </>
              )}
            </div>

            <p
              style={{
                textAlign: "center",
                color: "#9e8e7e",
                fontSize: "0.8rem",
                marginBottom: "1.5rem",
              }}
            >
              ¡Gracias por su visita!
            </p>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="btn-primary"
                onClick={imprimirFactura}
                style={{ flex: 1, padding: "0.75rem" }}
              >
                🖨️ Imprimir
              </button>
              <button
                className="btn-cancelar"
                onClick={() => setModal(null)}
                style={{ flex: 1 }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Salon;
