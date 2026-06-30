import app from "./app";
import { Context } from "hono";
import { getAllEnv } from "./utils/env";
import { HttpMessages, HttpStatusCodes } from "./constants/http";

export default {
  port : getAllEnv().PORT,
  fetch : app.fetch,
  onerror: (error: Error,c: Context) => {
    console.error(error);
    return c.json({ error: HttpMessages.INTERNAL_SERVER_ERROR }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}