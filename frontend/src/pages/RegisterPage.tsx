import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Asumo que compartes estilos con la página de login
import logo from '../assets/logo-blanco.png';

// Interfaz para la respuesta del backend (ya no esperamos un token, solo un mensaje)
interface RegisterResponse {
  message: string;
  user?: unknown; // El backend devuelve el usuario creado
}

// Interfaz para los errores de la API
interface ApiError {
  message?: string;
  errors?: { msg: string }[];
}

const RegisterPage = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [photo, setPhoto] = useState<File | null>(null); // Estado para la foto
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false); // Estado para feedback visual
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!photo) {
      setError('Por favor, selecciona una foto de perfil.');
      return;
    }
    
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('photo', photo);

    try {
      // No establecemos 'Content-Type', el navegador lo hace por nosotros con FormData
      const response = await axios.post<RegisterResponse>(
        'http://localhost:4000/api/auth/register',
        formData
      );

      if (response.status === 201) {
        alert(response.data.message || '¡Registro exitoso! Serás redirigido para iniciar sesión y esperar la aprobación.');
        navigate('/login');
      }

    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiError>;
        
        if (axiosError.response?.data?.errors) {
          setError(axiosError.response.data.errors[0].msg);
        } else {
          setError(axiosError.response?.data?.message || 'Error al registrarte.');
        }
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
        setLoading(false);
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
                placeholder="Contraseña (mínimo 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              {/* Etiqueta estilizada que activa el input de archivo */}
              <label htmlFor="photo-upload" className="photo-upload-label">
                {photo ? `Archivo: ${photo.name}` : 'Selecciona tu foto de perfil'}
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/png, image/jpeg, image/webp" // Acepta solo imágenes
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setPhoto(e.target.files[0]);
                  }
                }}
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
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