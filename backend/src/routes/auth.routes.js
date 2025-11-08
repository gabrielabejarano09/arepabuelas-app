import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { validateRegister } from "../middleware/validators.js";
import { uploadUserPhoto } from "../middleware/uploadUserPhoto.js";

const router = express.Router();

// Registro con validación + subida segura de foto
router.post("/register", uploadUserPhoto.single("photo"), validateRegister,register);
// Login sin foto
router.post("/login", login);

export default router;
