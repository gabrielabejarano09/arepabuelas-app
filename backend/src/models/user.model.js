import { pool } from "../config/db.js";

// Crear usuario nuevo (incluye foto)
export const createUser = async (name, email, hash, photo_url) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, photo_url, status)
         VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, status, photo_url`,
        [name, email, hash, photo_url, "pending"]
    );
    return result.rows[0];
};

// Buscar usuario por email
export const findByEmail = async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    return result.rows[0];
};

// Actualizar estado (aprobado / pendiente / bloqueado)
export const updateStatus = async (id, status) => {
    await pool.query("UPDATE users SET status=$1 WHERE id=$2", [status, id]);
};
