import express from "express";
import { getPendingUsers, approveUser, getActiveUsers } from "../controllers/users.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { isAdmin } from "../middleware/roles.js";

const router = express.Router();

// Solo admin puede listar o aprobar usuarios
router.get("/pending", verifyToken, isAdmin, getPendingUsers);
router.patch("/:id/approve", verifyToken, isAdmin, approveUser);
router.get("/active", verifyToken, isAdmin, getActiveUsers);

export default router;
