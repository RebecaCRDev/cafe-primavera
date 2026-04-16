import { useEffect, useState } from "react";
import api from "../services/api";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    api.get("/productos").then((res) => setProductos(res.data));
    api.get("/categorias").then((res) => setCategorias(res.data));
  }, []);

  const productosFiltrados = filtro
    ? productos.filter((p) => p.categoria?.id === parseInt(filtro))
    : productos;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Productos</h1>

      <select
        onChange={(e) => setFiltro(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", fontSize: "1rem" }}
      >
        <option value="">Todas las categorías</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#2d5016", color: "white" }}>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Nombre</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Categoría</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Precio</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Stock</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map((p, i) => (
            <tr
              key={p.id}
              style={{ background: i % 2 === 0 ? "#1a1a1a" : "#222" }}
            >
              <td style={{ padding: "0.75rem", color: "white" }}>{p.nombre}</td>
              <td style={{ padding: "0.75rem", color: "#aaa" }}>
                {p.categoria?.nombre}
              </td>
              <td style={{ padding: "0.75rem", color: "#f5e6d3" }}>
                {p.precio}€
              </td>
              <td
                style={{
                  padding: "0.75rem",
                  color: p.stock < 10 ? "#ff6b6b" : "#69db7c",
                }}
              >
                {p.stock}
              </td>
              <td style={{ padding: "0.75rem" }}>
                <span
                  style={{
                    background: p.activo ? "#2d5016" : "#5c1a1a",
                    color: "white",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                  }}
                >
                  {p.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Productos;
