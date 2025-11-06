import { Router } from "express";
import multer from "multer";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";

const router = Router();

// multer secure
const upload = multer({
  dest: process.env.UPLOAD_DIR,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", upload.single("image"), createProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
