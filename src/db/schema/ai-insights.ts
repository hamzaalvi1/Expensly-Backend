import { index, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./categories";
import { timestamps } from "../helpers/timestamps";

const {createdAt} = timestamps

export const aiInsights = pgTable("ai_insights", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: uuid("user_id").references(() => users.id,{ onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id,{ onDelete: "cascade" }),
  details: jsonb("details").notNull(),
  insightType: varchar("insight_type", { length: 50 }).notNull(),
  startDate: timestamp("start_date",{ withTimezone: true }).notNull(),
  endDate: timestamp("end_date",{ withTimezone: true }).notNull(),
  createdAt,
},(table)=>[
    index("ai_insights_user_id_created_at_index").on(table.userId, table.createdAt.desc()),
]);