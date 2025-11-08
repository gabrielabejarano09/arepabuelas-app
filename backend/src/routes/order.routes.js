import express from "express";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import { createOrder, payOrder, getUserOrders, getOrderById, getAllOrders } from "../controllers/order.controller.js";

const router = express.Router();

// Crear orden con posible cupón
router.post("/", verifyToken, createOrder);

// Pago sandbox
router.post("/pay", verifyToken, payOrder);

// Historial de compras
router.get("/", verifyToken, getUserOrders);

router.get("/all", verifyToken, getAllOrders);

router.get("/:id", verifyToken, getOrderById);



export default router;
