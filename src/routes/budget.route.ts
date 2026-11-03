import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createBudget,
  deleteBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
} from "../controllers/budget.controller";

const budgetPrefix = "/budget";

const budgetRouteObjects = {
  GET_BUDGETS: "/all",
  GET_BUDGET_BY_ID: "/:budgetId",
  CREATE_BUDGET: "/create",
  UPDATE_BUDGET: "/update/:budgetId",
  DELETE_BUDGET: "/delete/:budgetId",
};

const budgetRoute = new Hono();

budgetRoute.get(budgetRouteObjects.GET_BUDGETS, authMiddleware, async (c) => {
  return await getAllBudgets(c);
});

budgetRoute.get(
  budgetRouteObjects.GET_BUDGET_BY_ID,
  authMiddleware,
  async (c) => {
    return await getBudgetById(c);
  },
);

budgetRoute.post(budgetRouteObjects.CREATE_BUDGET, authMiddleware, async (c) => {
  return await createBudget(c);
});

budgetRoute.patch(
  budgetRouteObjects.UPDATE_BUDGET,
  authMiddleware,
  async (c) => {
    return await updateBudget(c);
  },
);

budgetRoute.delete(
  budgetRouteObjects.DELETE_BUDGET,
  authMiddleware,
  async (c) => {
    return await deleteBudget(c);
  },
);

export { budgetRoute, budgetPrefix };
