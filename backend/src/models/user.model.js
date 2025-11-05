import { pool } from "../config/db.js";

export const createUser = async (name, email, hash) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, status)
         VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, status`,
        [name, email, hash, "pending"]
    );
    return result.rows[0];
};

export const findByEmail = async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    return result.rows[0];
};

export const updateStatus = async (id, status) => {
    await pool.query("UPDATE users SET status=$1 WHERE id=$2", [status, id]);
};
