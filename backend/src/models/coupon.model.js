import { pool } from '../config/db.js';

export const createCoupon = async ({ code, discount, type, active }) => {
  const result = await pool.query(
    `INSERT INTO coupons (code, discount, type, active)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [code, discount, type, active]
  );
  return result.rows[0];
};

export const getCouponByCode = async (code) => {
  const result = await pool.query('SELECT * FROM coupons WHERE code=$1 AND active=true', [code]);
  return result.rows[0];
};
