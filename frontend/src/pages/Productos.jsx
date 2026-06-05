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
        <div className="alerta alerta-stock">
          <span className="alerta-icono">⚠️</span>
          <div>
            <p className="alerta-titulo-stock">
              {stockCritico.length} producto{stockCritico.length > 1 ? "s" : ""}{" "}
              con stock crítico
            </p>
            <p className="alerta-texto">
              {stockCritico
                .map((p) => `${p.nombre} (${p.stock} ud.)`)
                .join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Alerta flores caducidad */}
      {esFlorista && floresCaducidad.length > 0 && (
        <div className="alerta alerta-caducidad">
          <span className="alerta-icono">🌸</span>
          <div>
            <p className="alerta-titulo-caducidad">
              {floresCaducidad.length} producto
              {floresCaducidad.length > 1 ? "s" : ""} con caducidad próxima o
              vencida
            </p>
            <p className="alerta-texto">
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
      <div className="card card-formulario">
        <h2>Añadir producto</h2>
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

        {esFlor && (
          <div className="form-row form-row-flor">
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

        {mensaje && <p className="mensaje-exito">{mensaje}</p>}
      </div>

      {/* Filtro y buscador */}
      <div className="filtro-container">
        <div className="filtro-inputs">
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
        <span className="filtro-info">
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
                <td className="td-secundario">{p.categoria?.nombre}</td>
                <td className="td-precio">{p.precio}€</td>
                <td>
                  <span className={p.stock < 10 ? "stock-critico" : "stock-ok"}>
                    {p.stock} {p.stock < 10 && "⚠️"}
                  </span>
                </td>
                {esFlorista && (
                  <td>
                    {p.productoFlor?.fechaCaducidad ? (
                      <span className={`caducidad-${estado}`}>
                        {formatFecha(p.productoFlor.fechaCaducidad)}
                        {estado === "caducado" && " ⛔"}
                        {estado === "proximo" && " ⚠️"}
                      </span>
                    ) : (
                      <span className="caducidad-sin">—</span>
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
                    className="btn-gestionar"
                    onClick={() => {
                      setModalGestion(p);
                      setCantidad("");
                      setMotivo("");
                      setTipoMovimiento("COMPRA");
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
        <div className="paginacion">
          <button
            className="paginacion-btn"
            onClick={() => setPagina(1)}
            disabled={pagina === 1}
          >
            «
          </button>
          <button
            className="paginacion-btn"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
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
                <span key={`dots-${i}`} className="filtro-info">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPagina(item)}
                  className={
                    pagina === item
                      ? "paginacion-btn-activo"
                      : "paginacion-btn-inactivo"
                  }
                >
                  {item}
                </button>
              ),
            )}

          <button
            className="paginacion-btn"
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
          >
            ›
          </button>
          <button
            className="paginacion-btn"
            onClick={() => setPagina(totalPaginas)}
            disabled={pagina === totalPaginas}
          >
            »
          </button>
        </div>
      )}

      {/* Modal gestión de stock */}
      {modalGestion && (
        <div className="modal-overlay" onClick={() => setModalGestion(null)}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <h2>Gestionar stock</h2>
            <p className="modal-subtitulo">{modalGestion.nombre}</p>
            <p className="modal-info">
              Stock actual:{" "}
              <span className={modalGestion.stock < 10 ? "stock-critico" : ""}>
                {modalGestion.stock} unidades
              </span>
              {modalGestion.productoFlor?.fechaCaducidad && (
                <span
                  className={
                    estadoCaducidad(
                      modalGestion.productoFlor.fechaCaducidad,
                    ) === "caducado"
                      ? "stock-critico"
                      : "caducidad-proximo"
                  }
                  style={{ marginLeft: "1rem" }}
                >
                  · Caduca:{" "}
                  {formatFecha(modalGestion.productoFlor.fechaCaducidad)}
                </span>
              )}
            </p>
            <div className="modal-tipos">
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
                  className={`modal-tipo-btn ${tipoMovimiento === t.valor ? "modal-tipo-activo" : "modal-tipo-inactivo"}`}
                >
                  <div>{t.label}</div>
                  <div className="modal-tipo-desc">{t.desc}</div>
                </button>
              ))}
            </div>
            <p className="modal-desc">
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
              className="modal-input"
            />
            <input
              placeholder="Motivo (opcional)"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="modal-input-motivo"
            />
            {nuevoStock !== null && (
              <div className="modal-resultado">
                <span className="modal-resultado-label">
                  Nuevo stock resultante
                </span>
                <span className="modal-resultado-valor">
                  {nuevoStock} unidades
                </span>
              </div>
            )}
            <div className="modal-acciones">
              <button
                className="btn-primary"
                onClick={confirmarMovimiento}
                style={{ flex: 1, padding: "0.75rem" }}
              >
                Confirmar
              </button>
              <button
                className="btn-cancelar"
                onClick={() => setModalGestion(null)}
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
