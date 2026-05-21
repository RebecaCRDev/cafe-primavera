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

  const usuario = JSON.parse(localStorage.getItem("usuario"));

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
              gridTemplateColumns: "repeat(2, 200px)",
              gap: "1rem",
              marginBottom: "1.5rem",
              justifyContent: "center",
            }}
          >
            {[
              {
                label: "Efectivo",
                valor: dashboard.ingresosEfectivo?.toFixed(2) + "€",
                color: "#4a6030",
              },
              {
                label: "Tarjeta",
                valor: dashboard.ingresosTarjeta?.toFixed(2) + "€",
                color: "#4a6030",
              },
            ].map((item) => (
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
                    color: item.color,
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
              Total del día
            </span>
            <span
              style={{ color: "#4a6030", fontSize: "2rem", fontWeight: "bold" }}
            >
              {dashboard.ingresosHoy?.toFixed(2)}€
            </span>
          </div>
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
        </div>
      )}

      {/* Estado del cierre */}
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
              gridTemplateColumns: "repeat(2, 200px)",
              gap: "1rem",
              marginBottom: "1.5rem",
              justifyContent: "center",
            }}
          >
            {[
              {
                label: "Efectivo",
                valor: cierreHoy.totalEfectivo?.toFixed(2) + "€",
              },
              {
                label: "Tarjeta",
                valor: cierreHoy.totalTarjeta?.toFixed(2) + "€",
              },
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
            style={{ width: "100%", fontSize: "0.95rem", marginBottom: "1rem" }}
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
                ¿Confirmas el cierre de caja? Esta acción no se puede deshacer.
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
      )}

      {/* Historial de cierres */}
      {historial.length > 0 && (
        <div>
          <h2 style={{ marginBottom: "1rem" }}>Historial de cierres</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Efectivo</th>
                <th>Tarjeta</th>
                <th>Total</th>
                <th>Pedidos</th>
                <th>Empleado</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((c) => (
                <tr key={c.id}>
                  <td>{new Date(c.fecha).toLocaleDateString("es-ES")}</td>
                  <td style={{ color: "#6b7c4a" }}>
                    {c.totalEfectivo?.toFixed(2)}€
                  </td>
                  <td style={{ color: "#6b7c4a" }}>
                    {c.totalTarjeta?.toFixed(2)}€
                  </td>
                  <td style={{ color: "#3a3028", fontWeight: "bold" }}>
                    {c.totalGeneral?.toFixed(2)}€
                  </td>
                  <td style={{ color: "#7a6a5a" }}>{c.numPedidos}</td>
                  <td style={{ color: "#7a6a5a" }}>{c.empleado?.nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CierreCaja;
