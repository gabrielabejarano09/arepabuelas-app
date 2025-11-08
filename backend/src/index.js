import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { sanitizeInput } from "./middleware/sanitize.js";
import morgan from "morgan";
import { pool } from "./config/db.js";
import fs from "fs";
import path from "path";

// --- Rutas ---
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/product.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import orderRoutes from "./routes/order.routes.js";

dotenv.config();

const app = express();

// --- CONFIGURACIÓN PARA SUBIDA DE ARCHIVOS ---

// Lista de carpetas necesarias para subir archivos
const uploadDirs = ["uploads/products", "uploads/users"];

// Crear las carpetas si no existen (evita errores ENOENT)
uploadDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Directorio creado: ${dir}`);
    }
});

// Servir las carpetas como rutas estáticas
uploadDirs.forEach((dir) => {
    app.use(`/${dir}`, express.static(path.resolve(dir)));
});

// --- MIDDLEWARES DE SEGURIDAD Y UTILIDAD ---
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "default-src": ["'self'"],
                "img-src": ["'self'", "data:", "https:", "http://localhost:4000"],
                "script-src": ["'self'"],
                "object-src": ["'none'"],
                "upgrade-insecure-requests": [],
            },
        },
        referrerPolicy: { policy: "no-referrer" },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "same-origin" },
        crossOriginOpenerPolicy: { policy: "same-origin" },
    })
);
app.use(cors({ origin: "*" }));
app.use(sanitizeInput);
app.use(morgan("dev"));
app.use(express.json());

// Limita peticiones por IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Demasiadas peticiones desde esta IP, intenta más tarde",
});
app.use(limiter);

// --- RUTAS PRINCIPALES ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/orders", orderRoutes);

// --- RUTAS DE PRUEBA ---
app.get("/", (req, res) => {
    res.send("🫓 Servidor Arepabuelas funcionando");
});

// --- CONEXIÓN A LA BASE DE DATOS ---
pool
    .connect()
    .then(() => console.log("✅ Conectado a la base de datos desde index"))
    .catch((err) => console.error("❌ Error de conexión BD:", err.message));

// --- SERVIDOR ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
