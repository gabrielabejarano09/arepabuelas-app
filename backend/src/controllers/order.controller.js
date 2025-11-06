// src/controllers/order.controller.js

import { pool } from "../config/db.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET);

/**
 * Crear orden
 * Aplica cupón NEWUSER10 automáticamente si es la primera compra
 */
export const createOrder = async (req, res) => {
  try {
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

/**
 * Pago sandbox con Stripe
 */
export const payOrder = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: "orderId y amount son obligatorios" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convertir a centavos
      currency: "cop",
      payment_method_types: ["card"]
    });

    res.status(200).json({
      message: "Intento de pago creado",
      client_secret: paymentIntent.client_secret
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al procesar el pago" });
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
