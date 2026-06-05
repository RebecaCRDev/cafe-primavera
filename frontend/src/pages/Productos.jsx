import { useEffect, useState } from "react";
import api from "../services/api";

const PRODUCTOS_POR_PAGINA = 10;

const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

const diasHastaCaducidad = (fecha) => {
  if (!fecha) return null;
  const f = new Date(fecha);
  f.setHours(0, 0, 0, 0);
  return Math.floor((f - hoy) / (1000 * 60 * 60 * 24));
};

const estadoCaducidad = (fecha) => {
  const dias = diasHastaCaducidad(fecha);
  if (dias === null) return null;
  if (dias < 0) return "caducado";
  if (dias <= 7) return "proximo";
  return "ok";
};

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [fechaCaducidad, setFechaCaducidad] = useState("");
  const [temporada, setTemporada] = useState("TODO_AÑO");
  const [color, setColor] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalGestion, setModalGestion] = useState(null);
  const [tipoMovimiento, setTipoMovimiento] = useState("COMPRA");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [pagina, setPagina] = useState(1);

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const esFlorista = usuario?.rol === "FLORISTA" || usuario?.rol === "ADMIN";

  useEffect(() => {
    api.get("/productos").then((res) => setProductos(res.data));
    api.get("/categorias").then((res) => setCategorias(res.data));
  }, []);

  const handleFiltro = (valor) => {
    setFiltro(valor);
    setPagina(1);
  };

  const categoriasPorRol = categorias.filter((c) => {
    if (usuario?.rol === "CAJERO")
      return c.tipo === "CAFETERIA" || c.tipo === "PACK";
    if (usuario?.rol === "FLORISTA")
      return c.tipo === "FLORISTERIA" || c.tipo === "PACK";
    return true;
  });

  const productosPorRol = productos.filter((p) => {
    const tipo = p.categoria?.tipo;
    if (usuario?.rol === "CAJERO")
      return tipo === "CAFETERIA" || tipo === "PACK";
    if (usuario?.rol === "FLORISTA")
      return tipo === "FLORISTERIA" || tipo === "PACK";
    return true;
  });

  const productosFiltrados = productosPorRol.filter((p) => {
    const coincideCategoria = filtro
      ? p.categoria?.id === parseInt(filtro)
      : true;
    const coincideBusqueda = p.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const totalPaginas = Math.ceil(
    productosFiltrados.length / PRODUCTOS_POR_PAGINA,
  );
  const productosPagina = productosFiltrados.slice(
    (pagina - 1) * PRODUCTOS_POR_PAGINA,
    pagina * PRODUCTOS_POR_PAGINA,
  );

  const stockCritico = productosPorRol.filter((p) => p.activo && p.stock < 10);

  const floresCaducidad = esFlorista
    ? productosPorRol.filter((p) => {
        const estado = estadoCaducidad(p.productoFlor?.fechaCaducidad);
        return estado === "caducado" || estado === "proximo";
      })
    : [];

  const categoriaSeleccionada = categorias.find(
    (c) => c.id === parseInt(categoriaId),
  );
  const esFlor =
    categoriaSeleccionada?.tipo === "FLORISTERIA" ||
    categoriaSeleccionada?.tipo === "PACK";

  const crearProducto = () => {
    if (!nombre || !precio || !categoriaId)
      return setMensaje("Nombre, precio y categoría son obligatorios");

    const body = {
      nombre,
      precio: parseFloat(precio),
      stock: parseInt(stock) || 0,
      activo: true,
      categoria: { id: parseInt(categoriaId) },
    };

    if (esFlor && fechaCaducidad) {
      body.productoFlor = {
        fechaCaducidad,
        temporada: temporada || "TODO_AÑO",
        color: color || "",
      };
    }

    api
      .post("/productos", body)
      .then((res) => {
        setProductos([...productos, res.data]);
        setNombre("");
        setPrecio("");
        setStock("");
        setCategoriaId("");
        setFechaCaducidad("");
        setTemporada("TODO_AÑO");
        setColor("");
        setMensaje("Producto creado correctamente");
      })
      .catch(() => setMensaje("Error al crear el producto"));
  };

  const calcularNuevoStock = () => {
    if (!cantidad || !modalGestion) return null;
    const c = parseInt(cantidad);
    if (isNaN(c) || c < 0) return null;
    switch (tipoMovimiento) {
      case "COMPRA":
        return modalGestion.stock + c;
      case "AJUSTE":
        return c;
      case "BAJA":
        return Math.max(0, modalGestion.stock - c);
      default:
        return null;
    }
  };

  const confirmarMovimiento = () => {
    if (!cantidad || parseInt(cantidad) < 0) return;
    api
      .patch(`/productos/${modalGestion.id}/gestionar-stock`, {
        tipo: tipoMovimiento,
        cantidad: String(cantidad),
        motivo: motivo || tipoMovimiento,
        empleadoId: String(usuario?.id || 1),
      })
      .then((res) => {
        setProductos(
          productos.map((p) => (p.id === modalGestion.id ? res.data : p)),
        );
        setCantidad("");
        setMotivo("");
        setTipoMovimiento("COMPRA");
        setModalGestion(null);
        setMensaje(`Stock de ${modalGestion.nombre} actualizado correctamente`);
      })
      .catch(() => setMensaje("Error al actualizar el stock"));
  };

  const nuevoStock = calcularNuevoStock();

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    const [y, m, d] = fecha.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="page">
      <h1>Inventario</h1>

      {/* Alerta stock crítico */}
      {stockCritico.length > 0 && (
        <div
          style={{
            background: "#fef5e7",
            border: "1px solid #e67e22",
            borderRadius: "10px",
            padding: "1rem 1.5rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
          <span style={{ fontSize: "1.3rem" }}>⚠️</span>
          <div>
            <p
              style={{
                color: "#e67e22",
                fontWeight: "bold",
                fontSize: "0.9rem",
                marginBottom: "0.4rem",
              }}
            >
              {stockCritico.length} producto{stockCritico.length > 1 ? "s" : ""}{" "}
              con stock crítico
            </p>
            <p style={{ color: "#7a6a5a", fontSize: "0.85rem" }}>
              {stockCritico
                .map((p) => `${p.nombre} (${p.stock} ud.)`)
                .join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Alerta flores caducidad */}
      {esFlorista && floresCaducidad.length > 0 && (
        <div
          style={{
            background: "#fdecea",
            border: "1px solid #c0392b",
            borderRadius: "10px",
            padding: "1rem 1.5rem",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
          <span style={{ fontSize: "1.3rem" }}>🌸</span>
          <div>
            <p
              style={{
                color: "#c0392b",
                fontWeight: "bold",
                fontSize: "0.9rem",
                marginBottom: "0.4rem",
              }}
            >
              {floresCaducidad.length} producto
              {floresCaducidad.length > 1 ? "s" : ""} con caducidad próxima o
              vencida
            </p>
            <p style={{ color: "#7a6a5a", fontSize: "0.85rem" }}>
              {floresCaducidad
                .map((p) => {
                  const dias = diasHastaCaducidad(
                    p.productoFlor?.fechaCaducidad,
                  );
                  const texto =
                    dias < 0
                      ? "caducado"
                      : `caduca en ${dias} día${dias === 1 ? "" : "s"}`;
                  return `${p.nombre} (${texto})`;
                })
                .join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Formulario nuevo producto */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Añadir producto</h2>
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
            placeholder="Stock inicial"
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
            {categoriasPorRol.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <button className="btn-primary" onClick={crearProducto}>
            Añadir
          </button>
        </div>

        {/* Campos extra para floristería */}
        {esFlor && (
          <div className="form-row" style={{ marginTop: "0.75rem" }}>
            <input
              type="date"
              value={fechaCaducidad}
              onChange={(e) => setFechaCaducidad(e.target.value)}
              style={{ flex: 1 }}
              title="Fecha de caducidad"
            />
            <select
              value={temporada}
              onChange={(e) => setTemporada(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="TODO_AÑO">Todo el año</option>
              <option value="PRIMAVERA">Primavera</option>
              <option value="VERANO">Verano</option>
              <option value="OTOÑO">Otoño</option>
              <option value="INVIERNO">Invierno</option>
            </select>
            <input
              placeholder="Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        )}

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

      {/* Filtro y buscador */}
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", flex: 1 }}>
          <input
            placeholder="🔍 Buscar producto..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
            style={{ flex: 2 }}
          />
          <select
            onChange={(e) => handleFiltro(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">Todas las categorías</option>
            {categoriasPorRol.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <span
          style={{
            color: "#9e8e7e",
            fontSize: "0.85rem",
            whiteSpace: "nowrap",
          }}
        >
          {productosFiltrados.length} productos · página {pagina} de{" "}
          {totalPaginas || 1}
        </span>
      </div>

      {/* Tabla */}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            {esFlorista && <th>Caduca</th>}
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {productosPagina.map((p) => {
            const estado = estadoCaducidad(p.productoFlor?.fechaCaducidad);
            const filaBackground =
              estado === "caducado"
                ? "#fdecea"
                : estado === "proximo"
                  ? "#fef5e7"
                  : "transparent";

            return (
              <tr key={p.id} style={{ background: filaBackground }}>
                <td>{p.nombre}</td>
                <td style={{ color: "#7a6a5a" }}>{p.categoria?.nombre}</td>
                <td style={{ color: "#6b7c4a" }}>{p.precio}€</td>
                <td>
                  <span
                    style={{
                      color: p.stock < 10 ? "#c0392b" : "#3a3028",
                      fontWeight: p.stock < 10 ? "bold" : "normal",
                    }}
                  >
                    {p.stock} {p.stock < 10 && "⚠️"}
                  </span>
                </td>
                {esFlorista && (
                  <td>
                    {p.productoFlor?.fechaCaducidad ? (
                      <span
                        style={{
                          color:
                            estado === "caducado"
                              ? "#c0392b"
                              : estado === "proximo"
                                ? "#e67e22"
                                : "#3a3028",
                          fontWeight: estado !== "ok" ? "bold" : "normal",
                          fontSize: "0.85rem",
                        }}
                      >
                        {formatFecha(p.productoFlor.fechaCaducidad)}
                        {estado === "caducado" && " ⛔"}
                        {estado === "proximo" && " ⚠️"}
                      </span>
                    ) : (
                      <span style={{ color: "#c8b89a", fontSize: "0.85rem" }}>
                        —
                      </span>
                    )}
                  </td>
                )}
                <td>
                  <span
                    className={
                      p.activo ? "badge badge-green" : "badge badge-red"
                    }
                  >
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => {
                      setModalGestion(p);
                      setCantidad("");
                      setMotivo("");
                      setTipoMovimiento("COMPRA");
                    }}
                    style={{
                      background: "#e8f0e0",
                      color: "#4a6030",
                      border: "1px solid #6b7c4a",
                      borderRadius: "6px",
                      padding: "0.3rem 0.8rem",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    Gestionar stock
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={() => setPagina(1)}
            disabled={pagina === 1}
            style={{
              background: pagina === 1 ? "#f0ece8" : "#e8f0e0",
              border: "none",
              borderRadius: "6px",
              padding: "0.4rem 0.7rem",
              cursor: pagina === 1 ? "default" : "pointer",
              color: pagina === 1 ? "#b0a090" : "#4a6030",
              fontFamily: "Georgia, serif",
              fontSize: "0.85rem",
            }}
          >
            «
          </button>
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            style={{
              background: pagina === 1 ? "#f0ece8" : "#e8f0e0",
              border: "none",
              borderRadius: "6px",
              padding: "0.4rem 0.7rem",
              cursor: pagina === 1 ? "default" : "pointer",
              color: pagina === 1 ? "#b0a090" : "#4a6030",
              fontFamily: "Georgia, serif",
              fontSize: "0.85rem",
            }}
          >
            ‹
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1)
            .filter(
              (n) => n === 1 || n === totalPaginas || Math.abs(n - pagina) <= 1,
            )
            .reduce((acc, n, i, arr) => {
              if (i > 0 && n - arr[i - 1] > 1) acc.push("...");
              acc.push(n);
              return acc;
            }, [])
            .map((item, i) =>
              item === "..." ? (
                <span
                  key={`dots-${i}`}
                  style={{ color: "#9e8e7e", fontSize: "0.85rem" }}
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPagina(item)}
                  style={{
                    background: pagina === item ? "#6b7c4a" : "#f9f5f0",
                    border: pagina === item ? "none" : "1px solid #e8ddd0",
                    borderRadius: "6px",
                    padding: "0.4rem 0.75rem",
                    cursor: "pointer",
                    color: pagina === item ? "#fff" : "#7a6a5a",
                    fontFamily: "Georgia, serif",
                    fontSize: "0.85rem",
                    fontWeight: pagina === item ? "bold" : "normal",
                  }}
                >
                  {item}
                </button>
              ),
            )}

          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            style={{
              background: pagina === totalPaginas ? "#f0ece8" : "#e8f0e0",
              border: "none",
              borderRadius: "6px",
              padding: "0.4rem 0.7rem",
              cursor: pagina === totalPaginas ? "default" : "pointer",
              color: pagina === totalPaginas ? "#b0a090" : "#4a6030",
              fontFamily: "Georgia, serif",
              fontSize: "0.85rem",
            }}
          >
            ›
          </button>
          <button
            onClick={() => setPagina(totalPaginas)}
            disabled={pagina === totalPaginas}
            style={{
              background: pagina === totalPaginas ? "#f0ece8" : "#e8f0e0",
              border: "none",
              borderRadius: "6px",
              padding: "0.4rem 0.7rem",
              cursor: pagina === totalPaginas ? "default" : "pointer",
              color: pagina === totalPaginas ? "#b0a090" : "#4a6030",
              fontFamily: "Georgia, serif",
              fontSize: "0.85rem",
            }}
          >
            »
          </button>
        </div>
      )}

      {/* Modal gestión de stock */}
      {modalGestion && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setModalGestion(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "2rem",
              width: "400px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "0.3rem" }}>Gestionar stock</h2>
            <p
              style={{
                color: "#7a6a5a",
                fontSize: "0.9rem",
                marginBottom: "0.3rem",
              }}
            >
              {modalGestion.nombre}
            </p>
            <p
              style={{
                color: "#9e8e7e",
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
              }}
            >
              Stock actual:{" "}
              <span
                style={{
                  color: modalGestion.stock < 10 ? "#c0392b" : "#3a3028",
                  fontWeight: "bold",
                }}
              >
                {modalGestion.stock} unidades
              </span>
              {modalGestion.productoFlor?.fechaCaducidad && (
                <span
                  style={{
                    marginLeft: "1rem",
                    color:
                      estadoCaducidad(
                        modalGestion.productoFlor.fechaCaducidad,
                      ) === "caducado"
                        ? "#c0392b"
                        : "#e67e22",
                  }}
                >
                  · Caduca:{" "}
                  {formatFecha(modalGestion.productoFlor.fechaCaducidad)}
                </span>
              )}
            </p>
            <div
              style={{ display: "flex", gap: "0.5rem", marginBottom: "1.2rem" }}
            >
              {[
                {
                  valor: "COMPRA",
                  label: "📦 Reponer",
                  desc: "Añadir unidades",
                },
                {
                  valor: "AJUSTE",
                  label: "✏️ Ajustar",
                  desc: "Corregir stock real",
                },
                {
                  valor: "BAJA",
                  label: "🗑️ Dar de baja",
                  desc: "Retirar unidades",
                },
              ].map((t) => (
                <button
                  key={t.valor}
                  onClick={() => {
                    setTipoMovimiento(t.valor);
                    setCantidad("");
                  }}
                  style={{
                    flex: 1,
                    padding: "0.6rem 0.4rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    border:
                      tipoMovimiento === t.valor
                        ? "2px solid #6b7c4a"
                        : "1px solid #e8ddd0",
                    background:
                      tipoMovimiento === t.valor ? "#e8f0e0" : "#f9f5f0",
                    color: tipoMovimiento === t.valor ? "#4a6030" : "#7a6a5a",
                    fontFamily: "Georgia, serif",
                    fontSize: "0.8rem",
                    textAlign: "center",
                  }}
                >
                  <div>{t.label}</div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      marginTop: "0.2rem",
                      opacity: 0.8,
                    }}
                  >
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
            <p
              style={{
                color: "#9e8e7e",
                fontSize: "0.82rem",
                marginBottom: "1rem",
                fontStyle: "italic",
              }}
            >
              {tipoMovimiento === "COMPRA" &&
                "Introduce las unidades que has recibido. Se sumarán al stock actual."}
              {tipoMovimiento === "AJUSTE" &&
                "Introduce el stock real que tienes ahora mismo. Se reemplazará el valor actual."}
              {tipoMovimiento === "BAJA" &&
                "Introduce las unidades a retirar por caducidad, rotura u otro motivo."}
            </p>
            <input
              type="number"
              min="0"
              placeholder={
                tipoMovimiento === "AJUSTE"
                  ? "Stock real actual"
                  : "Número de unidades"
              }
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              style={{
                width: "100%",
                fontSize: "0.95rem",
                marginBottom: "0.75rem",
              }}
            />
            <input
              placeholder="Motivo (opcional)"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              style={{
                width: "100%",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            />
            {nuevoStock !== null && (
              <div
                style={{
                  background: "#f0f7e8",
                  border: "1px solid #6b7c4a",
                  borderRadius: "8px",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: "#7a6a5a", fontSize: "0.85rem" }}>
                  Nuevo stock resultante
                </span>
                <span
                  style={{
                    color: "#4a6030",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  {nuevoStock} unidades
                </span>
              </div>
            )}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="btn-primary"
                onClick={confirmarMovimiento}
                style={{ flex: 1, padding: "0.75rem" }}
              >
                Confirmar
              </button>
              <button
                onClick={() => setModalGestion(null)}
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
        </div>
      )}
    </div>
  );
}

export default Productos;
