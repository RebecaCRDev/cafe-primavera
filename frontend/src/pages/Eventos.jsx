import { useEffect, useState } from "react";
import api from "../services/api";

function Eventos() {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    api.get("/eventos").then((res) => setEventos(res.data));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Talleres y Eventos</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {eventos.map((e) => (
          <div
            key={e.id}
            style={{
              background: "#1a1a1a",
              borderRadius: "8px",
              padding: "1.5rem",
              borderLeft: "4px solid #2d5016",
            }}
          >
            <h3 style={{ color: "#f5e6d3", marginBottom: "0.5rem" }}>
              {e.nombre}
            </h3>
            <p
              style={{
                color: "#aaa",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            >
              {e.descripcion}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ color: "#aaa", fontSize: "0.85rem" }}>Fecha</span>
              <span style={{ color: "white", fontSize: "0.85rem" }}>
                {new Date(e.fechaHora).toLocaleString("es-ES")}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ color: "#aaa", fontSize: "0.85rem" }}>
                Plazas disponibles
              </span>
              <span
                style={{
                  color: e.plazasDisponibles === 0 ? "#ff6b6b" : "#69db7c",
                  fontSize: "0.85rem",
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
              <span style={{ color: "#aaa", fontSize: "0.85rem" }}>Precio</span>
              <span style={{ color: "#f5e6d3", fontSize: "0.85rem" }}>
                {e.precio}€
              </span>
            </div>
            <span
              style={{
                background: "#2d5016",
                color: "white",
                padding: "0.2rem 0.6rem",
                borderRadius: "12px",
                fontSize: "0.8rem",
              }}
            >
              {e.tipo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Eventos;
