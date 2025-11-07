import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../assets/logo-blanco.png';

interface RegisterResponse {
  token: string;
}

interface ApiError {
  message?: string;
  errors?: { msg: string }[];
}

const RegisterPage = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post<RegisterResponse>(
        'http://localhost:4000/api/auth/register',
        {
          name,
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        }
      );

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/menu');
      }

    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiError>;
        
        // Si viene lista de errores (express-validator)
        if (axiosError.response?.data?.errors) {
          setError(axiosError.response.data.errors[0].msg);
        } else {
          setError(axiosError.response?.data?.message || 'Error al registrarte.');
        }
      } else {
        setError('Ocurrió un error inesperado.');
      }
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
          <h2>Crear cuenta</h2>
          <p className="subtitle">Regístrate</p>
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="email"
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="login-button">
              Registrarse
            </button>

            <p className="link-text">
              ¿Ya tienes cuenta? <Link className='link' to="/login">Inicia sesión aquí</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
