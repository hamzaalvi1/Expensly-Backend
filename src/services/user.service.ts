import { db } from "../config/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const getMeService = async (id: string) => {
    const [user] = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        currency: users.currency,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id)).limit(1)

    return user;
}