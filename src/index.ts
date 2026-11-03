import app from "./app";
import { Context } from "hono";
import { HttpMessages, HttpStatusCodes } from "./constants/http";

export default {
  port: process.env.PORT ?? 3000,
  fetch : app.fetch,
  onerror: (error: Error,c: Context) => {
    console.error(error);
    return c.json({ error: HttpMessages.INTERNAL_SERVER_ERROR }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}
