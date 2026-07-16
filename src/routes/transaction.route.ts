import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactions,
  updateTransaction,
} from "../controllers/transactions.controller";

const transactionPrefix = "/transactions";

const transactionRoutes = new Hono();

const transactionRoutesObject = {
  GET_TRANSACTIONS: "/all",
  CREATE_TRANSACTION: "/create",
  UPDATE_TRANSACTION: "/update/:transactionId",
  DELETE_TRANSACTION: "/delete/:transactionId",
  GET_TRANSACTION: "/:transactionId",
} as const;

transactionRoutes.get(
  transactionRoutesObject.GET_TRANSACTIONS,
  authMiddleware,
  async (c) => {
    return await getTransactions(c);
  },
);

transactionRoutes.post(
  transactionRoutesObject.CREATE_TRANSACTION,
  authMiddleware,
  async (c) => {
    return await createTransaction(c);
  },
);

transactionRoutes.delete(
  transactionRoutesObject.DELETE_TRANSACTION,
  authMiddleware,
  async (c) => {
    return await deleteTransaction(c);
  },
);

transactionRoutes.patch(
  transactionRoutesObject.UPDATE_TRANSACTION,
  authMiddleware,
  async (c) => {
    return await updateTransaction(c);
  },
);

transactionRoutes.get(
  transactionRoutesObject.GET_TRANSACTION,
  authMiddleware,
  async (c) => {
    return await getTransactionById(c);
  },
);
export { transactionRoutes, transactionPrefix };
