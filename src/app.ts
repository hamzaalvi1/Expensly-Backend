import { Hono } from "hono";
import { corsMiddleware } from "./config/cors";
import { withApiPrefix } from "./utils/api";
import { HttpMessages, HttpStatusCodes } from "./constants/http";

const app = new Hono();

app.use(withApiPrefix('/*'),corsMiddleware);

app.get(withApiPrefix('/'), (c) => {
    return c.json({ message: HttpMessages.SUCCESS }, HttpStatusCodes.OK);
});

export default app;