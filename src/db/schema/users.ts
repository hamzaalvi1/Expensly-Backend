import { pgTable, varchar,uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../helpers/timestamps";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("PKR"),
  ...timestamps,
});