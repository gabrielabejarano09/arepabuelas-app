import { Router } from "express";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import multer from "multer";
import { pool } from "../config/db.js";

const router = Router();

// Config Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  }
});
const upload = multer({ storage });

// Listar todos
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM products");
  res.json(result.rows);
});

// Detalle
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM products WHERE id=$1", [id]);
  res.json(result.rows[0]);
});

// Crear producto (admin)
router.post("/", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  const { name, description, price, stock } = req.body;
  const image = req.file?.filename || null;
  const result = await pool.query(
    `INSERT INTO products (name, description, price, stock, image)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name, description, price, stock, image]
  );
  res.status(201).json(result.rows[0]);
});

// Editar producto (admin)
router.put("/:id", verifyToken, isAdmin, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock } = req.body;
  const image = req.file?.filename || null;
  const result = await pool.query(
    `UPDATE products SET name=$1, description=$2, price=$3, stock=$4, image=COALESCE($5,image)
     WHERE id=$6 RETURNING *`,
    [name, description, price, stock, image, id]
  );
  res.json(result.rows[0]);
});

// Eliminar producto (admin)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM products WHERE id=$1", [id]);
  res.json({ message: "Producto eliminado" });
});

export default router;
