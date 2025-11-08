import { pool } from "../config/db.js";

const createTables = async () => {
  try {
    console.log("🚀 Creando tablas...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          status VARCHAR(20) DEFAULT 'active' NOT NULL,
          is_admin BOOLEAN DEFAULT false NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          photo_url TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          price INTEGER NOT NULL,
          stock INTEGER NOT NULL,
          image TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          total NUMERIC(10, 2) NOT NULL,
          coupon VARCHAR(50),
          status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
          is_paid BOOLEAN DEFAULT false NOT NULL,
          paid_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS coupons (
          id SERIAL PRIMARY KEY,
          code VARCHAR(50) UNIQUE NOT NULL,
          discount_type VARCHAR(20) NOT NULL,
          discount_value INTEGER NOT NULL,
          active BOOLEAN DEFAULT true NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL, 
          product_id INTEGER NOT NULL, 
          quantity INTEGER NOT NULL CHECK (quantity > 0), 
          price NUMERIC(10, 2) NOT NULL, 
          FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
      );
    `);

    console.log("✅ Tablas creadas correctamente");
  } catch (err) {
    console.error("❌ Error creando tablas:", err);
  } finally {
    pool.end();
  }
};

createTables();
