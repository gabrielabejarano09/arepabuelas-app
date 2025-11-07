import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar"; // tu componente existente
import "./PaymentUser.css";

interface OrderItem {
  product_id: number;
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
  const [formData, setFormData] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:4000/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        // Tomamos la orden más reciente del usuario
        if (data && data.length > 0) {
          setOrder(data[0]);
        }
      } catch (err) {
        console.error("Error al obtener la orden:", err);
      }
    };

    fetchOrder();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePay = async () => {
    if (!order) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/orders/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Pago realizado con éxito ✅");
        console.log(data);
      } else {
        alert(data.message || "Error al procesar el pago ❌");
      }
    } catch (err) {
      console.error("Error en el pago:", err);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-content">
        <h2>Pagar</h2>

        {order ? (
          <div className="checkout-sections">
            {/* Sección de orden */}
            <div className="order-section">
              <h3>Orden</h3>
              {order.items.map((item, i) => (
                <div key={i} className="order-item">
                  <img src="/arepa.png" alt="Producto" />
                  <div>
                    <p className="product-name">Producto #{item.product_id}</p>
                    <p>$ {item.price.toLocaleString()}</p>
                  </div>
                  <div className="qty-control">
                    <span>{item.quantity}</span>
                  </div>
                </div>
              ))}
              <p className="total">Total: {order.total.toLocaleString()}</p>
            </div>

            {/* Sección de pago */}
            <div className="payment-section">
              <h3>Información de pago</h3>
              <form>
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre Completo"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="Número de tarjeta"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                />
                <div className="inline-fields">
                  <input
                    type="text"
                    name="expiry"
                    placeholder="Fecha de expiración"
                    value={formData.expiry}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="cvv"
                    placeholder="CVV"
                    value={formData.cvv}
                    onChange={handleInputChange}
                  />
                </div>
                <input
                  type="text"
                  name="address"
                  placeholder="Dirección de facturación"
                  value={formData.address}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Teléfono de contacto"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </form>

              <p className="coupon">
                Cupón aplicado: {order.coupon || "Ninguno"}
              </p>

              <button className="pay-btn" onClick={handlePay}>
                Pagar
              </button>
            </div>
          </div>
        ) : (
          <p className="no-order">No hay órdenes disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentUser;
