import { Pool,types } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { getEnv } from "../utils/env";

// Set the type parser for the date type yyyy-mm-dd to Date object 1082
types.setTypeParser(1082, (value) => 
   value 
);

export const pool = new Pool({
  connectionString: getEnv("DATABASE_URL"),
  ssl:{ rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000,
});

pool.on("connect", () => {
  console.log("Connected to database");
});

pool.on("error", (err) => {
  console.error("Database connection error:", err);
  process.exit(1); // Exit the process with a non-zero code to indicate failure
});

export const db = drizzle(pool);
