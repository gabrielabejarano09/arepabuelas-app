import { pool } from '../config/db.js';

// Crear producto
export const createProduct = async ({ name, description, price, image }) => {
  const result = await pool.query(
    `INSERT INTO products (name, description, price, image)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, description, price, image]
  );
  return result.rows[0];
};

// Listar todos
export const getAllProducts = async () => {
  const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
  return result.rows;
};

// Obtener por ID
export const getProductById = async (id) => {
  const result = await pool.query('SELECT * FROM products WHERE id=$1', [id]);
  return result.rows[0];
};

// Actualizar producto
export const updateProduct = async ({ id, name, description, price, image }) => {
  const result = await pool.query(
    `UPDATE products SET name=$1, description=$2, price=$3, image=$4
     WHERE id=$5 RETURNING *`,
    [name, description, price, image, id]
  );
  return result.rows[0];
};

// Eliminar producto
export const deleteProduct = async (id) => {
  await pool.query('DELETE FROM products WHERE id=$1', [id]);
};

