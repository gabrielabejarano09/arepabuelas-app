import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { pool } from "../config/db.js";

const router = Router();

// Crear comentario
router.post("/:productId", verifyToken, async (req, res) => {
  const { productId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  const result = await pool.query(
    `INSERT INTO comments (content, user_id, product_id)
     VALUES ($1, $2, $3) RETURNING *`,
    [content, userId, productId]
  );

  res.status(201).json(result.rows[0]);
});

// Listar comentarios
router.get("/:productId", async (req, res) => {
  const { productId } = req.params;
  const result = await pool.query(
    `SELECT c.*, u.name FROM comments c
     JOIN users u ON u.id=c.user_id
     WHERE product_id=$1`,
    [productId]
  );
  res.json(result.rows);
});

export default router;
