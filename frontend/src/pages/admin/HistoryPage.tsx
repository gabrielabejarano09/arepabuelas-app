import { useEffect, useState } from "react";
import axios from "axios";
import "./HistoryPage.css"; 

// --- CAMBIO: La interfaz de Item ahora incluye el nombre del producto ---
interface OrderItem {
  product_id: number;
  quantity: number;
  price: string;
  name: string; // <-- Nuevo campo
}

// --- CAMBIO: La interfaz de Orden ahora incluye el email del usuario ---
interface Order {
  id: number;
  total: string;
  coupon: string | null;
  created_at: string;
  user_email: string; // <-- Nuevo campo
  items: OrderItem[];
}

const HistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const backendUrl = "http://localhost:4000";

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // --- CAMBIO: Llamamos a la nueva ruta de administrador ---
        const response = await axios.get(`${backendUrl}/api/orders/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (err) {
        setError("No se pudo cargar el historial. Es posible que no tengas permisos de administrador.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  if (loading) return <p>Cargando historial de todas las órdenes...</p>;

  return (
    <div className="history-page">
      <h1>Historial de Todas las Órdenes (Admin)</h1>

      {orders.length > 0 ? (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Orden #{order.id}</h3>
                  {/* --- CAMBIO: Mostramos el email del usuario --- */}
                  <p className="user-email"><strong>Usuario:</strong> {order.user_email}</p>
                </div>
                <span className="order-date">
                  {new Date(order.created_at).toLocaleDateString("es-CO", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
              </div>
              <div className="order-body">
                <h4>Productos:</h4>
                <ul className="order-items-list">
                  {order.items.map((item, index) => (
                    <li key={index} className="order-item">
                      {/* --- CAMBIO: Mostramos el nombre del producto en lugar del ID --- */}
                      <span>{item.name} (x{item.quantity})</span>
                      <span>${Number(item.price).toLocaleString("es-CO")}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-footer">
                <div>
                  {order.coupon && (
                    <span className="coupon-tag">Cupón: {order.coupon}</span>
                  )}
                </div>
                <strong className="order-total">
                  Total: ${Number(order.total).toLocaleString("es-CO")}
                </strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No se ha realizado ninguna compra en la plataforma.</p>
      )}
    </div>
  );
};

export default HistoryPage;