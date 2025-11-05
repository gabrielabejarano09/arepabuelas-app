import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect()
    .then(() => console.log('✅ Conectado a la base de datos'))
    .catch(err => console.error('❌ Error de conexión BD:', err.message));