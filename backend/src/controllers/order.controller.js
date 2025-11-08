// src/controllers/order.controller.js

import { pool } from "../config/db.js";

const mockPaymentProcessor = {
  process: (cardDetails) => {
    // Simulamos diferentes respuestas basadas en el número de tarjeta
    if (cardDetails.cardNumber.startsWith("4242")) {
      // Éxito
      return { success: true, transactionId: `sim_tx_${Date.now()}` };
    } else if (cardDetails.cardNumber.startsWith("5100")) {
      // Fondos insuficientes
      return { success: false, message: "Fondos insuficientes." };
    } else {
      // Cualquier otro caso es rechazado
      return { success: false, message: "Tarjeta rechazada por el banco emisor." };
    }
  },
};

/**
 * Crear orden
 * Aplica cupón NEWUSER10 automáticamente si es la primera compra
 */
export const createOrder = async (req, res) => {
  try {
    console.log("Cuerpo de la solicitud recibido:", req.body);
    const userId = req.user.id;
    const { products, totalAmount } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "La orden debe contener productos" });
    }

    // Verificar si es la primera compra
    const { rows: previousOrders } = await pool.query(
      "SELECT id FROM orders WHERE user_id=$1",
      [userId]
    );

    let discount = 0;
    let appliedCoupon = null;

    if (previousOrders.length === 0) {
      discount = totalAmount * 0.10; // 10% de descuento
      appliedCoupon = "NEWUSER10";
    }

    const finalAmount = totalAmount - discount;

    // Crear la orden
    const { rows: newOrder } = await pool.query(
      `INSERT INTO orders (user_id, total, coupon)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, finalAmount, appliedCoupon]
    );

    // Insertar items de la orden
    for (const item of products) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [newOrder[0].id, item.product_id, item.quantity, item.price]
      );
    }

    res.status(201).json({
      message: "Orden creada exitosamente",
      order: newOrder[0],
      discount,
      appliedCoupon
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear la orden" });
  }
};

//Pago

export const payOrder = async (req, res) => {
  try {
    // 1. Extraer el ID de la orden y los detalles de pago del cuerpo de la solicitud
    const { orderId, paymentDetails } = req.body;

    // 2. Validación de seguridad: Asegurarse de que toda la información necesaria está presente
    if (!orderId || !paymentDetails) {
      return res.status(400).json({ message: "Falta el ID de la orden o los detalles de pago." });
    }
    
    const { cardNumber, cardHolder, expiryMonth, expiryYear, cvv } = paymentDetails;
    if (!cardNumber || !cardHolder || !expiryMonth || !expiryYear || !cvv) {
      return res.status(400).json({ message: "Todos los campos de la tarjeta son obligatorios." });
    }

    // 3. Buscar la orden en la base de datos
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "La orden especificada no fue encontrada." });
    }

    // Verificar si la orden ya fue pagada
    if (order.isPaid) {
      return res.status(400).json({ message: "Esta orden ya ha sido pagada previamente." });
    }

    // 4. Procesar el pago a través de nuestro simulador
    const paymentResult = mockPaymentProcessor.process(paymentDetails);

    // 5. Actualizar la orden según el resultado del pago
    if (paymentResult.success) {
      // Si el pago es exitoso:
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: paymentResult.transactionId, // ID de transacción simulado
        status: "COMPLETED",
        update_time: new Date().toISOString(),
        // El email se puede obtener del token o de la propia orden si la guardaste allí
        email_address: req.user.email, // Asumiendo que `verifyToken` añade 'user' al 'req'
      };

      const updatedOrder = await order.save();
      
      console.log(`Orden ${orderId} pagada exitosamente.`);
      res.status(200).json({ message: "Pago realizado con éxito.", order: updatedOrder });
    } else {
      // Si el pago falla:
      console.log(`Intento de pago fallido para la orden ${orderId}: ${paymentResult.message}`);
      res.status(400).json({ message: paymentResult.message });
    }
  } catch (error) {
    console.error("Error en el proceso de pago:", error);
    res.status(500).json({ message: "Error interno del servidor al procesar el pago." });
  }
};

/**
 * Historial de compras por usuario
 */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      `SELECT o.id, o.total, o.coupon, o.created_at,
              json_agg(json_build_object(
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'price', oi.price
              )) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id=$1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener historial de compras" });
  }
};

