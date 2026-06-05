import { useState } from "react";
import api from "../services/api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return setError("Introduce email y contraseña");
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      onLogin(res.data);
    } catch (e) {
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-emoji">🌸</div>
        <h1 className="login-titulo">Café Primavera</h1>
        <p className="login-subtitulo">Sistema de gestión</p>

        <div className="login-campos">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="login-input"
          />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary login-btn"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}

export default Login;
