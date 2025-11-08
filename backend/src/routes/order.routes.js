import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { createOrder, payOrder, getUserOrders, getOrderById } from "../controllers/order.controller.js";

const router = express.Router();

// Crear orden con posible cupón
router.post("/", verifyToken, createOrder);

// Pago sandbox
router.post("/pay", verifyToken, payOrder);

// Historial de compras
router.get("/", verifyToken, getUserOrders);

router.get("/:id", verifyToken, getOrderById); 

export default router;
