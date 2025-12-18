import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const register = async (e) => {
    e.preventDefault(),
    setError("");

    try {
      const resp = await fetch(`${backendUrl}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        setError(data.msg || "Error al registrarse");
        return;
      }
      const loginResp = await fetch(`${backendUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResp.json();

      if (loginResp.ok && loginData.token) {
        sessionStorage.setItem("token", loginData.token);
        navigate("/private");
      } else {
        setError("Error al iniciar sesión automáticamente");
      }
    } catch {
      setError("Error de red");
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3 text-center">Registro</h4>
              
              <form onSubmit={register}>
                <div className="mb-3">
                  <label className="form-label" for="name">Nombre</label>
                  <input
                    className="form-control"
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" for="email">Email</label>
                  <input
                    className="form-control"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" for="password">Password</label>
                  <input
                    className="form-control"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="d-grid">
                  <button className="btn btn-primary" type="submit">
                    Crear cuenta
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center bg-white">
              <small className="text-muted">
                ¿Ya tienes cuenta?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/login");
                  }}
                >
                  Inicia sesión
                </a>
              </small>
            </div>
          </div>
          {error && <div style={{ color: "red" }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
