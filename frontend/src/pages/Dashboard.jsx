import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard({ usuario, onEntrar }) {
  const [datos, setDatos] = useState(null);
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
    } catch {
      console.error("Error al cargar el dashboard");
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
    <div className="dashboard-wrapper">
      <div className="dashboard-inner">
        {/* Cabecera */}
        <div className="dashboard-header">
          <div className="dashboard-emoji">
            {rol === "FLORISTA" ? "🌸" : rol === "CAJERO" ? "☕" : "🌸"}
          </div>
          <h1 className="dashboard-titulo">
            Buenos días, {usuario.nombre.split(" ")[0]}
          </h1>
          <p className="dashboard-fecha">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Previsión de afluencia */}
        {datos && (rol === "CAJERO" || rol === "ADMIN") && prev && (
          <div
            className="dashboard-prevision"
            style={{ background: prev.bg, border: `1px solid ${prev.color}` }}
          >
            <div className="dashboard-prevision-nivel">
              <div
                className="dashboard-prevision-nivel-label"
                style={{ color: prev.color }}
              >
                Afluencia
              </div>
              <div
                className="dashboard-prevision-nivel-valor"
                style={{ color: prev.color }}
              >
                {prev.texto}
              </div>
            </div>
            <p className="dashboard-prevision-texto">
              {datos.previsionDescripcion}
            </p>
          </div>
        )}

        {/* Talleres del día */}
        {datos &&
          (rol === "FLORISTA" || rol === "ADMIN") &&
          datos.detalleTalleresHoy?.length > 0 && (
            <div className="card dashboard-talleres">
              <h2 className="dashboard-seccion-title-verde">
                🌿 Talleres de hoy
              </h2>
              {datos.detalleTalleresHoy.map((t, i) => (
                <div
                  key={i}
                  className="dashboard-taller-row"
                  style={{
                    borderBottom:
                      i < datos.detalleTalleresHoy.length - 1
                        ? "1px solid #f0e8dc"
                        : "none",
                  }}
                >
                  <div>
                    <span className="dashboard-taller-nombre">{t.nombre}</span>
                    <span className="dashboard-taller-hora">
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
          <div className="dashboard-tarjetas">
            {tarjetas.map((item) => (
              <div key={item.label} className="card dashboard-tarjeta">
                <div className="dashboard-tarjeta-emoji">{item.emoji}</div>
                <div
                  className="dashboard-tarjeta-valor"
                  style={{ color: item.color }}
                >
                  {item.valor}
                </div>
                <div className="dashboard-tarjeta-label">{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Stock crítico cafetería */}
        {datos?.productosCriticosCafeteria?.length > 0 &&
          (rol === "CAJERO" || rol === "ADMIN") && (
            <div className="card dashboard-stock-cafe">
              <h2 className="dashboard-seccion-title-rojo">
                ⚠️ Cafetería — reponer hoy
              </h2>
              <div className="dashboard-badges">
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
            <div className="card dashboard-stock-flor">
              <h2 className="dashboard-seccion-title-naranja">
                ⚠️ Floristería — reponer hoy
              </h2>
              <div className="dashboard-badges">
                {datos.productosCriticosFloristeria.map((p) => (
                  <span key={p} className="badge badge-naranja">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Flores caducando */}
        {datos?.nombresFloresCaducando?.length > 0 &&
          (rol === "FLORISTA" || rol === "ADMIN") && (
            <div className="card dashboard-flores">
              <h2 className="dashboard-seccion-title-morado">
                🕐 Flores próximas a caducar
              </h2>
              <div className="dashboard-badges">
                {datos.nombresFloresCaducando.map((p) => (
                  <span key={p} className="badge badge-morado">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

        <button onClick={onEntrar} className="btn-primary dashboard-btn-entrar">
          Entrar a la aplicación →
        </button>
      </div>
    </div>
  );
}
export default Dashboard;
