import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { auditLogger } from "../middleware/auditLogger.js";
import crypto from "crypto";

// Reutilizamos la función de auth
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");
    return `${salt}$${hash}`;
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

export const getActiveUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, status FROM users WHERE status = 'active'");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios activos." });
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

// Cambiar contraseña (solo usuarios "active")
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id; // obtenido desde authMiddleware
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Debes ingresar ambas contraseñas." });
        }

        // Buscar usuario
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        // Validar que el usuario esté activo
        if (user.status !== "active") {
            return res.status(403).json({ message: "Tu cuenta aún no ha sido aprobada." });
        }

        // Verificar contraseña actual
        const [salt, hash] = user.password_hash.split("$");
        const checkHash = crypto.createHmac("sha256", salt).update(currentPassword).digest("hex");

        if (hash !== checkHash) {
            auditLogger("PASSWORD_CHANGE_FAILED", { userId, reason: "Contraseña actual incorrecta" });
            return res.status(401).json({ message: "La contraseña actual es incorrecta." });
        }

        // Validar longitud de la nueva contraseña
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres." });
        }

        // Generar nuevo hash con la función reutilizada
        const newPasswordHash = hashPassword(newPassword);

        // Actualizar contraseña en la base de datos
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newPasswordHash, userId]);

        auditLogger("PASSWORD_CHANGED", { userId, email: user.email });

        res.status(200).json({ message: "Contraseña actualizada correctamente." });

    } catch (err) {
        console.error("❌ Error al cambiar contraseña:", err);
        auditLogger("PASSWORD_CHANGE_ERROR", { error: err.message, userId: req.user?.id });
        res.status(500).json({ message: "Error interno del servidor." });
    }
};



