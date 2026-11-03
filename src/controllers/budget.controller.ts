import { Context } from "hono";
import {
  DEFAULT_PAGINATION,
  LIMIT,
  ORDER,
  PAGE,
  SEARCH,
  SortOrder,
} from "../constants/pagination";
import {
  createBudgetService,
  deleteBudgetService,
  getAllBudgetsService,
  getBudgetByIdService,
  updateBudgetService,
} from "../services/budget.service";
import { Messages } from "../constants/messages";
import { HttpStatusCodes } from "../constants/http";
import { HTTPException } from "hono/http-exception";
import { createBudgetSchema, updateBudgetSchema } from "../validations/budget.schema";
import { zodSchemaValidator } from "../utils/zod-schema-validator";

export const getAllBudgets = async (c: Context) => {
  try {
    const page = Number(c.req.query(PAGE)) || DEFAULT_PAGINATION.PAGE;
    const limit = Number(c.req.query(LIMIT)) || DEFAULT_PAGINATION.LIMIT;
    const sortBy =
      (c.req.query(ORDER) as SortOrder) || DEFAULT_PAGINATION.ORDER;
    const search = c.req.query(SEARCH) || DEFAULT_PAGINATION.SEARCH;
    const userId = c.get("user").id;
    const categoryId = c.req.query("categoryId");
    const budgetParams = {
      page,
      limit,
      search,
      sortBy,
      userId,
      categoryId,
    };

    const { count, data, currentPage, totalPages, nextPage, previousPage } =
      await getAllBudgetsService(budgetParams);
    return c.json({
      message: Messages.SUCCESS,
      data,
      pagination: {
        count,
        currentPage,
        totalPages,
        nextPage,
        previousPage,
      },
    }, HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json({ message: error.message }, error.status);
    }
    return c.json(
      { message: Messages.SOMETHING_WENT_WRONG },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getBudgetById = async (c: Context) => {
  try {
    const { budgetId } = c.req.param();
    const userId = c.get("user").id;
    const budget = await getBudgetByIdService(budgetId, userId);

    if (!budget) {
      return c.json({ message: Messages.BUDGET_NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({ message: Messages.SUCCESS, data: budget }, HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json({ message: error.message }, error.status);
    }
    return c.json(
      { message: Messages.SOMETHING_WENT_WRONG },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export const createBudget = async (c: Context) => {
  try {
    const userId = c.get("user").id;
    const validatedData = zodSchemaValidator(
      createBudgetSchema,
      await c.req.json(),
    );

    if (!validatedData.success) {
      return c.json(
        { message: validatedData.error.message, field: validatedData.error.field },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    const budget = await createBudgetService(validatedData.data, userId);
    return c.json(
      { message: Messages.BUDGET_CREATED, data: budget },
      HttpStatusCodes.CREATED,
    );
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json({ message: error.message }, error.status);
    }
    return c.json(
      { message: Messages.SOMETHING_WENT_WRONG },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export const updateBudget = async (c: Context) => {
  try {
    const budgetId = c.req.param("budgetId");
    const userId = c.get("user").id;

    if (!budgetId) {
      throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
        message: Messages.BUDGET_ID_REQUIRED,
      });
    }

    const validatedData = zodSchemaValidator(
      updateBudgetSchema,
      await c.req.json(),
    );
    if (!validatedData.success) {
      return c.json(
        { message: validatedData.error.message, field: validatedData.error.field },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    const budget = await updateBudgetService(
      budgetId,
      userId,
      validatedData.data,
    );
    return c.json(
      { message: Messages.BUDGET_UPDATED, data: budget },
      HttpStatusCodes.OK,
    );
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json({ message: error.message }, error.status);
    }
    return c.json(
      { message: Messages.SOMETHING_WENT_WRONG },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export const deleteBudget = async (c: Context) => {
  try {
    const budgetId = c.req.param("budgetId");
    const userId = c.get("user").id;

    if (!budgetId) {
      throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
        message: Messages.BUDGET_ID_REQUIRED,
      });
    }

    await deleteBudgetService(budgetId, userId);
    return c.json({ message: Messages.BUDGET_DELETED }, HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json({ message: error.message }, error.status);
    }
    return c.json(
      { message: Messages.SOMETHING_WENT_WRONG },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
