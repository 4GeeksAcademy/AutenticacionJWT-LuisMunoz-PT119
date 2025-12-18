
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleLogin = async (e) => {
        e.preventDefault();
            setError("");

        try {
            const resp = await fetch(
                `${backendUrl}/api/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                }
            );

            const data = await resp.json();


            if (resp.ok && data.token) {
                sessionStorage.setItem("token", data.token);
                navigate("/private");
            } else {
                setError(data.msg || "Credenciales incorrectas");
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
                            <h4 className="card-title mb-3 text-center">Iniciar sesión</h4>

                            <form onSubmit={handleLogin}>
                                <div className="mb-3">
                                    <label className="form-label" for="email" >Email</label><br />
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
                                    />
                                </div>
                                <div className="d-grid">
                                    <button className="mt-2 btn btn-primary" type="submit">Inicia sesión</button>
                                </div>
                            </form>

                            <div className="card-footer text-center bg-white">
                                <small className="text-muted">¿No tienes cuenta?
                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        navigate("/register");
                                    }
                                    }>Regístrate</a>
                                </small>
                            </div>
                            {error && <div style={{ color: "red" }}>{error}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

