import { Context } from "hono";
import type {RegisterSchemaType} from "../validations/auth.schema";
import { createUser } from "../services/auth.service";
import { Messages } from "../constants/messages";
import { HttpStatusCodes } from "../constants/http";


export const registerUser = async (c:Context) => {
    const validatedBody:RegisterSchemaType = await c.get("json");
    const user = await createUser(validatedBody);

    return c.json({
        message: Messages.USER_CREATED,
        user
    }, HttpStatusCodes.CREATED);
}