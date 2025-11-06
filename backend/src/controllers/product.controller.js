import * as Product from '../models/product.model.js';

// Crear
export const addProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const image = req.file?.filename || null; // multer
    const product = await Product.createProduct({ name, description, price, image });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Listar todos
export const listProducts = async (req, res) => {
  const products = await Product.getAllProducts();
  res.json(products);
};

// Obtener detalle
export const getProduct = async (req, res) => {
  const product = await Product.getProductById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json(product);
};

// Actualizar
export const updateProductCtrl = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const image = req.file?.filename || null;
    const product = await Product.updateProduct({ id: req.params.id, name, description, price, image });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Eliminar
export const deleteProductCtrl = async (req, res) => {
  try {
    await Product.deleteProduct(req.params.id);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

