import React, { useEffect, useState } from "react";
import axios from "axios";

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
}

interface Order {
  id: string;
  total: number;
  coupon?: string;
  created_at: string;
  items: OrderItem[];
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

        // 🔹 (Opcional) Puedes hacer otra petición para traer nombres/imágenes de productos
        // o simplemente mostrar los IDs por ahora.
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
        <div
          key={order.id}
          className="order-card border p-4 rounded-xl my-3 shadow"
        >
          <div className="order-header flex justify-between">
            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(order.created_at).toLocaleDateString()}
            </p>
            <p>
              <strong>Total:</strong> ${order.total.toFixed(2)}
            </p>
            {order.coupon && (
              <p className="text-green-600">
                <strong>Cupón aplicado:</strong> {order.coupon}
              </p>
            )}
          </div>

          <div className="order-items mt-2">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="order-item flex items-center gap-4 border-t py-2"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name || `Producto ${item.product_id}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <p>
                    <strong>Producto:</strong>{" "}
                    {item.name || `ID ${item.product_id}`}
                  </p>
                  <p>Cantidad: {item.quantity}</p>
                  <p>Precio: ${item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistorialUser;
