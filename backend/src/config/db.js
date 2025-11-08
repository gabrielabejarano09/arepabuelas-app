import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config.js";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("Unexpected PG client error", err);
  process.exit(-1);
});
