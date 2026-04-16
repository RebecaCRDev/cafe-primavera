import { useEffect, useState } from "react";
import api from "../services/api";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    api.get("/productos").then((res) => setProductos(res.data));
    api.get("/categorias").then((res) => setCategorias(res.data));
  }, []);

  const productosFiltrados = filtro
    ? productos.filter((p) => p.categoria?.id === parseInt(filtro))
    : productos;

  const crearProducto = () => {
    if (!nombre || !precio || !categoriaId)
      return setMensaje("Nombre, precio y categoría son obligatorios");
    api
      .post("/productos", {
        nombre,
        precio: parseFloat(precio),
        stock: parseInt(stock) || 0,
        activo: true,
        categoria: { id: parseInt(categoriaId) },
      })
      .then((res) => {
        setProductos([...productos, res.data]);
        setNombre("");
        setPrecio("");
        setStock("");
        setCategoriaId("");
        setMensaje("Producto creado correctamente");
      })
      .catch(() => setMensaje("Error al crear el producto"));
  };

  return (
    <div className="page">
      <h1>Productos</h1>

      <div
        className="card"
        style={{ marginBottom: "2rem", background: "#fff" }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Nuevo producto</h2>
        <div className="form-row">
          <input
            placeholder="Nombre *"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ flex: 2 }}
          />
          <input
            placeholder="Precio *"
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            placeholder="Stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            style={{ flex: 1 }}
          />
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            style={{ flex: 2 }}
          >
            <option value="">Categoría *</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <button className="btn-primary" onClick={crearProducto}>
            Añadir
          </button>
        </div>
        {mensaje && (
          <p
            style={{
              color: "#6b7c4a",
              marginTop: "0.75rem",
              fontSize: "0.9rem",
            }}
          >
            {mensaje}
          </p>
        )}
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <select onChange={(e) => setFiltro(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td style={{ color: "#7a6a5a" }}>{p.categoria?.nombre}</td>
              <td style={{ color: "#6b7c4a" }}>{p.precio}€</td>
              <td>
                <span style={{ color: p.stock < 10 ? "#c0392b" : "#3a3028" }}>
                  {p.stock}
                </span>
              </td>
              <td>
                <span
                  className={p.activo ? "badge badge-green" : "badge badge-red"}
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
