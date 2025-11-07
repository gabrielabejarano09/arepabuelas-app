import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // <-- 1. Importar la función jwtDecode como exportación nombrada
import "./LoginPage.css";
import logo from "../assets/logo-blanco.png";

interface LoginResponse {
  token: string;
}

// 2. Definir una interfaz para los datos que esperamos dentro del token
interface DecodedToken {
  id: string;
  role: "ADMIN" | "USER"; // Asumimos que los roles son 'admin' o 'user'
  // ...otros campos que pueda tener tu token
}

interface ApiError {
  message: string;
}

const LoginPage = () => {
  // Corregido: Nombres de estado y setter consistentes
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post<LoginResponse>(
        "http://localhost:4000/api/auth/login",
        {
          email,
          password,
        }
      );

      if (response.data.token) {
        const { token } = response.data;
        localStorage.setItem("token", token);

        // --- 3. Lógica de redirección por rol ---
        try {
          const decodedToken = jwtDecode<DecodedToken>(token);
          const userRole = decodedToken.role;

          if (userRole === "ADMIN") {
            navigate("/menu"); // Redirigir al admin al menú de administración
          } else {
            navigate("/home"); // Redirigir al usuario normal a su página de inicio
          }
        } catch (decodeError) {
          setError("El token recibido no es válido.");
          console.error("Error al decodificar el token:", decodeError);
        }
        // --- Fin de la lógica de redirección ---
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiError>;
        const errorMessage =
          axiosError.response?.data?.message ||
          "Correo o contraseña incorrectos.";
        setError(errorMessage);
      } else {
        setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }
      console.error("Error en el inicio de sesión:", err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo-section">
        <img src={logo} alt="Logo Arepabuelas" className="logo" />
        <h1 className="brand-name">arepabuelas</h1>
        <p className="tagline">Arepas Tradicionales</p>
      </div>
      <div className="login-form-section">
        <div className="form-wrapper">
          <h2>¡Bienvenido!</h2>
          <p className="subtitle">Inicia Sesión</p>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                id="email"
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                id="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="login-button">
              Iniciar Sesión
            </button>
            <p className="link-text">
              ¿No tienes cuenta?{" "}
              <Link className="link" to="/register">
                Registrate aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
