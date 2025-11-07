import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { sanitizeInput } from "./middleware/sanitize.js";
import morgan from "morgan";
import { pool } from "./config/db.js";

// --- Dependencias para la gestión de archivos ---
import fs from 'fs';        // <-- AÑADIDO: Módulo File System para interactuar con carpetas
import path from 'path';    // <-- AÑADIDO: Módulo Path para manejar rutas de archivos de forma segura

// --- Rutas ---
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import productRoutes from './routes/product.routes.js';
import commentRoutes from './routes/comment.routes.js';
import orderRoutes from "./routes/order.routes.js";

dotenv.config();

// Inicializar Express
const app = express();


// --- CONFIGURACIÓN PARA SUBIDA DE ARCHIVOS ---

// 1. Definir la ruta del directorio de subidas. Usa una variable de entorno o un valor por defecto.
const uploadDir = process.env.UPLOAD_DIR || 'uploads/products';

// 2. Creación automática del directorio si no existe (SOLUCIONA EL ERROR ENOENT)
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`✅ Directorio de subidas creado en: ${uploadDir}`);
}

// 3. Servir la carpeta de 'uploads' como contenido estático
// Esto permite que las imágenes sean accesibles desde el navegador a través de una URL.
// Por ejemplo: http://localhost:4000/uploads/products/mi-imagen.png
app.use(`/${uploadDir}`, express.static(path.resolve(uploadDir)));

// --- FIN DE LA CONFIGURACIÓN ---


// Middlewares
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "default-src": ["'self'"],
                "img-src": ["'self'", "data:", "https:", "http://localhost:4000"], // <-- MODIFICADO: Permite cargar imágenes desde tu propio backend
                "script-src": ["'self'"],
                "object-src": ["'none'"],
                "upgrade-insecure-requests": [],
            },
        },
        referrerPolicy: { policy: "no-referrer" },
        crossOriginEmbedderPolicy: false, // <-- MODIFICADO: Cambiado a false para evitar problemas con recursos estáticos locales
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
    message: "Demasiadas peticiones desde esta IP, intenta más tarde"
});
app.use(limiter);

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/comments', commentRoutes);
app.use("/api/orders", orderRoutes); // <-- Corregido (añadí /api)

// Ruta de prueba 1
app.get("/", (req, res) => {
    res.send("🫓 Servidor Arepabuelas funcionando");
});

// ... (el resto de tu archivo sigue igual)

// Conexión a la base de datos
pool.connect()
    .then(() => console.log("✅ Conectado a la base de datos desde index"))
    .catch((err) => console.error("❌ Error de conexión BD:", err.message));

// Servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});