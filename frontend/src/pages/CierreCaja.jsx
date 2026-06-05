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
        <div className="card card-formulario">
          <h2>Resumen de hoy</h2>
          <div
            className="caja-tarjetas"
            style={{
              gridTemplateColumns: `repeat(${tarjetasResumenHoy().length}, 1fr)`,
            }}
          >
            {tarjetasResumenHoy().map((item) => (
              <div key={item.label} className="caja-tarjeta">
                <div className="caja-tarjeta-label">{item.label}</div>
                <div className="caja-tarjeta-valor">{item.valor}</div>
              </div>
            ))}
          </div>

          <div className="caja-total">
            <span className="caja-total-label">
              {rol === "CAJERO"
                ? "Total cafetería hoy"
                : rol === "FLORISTA"
                  ? "Total floristería hoy"
                  : "Total del día"}
            </span>
            <span className="caja-total-valor">
              {rol === "CAJERO"
                ? (dashboard.ingresosCafeteria || 0).toFixed(2)
                : rol === "FLORISTA"
                  ? (dashboard.ingresosFloristeria || 0).toFixed(2)
                  : (dashboard.ingresosHoy || 0).toFixed(2)}
              €
            </span>
          </div>

          {rol !== "FLORISTA" && (
            <div className="caja-stats">
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

      {/* Cierre de caja */}
      {cierreHoy ? (
        <div className="card caja-cerrada">
          <div className="caja-cerrada-header">
            <span style={{ fontSize: "1.5rem" }}>✅</span>
            <h2>Caja cerrada hoy</h2>
          </div>
          <p className="caja-cerrada-info">
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
              <div key={item.label} className="caja-tarjeta">
                <div className="caja-tarjeta-label">{item.label}</div>
                <div
                  className="caja-tarjeta-valor"
                  style={{ fontSize: "1rem" }}
                >
                  {item.valor}
                </div>
              </div>
            ))}
          </div>
          {cierreHoy.observaciones && (
            <p className="caja-cerrada-obs">
              Observaciones: {cierreHoy.observaciones}
            </p>
          )}
        </div>
      ) : (
        rol !== "FLORISTA" && (
          <div className="card card-formulario">
            <h2>Cerrar caja</h2>
            <p className="caja-obs">
              Al cerrar la caja se registrará el resumen del día con los totales
              actuales.
            </p>
            <input
              placeholder="Observaciones (opcional)"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="caja-input"
            />
            {mensaje && <p className="mensaje-error">{mensaje}</p>}
            {!confirmar ? (
              <button
                className="btn-primary"
                onClick={() => setConfirmar(true)}
                style={{ width: "100%", padding: "0.85rem" }}
              >
                Cerrar caja del día
              </button>
            ) : (
              <div className="caja-confirmar">
                <p className="caja-confirmar-texto">
                  ¿Confirmas el cierre de caja? Esta acción no se puede
                  deshacer.
                </p>
                <div className="caja-confirmar-acciones">
                  <button
                    className="btn-primary"
                    onClick={cerrarCaja}
                    disabled={cargando}
                    style={{ flex: 1, padding: "0.75rem" }}
                  >
                    {cargando ? "Cerrando..." : "Sí, cerrar caja"}
                  </button>
                  <button
                    className="btn-cancelar"
                    onClick={() => setConfirmar(false)}
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
        <div className="calendario-nav">
          <button
            className="calendario-btn"
            onClick={() =>
              setMesActual(
                new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1),
              )
            }
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
            className="calendario-btn"
            onClick={() =>
              setMesActual(
                new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1),
              )
            }
          >
            ›
          </button>
        </div>
        <div className="calendario-cabecera">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
            <div key={d} className="calendario-dia-label">
              {d}
            </div>
          ))}
        </div>
        <div className="calendario-grid">{renderCalendario()}</div>
        <p className="calendario-nota">
          Los días en verde tienen cierre de caja registrado. Pulsa para ver el
          detalle.
        </p>
      </div>

      {/* Modal detalle del día */}
      {modalDia && (
        <div className="modal-overlay" onClick={() => setModalDia(null)}>
          <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
            <div className="modal-caja-header">
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
                <p className="modal-caja-subtitulo">
                  Cerrada por {modalDia.empleado?.nombre}
                </p>
              </div>
              <button
                className="calendario-btn"
                onClick={() => setModalDia(null)}
              >
                ✕
              </button>
            </div>

            {rol !== "FLORISTA" && (
              <div className="modal-caja-resumen">
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
                  <div key={item.label} className="modal-caja-tarjeta">
                    <div className="modal-caja-tarjeta-label">{item.label}</div>
                    <div className="modal-caja-tarjeta-valor">{item.valor}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-caja-desglose">
              {(rol === "ADMIN" || rol === "CAJERO") && (
                <div className="modal-caja-area">
                  <div className="modal-caja-area-label">☕ Cafetería</div>
                  <div className="modal-caja-area-valor">
                    {modalDia.totalCafeteria?.toFixed(2)}€
                  </div>
                </div>
              )}
              {(rol === "ADMIN" || rol === "FLORISTA") && (
                <div className="modal-caja-area">
                  <div className="modal-caja-area-label">🌸 Floristería</div>
                  <div className="modal-caja-area-valor">
                    {modalDia.totalFloristeria?.toFixed(2)}€
                  </div>
                </div>
              )}
            </div>

            {rol !== "FLORISTA" && (
              <div className="modal-caja-stats">
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

            {cargandoModal ? (
              <p className="modal-caja-cargando">Cargando pedidos...</p>
            ) : (
              <>
                {pedidosPagados.length > 0 && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h3 className="modal-caja-seccion-title-verde">
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
                        <div key={p.id} className="modal-caja-pedido">
                          <div className="modal-caja-pedido-header">
                            <span className="modal-caja-pedido-titulo">
                              {p.mesa ? `Mesa ${p.mesa.numero}` : "Mostrador"} ·{" "}
                              {new Date(p.fecha).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <div className="modal-caja-pedido-acciones">
                              {rol !== "FLORISTA" && (
                                <span
                                  className={
                                    p.metodoPago === "EFECTIVO"
                                      ? "badge-metodo-efectivo"
                                      : "badge-metodo-tarjeta"
                                  }
                                >
                                  {p.metodoPago === "EFECTIVO" ? "💵" : "💳"}{" "}
                                  {p.metodoPago}
                                </span>
                              )}
                              <span className="modal-caja-total">
                                {totalFiltrado.toFixed(2)}€
                              </span>
                            </div>
                          </div>
                          <div className="modal-caja-pedido-lineas">
                            {lineasFiltradas.map((l) => (
                              <div key={l.id} className="modal-caja-linea">
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
                    <h3 className="modal-caja-seccion-title-rojo">
                      Pedidos cancelados ({pedidosCancelados.length})
                    </h3>
                    {pedidosCancelados.map((p) => (
                      <div key={p.id} className="modal-caja-cancelado">
                        <div className="modal-caja-cancelado-row">
                          <span className="modal-caja-cancelado-info">
                            {p.mesa ? `Mesa ${p.mesa.numero}` : "Mostrador"} ·{" "}
                            {new Date(p.fecha).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="modal-caja-cancelado-motivo">
                            {p.motivoCancelacion || "Sin motivo"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pedidosDia.length === 0 && (
                  <p className="modal-caja-vacio">
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
