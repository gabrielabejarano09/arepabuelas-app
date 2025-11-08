import React, { useEffect, useState } from "react";
import axios from "axios";

interface Product {
  name: string;
  price: number;
  image?: string;
}

interface Item {
  product: Product;
  qty: number;
}

interface Order {
  _id: string;
  items: Item[];
  total: number;
  status: string;
  createdAt: string;
}

const HistorialUser: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:4000/orders", {
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

  if (loading) return <p>Cargando historial...</p>;

  if (orders.length === 0) return <p>No tienes compras realizadas aún.</p>;

  return (
    <div className="historialUser">
      <h2>Historial de compras</h2>
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Total:</strong> ${order.total.toFixed(2)}
            </p>
          </div>
          <div className="order-items">
            {order.items.map((item, idx) => (
              <div key={idx} className="order-item">
                {item.product.image && (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="item-img"
                  />
                )}
                <p>{item.product.name}</p>
                <p>Cantidad: {item.qty}</p>
                <p>Precio: ${item.product.price}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistorialUser;
