import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../admin/AddProductPage'; // Reutilizamos los mismos estilos

const EditProductPage = () => {
  const { id } = useParams<{ id: string }>(); // Obtiene el ID del producto de la URL
  const navigate = useNavigate();

  // Estados para los campos del formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [image, setImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null); // Para mostrar la imagen actual

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backendUrl = 'http://localhost:4000';

  // 1. useEffect para cargar los datos del producto cuando el componente se monta
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/products/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const product = response.data;
        
        // Rellenamos el formulario con los datos obtenidos
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setStock(product.stock);
        if (product.image) {
          setExistingImageUrl(`${backendUrl}/uploads/products/${product.image}`);
        }
      } catch (err) {
        setError('No se pudo cargar la información del producto.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]); // Se ejecuta cada vez que el ID de la URL cambia

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // 2. Función para enviar los datos actualizados
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', String(price));
    formData.append('stock', String(stock));
    if (image) { // Solo añadimos la imagen si el usuario seleccionó una nueva
      formData.append('image', image);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${backendUrl}/api/products/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/menu'); // Redirige al menú después de actualizar
    } catch (err) {
      setError('No se pudo actualizar el producto.');
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando producto...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="add-product-container">
      <h1>Editar Plato</h1>
      <form className="add-product-form" onSubmit={handleSubmit}>
        {/* Mostramos la imagen actual si existe */}
        {existingImageUrl && (
          <div className="form-group image-preview">
            <label>Imagen Actual</label>
            <img src={existingImageUrl} alt="Vista previa del producto" />
          </div>
        )}

        {/* ... (el resto del formulario es casi idéntico al de AddProductPage) ... */}
        <div className="form-group">
          <label htmlFor="name">Nombre del Plato</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4}></textarea>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Precio</label>
            <input type="number" id="price" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label htmlFor="stock">Cantidad en Stock</label>
            <input type="number" id="stock" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="image">Cambiar Imagen (opcional)</label>
          <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/menu')}>Cancelar</button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;