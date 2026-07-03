import { and, eq, isNull } from "drizzle-orm";

import { db } from "../config/db";
import { categories } from "../db/schema/categories";

export const defaultCategories = [
  // Income
  { name: "Salary", type: "INCOME", icon: "briefcase", color: "#10B981" },
  { name: "Freelance", type: "INCOME", icon: "laptop", color: "#22C55E" },
  { name: "Investments", type: "INCOME", icon: "trending-up", color: "#14B8A6" },
  { name: "Gifts", type: "INCOME", icon: "gift", color: "#06B6D4" },
  { name: "Other Income", type: "INCOME", icon: "plus-circle", color: "#0EA5E9" },

  // Expense
  { name: "Food & Dining", type: "EXPENSE", icon: "utensils", color: "#F59E0B" },
  { name: "Groceries", type: "EXPENSE", icon: "shopping-cart", color: "#EAB308" },
  { name: "Transportation", type: "EXPENSE", icon: "car", color: "#EF4444" },
  { name: "Rent", type: "EXPENSE", icon: "home", color: "#F43F5E" },
  { name: "Utilities", type: "EXPENSE", icon: "zap", color: "#EC4899" },
  { name: "Entertainment", type: "EXPENSE", icon: "film", color: "#A855F7" },
  { name: "Shopping", type: "EXPENSE", icon: "shopping-bag", color: "#8B5CF6" },
  { name: "Healthcare", type: "EXPENSE", icon: "heart", color: "#3B82F6" },
  { name: "Education", type: "EXPENSE", icon: "book-open", color: "#6366F1" },
  { name: "Travel", type: "EXPENSE", icon: "plane", color: "#F97316" },
  { name: "Personal Care", type: "EXPENSE", icon: "sparkles", color: "#D946EF" },
  { name: "Other Expense", type: "EXPENSE", icon: "more-horizontal", color: "#64748B" },
] as const;

export const seedDefaultCategories = async () => {
  await db
    .delete(categories)
    .where(and(eq(categories.isDefault, true), isNull(categories.userId)));

  await db.insert(categories).values(
    defaultCategories.map((category) => ({
      ...category,
      isDefault: true,
      userId: null,
    }))
  );
};
