import { useEffect, useState } from "react";
import axios from "axios";
import "./HistoryPage.css"; // Crearemos este archivo para los estilos

// Interfaz para un item dentro de una orden
interface OrderItem {
  product_id: number;
  quantity: number;
  price: string; // El precio viene como string desde la BD
  // Podrías añadir 'name' si modificas el backend para unirlo
}

// Interfaz para una orden completa
interface Order {
  id: number;
  total: string;
  coupon: string | null;
  created_at: string; // La fecha viene como un string ISO
  items: OrderItem[];
}

const HistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = "http://localhost:4000";

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        // Tu backend ya tiene la ruta GET '/' en order.routes.js para esto
        const response = await axios.get(`${backendUrl}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (err) {
        setError("No se pudo cargar el historial de órdenes.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, []); // El array vacío asegura que esto se ejecute solo una vez

  if (loading) return <p>Cargando historial...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="history-page">
      <h1>Historial de Órdenes</h1>

      {orders.length > 0 ? (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Orden #{order.id}</h3>
                <span className="order-date">
                  {/* Formateamos la fecha para que sea más legible */}
                  {new Date(order.created_at).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="order-body">
                <h4>Productos:</h4>
                <ul className="order-items-list">
                  {order.items.map((item, index) => (
                    <li key={index} className="order-item">
                      <span>Producto ID: {item.product_id}</span>
                      <span>Cantidad: {item.quantity}</span>
                      <span>
                        Precio Unitario: $
                        {parseFloat(item.price).toLocaleString("es-CO")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-footer">
                {order.coupon && (
                  <span className="coupon-tag">Cupón: {order.coupon}</span>
                )}
                <strong className="order-total">
                  Total: ${parseFloat(order.total).toLocaleString("es-CO")}
                </strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Aún no has realizado ninguna compra.</p>
      )}
    </div>
  );
};

export default HistoryPage;
