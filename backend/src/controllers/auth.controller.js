import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createUser, findByEmail } from "../models/user.model.js";
import { auditLogger } from "../middleware/auditLogger.js";
import 'dotenv/config';

dotenv.config();

// Registro
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: "Todos los campos son obligatorios" });

        const existing = await findByEmail(email);
        if (existing) return res.status(400).json({ message: "El usuario ya existe" });

        if (!/\S+@\S+\.\S+/.test(email))
            return res.status(400).json({ message: "Formato de email inválido" });

        if (password.length < 6)
            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });

        const hash = await bcrypt.hash(password, 12);
        const user = await createUser(name, email, hash);

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
        console.error(err);

        auditLogger("REGISTER_ERROR", {
            error: err.message,
            origin: "register",
        });

        res.status(500).json({ message: "Error en el registro" });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await findByEmail(email);

        if (!user) {
            auditLogger("LOGIN_FAILED", {
                email,
                reason: "Usuario no encontrado"
            });
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            auditLogger("LOGIN_FAILED", {
                email,
                reason: "Contraseña incorrecta"
            });
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        if (user.status !== "active") {
            auditLogger("LOGIN_DENIED", {
                email,
                reason: "Usuario pendiente de aprobación"
            });
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
            role: user.is_admin ? "ADMIN" : "USER"
        });

        res.status(200).json({ message: "Login exitoso", token });
    } catch (err) {
        console.error(err);

        auditLogger("LOGIN_ERROR", {
            error: err.message,
            origin: "login",
        });

        res.status(500).json({ message: "Error en el login" });
    }
};
