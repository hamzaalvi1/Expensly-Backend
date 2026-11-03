import { NODE_ENV } from "../constants/env";
import { pool } from "../config/db";
import { getEnv } from "../utils/env";

if (getEnv("NODE_ENV") === NODE_ENV.PRODUCTION) {
  throw new Error("Refusing to reset database in production");
}

const resetDatabase = async () => {
  try {
    await pool.query("DROP SCHEMA IF EXISTS public CASCADE");
    await pool.query("CREATE SCHEMA public");
    await pool.query("GRANT ALL ON SCHEMA public TO public");
    console.log("Database schema reset");
  } finally {
    await pool.end();
  }
};

resetDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
