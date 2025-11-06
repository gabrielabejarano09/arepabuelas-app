import Product from "../models/Product.js";

// CREATE
export async function createProduct(req, res) {
  try {
    const body = {
      ...req.body,
      image: req.file ? req.file.path : undefined
    };

    const product = await Product.create(body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// LIST
export async function getProducts(req, res) {
  try {
    const products = await Product.find({ active: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DETAIL
export async function getProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });

    res.json(product);
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
}

// UPDATE
export async function updateProduct(req, res) {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.path;

    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true
    });
    res.json(product);
  } catch {
    res.status(400).json({ error: "Update failed" });
  }
}

// DELETE
export async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    res.json(product);
  } catch {
    res.status(400).json({ error: "Delete failed" });
  }
}
