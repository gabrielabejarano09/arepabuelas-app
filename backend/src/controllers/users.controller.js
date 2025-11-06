import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { auditLogger } from "../middleware/auditLogger.js";
import crypto from "crypto";

// ---------------------------
// Funciones de hash y verificación
// ---------------------------

// Genera hash SHA-512 con sal
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHmac("sha512", salt).update(password).digest("hex");
  return `${salt}$${hash}`; // Guardamos sal y hash juntos
};

// Verifica contraseña
const verifyPassword = (password, stored) => {
  const [salt, hash] = stored.split("$");
  const checkHash = crypto.createHmac("sha512", salt).update(password).digest("hex");
  return hash === checkHash;
};

// ---------------------------
// Registro de usuario
// ---------------------------
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Todos los campos son obligatorios" });

    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rowCount > 0)
      return res.status(400).json({ message: "El usuario ya existe" });

    if (!/\S+@\S+\.\S+/.test(email))
      return res.status(400).json({ message: "Formato de email inválido" });

    if (password.length < 6)
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });

    const password_hash = hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, status)
       VALUES ($1, $2, $3, 'pending') RETURNING id, name, email, status`,
      [name, email, password_hash]
    );

    auditLogger("USER_REGISTERED", { email, name, status: "pending" });

    res.status(201).json({
      message: "Usuario registrado correctamente. Pendiente de aprobación.",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    auditLogger("REGISTER_ERROR", { error: err.message, origin: "register" });
    res.status(500).json({ message: "Error en el registro" });
  }
};

// ---------------------------
// Login de usuario
// ---------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

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
      { id: user.id, role: user.is_admin ? "ADMIN" : "USER" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    auditLogger("LOGIN_SUCCESS", { email, id: user.id, role: user.is_admin ? "ADMIN" : "USER" });

    res.status(200).json({ message: "Login exitoso", token });
  } catch (err) {
    console.error(err);
    auditLogger("LOGIN_ERROR", { error: err.message, origin: "login" });
    res.status(500).json({ message: "Error en el login" });
  }
};

// ---------------------------
// Administración de usuarios
// ---------------------------
export const getPendingUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, status FROM users WHERE status = 'pending'");
    auditLogger("ADMIN_VIEW_PENDING_USERS", {
      admin_id: req.user.id,
      total_pending: result.rowCount,
    });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener usuarios pendientes" });
  }
};

export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE users SET status = 'active' WHERE id = $1 RETURNING id, name, email, status",
      [id]
    );

    if (result.rowCount === 0) {
      auditLogger("USER_APPROVAL_FAILED", {
        admin_id: req.user.id,
        target_user_id: id,
        reason: "Usuario no encontrado",
      });
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    auditLogger("USER_APPROVED", {
      admin_id: req.user.id,
      approved_user_id: id,
      approved_email: result.rows[0].email,
    });

    res.json({ message: "Usuario aprobado correctamente", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al aprobar usuario" });
  }
};


