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
      setModal("opciones");
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

  const libres = mesas.filter((m) => m.estado === "LIBRE").length;
  const ocupadas = mesas.filter((m) => m.estado === "OCUPADA").length;
  const reservadas = mesas.filter((m) => m.estado === "RESERVADA").length;

  return (
    <div className="page">
      <h1>Salón</h1>

      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          justifyContent: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        {[
          { color: "#6b7c4a", bg: "#e8f0e0", label: `Libre (${libres})` },
          { color: "#c0392b", bg: "#f5e8e8", label: `Ocupada (${ocupadas})` },
          {
            color: "#e67e22",
            bg: "#fef3e2",
            label: `Reservada (${reservadas})`,
          },
        ].map((item) => (
          <span
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.85rem",
            }}
          >
            <span
              style={{
                width: "16px",
                height: "16px",
                background: item.bg,
                border: `2px solid ${item.color}`,
                borderRadius: "50%",
                display: "inline-block",
              }}
            ></span>
            {item.label}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{ position: "relative", width: "700px", minHeight: "620px" }}
        >
          <div
            style={{
              position: "relative",
              height: "100px",
              background: "#f0f7e8",
              border: "2px dashed #6b7c4a",
              borderRadius: "10px",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                color: "#6b7c4a",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                position: "absolute",
                top: "8px",
                left: "12px",
              }}
            >
              🌿 Terraza
            </span>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "70px",
                height: "14px",
                background: "#c8b89a",
                borderRadius: "0 0 8px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.55rem",
                color: "#7a6a5a",
              }}
            >
              🚪 PUERTA
            </div>
            <Mesa numero="T1" top="24px" left="80px" />
            <Mesa numero="T2" top="24px" left="550px" />
          </div>
          <div
            style={{
              position: "relative",
              height: "500px",
              background: "#faf6f1",
              border: "2px solid #c8b89a",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                color: "#7a6a5a",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                position: "absolute",
                top: "10px",
                left: "14px",
              }}
            >
              🏠 Interior
            </span>
            <div
              style={{
                position: "absolute",
                top: "30px",
                right: "20px",
                width: "55px",
                height: "220px",
                background: "#e8ddd0",
                borderRadius: "8px",
                border: "2px solid #c8b89a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.65rem",
                  color: "#7a6a5a",
                  writingMode: "vertical-rl",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                ☕ Barra
              </span>
            </div>
            <SillaBarra numero="B1" top="38px" left="588px" />
            <SillaBarra numero="B2" top="82px" left="588px" />
            <SillaBarra numero="B3" top="126px" left="588px" />
            <SillaBarra numero="B4" top="170px" left="588px" />
            <SillaBarra numero="B5" top="214px" left="588px" />
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                width: "110px",
                height: "80px",
                background: "#f0ece8",
                border: "2px solid #c8b89a",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                color: "#7a6a5a",
                textAlign: "center",
              }}
            >
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
          </div>
        </div>
      </div>

      {/* MODAL OPCIONES */}
      {modal === "opciones" && (
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
          onClick={cerrarModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "2rem",
              width: "360px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "0.5rem" }}>
              Mesa {mesaActiva?.numero}
            </h2>
            <p
              style={{
                color: "#9e8e7e",
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
              }}
            >
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
              <p
                style={{
                  color: "#7a6a5a",
                  fontSize: "0.85rem",
                  marginBottom: "0.75rem",
                  fontWeight: "bold",
                }}
              >
                📅 Reservar mesa
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  marginBottom: "0.75rem",
                }}
              >
                <input
                  placeholder="Nombre del cliente *"
                  value={nombreReserva}
                  onChange={(e) => setNombreReserva(e.target.value)}
                  style={{ fontSize: "0.9rem" }}
                />
                <div style={{ display: "flex", gap: "0.5rem" }}>
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
                <p
                  style={{
                    color: "#c0392b",
                    fontSize: "0.8rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {mensaje}
                </p>
              )}
              <button
                onClick={reservarMesa}
                style={{
                  width: "100%",
                  background: "#fef3e2",
                  border: "1px solid #e67e22",
                  color: "#e67e22",
                  borderRadius: "6px",
                  padding: "0.75rem",
                  cursor: "pointer",
                  fontFamily: "Georgia, serif",
                  fontSize: "0.9rem",
                }}
              >
                Confirmar reserva
              </button>
            </div>
            <button
              onClick={cerrarModal}
              style={{
                width: "100%",
                background: "#f0ece8",
                border: "none",
                borderRadius: "6px",
                padding: "0.75rem",
                cursor: "pointer",
                color: "#7a6a5a",
                fontFamily: "Georgia, serif",
                marginTop: "0.75rem",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL RESERVADA */}
      {modal === "reservada" && (
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
          onClick={cerrarModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "2rem",
              width: "320px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "0.5rem" }}>
              Mesa {mesaActiva?.numero}
            </h2>
            <span
              style={{
                background: "#fef3e2",
                color: "#e67e22",
                padding: "0.2rem 0.8rem",
                borderRadius: "12px",
                fontSize: "0.8rem",
              }}
            >
              RESERVADA
            </span>
            <p
              style={{
                color: "#9e8e7e",
                fontSize: "0.85rem",
                margin: "1rem 0 1.5rem",
              }}
            >
              ¿Qué quieres hacer?
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <button
                onClick={() => setModal("verReserva")}
                style={{
                  background: "#fef3e2",
                  border: "1px solid #e67e22",
                  color: "#e67e22",
                  borderRadius: "6px",
                  padding: "0.85rem",
                  cursor: "pointer",
                  fontFamily: "Georgia, serif",
                }}
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
                onClick={cerrarModal}
                style={{
                  background: "#f0ece8",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.75rem",
                  cursor: "pointer",
                  color: "#7a6a5a",
                  fontFamily: "Georgia, serif",
                }}
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
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
          }}
          onClick={() => setModal("reservada")}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "2rem",
              width: "340px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>Datos de la reserva</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
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
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom:
                      i < arr.length - 1 ? "1px solid #f0e8dc" : "none",
                    paddingBottom: i < arr.length - 1 ? "0.75rem" : 0,
                  }}
                >
                  <span style={{ color: "#9e8e7e", fontSize: "0.85rem" }}>
                    {item.label}
                  </span>
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
              onClick={() => setModal("reservada")}
              style={{
                width: "100%",
                background: "#f0ece8",
                border: "none",
                borderRadius: "6px",
                padding: "0.75rem",
                cursor: "pointer",
                color: "#7a6a5a",
                fontFamily: "Georgia, serif",
              }}
            >
              Volver
            </button>
          </div>
        </div>
      )}

      {/* MODAL PEDIDO */}
      {modal === "pedido" && (
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
          onClick={cerrarModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "0",
              width: "860px",
              maxHeight: "85vh",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              display: "flex",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel izquierdo - Productos */}
            <div
              style={{
                flex: 1,
                padding: "1.5rem",
                overflowY: "auto",
                background: "#f9f5f0",
                borderRight: "1px solid #e8ddd0",
              }}
            >
              <h2 style={{ marginBottom: "1rem", fontSize: "1rem" }}>
                Añadir productos
              </h2>
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
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {productosFiltrados.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => añadirProducto(p)}
                    style={{
                      background: "#fff",
                      border: "1px solid #e8ddd0",
                      borderRadius: "8px",
                      padding: "0.8rem",
                      cursor: "pointer",
                      textAlign: "center",
                      fontFamily: "Georgia, serif",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#6b7c4a";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(107,124,74,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e8ddd0";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                        marginBottom: "0.2rem",
                        color: "#3a3028",
                      }}
                    >
                      {p.nombre}
                    </div>
                    <div style={{ color: "#6b7c4a", fontSize: "0.95rem" }}>
                      {p.precio}€
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel derecho - Pedido */}
            <div
              style={{
                width: "300px",
                minWidth: "300px",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h2 style={{ fontSize: "1rem" }}>Mesa {mesaActiva?.numero}</h2>
                <span
                  style={{
                    background: "#f5e8e8",
                    color: "#c0392b",
                    padding: "0.2rem 0.7rem",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                  }}
                >
                  OCUPADA
                </span>
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
              <div style={{ flex: 1, overflowY: "auto" }}>
                {lineasPedido.length === 0 ? (
                  <p
                    style={{
                      color: "#b0a090",
                      textAlign: "center",
                      marginTop: "2rem",
                      fontSize: "0.85rem",
                      fontStyle: "italic",
                    }}
                  >
                    Pulsa un producto para añadirlo
                  </p>
                ) : (
                  lineasPedido.map((l) => (
                    <div
                      key={l.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.6rem 0",
                        borderBottom: "1px solid #f0e8dc",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.85rem", color: "#3a3028" }}>
                          {l.producto?.nombre}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#9e8e7e" }}>
                          {l.precioUnitario}€ × {l.cantidad}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <button
                          onClick={() => quitarProducto(l)}
                          style={{
                            background: "#f5e8e8",
                            color: "#c0392b",
                            border: "none",
                            borderRadius: "4px",
                            width: "22px",
                            height: "22px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            fontSize: "0.85rem",
                            minWidth: "16px",
                            textAlign: "center",
                          }}
                        >
                          {l.cantidad}
                        </span>
                        <button
                          onClick={() => añadirProducto(l.producto)}
                          style={{
                            background: "#e8f0e0",
                            color: "#4a6030",
                            border: "none",
                            borderRadius: "4px",
                            width: "22px",
                            height: "22px",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  borderTop: "1px solid #e8ddd0",
                  paddingTop: "1rem",
                  marginTop: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      color: "#9e8e7e",
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Total
                  </span>
                  <span style={{ fontSize: "1.5rem", color: "#3a3028" }}>
                    {totalPedido.toFixed(2)}€
                  </span>
                </div>

                {/* Selector método de pago */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {["EFECTIVO", "TARJETA"].map((mp) => (
                    <button
                      key={mp}
                      onClick={() => {
                        setMetodoPago(mp);
                        setImporteEntregado("");
                      }}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontFamily: "Georgia, serif",
                        fontSize: "0.85rem",
                        border:
                          metodoPago === mp
                            ? "2px solid #6b7c4a"
                            : "1px solid #e8ddd0",
                        background: metodoPago === mp ? "#e8f0e0" : "#f9f5f0",
                        color: metodoPago === mp ? "#4a6030" : "#7a6a5a",
                      }}
                    >
                      {mp === "EFECTIVO" ? "💵 Efectivo" : "💳 Tarjeta"}
                    </button>
                  ))}
                </div>

                {/* Campo importe entregado solo para efectivo */}
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
                        <div
                          style={{
                            background: "#e8f0e0",
                            borderRadius: "6px",
                            padding: "0.5rem 0.75rem",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span
                            style={{ color: "#4a6030", fontSize: "0.85rem" }}
                          >
                            Cambio
                          </span>
                          <span
                            style={{
                              color: "#4a6030",
                              fontWeight: "bold",
                              fontSize: "1rem",
                            }}
                          >
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
                    marginBottom: "0.5rem",
                  }}
                >
                  Cobrar {totalPedido.toFixed(2)}€
                </button>
                <button
                  onClick={() => setModal("cancelar")}
                  className="btn-danger"
                  style={{ width: "100%", padding: "0.6rem" }}
                >
                  Cancelar / Invitar
                </button>
                {mensaje && (
                  <p
                    style={{
                      color: "#c0392b",
                      textAlign: "center",
                      marginTop: "0.5rem",
                      fontSize: "0.8rem",
                    }}
                  >
                    {mensaje}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CANCELAR */}
      {modal === "cancelar" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
          }}
          onClick={() => setModal("pedido")}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "2rem",
              width: "380px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "0.5rem" }}>Cancelar pedido</h2>
            <p
              style={{
                color: "#9e8e7e",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              El pedido se registrará como pérdida. Indica el motivo:
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {[
                "Cliente se fue sin pagar",
                "Invitación de la casa",
                "Error en el pedido",
                "Otro motivo",
              ].map((m) => (
                <button
                  key={m}
                  onClick={() => setMotivoCancelacion(m)}
                  style={{
                    background: motivoCancelacion === m ? "#e8f0e0" : "#f9f5f0",
                    border: `1px solid ${motivoCancelacion === m ? "#6b7c4a" : "#e8ddd0"}`,
                    borderRadius: "6px",
                    padding: "0.6rem",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "0.85rem",
                    color: "#3a3028",
                    fontFamily: "Georgia, serif",
                  }}
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
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="btn-danger"
                onClick={cancelarPedido}
                style={{ flex: 1, padding: "0.75rem" }}
              >
                Confirmar cancelación
              </button>
              <button
                onClick={() => setModal("pedido")}
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
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Salon;
