import type { Context } from "hono";
import type { LoginSchemaType, RegisterSchemaType } from "../validations/auth.schema";
import { createUserService,loginUserService } from "../services/auth.service";
import { Messages } from "../constants/messages";
import { HttpStatusCodes } from "../constants/http";

export const registerUser = async (c: Context, data: RegisterSchemaType) => {
  const user = await createUserService(data);
  return c.json(
    {
      message: Messages.USER_CREATED,
      user,
    },
    HttpStatusCodes.CREATED,
  );
};

export const loginUser = async (c: Context, data: LoginSchemaType) => {
  const token = await loginUserService(data);
  return c.json({
    message: Messages.SUCCESS,
    token,
  }, HttpStatusCodes.OK);
};