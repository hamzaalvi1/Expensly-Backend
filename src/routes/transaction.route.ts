import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getTransactions } from "../controllers/transactions.controller";

const transactionPrefix = "/transactions";

const transactionRoutes = new Hono()

const transactionRoutesObject = {
  GET_TRANSACTIONS: "/all",
  CREATE_TRANSACTION: "/create",
  UPDATE_TRANSACTION: "/update/:transactionId",
  DELETE_TRANSACTION: "/delete/:transactionId",
} as const;


transactionRoutes.get(transactionRoutesObject.GET_TRANSACTIONS, authMiddleware, async (c) => {
  return await getTransactions(c);
});

export { transactionRoutes, transactionPrefix };