import { pgTable, varchar, uuid, boolean, unique } from "drizzle-orm/pg-core";   
import { timestamps } from "../helpers/timestamps";
import { users } from "./users";
import { transactionTypeEnum } from "./enums";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  userId: uuid("user_id").references(() => users.id,{ onDelete: "cascade" }),
  isDefault: boolean("is_default").notNull().default(false),
  type: transactionTypeEnum("type").notNull(),
  ...timestamps,
},(table)=>[
    unique("categories_user_id_name_type_unique").on(table.name, table.type, table.userId),
]);
