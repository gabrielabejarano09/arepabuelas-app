import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddProductPage.css';

const AddProductPage = () => {
  // CAMBIO: Nombres de estado coinciden con la API (name, description, price, stock)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [image, setImage] = useState<File | null>(null); // CAMBIO: 'image' en lugar de 'imagen'

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name || !description || price === '' || stock === '' || !image) {
      setError('Todos los campos, incluyendo la imagen, son obligatorios.');
      setLoading(false);
      return;
    }

    // FormData para enviar archivos y texto juntos
    const formData = new FormData();
    // CAMBIO: Las claves coinciden con req.body y req.file en tu backend
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', String(price));
    formData.append('stock', String(stock));
    formData.append('image', image); // CAMBIO: 'image' es el nombre que espera multer

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:4000/api/products', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Esencial para la subida de archivos
        },
      });

      navigate('/menu');
    } catch (err) {
      setError('No se pudo crear el producto. Inténtalo de nuevo.');
      console.error('Error al crear producto:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h1>Añadir Nuevo Plato</h1>
      <form className="add-product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          {/* CAMBIO: htmlFor, id y onChange usan 'name' */}
          <label htmlFor="name">Nombre del Plato</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Arepa de Choclo"
          />
        </div>

        <div className="form-group">
          {/* CAMBIO: htmlFor, id y onChange usan 'description' */}
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Ej: Deliciosa arepa hecha a base de maíz tierno..."
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            {/* CAMBIO: htmlFor, id y onChange usan 'price' */}
            <label htmlFor="price">Precio</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ej: 5000"
            />
          </div>
          <div className="form-group">
            {/* CAMBIO: htmlFor, id y onChange usan 'stock' */}
            <label htmlFor="stock">Cantidad en Stock</label>
            <input
              type="number"
              id="stock"
              value={stock}
              onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ej: 50"
            />
          </div>
        </div>

        <div className="form-group">
          {/* CAMBIO: htmlFor, id y onChange usan 'image' */}
          <label htmlFor="image">Imagen del Plato</label>
          <input
            type="file"
            id="image"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleImageChange}
          />
        </div>

        {error && <p className="error-message">{error}</p>}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/menu')}>
            Cancelar
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Plato'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;