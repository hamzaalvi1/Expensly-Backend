import { numeric, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../helpers/timestamps";
import { users } from "./users";
import { categories } from "./categories";

export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  userId: uuid("user_id").references(() => users.id,{ onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id,{ onDelete: "cascade" }),
  ...timestamps,
},(table)=>[
    unique("budgets_user_id_category_id_start_date_end_date_unique").on(table.userId, table.categoryId, table.startDate, table.endDate),
]);