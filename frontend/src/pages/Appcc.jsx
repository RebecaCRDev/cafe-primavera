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

      <div className="card card-formulario">
        <h2>Nuevo registro</h2>
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
        {mensaje && <p className="mensaje-exito">{mensaje}</p>}
      </div>

      <div className="appcc-filtro">
        <select onChange={(e) => setFiltro(e.target.value)}>
          <option value="">Todos los controles</option>
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.label}
            </option>
          ))}
        </select>
        <span className="appcc-incidencias">
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
              <td className="td-secundario" style={{ fontSize: "0.85rem" }}>
                {labelTipo(r.tipo)}
              </td>
              <td>{r.descripcion}</td>
              <td className="td-secundario">{r.valor || "—"}</td>
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
              <td className="td-secundario" style={{ fontSize: "0.85rem" }}>
                {new Date(r.fecha).toLocaleString("es-ES")}
              </td>
              <td className="td-secundario" style={{ fontSize: "0.85rem" }}>
                {r.empleado?.nombre || "—"}
              </td>
              <td>
                <button className="btn-editar" onClick={() => abrirEditar(r)}>
                  ✏️ Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalEditar && (
        <div className="modal-overlay" onClick={() => setModalEditar(null)}>
          <div className="appcc-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Editar registro APPCC</h2>
            <div className="appcc-modal-campos">
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
            {mensaje && <p className="mensaje-error">{mensaje}</p>}
            <div className="appcc-modal-acciones">
              <button
                className="btn-primary"
                onClick={guardarEdicion}
                style={{ flex: 1, padding: "0.75rem" }}
              >
                Guardar cambios
              </button>
              <button
                className="btn-cancelar"
                onClick={() => setModalEditar(null)}
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
