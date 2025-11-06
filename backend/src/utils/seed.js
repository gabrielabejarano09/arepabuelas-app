import "dotenv/config";
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

const seed = async () => {
  try {
    console.log("⏳ Insertando datos iniciales...");

    // Crear admin
    const hashAdmin = await bcrypt.hash("AdminPass123", 12);
    await pool.query(`
      INSERT INTO users (name, email, password_hash, status, is_admin)
      VALUES ('Admin', 'admin@example.com', '${hashAdmin}', 'active', true)
      ON CONFLICT (email) DO NOTHING
    `);

    // Crear 5 productos
    await pool.query(`
      INSERT INTO products (name, description, price, stock, image)
      VALUES
        ('Arepa Clásica', 'Arepa tradicional', 1000, 50, 'arepa1.jpg'),
        ('Arepa Rellena', 'Arepa con queso', 1500, 30, 'arepa2.jpg'),
        ('Arepa Dulce', 'Arepa con miel', 1200, 40, 'arepa3.jpg'),
        ('Arepa Integral', 'Arepa saludable', 1300, 35, 'arepa4.jpg'),
        ('Arepa de Maíz Amarillo', 'Arepa especial', 1400, 25, 'arepa5.jpg')
      ON CONFLICT (name) DO NOTHING
    `);

    // Crear cupón nuevo usuario
    await pool.query(`
      INSERT INTO coupons (code, discount, discount_type, discount_value, active)
      VALUES ('NEWUSER10', 10, 'percentage', 10, true)
      ON CONFLICT (code) DO NOTHING
    `);

    console.log("✅ Seed completado");
  } catch (error) {
    console.error("❌ Error en seed:", error);
  } finally {
    pool.end();
  }
};

seed();



