// generate-custom-hash.js
import crypto from "crypto";

// Copiamos tu función de hash EXACTAMENTE como la tienes
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");
    return `${salt}$${hash}`; // Guardamos sal y hash juntos
};

// --- Script para generar el hash ---
const passwordParaAdmin = 'admin123'; // La contraseña que quieres usar
const hashGenerado = hashPassword(passwordParaAdmin);

console.log("======================================================");
console.log("Usa esta contraseña para iniciar sesión:", passwordParaAdmin);
console.log("Copia y pega el siguiente hash en tu archivo init.sql:");
console.log(hashGenerado);
console.log("======================================================");