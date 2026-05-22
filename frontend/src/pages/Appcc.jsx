import { useEffect, useState } from "react";
import api from "../services/api";

const TIPOS = [
  { valor: "TEMPERATURA_CAMARA", label: "Temperatura cámara frigorífica" },
  { valor: "RECEPCION_MERCANCIA", label: "Recepción de mercancía" },
  { valor: "LIMPIEZA", label: "Limpieza y desinfección" },
  { valor: "CONTROL_CADUCIDAD", label: "Control de caducidades" },
  { valor: "CONTROL_ALERGENOS", label: "Control de alérgenos" },
  { valor: "ESTADO_FLORES", label: "Estado de las flores" },
];

function Appcc() {
  const [registros, setRegistros] = useState([]);
  const [tipo, setTipo] = useState("TEMPERATURA_CAMARA");
  const [descripcion, setDescripcion] = useState("");
  const [valor, setValor] = useState("");
  const [resultado, setResultado] = useState("CORRECTO");
  const [observaciones, setObservaciones] = useState("");
  const [filtro, setFiltro] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalEditar, setModalEditar] = useState(null);
  const [editTipo, setEditTipo] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editValor, setEditValor] = useState("");
  const [editResultado, setEditResultado] = useState("");
  const [editObservaciones, setEditObservaciones] = useState("");

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    api.get("/appcc").then((res) => setRegistros(res.data));
  }, []);

  const crearRegistro = () => {
    if (!descripcion) return setMensaje("La descripción es obligatoria");
    api
      .post("/appcc", {
        tipo,
        descripcion,
        valor,
        resultado,
        observaciones,
        empleado: { id: usuario.id },
      })
      .then(() => {
        api.get("/appcc").then((res) => setRegistros(res.data));
        setDescripcion("");
        setValor("");
        setObservaciones("");
        setResultado("CORRECTO");
        setMensaje("Registro creado correctamente");
      })
      .catch(() => setMensaje("Error al crear el registro"));
  };

  const abrirEditar = (registro) => {
    setModalEditar(registro);
    setEditTipo(registro.tipo);
    setEditDescripcion(registro.descripcion);
    setEditValor(registro.valor || "");
    setEditResultado(registro.resultado);
    setEditObservaciones(registro.observaciones || "");
    setMensaje("");
  };

  const guardarEdicion = () => {
    if (!editDescripcion) return setMensaje("La descripción es obligatoria");
    api
      .put(`/appcc/${modalEditar.id}`, {
        ...modalEditar,
        tipo: editTipo,
        descripcion: editDescripcion,
        valor: editValor,
        resultado: editResultado,
        observaciones: editObservaciones,
        empleado: { id: modalEditar.empleado?.id || usuario.id },
      })
      .then((res) => {
        setRegistros(
          registros.map((r) => (r.id === modalEditar.id ? res.data : r)),
        );
        setModalEditar(null);
        setMensaje("Registro actualizado correctamente");
      })
      .catch(() => setMensaje("Error al actualizar el registro"));
  };

  const registrosFiltrados = filtro
    ? registros.filter((r) => r.tipo === filtro)
    : registros;

  const labelTipo = (tipo) =>
    TIPOS.find((t) => t.valor === tipo)?.label || tipo;

  return (
    <div className="page">
      <h1>Control APPCC</h1>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Nuevo registro</h2>
        <div className="form-row" style={{ marginBottom: "1rem" }}>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{ flex: 2 }}
          >
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={resultado}
            onChange={(e) => setResultado(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="CORRECTO">Correcto</option>
            <option value="INCIDENCIA">Incidencia</option>
          </select>
        </div>
        <div className="form-row" style={{ marginBottom: "1rem" }}>
          <input
            placeholder="Descripción *"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={{ flex: 3 }}
          />
          <input
            placeholder="Valor medido (ej: 4°C)"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <div className="form-row">
          <input
            placeholder="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn-primary" onClick={crearRegistro}>
            Registrar
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

      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <select onChange={(e) => setFiltro(e.target.value)}>
          <option value="">Todos los controles</option>
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.label}
            </option>
          ))}
        </select>
        <span style={{ color: "#9e8e7e", fontSize: "0.85rem" }}>
          {
            registrosFiltrados.filter((r) => r.resultado === "INCIDENCIA")
              .length
          }{" "}
          incidencias
        </span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Valor</th>
            <th>Resultado</th>
            <th>Fecha</th>
            <th>Empleado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {registrosFiltrados.map((r) => (
            <tr key={r.id}>
              <td style={{ color: "#7a6a5a", fontSize: "0.85rem" }}>
                {labelTipo(r.tipo)}
              </td>
              <td>{r.descripcion}</td>
              <td style={{ color: "#7a6a5a" }}>{r.valor || "—"}</td>
              <td>
                <span
                  className={
                    r.resultado === "INCIDENCIA"
                      ? "badge badge-red"
                      : "badge badge-green"
                  }
                >
                  {r.resultado}
                </span>
              </td>
              <td style={{ color: "#7a6a5a", fontSize: "0.85rem" }}>
                {new Date(r.fecha).toLocaleString("es-ES")}
              </td>
              <td style={{ color: "#7a6a5a", fontSize: "0.85rem" }}>
                {r.empleado?.nombre || "—"}
              </td>
              <td>
                <button
                  onClick={() => abrirEditar(r)}
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
                  ✏️ Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal editar */}
      {modalEditar && (
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
          onClick={() => setModalEditar(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "2rem",
              width: "480px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>Editar registro APPCC</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div className="form-row">
                <select
                  value={editTipo}
                  onChange={(e) => setEditTipo(e.target.value)}
                  style={{ flex: 2 }}
                >
                  {TIPOS.map((t) => (
                    <option key={t.valor} value={t.valor}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <select
                  value={editResultado}
                  onChange={(e) => setEditResultado(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="CORRECTO">Correcto</option>
                  <option value="INCIDENCIA">Incidencia</option>
                </select>
              </div>
              <div className="form-row">
                <input
                  placeholder="Descripción *"
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  style={{ flex: 3 }}
                />
                <input
                  placeholder="Valor medido"
                  value={editValor}
                  onChange={(e) => setEditValor(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
              <input
                placeholder="Observaciones"
                value={editObservaciones}
                onChange={(e) => setEditObservaciones(e.target.value)}
              />
            </div>
            {mensaje && (
              <p
                style={{
                  color: "#c0392b",
                  fontSize: "0.85rem",
                  marginTop: "0.75rem",
                }}
              >
                {mensaje}
              </p>
            )}
            <div
              style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}
            >
              <button
                className="btn-primary"
                onClick={guardarEdicion}
                style={{ flex: 1, padding: "0.75rem" }}
              >
                Guardar cambios
              </button>
              <button
                onClick={() => setModalEditar(null)}
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

export default Appcc;
