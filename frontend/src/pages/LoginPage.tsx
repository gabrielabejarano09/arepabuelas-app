import React, { useState } from 'react';
import axios, { AxiosError } from 'axios'; // 
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../assets/logo-blanco.png';


interface LoginResponse {
  token: string;
}

interface ApiError {
  message: string;
}

const LoginPage = () => {
  const [email, setCorreo] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

 
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post<LoginResponse>('http://localhost:4000/api/auth/login', {
        email,
        password,
      });
      

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/menu');
      }

    } catch (err) {
      
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiError>;
        const errorMessage = axiosError.response?.data?.message || 'Correo o contraseña incorrectos.';
        setError(errorMessage);
      } else {
        
        setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      }
      console.error('Error en el inicio de sesión:', err);
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
                
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCorreo(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                id="password"
                placeholder="Contraseña"
                value={password}
                // Tipamos el evento onChange
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="login-button">
              Iniciar Sesión
            </button>
            <p className="link-text">
              ¿No tienes cuenta? <Link className='link' to="/register">Registrate aquí</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;