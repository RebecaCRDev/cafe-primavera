import { useEffect, useState } from "react";
import api from "../services/api";

function TPV() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    api.get("/productos/activos").then((res) => setProductos(res.data));
    api.get("/categorias").then((res) => setCategorias(res.data));
  }, []);

  const productosFiltrados = filtro
    ? productos.filter((p) => p.categoria?.id === parseInt(filtro))
    : productos;

  const añadirAlCarrito = (producto) => {
    const existe = carrito.find((item) => item.producto.id === producto.id);
    if (existe) {
      setCarrito(
        carrito.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        ),
      );
    } else {
      setCarrito([...carrito, { producto, cantidad: 1 }]);
    }
  };

  const quitarDelCarrito = (productoId) => {
    const existe = carrito.find((item) => item.producto.id === productoId);
    if (existe.cantidad === 1) {
      setCarrito(carrito.filter((item) => item.producto.id !== productoId));
    } else {
      setCarrito(
        carrito.map((item) =>
          item.producto.id === productoId
            ? { ...item, cantidad: item.cantidad - 1 }
            : item,
        ),
      );
    }
  };

  const total = carrito.reduce(
    (sum, item) => sum + item.producto.precio * item.cantidad,
    0,
  );

  const cobrar = async () => {
    if (carrito.length === 0) return setMensaje("El carrito está vacío");
    try {
      const pedido = await api.post("/pedidos", {
        metodoPago,
        estado: "ABIERTO",
        empleado: { id: 1 },
      });
      for (const item of carrito) {
        await api.post(`/pedidos/${pedido.data.id}/lineas`, {
          cantidad: item.cantidad,
          precioUnitario: item.producto.precio,
          producto: { id: item.producto.id },
        });
      }
      await api.patch(
        `/pedidos/${pedido.data.id}/cerrar?metodoPago=${metodoPago}`,
      );
      setCarrito([]);
      setMensaje(`Pedido #${pedido.data.id} cobrado correctamente`);
    } catch (e) {
      setMensaje("Error al procesar el pedido");
    }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
      {/* Panel izquierdo - Productos */}
      <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
        <h2 style={{ color: "#f5e6d3", marginBottom: "1rem" }}>Productos</h2>

        <select
          onChange={(e) => setFiltro(e.target.value)}
          style={{
            marginBottom: "1rem",
            padding: "0.5rem",
            borderRadius: "4px",
            border: "none",
            width: "100%",
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "1rem",
          }}
        >
          {productosFiltrados.map((p) => (
            <button
              key={p.id}
              onClick={() => añadirAlCarrito(p)}
              style={{
                background: "#1a1a1a",
                border: "1px solid #2d5016",
                borderRadius: "8px",
                padding: "1rem",
                cursor: "pointer",
                textAlign: "left",
                color: "white",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "0.3rem" }}>
                {p.nombre}
              </div>
              <div style={{ color: "#f5e6d3", fontSize: "1.1rem" }}>
                {p.precio}€
              </div>
              <div
                style={{
                  color: p.stock < 10 ? "#ff6b6b" : "#aaa",
                  fontSize: "0.8rem",
                }}
              >
                Stock: {p.stock}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Panel derecho - Carrito */}
      <div
        style={{
          width: "320px",
          background: "#1a1a1a",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #2d5016",
        }}
      >
        <h2 style={{ color: "#f5e6d3", marginBottom: "1rem" }}>
          Pedido actual
        </h2>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {carrito.length === 0 ? (
            <p
              style={{ color: "#aaa", textAlign: "center", marginTop: "2rem" }}
            >
              Pulsa un producto para añadirlo
            </p>
          ) : (
            carrito.map((item) => (
              <div
                key={item.producto.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid #333",
                }}
              >
                <div>
                  <div style={{ color: "white", fontSize: "0.9rem" }}>
                    {item.producto.nombre}
                  </div>
                  <div style={{ color: "#aaa", fontSize: "0.8rem" }}>
                    {item.producto.precio}€ x {item.cantidad}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <button
                    onClick={() => quitarDelCarrito(item.producto.id)}
                    style={{
                      background: "#5c1a1a",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.2rem 0.5rem",
                      cursor: "pointer",
                    }}
                  >
                    -
                  </button>
                  <span style={{ color: "white" }}>{item.cantidad}</span>
                  <button
                    onClick={() => añadirAlCarrito(item.producto)}
                    style={{
                      background: "#2d5016",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.2rem 0.5rem",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            borderTop: "1px solid #2d5016",
            paddingTop: "1rem",
            marginTop: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <span style={{ color: "#aaa" }}>Total</span>
            <span
              style={{
                color: "#f5e6d3",
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              {total.toFixed(2)}€
            </span>
          </div>

          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "none",
              marginBottom: "0.75rem",
            }}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="BIZUM">Bizum</option>
          </select>

          <button
            onClick={cobrar}
            style={{
              width: "100%",
              background: "#2d5016",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "1rem",
              fontSize: "1.1rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Cobrar {total.toFixed(2)}€
          </button>

          {mensaje && (
            <p
              style={{
                color: "#69db7c",
                textAlign: "center",
                marginTop: "0.75rem",
                fontSize: "0.9rem",
              }}
            >
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TPV;
