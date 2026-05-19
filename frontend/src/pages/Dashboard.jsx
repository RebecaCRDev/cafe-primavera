import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard({ usuario, onEntrar }) {
  const [datos, setDatos] = useState(null);
  const [resumen, setResumen] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    setCargando(true);
    try {
      const res = await api.get("/dashboard");
      setDatos(res.data);
      await generarResumen(res.data);
    } catch {
      setResumen("No se pudo cargar el resumen del día.");
    }
    setCargando(false);
  };

  const generarResumen = async (datos) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          messages: [
            {
              role: "user",
              content: `Eres el asistente de Café Primavera, una cafetería-floristería. 
Genera un resumen breve y amigable del día para el empleado ${usuario.nombre} (${usuario.rol}).
Datos de hoy:
- Reservas para hoy: ${datos.reservasHoy}
- Pedidos realizados hoy: ${datos.pedidosHoy}
- Ingresos de hoy: ${datos.ingresosHoy}€
- Talleres programados hoy: ${datos.talleresHoy}
- Productos con stock crítico (menos de 10 unidades): ${datos.stockCritico}
${datos.productosStockCritico?.length > 0 ? "- Productos a reponer: " + datos.productosStockCritico.join(", ") : ""}

El resumen debe ser en español, en 3-4 frases cortas, tono cálido y profesional. 
Si hay stock crítico menciona qué hay que reponer. 
Si hay talleres menciónalos. Termina con un mensaje motivador.`,
            },
          ],
        }),
      });
      const data = await response.json();
      setResumen(
        data.content?.[0]?.text || "Buen día, que vaya bien la jornada.",
      );
    } catch {
      setResumen(
        "Buen día. Revisa las reservas y el stock antes de empezar la jornada.",
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9f5f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "680px", width: "100%" }}>
        {/* Cabecera */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🌸</div>
          <h1
            style={{
              fontSize: "1.8rem",
              color: "#3a3028",
              marginBottom: "0.3rem",
            }}
          >
            Buenos días, {usuario.nombre.split(" ")[0]}
          </h1>
          <p style={{ color: "#9e8e7e", fontSize: "0.9rem" }}>
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Tarjetas de estadísticas */}
        {datos && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {[
              {
                label: "Reservas hoy",
                valor: datos.reservasHoy,
                emoji: "📅",
                color: "#6b7c4a",
              },
              {
                label: "Pedidos hoy",
                valor: datos.pedidosHoy,
                emoji: "🧾",
                color: "#6b7c4a",
              },
              {
                label: "Ingresos hoy",
                valor: `${datos.ingresosHoy?.toFixed(2)}€`,
                emoji: "💰",
                color: "#6b7c4a",
              },
              {
                label: "Stock crítico",
                valor: datos.stockCritico,
                emoji: "⚠️",
                color: datos.stockCritico > 0 ? "#c0392b" : "#6b7c4a",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="card"
                style={{ textAlign: "center", padding: "1.2rem" }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>
                  {item.emoji}
                </div>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: "bold",
                    color: item.color,
                  }}
                >
                  {item.valor}
                </div>
                <div
                  style={{
                    color: "#9e8e7e",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resumen IA */}
        <div
          className="card"
          style={{ marginBottom: "1.5rem", borderLeft: "4px solid #6b7c4a" }}
        >
          <h2
            style={{
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#6b7c4a",
              marginBottom: "0.75rem",
            }}
          >
            ✨ Resumen del día
          </h2>
          {cargando ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                color: "#9e8e7e",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #c8b89a",
                  borderTopColor: "#6b7c4a",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              Preparando el resumen del día...
            </div>
          ) : (
            <p
              style={{
                color: "#3a3028",
                lineHeight: "1.7",
                fontSize: "0.95rem",
              }}
            >
              {resumen}
            </p>
          )}
        </div>

        {/* Stock crítico detalle */}
        {datos?.productosStockCritico?.length > 0 && (
          <div
            className="card"
            style={{ marginBottom: "1.5rem", borderLeft: "4px solid #c0392b" }}
          >
            <h2
              style={{
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#c0392b",
                marginBottom: "0.75rem",
              }}
            >
              ⚠️ Productos a reponer
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {datos.productosStockCritico.map((p) => (
                <span key={p} className="badge badge-red">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onEntrar}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1rem",
            letterSpacing: "0.08em",
          }}
        >
          Entrar a la aplicación →
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Dashboard;
