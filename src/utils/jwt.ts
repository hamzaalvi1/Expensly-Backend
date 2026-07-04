import { sign, verify } from "hono/jwt";
import { getEnv } from "./env";

export const generateToken = async (payload: any) => {
  return await sign(payload, getEnv("JWT_SECRET"));
};

export const verifyToken = async (token: string) => {
  return await verify(token, getEnv("JWT_SECRET"), {
    alg: "HS256",
  });
};