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
    <div
      style={{
        minHeight: "100vh",
        background: "#f9f5f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "3rem",
          width: "400px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          border: "1px solid #e8ddd0",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🌸</div>
        <h1
          style={{
            fontSize: "1.8rem",
            marginBottom: "0.3rem",
            color: "#3a3028",
          }}
        >
          Café Primavera
        </h1>
        <p
          style={{
            color: "#9e8e7e",
            fontSize: "0.9rem",
            marginBottom: "2rem",
            fontStyle: "italic",
          }}
        >
          Sistema de gestión
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              textAlign: "left",
            }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              textAlign: "left",
            }}
          />
        </div>

        {error && (
          <p
            style={{
              color: "#c0392b",
              fontSize: "0.9rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary"
          style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}

export default Login;
