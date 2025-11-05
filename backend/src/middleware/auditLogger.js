import fs from "fs";
import path from "path";

const logDir = path.resolve("logs");

// Si no existe la carpeta logs, se crea
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

export const auditLogger = (event, details) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] EVENT: ${event} | DETAILS: ${JSON.stringify(details)}\n`;

    fs.appendFileSync(path.join(logDir, "audit.log"), logMessage);
};
