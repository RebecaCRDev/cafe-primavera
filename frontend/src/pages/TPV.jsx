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
    <div
      style={{
        display: "flex",
        flex: 1,
        height: "calc(100vh - 64px)",
        overflow: "hidden",
      }}
    >
      {/* Panel izquierdo - Productos */}
      <div
        style={{
          flex: 1,
          padding: "2rem",
          overflowY: "auto",
          background: "#f9f5f0",
        }}
      >
        <h2
          style={{
            marginBottom: "1.2rem",
            fontSize: "1.4rem",
            letterSpacing: "0.06em",
          }}
        >
          Productos
        </h2>

        <select
          onChange={(e) => setFiltro(e.target.value)}
          style={{ marginBottom: "1.5rem", width: "280px" }}
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
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "1.2rem",
          }}
        >
          {productosFiltrados.map((p) => (
            <button
              key={p.id}
              onClick={() => añadirAlCarrito(p)}
              style={{
                background: "#fff",
                border: "1px solid #e8ddd0",
                borderRadius: "12px",
                padding: "1.8rem 1.5rem",
                cursor: "pointer",
                textAlign: "center",
                color: "#3a3028",
                boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                transition: "all 0.2s",
                fontFamily: "Georgia, serif",
                minHeight: "130px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(107,124,74,0.2)";
                e.currentTarget.style.borderColor = "#6b7c4a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.05)";
                e.currentTarget.style.borderColor = "#e8ddd0";
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  marginBottom: "0.3rem",
                }}
              >
                {p.nombre}
              </div>
              <div style={{ color: "#6b7c4a", fontSize: "1.4rem" }}>
                {p.precio}€
              </div>
              <div
                style={{
                  color: p.stock < 10 ? "#c0392b" : "#b0a090",
                  fontSize: "0.78rem",
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
          width: "340px",
          minWidth: "340px",
          background: "#fff",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #e8ddd0",
          boxShadow: "-2px 0 12px rgba(0,0,0,0.04)",
        }}
      >
        <h2
          style={{
            marginBottom: "1.5rem",
            fontSize: "1.2rem",
            letterSpacing: "0.06em",
          }}
        >
          Pedido actual
        </h2>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {carrito.length === 0 ? (
            <p
              style={{
                color: "#b0a090",
                textAlign: "center",
                marginTop: "3rem",
                fontSize: "0.9rem",
                fontStyle: "italic",
              }}
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
                  padding: "0.85rem 0",
                  borderBottom: "1px solid #f0e8dc",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#3a3028",
                      fontSize: "0.9rem",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {item.producto.nombre}
                  </div>
                  <div style={{ color: "#9e8e7e", fontSize: "0.8rem" }}>
                    {item.producto.precio}€ × {item.cantidad} ={" "}
                    {(item.producto.precio * item.cantidad).toFixed(2)}€
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
                      background: "#f5e8e8",
                      color: "#c0392b",
                      border: "none",
                      borderRadius: "4px",
                      width: "26px",
                      height: "26px",
                      cursor: "pointer",
                      fontSize: "1rem",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      color: "#3a3028",
                      minWidth: "20px",
                      textAlign: "center",
                    }}
                  >
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() => añadirAlCarrito(item.producto)}
                    style={{
                      background: "#e8f0e0",
                      color: "#4a6030",
                      border: "none",
                      borderRadius: "4px",
                      width: "26px",
                      height: "26px",
                      cursor: "pointer",
                      fontSize: "1rem",
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
            borderTop: "1px solid #e8ddd0",
            paddingTop: "1.2rem",
            marginTop: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1.2rem",
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                color: "#9e8e7e",
                letterSpacing: "0.06em",
                fontSize: "0.85rem",
                textTransform: "uppercase",
              }}
            >
              Total
            </span>
            <span
              style={{
                color: "#3a3028",
                fontSize: "1.8rem",
                fontWeight: "normal",
                letterSpacing: "-0.02em",
              }}
            >
              {total.toFixed(2)}€
            </span>
          </div>

          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            style={{ width: "100%", marginBottom: "1rem" }}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="BIZUM">Bizum</option>
          </select>

          <button
            onClick={cobrar}
            className="btn-primary"
            style={{ width: "100%", padding: "0.9rem", fontSize: "1rem" }}
          >
            Cobrar {total.toFixed(2)}€
          </button>

          {mensaje && (
            <p
              style={{
                color: "#6b7c4a",
                textAlign: "center",
                marginTop: "0.75rem",
                fontSize: "0.85rem",
                fontStyle: "italic",
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
