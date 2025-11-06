import { pool } from '../config/db.js';

// Crear comentario
export const createComment = async ({ user_id, product_id, content }) => {
  const result = await pool.query(
    `INSERT INTO comments (user_id, product_id, content)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [user_id, product_id, content]
  );
  return result.rows[0];
};

// Obtener comentarios de un producto
export const getCommentsByProduct = async (product_id) => {
  const result = await pool.query(
    `SELECT c.id, c.content, c.created_at, u.name AS user_name
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.product_id = $1
     ORDER BY c.created_at DESC`,
    [product_id]
  );
  return result.rows;
};
