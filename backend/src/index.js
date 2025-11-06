import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { sanitizeInput } from "./middleware/sanitize.js";
import morgan from "morgan";
import { pool } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";

dotenv.config();

// Inicializar Express (esto debe ir antes de usar app)
const app = express();

// Middlewares
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "default-src": ["'self'"],           // Solo recursos locales
                "img-src": ["'self'", "data:", "https:"], // Permite imágenes locales y seguras
                "script-src": ["'self'"],            // No permite scripts externos
                "object-src": ["'none'"],            // Bloquea objetos embebidos
                "upgrade-insecure-requests": [],     // Obliga a HTTPS si está disponible
            },
        },
        referrerPolicy: { policy: "no-referrer" }, // No expone origen en peticiones externas
        crossOriginEmbedderPolicy: true,           // Previene fugas de datos por recursos cruzados
        crossOriginResourcePolicy: { policy: "same-origin" },
        crossOriginOpenerPolicy: { policy: "same-origin" },
    })
);
app.use(cors({ origin: "*" }));
app.use(sanitizeInput);
app.use(morgan("dev"));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Limita peticiones por IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Demasiadas peticiones desde esta IP, intenta más tarde"
});
app.use(limiter);

// Rutas
app.use("/api/auth", authRoutes);

// Ruta de prueba 1
app.get("/", (req, res) => {
    res.send("🫓 Servidor Arepabuelas funcionando");
});

// Ruta de prueba 2
app.get("/env-test", (req, res) => {
  res.json({
    mongo: process.env.DB_URI ? "ok" : "missing",
    jwt: process.env.JWT_SECRET ? "ok" : "missing"
  });
});


// Conexión a la base de datos
pool.connect()
    .then(() => console.log("✅ Conectado a la base de datos desde index"))
    .catch((err) => console.error("❌ Error de conexión BD:", err.message));

// Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
