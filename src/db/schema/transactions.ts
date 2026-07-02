import { pgTable, uuid, timestamp, numeric, text, index } from "drizzle-orm/pg-core";   
import { timestamps } from "../helpers/timestamps";
import { categories } from "./categories";
import { transactionTypeEnum } from "./enums";
import { users } from "./users";

export const transactions = pgTable("transactions", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    categoryId: uuid("category_id").references(() => categories.id,{ onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id,{ onDelete: "cascade" }),
    type: transactionTypeEnum("type").notNull(),
    description: text("description").notNull(),
    transactionDate: timestamp("transaction_date", { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
},(table)=>[
    index("idx_txn_user_date").on(table.userId, table.transactionDate.desc()),
    index("idx_txn_user_category").on( table.userId, table.categoryId),
]);
