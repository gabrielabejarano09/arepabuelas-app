import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Token no proporcionado" });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: "Token inválido o expirado" });
            req.user = user; // añade info del usuario al request
            next();
        });
    } catch (err) {
        console.error("Error en verifyToken:", err);
        res.status(500).json({ message: "Error interno en autenticación" });
    }
};