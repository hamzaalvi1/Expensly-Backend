import { eq } from "drizzle-orm";
import { db } from "../config/db";
import { users } from "../db/schema";
import { hashPassword } from "../utils/auth";
import { RegisterSchemaType } from "../validations/auth.schema";
import { HTTPException } from "hono/http-exception";
import { HttpStatusCodes } from "../constants/http";
import { Messages } from "../constants/messages";

const findUserByEmail = async (email:string) => {
    const [user] = await db.select().from(users).where(eq(users.email,email)).limit(1);
    return user ?? null;
}

export const createUser = async (data:RegisterSchemaType) => {
    const {name, email, password} = data;
    const existingUser = await findUserByEmail(email);
    if(existingUser) throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
        message: Messages.USER_ALREADY_EXISTS
    });
    const hashedPassword = await hashPassword(password);
    
    const newUser = await db.insert(users).values({name, email, password:hashedPassword}).returning({
        id:users.id,
        name:users.name,
        email:users.email,
        createdAt:users.createdAt,
        updatedAt:users.updatedAt,
        currency:users.currency
    }).then(([user]) => user);

    return newUser;
}