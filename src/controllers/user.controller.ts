import { getMeService } from "../services/user.service";
import type { Context } from "hono";
import { Messages } from "../constants/messages";
import { HttpStatusCodes } from "../constants/http";

export const getMe = async (c: Context) => {
    const data = c.get("user");
    const userDetails = await getMeService(data.id);
    return c.json({
        message: Messages.SUCCESS,
        data: userDetails,
    }, HttpStatusCodes.OK);
}