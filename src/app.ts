import { Hono } from "hono";
import { corsMiddleware } from "./config/cors";
import { withApiPrefix } from "./utils/api";
import { HttpMessages, HttpStatusCodes } from "./constants/http";
import { authRoutes, authPrefix } from "./routes/auth.route";
import { categoriesPrefix, categoriesRoutes } from "./routes/categories.route";
import { transactionPrefix, transactionRoutes } from "./routes/transaction.route";
import { budgetPrefix, budgetRoute } from "./routes/budget.route";

const app = new Hono();

app.use(withApiPrefix('/*'),corsMiddleware);

app.route(withApiPrefix(authPrefix), authRoutes);

app.route(withApiPrefix(categoriesPrefix), categoriesRoutes)

app.route(withApiPrefix(transactionPrefix), transactionRoutes)

app.route(withApiPrefix(budgetPrefix), budgetRoute)


app.get(withApiPrefix('/'), (c) => {
    return c.json({ message: HttpMessages.SUCCESS }, HttpStatusCodes.OK);
});


export default app;
