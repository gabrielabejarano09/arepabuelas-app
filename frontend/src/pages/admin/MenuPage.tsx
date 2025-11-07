import axios from "axios";
import "./MenuPage.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string | null;
}

const MenuPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = "http://localhost:4000";

  // Función para obtener los productos
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No estás autenticado.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${backendUrl}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      setError("No se pudieron cargar los productos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- NUEVA FUNCIÓN PARA ELIMINAR UN PRODUCTO ---
  const handleDelete = async (productId: number) => {
    // Pedimos confirmación al usuario para evitar borrados accidentales
    if (
      !window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      // Hacemos la llamada DELETE a la API con el ID del producto
      await axios.delete(`${backendUrl}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Si se elimina correctamente, actualizamos el estado para quitar el producto de la vista
      setProducts((currentProducts) =>
        currentProducts.filter((p) => p.id !== productId)
      );
    } catch (err) {
      console.error("Error al eliminar el producto:", err);
      alert("No se pudo eliminar el producto."); // Informamos al usuario del error
    }
  };

  if (loading) return <p>Cargando menú...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="menu-page">
      <header className="menu-header">
        <div>
          <h1>Menú</h1>
          <p>Aquí podrás añadir, eliminar o modificar los platos en tu menú</p>
        </div>
        <Link to="/menu/nuevo" className="add-plate-btn">
          Añadir plato al menú
        </Link>
      </header>

      <div className="product-grid">
        {products.map((product) => (
          // CAMBIO: Ahora la key está en el div exterior que contiene el Link y el botón
          <div key={product.id} className="product-card-wrapper">
            {/* 1. Envuelve el contenido principal en un Link */}
            <Link to={`/menu/edit/${product.id}`} className="product-card-link">
              <div className="product-card">
                <div className="card-main-content">
                  <div className="card-header">
                    {product.image ? (
                      <img
                        src={`${backendUrl}/uploads/products/${product.image}`}
                        alt={product.name}
                        className="product-image"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        Sin imagen
                      </div>
                    )}
                    <h3 className="name">{product.name}</h3>
                  </div>
                  <div className="product-info">
                    <p>{product.description}</p>
                    <div className="product-footer">
                      <span className="product-price">
                        ${product.price.toLocaleString("es-CO")}
                      </span>
                      <span className="product-capacity">
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* 2. El botón de eliminar se queda fuera del Link */}
            <button
              className="product-action-btn"
              onClick={() => handleDelete(product.id)}
            >
              -
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
