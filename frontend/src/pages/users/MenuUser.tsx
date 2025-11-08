import axios from "axios";
import "./MenuUser.css";
import { useEffect, useState, useRef } from "react";
// --- CAMBIO: Importamos el ícono 'Users' ---
import { ShoppingCart, Users } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { AxiosError } from 'axios';

// ... (Las interfaces Product y CartItem no cambian) ...
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string | null;
}

interface CartItem {
  product: Product;
  qty: number;
}


const MenuUser = () => {
  // ... (Toda la lógica de useState, useEffects, addToCart, etc., no cambia) ...
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const backendUrl = "http://localhost:4000";
  const cartRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Cerrar carrito si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setShowCart(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Obtener productos (el backend debe enviar los productos con un 'id' numérico)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/products`);
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  // La lógica del carrito vuelve a usar 'id' numérico
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCreatingOrder(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Por favor, inicia sesión para realizar una compra.");
        navigate("/login");
        return;
      }
      
      const orderPayload = {
        products: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.qty,
          price: item.product.price,
        })),
        totalAmount: total,
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data: response } = await axios.post(
        `${backendUrl}/api/orders`,
        orderPayload,
        config
      );
      
      const orderId = response.order.id;
      if (orderId) {
        setCart([]);
        navigate(`/payment/${orderId}`);
      } else {
        throw new Error("La respuesta del servidor no incluyó un ID de orden.");
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const message = error.response?.data?.message || "Error al procesar el pago ❌";
      alert(message);
    } finally {
      setIsCreatingOrder(false);
    }
  };


  return (
    <div className="menu-page">
      <header className="menu-header">
        {/* ... (El header y el carrito no cambian) ... */}
        <h1>Menú</h1>
        <div className="cart-wrapper" ref={cartRef}>
          <div className="cart-icon" onClick={() => setShowCart(!showCart)}>
            <ShoppingCart size={28} />
            {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
          </div>
          {showCart && (
            <div className="cart-dropdown">
              <h3>Orden</h3>
              {cart.length === 0 ? (<p>Tu carrito está vacío.</p>) : (
                <>
                  {cart.map((item) => (
                    <div key={item.product.id} className="cart-item">
                      <img src={`${backendUrl}/uploads/products/${item.product.image}`} alt={item.product.name} className="image" />
                      <div className="cart-info">
                        <p>{item.product.name}</p>
                        <p>${item.product.price.toLocaleString("es-CO")}</p>
                      </div>
                      <div className="qty-controls">
                        <button onClick={() => removeFromCart(item.product.id)}>-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => addToCart(item.product)}>+</button>
                      </div>
                    </div>
                  ))}
                  <div className="cart-total">
                    <strong>Total:</strong> ${total.toLocaleString("es-CO")}
                  </div>
                  <button className="checkout-btn" onClick={handleCheckout} disabled={isCreatingOrder}>
                    {isCreatingOrder ? "Procesando..." : "Ir a pagar"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="product-grid">
        {products.map((product) => (
          // --- 👇 TODA LA TARJETA HA SIDO REESTRUCTURADA 👇 ---
          <div key={product.id} className="product-card">
            {/* El onClick para abrir el modal ahora está en un div aparte */}
            <div className="card-clickable-area" onClick={() => setSelectedProduct(product)}>
              {product.image ? (
                <img src={`${backendUrl}/uploads/products/${product.image}`} alt={product.name} className="product-image"/>
              ) : (
                <div className="product-image-placeholder">Sin imagen</div>
              )}
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              
              <div className="product-meta">
                <span className="product-price">${product.price.toLocaleString("es-CO")}</span>
                <span className="product-stock">
                  <Users size={18} />
                  {product.stock}
                </span>
              </div>
            </div>

            {/* Este es el nuevo botón de "Añadir a Carrito" */}
            <button
              className="card-add-btn"
              onClick={(e) => {
                e.stopPropagation(); // Evita que se abra el modal al hacer clic
                addToCart(product);
              }}
            >
              Añadir a Carrito
            </button>
          </div>
        ))}
      </div>

      {/* ... (El modal no cambia) ... */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={`${backendUrl}/uploads/products/${selectedProduct.image}`} alt={selectedProduct.name} className="modal-image"/>
            <h2>{selectedProduct.name}</h2>
            <p>{selectedProduct.description}</p>
            <p className="modal-price">${selectedProduct.price.toLocaleString("es-CO")}</p>
            <button className="add-cart-btn" onClick={() => {addToCart(selectedProduct); setSelectedProduct(null);}}>Añadir al carrito</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuUser;