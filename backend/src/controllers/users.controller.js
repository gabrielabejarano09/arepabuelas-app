import { pool } from "../config/db.js";
import { auditLogger } from "../middleware/auditLogger.js";


// Lista todos los usuarios pendientes
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

// Aprueba un usuario (cambia status a active)
export const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("UPDATE users SET status = 'active' WHERE id = $1 RETURNING id, name, email, status", [id]);

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
