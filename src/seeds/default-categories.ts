import { and, eq, isNull } from "drizzle-orm";

import { db } from "../config/db";
import { categories } from "../db/schema/categories";

export const defaultCategories = [
  { name: "Salary", type: "INCOME", icon: "FaBriefcase" },
  { name: "Freelance", type: "INCOME", icon: "FaLaptop" },
  { name: "Investments", type: "INCOME", icon: "FaChartLine" },
  { name: "Gifts", type: "INCOME", icon: "FaGift" },
  { name: "Other Income", type: "INCOME", icon: "FaCirclePlus" },
  { name: "Food & Dining", type: "EXPENSE", icon: "FaUtensils" },
  { name: "Groceries", type: "EXPENSE", icon: "FaCartShopping" },
  { name: "Transportation", type: "EXPENSE", icon: "FaCar" },
  { name: "Rent", type: "EXPENSE", icon: "FaHouse" },
  { name: "Utilities", type: "EXPENSE", icon: "FaBolt" },
  { name: "Entertainment", type: "EXPENSE", icon: "FaFilm" },
  { name: "Shopping", type: "EXPENSE", icon: "FaBagShopping" },
  { name: "Healthcare", type: "EXPENSE", icon: "FaHeart" },
  { name: "Education", type: "EXPENSE", icon: "FaBookOpen" },
  { name: "Travel", type: "EXPENSE", icon: "FaPlane" },
  { name: "Personal Care", type: "EXPENSE", icon: "FaWandSparkles" },
  { name: "Other Expense", type: "EXPENSE", icon: "FaEllipsis" },
] as const;

export const seedDefaultCategories = async () => {
  for (const category of defaultCategories) {
    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.name, category.name),
          eq(categories.type, category.type),
          eq(categories.isDefault, true),
          isNull(categories.userId),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(categories)
        .set({ icon: category.icon })
        .where(eq(categories.id, existing.id));
    } else {
      await db.insert(categories).values({
        ...category,
        isDefault: true,
        userId: null,
      });
    }
  }
};
