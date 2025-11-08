import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // <-- 1. Importar useParams
import axios from "axios"; // Usaremos axios para consistencia
import "./PaymentUser.css";
import { AxiosError } from 'axios';

// Interfaces actualizadas para reflejar los datos que traerá el backend
interface OrderItem {
  name: string; // <-- Ahora tendremos el nombre del producto
  image: string; // <-- Y la imagen
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  total: number;
  coupon?: string;
  items: OrderItem[];
}

const PaymentUser: React.FC = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cardHolder: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>(); // <-- 2. Obtener el ID de la URL
  const backendUrl = "http://localhost:4000";

  // 3. useEffect ahora busca una sola orden usando el orderId de la URL
  useEffect(() => {
    if (!orderId) {
      setError("No se especificó un ID de orden.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        // Hacemos la llamada al nuevo endpoint GET /api/orders/:id
        const { data } = await axios.get(`${backendUrl}/api/orders/${orderId}`, config);
        setOrder(data);
      } catch (err) {
        console.error("Error al obtener la orden:", err);
        setError("No se pudo cargar la orden. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]); // El efecto se ejecuta si el orderId cambia

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    // El ID de la orden ahora viene del parámetro de la URL, no del estado
    if (!orderId) {
      alert("Error: No hay ID de orden para pagar.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        orderId: orderId, // <-- 4. Usamos el orderId de la URL
        paymentDetails: formData,
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(`${backendUrl}/api/orders/pay`, payload, config);

      alert("Pago realizado con éxito ✅");
      navigate("/purchased"); // Redirige al historial de órdenes
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;

    // 4. El resto de tu lógica funciona igual, pero ahora es 100% seguro en tipos
    const message = error.response?.data?.message || "Error al procesar el pago ❌";
    setError(message);
    alert(message);
    }
  };

  if (loading) {
    return <div className="checkout-page"><p>Cargando orden...</p></div>;
  }

  if (error) {
    return <div className="checkout-page"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-content">
        <h2>Pagar Orden #{order?.id}</h2>

        {order ? (
          <div className="checkout-sections">
            <div className="order-section">
              <h3>Resumen del Pedido</h3>
              {order.items.map((item, i) => (
                <div key={i} className="order-item">
                  <img src={`${backendUrl}/uploads/products/${item.image}`} alt={item.name} />
                  <div>
                    <p className="product-name">{item.name} (x{item.quantity})</p>
                    <p>$ {item.price.toLocaleString("es-CO")}</p>
                  </div>
                </div>
              ))}
              {order.coupon && <p className="coupon">Cupón aplicado: {order.coupon}</p>}
              <p className="total">Total a Pagar: ${Number(order.total).toLocaleString("es-CO")}</p>
            </div>

            <div className="payment-section">
              <h3>Información de pago</h3>
              <form onSubmit={handlePay}>
                <input type="text" name="cardHolder" placeholder="Nombre en la tarjeta" value={formData.cardHolder} onChange={handleInputChange} required />
                <input type="text" name="cardNumber" placeholder="Número de tarjeta (ej: 4242...)" value={formData.cardNumber} onChange={handleInputChange} required />
                <div className="inline-fields">
                  <input type="text" name="expiryMonth" placeholder="Mes (MM)" value={formData.expiryMonth} onChange={handleInputChange} required />
                  <input type="text" name="expiryYear" placeholder="Año (AAAA)" value={formData.expiryYear} onChange={handleInputChange} required />
                </div>
                <input type="text" name="cvv" placeholder="CVV" value={formData.cvv} onChange={handleInputChange} required />
                <button className="pay-btn" type="submit">Pagar</button>
              </form>
            </div>
          </div>
        ) : (
          <p className="no-order">No se encontraron los detalles de la orden.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentUser;