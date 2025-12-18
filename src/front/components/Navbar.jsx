import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "/src/front/pages/navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
      <div className="container">
        <Link className="navbar-brand custom-brand" to="/">Autentificacion JWT</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <div className="ms-auto d-flex align-items-center">
            {!token && (
              <>
                <Link className="btn nav-btn-custom text-white me-2" to="/register">Registrate</Link>
                <Link className="btn nav-btn-custom text-white me-2" to="/login">Login</Link>
              </>
            )}
            {token && (
              <button className="btn logout-btn px-4" onClick={handleLogout}>Cerrar sesión</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}