import { Hono } from "hono";
import { getMe } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const userRoutesObject = {
  GET_ME: "/me",
} as const;

const userRoutes = new Hono();

userRoutes.get(userRoutesObject.GET_ME, authMiddleware, async (c) => {
  return await getMe(c);
});

export { userRoutes };