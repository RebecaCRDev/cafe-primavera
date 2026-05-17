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
      .then((res) => {
        setRegistros([res.data, ...registros]);
        setDescripcion("");
        setValor("");
        setObservaciones("");
        setResultado("CORRECTO");
        setMensaje("Registro creado correctamente");
      })
      .catch(() => setMensaje("Error al crear el registro"));
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Appcc;
