import { useEffect, useState } from "react";
import api from "../services/api";

function Eventos() {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    api.get("/eventos").then((res) => setEventos(res.data));
  }, []);

  return (
    <div className="page">
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
            className="card"
            style={{ borderLeft: "4px solid #6b7c4a" }}
          >
            <h2 style={{ marginBottom: "0.5rem", color: "#3a3028" }}>
              {e.nombre}
            </h2>
            <p
              style={{
                color: "#7a6a5a",
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
                marginBottom: "0.4rem",
              }}
            >
              <span style={{ color: "#9e8e7e", fontSize: "0.85rem" }}>
                Fecha
              </span>
              <span style={{ color: "#3a3028", fontSize: "0.85rem" }}>
                {new Date(e.fechaHora).toLocaleString("es-ES")}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.4rem",
              }}
            >
              <span style={{ color: "#9e8e7e", fontSize: "0.85rem" }}>
                Plazas disponibles
              </span>
              <span
                style={{
                  color: e.plazasDisponibles === 0 ? "#c0392b" : "#6b7c4a",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
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
              <span style={{ color: "#9e8e7e", fontSize: "0.85rem" }}>
                Precio
              </span>
              <span style={{ color: "#3a3028", fontSize: "0.85rem" }}>
                {e.precio}€
              </span>
            </div>
            <span className="badge badge-green">{e.tipo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Eventos;
