import jwt from "jsonwebtoken";
import "dotenv/config";

// Middleware de autenticación para proteger rutas
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "No autorizado" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // info del usuario en req.user
    next(); // ✅ correctamente declarado
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

// Alias para autenticación
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Token inválido" });
  }
};

// Middleware para verificar si el usuario es admin
export const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Usuario no autenticado" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Acceso denegado" });
  next();
};
