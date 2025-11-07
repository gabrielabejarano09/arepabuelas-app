import axios from "axios";
import "./MenuUser.css";
import { useEffect, useState, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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

  // Obtener productos
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

  // Añadir al carrito
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

  // Quitar del carrito
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

  const handleCheckout = () => {
    navigate("/payment");
  };

  return (
    <div className="menu-page">
      {/* Header */}
      <header className="menu-header">
        <h1>Menú</h1>
        <div className="cart-wrapper" ref={cartRef}>
          <div className="cart-icon" onClick={() => setShowCart(!showCart)}>
            <ShoppingCart size={28} />
            {cart.length > 0 && (
              <span className="cart-count">{cart.length}</span>
            )}
          </div>

          {/* Dropdown del carrito */}
          {showCart && (
            <div className="cart-dropdown">
              <h3>Orden</h3>
              {cart.length === 0 ? (
                <p>Tu carrito está vacío.</p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.product.id} className="cart-item">
                      <img
                        src={`${backendUrl}/uploads/products/${item.product.image}`}
                        alt={item.product.name}
                      />
                      <div className="cart-info">
                        <p>{item.product.name}</p>
                        <p>${item.product.price.toLocaleString("es-CO")}</p>
                      </div>
                      <div className="qty-controls">
                        <button onClick={() => removeFromCart(item.product.id)}>
                          -
                        </button>
                        <span>{item.qty}</span>
                        <button onClick={() => addToCart(item.product)}>
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="cart-total">
                    <strong>Total:</strong> ${total.toLocaleString("es-CO")}
                  </div>
                  <button className="checkout-btn" onClick={handleCheckout}>
                    Ir a pagar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Grid de productos */}
      <div className="product-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => setSelectedProduct(product)}
          >
            {product.image ? (
              <img
                src={`${backendUrl}/uploads/products/${product.image}`}
                alt={product.name}
                className="product-image"
              />
            ) : (
              <div className="product-image-placeholder">Sin imagen</div>
            )}
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="product-footer">
              <span className="product-price">
                ${product.price.toLocaleString("es-CO")}
              </span>
              <span className="product-stock">
                Disponibles: {product.stock}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal del producto */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${backendUrl}/uploads/products/${selectedProduct.image}`}
              alt={selectedProduct.name}
              className="modal-image"
            />
            <h2>{selectedProduct.name}</h2>
            <p>{selectedProduct.description}</p>
            <p className="modal-price">
              ${selectedProduct.price.toLocaleString("es-CO")}
            </p>
            <button
              className="add-cart-btn"
              onClick={() => {
                addToCart(selectedProduct);
                setSelectedProduct(null);
              }}
            >
              Añadir al carrito
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuUser;
