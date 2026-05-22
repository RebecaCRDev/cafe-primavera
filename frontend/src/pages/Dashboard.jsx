import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard({ usuario, onEntrar }) {
  const [datos, setDatos] = useState(null);
  const [resumen, setResumen] = useState("");
  const [cargando, setCargando] = useState(true);

  const rol = usuario.rol;

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

  const previsionColor = (nivel) => {
    if (nivel === "ALTA")
      return { bg: "#f5e8e8", color: "#c0392b", texto: "Alta" };
    if (nivel === "MEDIA-ALTA")
      return { bg: "#fef3e2", color: "#e67e22", texto: "Media-alta" };
    if (nivel === "MEDIA")
      return { bg: "#e8f0e0", color: "#6b7c4a", texto: "Media" };
    return { bg: "#f0ece8", color: "#7a6a5a", texto: "Baja" };
  };

  const generarResumen = async (datos) => {
    try {
      let prompt = "";
      if (rol === "CAJERO") {
        prompt = `Eres el asistente de Café Primavera, una cafetería-floristería.
Genera una previsión del día para ${usuario.nombre}, cajero de la cafetería.
Datos de hoy:
- Mesas reservadas ahora mismo: ${datos.reservasMesaHoy}
- Mesas ocupadas: ${datos.mesasOcupadas}, mesas libres: ${datos.mesasLibres}
- Previsión de afluencia: ${datos.previsionAfluencia}
- ${datos.previsionDescripcion}
- Talleres hoy (afectará afluencia): ${datos.talleresHoy}
- Productos de cafetería con stock crítico: ${datos.stockCriticoCafeteria}
${datos.productosCriticosCafeteria?.length > 0 ? "- Productos a reponer: " + datos.productosCriticosCafeteria.join(", ") : ""}
El resumen debe ser en español, 3-4 frases, tono cálido. Enfócate en la cafetería. Termina con un mensaje motivador.`;
      } else if (rol === "FLORISTA") {
        prompt = `Eres el asistente de Café Primavera, una cafetería-floristería.
Genera una previsión del día para ${usuario.nombre}, florista.
Datos de hoy:
- Talleres programados hoy: ${datos.talleresHoy}
${datos.detalleTalleresHoy?.map((t) => `  · ${t.nombre} a las ${t.hora} — ${t.plazasReservadas} personas reservadas de ${t.plazasTotales}`).join("\n") || ""}
- Flores próximas a caducar (≤3 días): ${datos.floresCaducando}
${datos.nombresFloresCaducando?.length > 0 ? "- Flores a gestionar: " + datos.nombresFloresCaducando.join(", ") : ""}
- Productos de floristería con stock crítico: ${datos.stockCriticoFloristeria}
${datos.productosCriticosFloristeria?.length > 0 ? "- Productos a reponer: " + datos.productosCriticosFloristeria.join(", ") : ""}
El resumen debe ser en español, 3-4 frases, tono cálido. Enfócate en la floristería y los talleres. Termina con un mensaje motivador.`;
      } else {
        prompt = `Eres el asistente de Café Primavera, una cafetería-floristería.
Genera una previsión del día para ${usuario.nombre}, administrador.
Datos de hoy:
- Mesas reservadas: ${datos.reservasMesaHoy}, ocupadas: ${datos.mesasOcupadas}, libres: ${datos.mesasLibres}
- Previsión de afluencia: ${datos.previsionAfluencia} — ${datos.previsionDescripcion}
- Talleres hoy: ${datos.talleresHoy}
${datos.detalleTalleresHoy?.map((t) => `  · ${t.nombre} a las ${t.hora} — ${t.plazasReservadas}/${t.plazasTotales} plazas`).join("\n") || ""}
- Stock crítico cafetería: ${datos.stockCriticoCafeteria} productos
- Stock crítico floristería: ${datos.stockCriticoFloristeria} productos
- Flores próximas a caducar: ${datos.floresCaducando}
El resumen debe ser en español, 4-5 frases, tono profesional. Menciona lo más urgente. Termina con un mensaje motivador.`;
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          messages: [{ role: "user", content: prompt }],
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

  const tarjetasCajero = () =>
    datos
      ? [
          {
            label: "Mesas reservadas",
            valor: datos.reservasMesaHoy,
            emoji: "📅",
            color: "#6b7c4a",
          },
          {
            label: "Mesas ocupadas",
            valor: datos.mesasOcupadas,
            emoji: "🪑",
            color: "#c0392b",
          },
          {
            label: "Mesas libres",
            valor: datos.mesasLibres,
            emoji: "✅",
            color: "#6b7c4a",
          },
          {
            label: "Talleres hoy",
            valor: datos.talleresHoy,
            emoji: "🌸",
            color: "#6b7c4a",
          },
        ]
      : [];

  const tarjetasForista = () =>
    datos
      ? [
          {
            label: "Talleres hoy",
            valor: datos.talleresHoy,
            emoji: "🌿",
            color: "#6b7c4a",
          },
          {
            label: "Flores a gestionar",
            valor: datos.floresCaducando,
            emoji: "⏰",
            color: datos.floresCaducando > 0 ? "#e67e22" : "#6b7c4a",
          },
          {
            label: "Stock crítico",
            valor: datos.stockCriticoFloristeria,
            emoji: "⚠️",
            color: datos.stockCriticoFloristeria > 0 ? "#c0392b" : "#6b7c4a",
          },
          {
            label: "Packs regalo críticos",
            valor:
              datos.productosCriticosFloristeria?.filter((p) =>
                p.includes("Pack"),
              ).length || 0,
            emoji: "🎁",
            color: "#6b7c4a",
          },
        ]
      : [];

  const tarjetasAdmin = () =>
    datos
      ? [
          {
            label: "Mesas reservadas",
            valor: datos.reservasMesaHoy,
            emoji: "📅",
            color: "#6b7c4a",
          },
          {
            label: "Talleres hoy",
            valor: datos.talleresHoy,
            emoji: "🌿",
            color: "#6b7c4a",
          },
          {
            label: "Stock crítico café",
            valor: datos.stockCriticoCafeteria,
            emoji: "☕",
            color: datos.stockCriticoCafeteria > 0 ? "#c0392b" : "#6b7c4a",
          },
          {
            label: "Stock crítico flor",
            valor: datos.stockCriticoFloristeria,
            emoji: "🌸",
            color: datos.stockCriticoFloristeria > 0 ? "#c0392b" : "#6b7c4a",
          },
        ]
      : [];

  const tarjetas =
    rol === "CAJERO"
      ? tarjetasCajero()
      : rol === "FLORISTA"
        ? tarjetasForista()
        : tarjetasAdmin();
  const prev = datos ? previsionColor(datos.previsionAfluencia) : null;

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
      <div style={{ maxWidth: "720px", width: "100%" }}>
        {/* Cabecera */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
            {rol === "FLORISTA" ? "🌸" : rol === "CAJERO" ? "☕" : "🌸"}
          </div>
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

        {/* Previsión de afluencia — solo CAJERO y ADMIN */}
        {datos && (rol === "CAJERO" || rol === "ADMIN") && prev && (
          <div
            style={{
              background: prev.bg,
              border: `1px solid ${prev.color}`,
              borderRadius: "12px",
              padding: "1rem 1.5rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div style={{ textAlign: "center", minWidth: "80px" }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: prev.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.2rem",
                }}
              >
                Afluencia
              </div>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: prev.color,
                }}
              >
                {prev.texto}
              </div>
            </div>
            <p style={{ color: "#3a3028", fontSize: "0.9rem", margin: 0 }}>
              {datos.previsionDescripcion}
            </p>
          </div>
        )}

        {/* Talleres del día — solo FLORISTA y ADMIN */}
        {datos &&
          (rol === "FLORISTA" || rol === "ADMIN") &&
          datos.detalleTalleresHoy?.length > 0 && (
            <div
              className="card"
              style={{
                marginBottom: "1.5rem",
                borderLeft: "4px solid #6b7c4a",
              }}
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
                🌿 Talleres de hoy
              </h2>
              {datos.detalleTalleresHoy.map((t, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0",
                    borderBottom:
                      i < datos.detalleTalleresHoy.length - 1
                        ? "1px solid #f0e8dc"
                        : "none",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "#3a3028",
                        fontWeight: "bold",
                      }}
                    >
                      {t.nombre}
                    </span>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        color: "#9e8e7e",
                        marginLeft: "0.5rem",
                      }}
                    >
                      a las {t.hora}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: t.plazasDisponibles === 0 ? "#c0392b" : "#6b7c4a",
                      fontWeight: "bold",
                    }}
                  >
                    {t.plazasReservadas}/{t.plazasTotales} personas
                  </span>
                </div>
              ))}
            </div>
          )}

        {/* Tarjetas */}
        {datos && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {tarjetas.map((item) => (
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
            ✨ Previsión del día
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
              Preparando la previsión del día...
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

        {/* Stock crítico cafetería */}
        {datos?.productosCriticosCafeteria?.length > 0 &&
          (rol === "CAJERO" || rol === "ADMIN") && (
            <div
              className="card"
              style={{ marginBottom: "1rem", borderLeft: "4px solid #c0392b" }}
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
                ⚠️ Cafetería — reponer hoy
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {datos.productosCriticosCafeteria.map((p) => (
                  <span key={p} className="badge badge-red">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Stock crítico floristería */}
        {datos?.productosCriticosFloristeria?.length > 0 &&
          (rol === "FLORISTA" || rol === "ADMIN") && (
            <div
              className="card"
              style={{ marginBottom: "1rem", borderLeft: "4px solid #e67e22" }}
            >
              <h2
                style={{
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#e67e22",
                  marginBottom: "0.75rem",
                }}
              >
                ⚠️ Floristería — reponer hoy
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {datos.productosCriticosFloristeria.map((p) => (
                  <span
                    key={p}
                    className="badge"
                    style={{ background: "#fef3e2", color: "#e67e22" }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Flores caducando */}
        {datos?.nombresFloresCaducando?.length > 0 &&
          (rol === "FLORISTA" || rol === "ADMIN") && (
            <div
              className="card"
              style={{
                marginBottom: "1.5rem",
                borderLeft: "4px solid #9b59b6",
              }}
            >
              <h2
                style={{
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#9b59b6",
                  marginBottom: "0.75rem",
                }}
              >
                🕐 Flores próximas a caducar
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {datos.nombresFloresCaducando.map((p) => (
                  <span
                    key={p}
                    className="badge"
                    style={{ background: "#f5eef8", color: "#9b59b6" }}
                  >
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Dashboard;
