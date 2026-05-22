import { useEffect, useState } from "react";
import api from "../services/api";

function CierreCaja() {
  const [cierreHoy, setCierreHoy] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [confirmar, setConfirmar] = useState(false);
  const [modalDia, setModalDia] = useState(null);
  const [pedidosDia, setPedidosDia] = useState([]);
  const [lineasPorPedido, setLineasPorPedido] = useState({});
  const [cargandoModal, setCargandoModal] = useState(false);
  const [mesActual, setMesActual] = useState(new Date());

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const rol = usuario?.rol;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [dashRes, cierreRes, histRes] = await Promise.all([
      api.get("/dashboard"),
      api.get("/cierre-caja/hoy"),
      api.get("/cierre-caja"),
    ]);
    setDashboard(dashRes.data);
    setCierreHoy(cierreRes.data);
    setHistorial(histRes.data);
  };

  const cerrarCaja = async () => {
    setCargando(true);
    try {
      await api.post("/cierre-caja/cerrar", {
        observaciones,
        empleadoId: String(usuario?.id || 1),
      });
      setMensaje("Caja cerrada correctamente");
      setConfirmar(false);
      cargarDatos();
    } catch (e) {
      setMensaje(e.response?.data?.error || "Error al cerrar la caja");
    }
    setCargando(false);
  };

  const abrirModalDia = async (cierre) => {
    setModalDia(cierre);
    setCargandoModal(true);
    setPedidosDia([]);
    setLineasPorPedido({});
    try {
      const res = await api.get(`/pedidos/fecha/${cierre.fecha}`);
      const pedidos = res.data;
      setPedidosDia(pedidos);
      const lineasMap = {};
      await Promise.all(
        pedidos.map(async (p) => {
          const lineasRes = await api.get(`/pedidos/${p.id}/lineas`);
          lineasMap[p.id] = lineasRes.data;
        }),
      );
      setLineasPorPedido(lineasMap);
    } catch {
      setPedidosDia([]);
    }
    setCargandoModal(false);
  };

  const filtrarLineasPorRol = (lineas) => {
    if (!lineas) return [];
    if (rol === "ADMIN") return lineas;
    return lineas.filter((l) => {
      const tipo = l.producto?.categoria?.tipo;
      if (rol === "CAJERO") return tipo === "CAFETERIA" || tipo === "PACK";
      if (rol === "FLORISTA") return tipo === "FLORISTERIA" || tipo === "PACK";
      return true;
    });
  };

  const totalPorRolDeCierre = (cierre) => {
    if (!cierre) return 0;
    if (rol === "CAJERO") return cierre.totalCafeteria;
    if (rol === "FLORISTA") return cierre.totalFloristeria;
    return cierre.totalGeneral;
  };

  const diasEnMes = (fecha) =>
    new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
  const primerDiaMes = (fecha) =>
    new Date(fecha.getFullYear(), fecha.getMonth(), 1).getDay();

  const cierresPorFecha = historial.reduce((acc, c) => {
    acc[c.fecha] = c;
    return acc;
  }, {});

  const renderCalendario = () => {
    const dias = diasEnMes(mesActual);
    const primerDia = (primerDiaMes(mesActual) + 6) % 7;
    const celdas = [];

    for (let i = 0; i < primerDia; i++) {
      celdas.push(<div key={`empty-${i}`} />);
    }

    for (let d = 1; d <= dias; d++) {
      const fechaStr = `${mesActual.getFullYear()}-${String(mesActual.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const cierre = cierresPorFecha[fechaStr];
      const hoy = new Date();
      const esHoy =
        d === hoy.getDate() &&
        mesActual.getMonth() === hoy.getMonth() &&
        mesActual.getFullYear() === hoy.getFullYear();
      const totalMostrar = cierre ? totalPorRolDeCierre(cierre) : null;

      celdas.push(
        <div
          key={d}
          onClick={() => cierre && abrirModalDia(cierre)}
          style={{
            aspectRatio: "1",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: cierre ? "pointer" : "default",
            background: cierre ? "#e8f0e0" : esHoy ? "#fef3e2" : "#f9f5f0",
            border: esHoy
              ? "2px solid #e67e22"
              : cierre
                ? "1px solid #6b7c4a"
                : "1px solid #e8ddd0",
            transition: "all 0.15s",
            padding: "0.3rem",
          }}
          onMouseEnter={(e) => {
            if (cierre) e.currentTarget.style.background = "#d4e8c4";
          }}
          onMouseLeave={(e) => {
            if (cierre) e.currentTarget.style.background = "#e8f0e0";
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: esHoy ? "bold" : "normal",
              color: cierre ? "#4a6030" : "#9e8e7e",
            }}
          >
            {d}
          </span>
          {cierre && (
            <span
              style={{
                fontSize: "0.65rem",
                color: "#6b7c4a",
                fontWeight: "bold",
              }}
            >
              {totalMostrar?.toFixed(0)}€
            </span>
          )}
        </div>,
      );
    }
    return celdas;
  };

  const pedidosPagados = pedidosDia.filter((p) => p.estado === "PAGADO");
  const pedidosCancelados = pedidosDia.filter((p) => p.estado === "CANCELADO");

  const tarjetasResumenHoy = () => {
    if (!dashboard) return [];
    if (rol === "FLORISTA") {
      return [
        {
          label: "🌸 Total floristería",
          valor: (dashboard.ingresosFloristeria || 0).toFixed(2) + "€",
        },
        { label: "Talleres hoy", valor: String(dashboard.talleresHoy || 0) },
      ];
    }
    if (rol === "CAJERO") {
      return [
        {
          label: "Efectivo",
          valor: (dashboard.ingresosEfectivo || 0).toFixed(2) + "€",
        },
        {
          label: "Tarjeta",
          valor: (dashboard.ingresosTarjeta || 0).toFixed(2) + "€",
        },
        {
          label: "☕ Total cafetería",
          valor: (dashboard.ingresosCafeteria || 0).toFixed(2) + "€",
        },
      ];
    }
    return [
      {
        label: "Efectivo",
        valor: (dashboard.ingresosEfectivo || 0).toFixed(2) + "€",
      },
      {
        label: "Tarjeta",
        valor: (dashboard.ingresosTarjeta || 0).toFixed(2) + "€",
      },
      {
        label: "☕ Cafetería",
        valor: (dashboard.ingresosCafeteria || 0).toFixed(2) + "€",
      },
      {
        label: "🌸 Floristería",
        valor: (dashboard.ingresosFloristeria || 0).toFixed(2) + "€",
      },
    ];
  };

  return (
    <div className="page">
      <h1>Cierre de caja</h1>

      {/* Resumen del día */}
      {dashboard && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1.2rem" }}>Resumen de hoy</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${tarjetasResumenHoy().length}, 1fr)`,
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {tarjetasResumenHoy().map((item) => (
              <div
                key={item.label}
                style={{
                  background: "#f9f5f0",
                  borderRadius: "10px",
                  padding: "1rem",
                  textAlign: "center",
                  border: "1px solid #e8ddd0",
                }}
              >
                <div
                  style={{
                    color: "#9e8e7e",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "0.5rem",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    color: "#4a6030",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  }}
                >
                  {item.valor}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem",
              background: "#e8f0e0",
              borderRadius: "10px",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                color: "#4a6030",
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {rol === "CAJERO"
                ? "Total cafetería hoy"
                : rol === "FLORISTA"
                  ? "Total floristería hoy"
                  : "Total del día"}
            </span>
            <span
              style={{ color: "#4a6030", fontSize: "2rem", fontWeight: "bold" }}
            >
              {rol === "CAJERO"
                ? (dashboard.ingresosCafeteria || 0).toFixed(2)
                : rol === "FLORISTA"
                  ? (dashboard.ingresosFloristeria || 0).toFixed(2)
                  : (dashboard.ingresosHoy || 0).toFixed(2)}
              €
            </span>
          </div>

          {rol !== "FLORISTA" && (
            <div
              style={{
                display: "flex",
                gap: "2rem",
                color: "#9e8e7e",
                fontSize: "0.85rem",
              }}
            >
              <span>
                Pedidos cobrados:{" "}
                <strong style={{ color: "#3a3028" }}>
                  {dashboard.numPedidosPagados || 0}
                </strong>
              </span>
              <span>
                Pedidos cancelados:{" "}
                <strong style={{ color: "#c0392b" }}>
                  {dashboard.pedidosCancelados || 0}
                </strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Cierre de caja — solo CAJERO y ADMIN */}
      {cierreHoy ? (
        <div
          className="card"
          style={{ marginBottom: "2rem", borderLeft: "4px solid #6b7c4a" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>✅</span>
            <h2>Caja cerrada hoy</h2>
          </div>
          <p
            style={{
              color: "#7a6a5a",
              fontSize: "0.85rem",
              marginBottom: "1rem",
            }}
          >
            Cerrada el {new Date(cierreHoy.createdAt).toLocaleString("es-ES")}{" "}
            por {cierreHoy.empleado?.nombre}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                rol === "ADMIN" ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
              gap: "1rem",
            }}
          >
            {[
              ...(rol !== "FLORISTA"
                ? [
                    {
                      label: "Efectivo",
                      valor: cierreHoy.totalEfectivo?.toFixed(2) + "€",
                    },
                    {
                      label: "Tarjeta",
                      valor: cierreHoy.totalTarjeta?.toFixed(2) + "€",
                    },
                  ]
                : []),
              ...(rol === "ADMIN"
                ? [
                    {
                      label: "☕ Cafetería",
                      valor: cierreHoy.totalCafeteria?.toFixed(2) + "€",
                    },
                    {
                      label: "🌸 Floristería",
                      valor: cierreHoy.totalFloristeria?.toFixed(2) + "€",
                    },
                  ]
                : rol === "CAJERO"
                  ? [
                      {
                        label: "☕ Tu área",
                        valor: cierreHoy.totalCafeteria?.toFixed(2) + "€",
                      },
                    ]
                  : [
                      {
                        label: "🌸 Tu área",
                        valor: cierreHoy.totalFloristeria?.toFixed(2) + "€",
                      },
                    ]),
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "#f9f5f0",
                  borderRadius: "8px",
                  padding: "0.75rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    color: "#9e8e7e",
                    fontSize: "0.78rem",
                    textTransform: "uppercase",
                    marginBottom: "0.3rem",
                  }}
                >
                  {item.label}
                </div>
                <div style={{ color: "#4a6030", fontWeight: "bold" }}>
                  {item.valor}
                </div>
              </div>
            ))}
          </div>
          {cierreHoy.observaciones && (
            <p
              style={{
                color: "#7a6a5a",
                fontSize: "0.85rem",
                marginTop: "1rem",
                fontStyle: "italic",
              }}
            >
              Observaciones: {cierreHoy.observaciones}
            </p>
          )}
        </div>
      ) : (
        rol !== "FLORISTA" && (
          <div className="card" style={{ marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1rem" }}>Cerrar caja</h2>
            <p
              style={{
                color: "#9e8e7e",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              Al cerrar la caja se registrará el resumen del día con los totales
              actuales.
            </p>
            <input
              placeholder="Observaciones (opcional)"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              style={{
                width: "100%",
                fontSize: "0.95rem",
                marginBottom: "1rem",
              }}
            />
            {mensaje && (
              <p
                style={{
                  color: "#c0392b",
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                }}
              >
                {mensaje}
              </p>
            )}
            {!confirmar ? (
              <button
                className="btn-primary"
                onClick={() => setConfirmar(true)}
                style={{ width: "100%", padding: "0.85rem" }}
              >
                Cerrar caja del día
              </button>
            ) : (
              <div
                style={{
                  background: "#fef5e7",
                  border: "1px solid #e67e22",
                  borderRadius: "10px",
                  padding: "1rem",
                }}
              >
                <p
                  style={{
                    color: "#e67e22",
                    fontSize: "0.9rem",
                    marginBottom: "1rem",
                  }}
                >
                  ¿Confirmas el cierre de caja? Esta acción no se puede
                  deshacer.
                </p>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    className="btn-primary"
                    onClick={cerrarCaja}
                    disabled={cargando}
                    style={{ flex: 1, padding: "0.75rem" }}
                  >
                    {cargando ? "Cerrando..." : "Sí, cerrar caja"}
                  </button>
                  <button
                    onClick={() => setConfirmar(false)}
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
            )}
          </div>
        )
      )}

      {/* Calendario */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <button
            onClick={() =>
              setMesActual(
                new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1),
              )
            }
            style={{
              background: "#f0ece8",
              border: "none",
              borderRadius: "6px",
              padding: "0.4rem 0.8rem",
              cursor: "pointer",
              color: "#7a6a5a",
              fontFamily: "Georgia, serif",
            }}
          >
            ‹
          </button>
          <h2 style={{ margin: 0 }}>
            {mesActual.toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            onClick={() =>
              setMesActual(
                new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1),
              )
            }
            style={{
              background: "#f0ece8",
              border: "none",
              borderRadius: "6px",
              padding: "0.4rem 0.8rem",
              cursor: "pointer",
              color: "#7a6a5a",
              fontFamily: "Georgia, serif",
            }}
          >
            ›
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "0.4rem",
            marginBottom: "0.5rem",
          }}
        >
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                fontSize: "0.75rem",
                color: "#9e8e7e",
                fontWeight: "bold",
                padding: "0.3rem 0",
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "0.4rem",
          }}
        >
          {renderCalendario()}
        </div>
        <p
          style={{
            color: "#9e8e7e",
            fontSize: "0.8rem",
            marginTop: "1rem",
            textAlign: "center",
          }}
        >
          Los días en verde tienen cierre de caja registrado. Pulsa para ver el
          detalle.
        </p>
      </div>

      {/* Modal detalle del día */}
      {modalDia && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setModalDia(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "2rem",
              width: "680px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <h2 style={{ marginBottom: "0.3rem" }}>
                  {new Date(modalDia.fecha + "T12:00:00").toLocaleDateString(
                    "es-ES",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </h2>
                <p style={{ color: "#9e8e7e", fontSize: "0.85rem" }}>
                  Cerrada por {modalDia.empleado?.nombre}
                </p>
              </div>
              <button
                onClick={() => setModalDia(null)}
                style={{
                  background: "#f0ece8",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.4rem 0.8rem",
                  cursor: "pointer",
                  color: "#7a6a5a",
                  fontFamily: "Georgia, serif",
                }}
              >
                ✕
              </button>
            </div>

            {/* Resumen del cierre */}
            {rol !== "FLORISTA" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                {[
                  {
                    label: "Efectivo",
                    valor: modalDia.totalEfectivo?.toFixed(2) + "€",
                  },
                  {
                    label: "Tarjeta",
                    valor: modalDia.totalTarjeta?.toFixed(2) + "€",
                  },
                  {
                    label: "Total",
                    valor: modalDia.totalGeneral?.toFixed(2) + "€",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "#f0f7e8",
                      borderRadius: "8px",
                      padding: "0.75rem",
                      textAlign: "center",
                      border: "1px solid #6b7c4a",
                    }}
                  >
                    <div
                      style={{
                        color: "#6b7c4a",
                        fontSize: "0.78rem",
                        textTransform: "uppercase",
                        marginBottom: "0.3rem",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        color: "#4a6030",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      {item.valor}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Desglose por área */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              {(rol === "ADMIN" || rol === "CAJERO") && (
                <div
                  style={{
                    background: "#f9f5f0",
                    borderRadius: "8px",
                    padding: "0.75rem",
                    textAlign: "center",
                    border: "1px solid #e8ddd0",
                  }}
                >
                  <div
                    style={{
                      color: "#9e8e7e",
                      fontSize: "0.78rem",
                      textTransform: "uppercase",
                      marginBottom: "0.3rem",
                    }}
                  >
                    ☕ Cafetería
                  </div>
                  <div style={{ color: "#4a6030", fontWeight: "bold" }}>
                    {modalDia.totalCafeteria?.toFixed(2)}€
                  </div>
                </div>
              )}
              {(rol === "ADMIN" || rol === "FLORISTA") && (
                <div
                  style={{
                    background: "#f9f5f0",
                    borderRadius: "8px",
                    padding: "0.75rem",
                    textAlign: "center",
                    border: "1px solid #e8ddd0",
                  }}
                >
                  <div
                    style={{
                      color: "#9e8e7e",
                      fontSize: "0.78rem",
                      textTransform: "uppercase",
                      marginBottom: "0.3rem",
                    }}
                  >
                    🌸 Floristería
                  </div>
                  <div style={{ color: "#4a6030", fontWeight: "bold" }}>
                    {modalDia.totalFloristeria?.toFixed(2)}€
                  </div>
                </div>
              )}
            </div>

            {rol !== "FLORISTA" && (
              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  color: "#9e8e7e",
                  fontSize: "0.85rem",
                  marginBottom: "1.5rem",
                }}
              >
                <span>
                  Pedidos cobrados:{" "}
                  <strong style={{ color: "#3a3028" }}>
                    {modalDia.numPedidos}
                  </strong>
                </span>
                <span>
                  Pedidos cancelados:{" "}
                  <strong style={{ color: "#c0392b" }}>
                    {modalDia.numCancelados}
                  </strong>
                </span>
                {modalDia.observaciones && (
                  <span style={{ fontStyle: "italic" }}>
                    "{modalDia.observaciones}"
                  </span>
                )}
              </div>
            )}

            {/* Detalle de pedidos */}
            {cargandoModal ? (
              <p
                style={{
                  color: "#9e8e7e",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                Cargando pedidos...
              </p>
            ) : (
              <>
                {pedidosPagados.length > 0 && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h3
                      style={{
                        color: "#4a6030",
                        fontSize: "0.9rem",
                        marginBottom: "1rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {rol === "FLORISTA"
                        ? "Ventas floristería"
                        : `Pedidos cobrados (${pedidosPagados.length})`}
                    </h3>
                    {pedidosPagados.map((p) => {
                      const lineasFiltradas = filtrarLineasPorRol(
                        lineasPorPedido[p.id],
                      );
                      if (lineasFiltradas.length === 0) return null;
                      const totalFiltrado = lineasFiltradas.reduce(
                        (sum, l) => sum + l.precioUnitario * l.cantidad,
                        0,
                      );
                      return (
                        <div
                          key={p.id}
                          style={{
                            border: "1px solid #e8ddd0",
                            borderRadius: "8px",
                            padding: "0.75rem 1rem",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.85rem",
                                color: "#3a3028",
                                fontWeight: "bold",
                              }}
                            >
                              {p.mesa ? `Mesa ${p.mesa.numero}` : "Mostrador"} ·{" "}
                              {new Date(p.fecha).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                gap: "0.75rem",
                                alignItems: "center",
                              }}
                            >
                              {rol !== "FLORISTA" && (
                                <span
                                  style={{
                                    fontSize: "0.78rem",
                                    background:
                                      p.metodoPago === "EFECTIVO"
                                        ? "#e8f0e0"
                                        : "#e8f0f8",
                                    color:
                                      p.metodoPago === "EFECTIVO"
                                        ? "#4a6030"
                                        : "#2c5f8a",
                                    padding: "0.1rem 0.5rem",
                                    borderRadius: "10px",
                                  }}
                                >
                                  {p.metodoPago === "EFECTIVO" ? "💵" : "💳"}{" "}
                                  {p.metodoPago}
                                </span>
                              )}
                              <span
                                style={{ color: "#4a6030", fontWeight: "bold" }}
                              >
                                {totalFiltrado.toFixed(2)}€
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              borderTop: "1px solid #f0e8dc",
                              paddingTop: "0.5rem",
                            }}
                          >
                            {lineasFiltradas.map((l) => (
                              <div
                                key={l.id}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: "0.8rem",
                                  color: "#7a6a5a",
                                  padding: "0.15rem 0",
                                }}
                              >
                                <span>
                                  {l.producto?.nombre} × {l.cantidad}
                                </span>
                                <span>
                                  {(l.precioUnitario * l.cantidad).toFixed(2)}€
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {rol !== "FLORISTA" && pedidosCancelados.length > 0 && (
                  <div>
                    <h3
                      style={{
                        color: "#c0392b",
                        fontSize: "0.9rem",
                        marginBottom: "1rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Pedidos cancelados ({pedidosCancelados.length})
                    </h3>
                    {pedidosCancelados.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          border: "1px solid #f5e8e8",
                          borderRadius: "8px",
                          padding: "0.75rem 1rem",
                          marginBottom: "0.75rem",
                          background: "#fdf8f8",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span
                            style={{ fontSize: "0.85rem", color: "#7a6a5a" }}
                          >
                            {p.mesa ? `Mesa ${p.mesa.numero}` : "Mostrador"} ·{" "}
                            {new Date(p.fecha).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "#c0392b",
                              fontStyle: "italic",
                            }}
                          >
                            {p.motivoCancelacion || "Sin motivo"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pedidosDia.length === 0 && (
                  <p
                    style={{
                      color: "#b0a090",
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    No se encontraron pedidos para este día
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CierreCaja;
