// ARCHIVO: backend/src/controllers/order.controller.js

import { pool } from "../config/db.js";

const mockPaymentProcessor = {
  process: (cardDetails) => {
    if (cardDetails.cardNumber.startsWith("4242")) {
      return { success: true, transactionId: `sim_tx_${Date.now()}` };
    } else if (cardDetails.cardNumber.startsWith("5100")) {
      return { success: false, message: "Fondos insuficientes." };
    } else {
      return { success: false, message: "Tarjeta rechazada por el banco emisor." };
    }
  },
};

/**
 * Crear orden
 */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { products, totalAmount } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "La orden debe contener productos" });
    }

    const { rows: previousOrders } = await pool.query(
      "SELECT id FROM orders WHERE user_id=$1",
      [userId]
    );

    let discount = 0;
    let appliedCoupon = null;
    if (previousOrders.length === 0) {
      discount = totalAmount * 0.10;
      appliedCoupon = "NEWUSER10";
    }

    const finalAmount = totalAmount - discount;

    const { rows: newOrder } = await pool.query(
      `INSERT INTO orders (user_id, total, coupon, status)
       VALUES ($1, $2, $3, 'PENDING') RETURNING *`, // Añadimos un status inicial
      [userId, finalAmount, appliedCoupon]
    );

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

/**
 * Pagar una orden
 * --- VERSIÓN CORREGIDA ---
 */
export const payOrder = async (req, res) => {
  try {
    const { orderId, paymentDetails } = req.body;
    const userId = req.user.id; 

    if (!orderId || !paymentDetails) {
      return res.status(400).json({ message: "Falta el ID de la orden o los detalles de pago." });
    }

    const { rows: orderRows } = await pool.query(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
      [orderId, userId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ message: "La orden no fue encontrada o no pertenece al usuario." });
    }

    const order = orderRows[0];

    if (order.is_paid) {
      return res.status(400).json({ message: "Esta orden ya ha sido pagada previamente." });
    }

    const paymentResult = mockPaymentProcessor.process(paymentDetails);

    if (paymentResult.success) {
      // La consulta UPDATE ahora solo usa las columnas que SÍ existen en tu tabla.
      const { rows: updatedOrderRows } = await pool.query(
        `UPDATE orders 
         SET 
           is_paid = true, 
           paid_at = NOW(),
           status = 'PAID_SUCCESS'
         WHERE id = $1 RETURNING *`,
        [orderId] // El único parámetro necesario es el ID de la orden.
      );
      
      console.log(`Orden ${orderId} pagada exitosamente.`);
      res.status(200).json({ message: "Pago realizado con éxito.", order: updatedOrderRows[0] });

    } else {
      // Si falla, actualizamos solo el status para reflejar el error.
      await pool.query(
        "UPDATE orders SET status = 'PAID_FAILED' WHERE id = $1",
        [orderId]
      );
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

    // Esta consulta une las órdenes con sus items y los datos de los productos (nombre, imagen)
    const { rows } = await pool.query(
      `SELECT 
         o.id, 
         o.total, 
         o.coupon, 
         o.created_at, 
         o.is_paid,
         o.status,
         -- Si no hay items, devolvemos un array JSON vacío '[]'
         COALESCE(
           json_agg(
             json_build_object(
               'product_id', p.id,
               'name', p.name,
               'image', p.image,
               'quantity', oi.quantity,
               'price', oi.price
             )
           ) FILTER (WHERE p.id IS NOT NULL), '[]'
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error al obtener historial de compras:", err);
    res.status(500).json({ message: "Error al obtener historial de compras" });
  }
};

/**
 * Obtener una orden por su ID
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { rows: orderRows } = await pool.query(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    const { rows: itemRows } = await pool.query(
      `SELECT oi.quantity, oi.price, p.name, p.image
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [id]
    );

    const order = orderRows[0];
    order.items = itemRows;

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener la orden" });
  }
};