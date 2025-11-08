import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { auditLogger } from "../middleware/auditLogger.js";
import { createUser, findByEmail } from "../models/user.model.js";
import 'dotenv/config';

dotenv.config();

// Funciones de hash y verificación (SHA-256 + sal)
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");
    return `${salt}$${hash}`; // Guardamos sal y hash juntos
};

const verifyPassword = (password, stored) => {
    const [salt, hash] = stored.split("$");
    const checkHash = crypto.createHmac("sha256", salt).update(password).digest("hex");
    return hash === checkHash;
};

// Register con foto obligatoria
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validación de campos
        if (!name || !email || !password || !req.file)
            return res.status(400).json({ message: "Todos los campos son obligatorios, incluida la foto." });

        // Validar formato del email
        if (!/\S+@\S+\.\S+/.test(email))
            return res.status(400).json({ message: "Formato de email inválido" });

        // Validar longitud de la contraseña
        if (password.length < 6)
            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });

        // Validar tipo de archivo permitido
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(req.file.mimetype)) {
            // Si el archivo no es imagen válida → eliminarlo por seguridad
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Solo se permiten archivos de imagen (jpg, png, webp)" });
        }

        // Revisar si el usuario ya existe
        const existing = await findByEmail(email);
        if (existing) return res.status(400).json({ message: "El usuario ya existe" });

        // Crear hash seguro
        const password_hash = hashPassword(password);

        // Guardar ruta segura de la foto
        const photo_url = `/uploads/users/${req.file.filename}`;

        // Crear usuario en base de datos
        const user = await createUser(name, email, password_hash, photo_url);

        auditLogger("USER_REGISTERED", {
            email,
            name,
            status: "pending",
        });

        res.status(201).json({
            message: "Usuario registrado correctamente. Pendiente de aprobación.",
            user,
        });
    } catch (err) {
        console.error("❌ Error en registro:", err);
        auditLogger("REGISTER_ERROR", { error: err.message, origin: "register" });
        res.status(500).json({ message: "Error en el registro" });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await findByEmail(email);

        if (!user) {
            auditLogger("LOGIN_FAILED", { email, reason: "Usuario no encontrado" });
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const match = verifyPassword(password, user.password_hash);
        if (!match) {
            auditLogger("LOGIN_FAILED", { email, reason: "Contraseña incorrecta" });
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        if (user.status !== "active") {
            auditLogger("LOGIN_DENIED", { email, reason: "Usuario pendiente de aprobación" });
            return res.status(403).json({ message: "Usuario pendiente de aprobación" });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.is_admin ? "ADMIN" : "USER" },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        auditLogger("LOGIN_SUCCESS", {
            email,
            id: user.id,
            role: user.is_admin ? "ADMIN" : "USER",
        });

        res.status(200).json({ message: "Login exitoso", token });
    } catch (err) {
        console.error("❌ Error en login:", err);
        auditLogger("LOGIN_ERROR", { error: err.message, origin: "login" });
        res.status(500).json({ message: "Error en el login" });
    }
};
