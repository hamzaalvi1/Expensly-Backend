import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import type { z } from "zod";
import { HttpMessages, HttpStatusCodes } from "../constants/http";

export const zodValidatorMiddleware = <Schema extends z.ZodType>(schema: Schema) => {
  return zValidator("json", schema, (result) => {
    if (result.success === false) {
      throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
        message: result.error.issues[0]?.message ?? HttpMessages.BAD_REQUEST,
        cause: result.error.issues,
      });
    }
  });
};

