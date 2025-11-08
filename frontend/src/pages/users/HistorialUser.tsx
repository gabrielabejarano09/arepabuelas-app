import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HistorialUser.css"; // <-- Asegúrate que la ruta a tu CSS es correcta

// Interfaces (sin cambios)
interface OrderItem {
  product_id: number;
  quantity: number;
  price: string;
  name: string;
  image: string;
}

interface Order {
  id: string;
  total: string;
  coupon?: string;
  created_at: string;
  items: OrderItem[];
}

const HistorialUser: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = "http://localhost:4000";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${backendUrl}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data);
      } catch (error) {
        console.error("Error al obtener historial:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-8">Cargando historial...</p>;
  if (orders.length === 0) return <p className="text-center mt-8">No tienes compras realizadas aún.</p>;

  return (
    // CAMBIO: Contenedor principal ahora usa la clase 'history-page'
    <div className="history-page">
      {/* CAMBIO: Título ahora es un h1 para coincidir con el CSS */}
      <h1>Mi Historial de Compras</h1>

      {/* CAMBIO: Se añade el div '.orders-list' que esperaba el CSS */}
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            
            <div className="order-header">
              {/* CAMBIO: Estructura de la cabecera ajustada */}
              <h3>Pedido #{order.id}</h3>
              <span className="order-date">
                {new Date(order.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* CAMBIO: Se añade '.order-body' para la sección de productos */}
            <div className="order-body">
              <h4>Productos</h4>
              {/* CAMBIO: Se usa <ul> para la lista, como es semánticamente correcto */}
              <ul className="order-items-list">
                {order.items.map((item, idx) => (
                  // CAMBIO: Cada item es un <li> con la clase '.order-item'
                  <li key={idx} className="order-item">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>${Number(item.price).toLocaleString("es-CO")}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CAMBIO: Se añade la sección '.order-footer' para el cupón y el total */}
            <div className="order-footer">
              <div>
                {order.coupon && (
                  <span className="coupon-tag">Cupón: {order.coupon}</span>
                )}
              </div>
              <span className="order-total">
                Total: ${Number(order.total).toLocaleString("es-CO")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorialUser;