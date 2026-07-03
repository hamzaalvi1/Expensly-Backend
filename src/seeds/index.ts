import { pool } from "../config/db";
import { seedDefaultCategories } from "./default-categories";

const runSeeds = async () => {
  try {
    await pool.query("select 1");
    await seedDefaultCategories();
    console.log("Seeds completed");
  } finally {
    await pool.end();
  }
};

runSeeds().catch((error) => {
  console.error(error);
  process.exit(1);
});
