import { Hono } from "hono";
import { loginUser, registerUser } from "../controllers/auth.controller";
import { zodValidatorMiddleware } from "../middlewares/validate-body.middleware";
import { loginSchema, registerSchema } from "../validations/auth.schema";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getMe } from "../controllers/user.controller";

const authPrefix = "/auth";

const authRoutesObject = {
  REGISTER: "/register",
  LOGIN: "/login",
  GET_ME: "/me",
} as const;

const authRoutes = new Hono()

authRoutes.post(
  authRoutesObject.REGISTER,
  zodValidatorMiddleware(registerSchema),
  async (c) => {
    const data = c.req.valid("json");
    return await registerUser(c, data);
  },
);

authRoutes.post(
  authRoutesObject.LOGIN,
  zodValidatorMiddleware(loginSchema),
  async (c) => {
    const data = c.req.valid("json");
    return await loginUser(c, data);
  },
);

authRoutes.get(
  authRoutesObject.GET_ME,
  authMiddleware,
  async (c) => {
    return await getMe(c);
  },
);

export { authRoutes,authPrefix };