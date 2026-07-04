import { createMiddleware } from "hono/factory";
import { verifyToken } from "../utils/jwt";
import { HttpStatusCodes } from "../constants/http";
import { Messages } from "../constants/messages";

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if(!authHeader) {
    return c.json({ message: Messages.INVALID_TOKEN }, HttpStatusCodes.UNAUTHORIZED);
  }
  const token = authHeader.split(" ")[1];
  if(!token) {
    return c.json({ message: Messages.INVALID_TOKEN }, HttpStatusCodes.UNAUTHORIZED);
  }
  const payload = await verifyToken(token);
  if(!payload) {
    return c.json({ message: Messages.INVALID_TOKEN }, HttpStatusCodes.UNAUTHORIZED);
  }
  c.set("user", payload);
  await next();
});