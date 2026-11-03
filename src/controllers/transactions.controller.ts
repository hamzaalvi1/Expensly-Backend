import { Context } from "hono";
import { HttpStatusCodes } from "../constants/http";
import { Messages } from "../constants/messages";
import {
  DEFAULT_PAGINATION,
  FilterBy,
  FilterByType,
  END_DATE,
  LIMIT,
  ORDER,
  PAGE,
  SEARCH,
  SortOrder,
  START_DATE,
} from "../constants/pagination";
import {
  createTransactionService,
  deleteTransactionService,
  getAllTransactionsService,
  getTransactionByIdService,
  getTransactionTrendService,
  updateTransactionService,
} from "../services/transaction.service";
import { HTTPException } from "hono/http-exception";
import { Query } from "../constants/query";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../validations/transaction.schema";
import { zodSchemaValidator } from "../utils/zod-schema-validator";

export const getTransactionTrend = async (c: Context) => {
  const rawDays = c.req.query("days");
  const days = rawDays === undefined ? 30 : Number(rawDays);

  if (!Number.isInteger(days) || days < 1 || days > 365) {
    return c.json(
      { message: "days must be an integer between 1 and 365" },
      HttpStatusCodes.BAD_REQUEST,
    );
  }

  try {
    const data = await getTransactionTrendService(c.get("user").id, days);

    return c.json(
      { message: Messages.TRANSACTIONS_FETCHED_SUCCESSFULLY, data },
      HttpStatusCodes.OK,
    );
  } catch {
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: Messages.SOMETHING_WENT_WRONG,
    });
  }
};

export const getTransactions = async (c: Context) => {
  try {
    const userId = c.get("user").id;
    const categoryId = c.req.query(Query.CATEGORY_ID) || undefined;
    const requestedType = c.req.query(Query.TYPE);
    if (
      requestedType &&
      requestedType !== FilterBy.INCOME &&
      requestedType !== FilterBy.EXPENSE
    ) {
      return c.json(
        { message: "Type must be INCOME or EXPENSE" },
        HttpStatusCodes.BAD_REQUEST,
      );
    }
    const type = requestedType as FilterByType | undefined;
    const page = Number(c.req.query(PAGE)) || DEFAULT_PAGINATION.PAGE;
    const limit = Number(c.req.query(LIMIT)) || DEFAULT_PAGINATION.LIMIT;
    const sortBy =
      (c.req.query(ORDER) as SortOrder) || DEFAULT_PAGINATION.ORDER;
    const search = c.req.query(SEARCH) || DEFAULT_PAGINATION.SEARCH;
    const startDate = c.req.query(START_DATE) || DEFAULT_PAGINATION.START_DATE;
    const endDate = c.req.query(END_DATE) || DEFAULT_PAGINATION.END_DATE;

    const transactionParams = {
      page,
      limit,
      sortBy,
      search,
      startDate,
      endDate,
      categoryId,
      type,
    };
    const transactions = await getAllTransactionsService(
      transactionParams,
      userId,
    );

    return c.json(
      {
        message: Messages.TRANSACTIONS_FETCHED_SUCCESSFULLY,
        data: transactions,
      },
      HttpStatusCodes.OK,
    );
  } catch (error) {
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: Messages.SOMETHING_WENT_WRONG,
    });
  }
};

export const createTransaction = async (c: Context) => {
  try {
    const userId = c.get("user").id;
    const transactionData = await c.req.json();
    const validatedData = zodSchemaValidator(
      createTransactionSchema,
      transactionData,
    );
    if (!validatedData.success) {
      throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
        message: validatedData.error.message,
      });
    }
    const transaction = await createTransactionService(
      validatedData.data,
      userId,
    );

    return c.json(
      {
        message: Messages.SUCCESS,
        data: transaction,
      },
      HttpStatusCodes.OK,
    );
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: Messages.SOMETHING_WENT_WRONG,
    });
  }
};

export const deleteTransaction = async (c: Context) => {
  try {
    const userId = c.get("user").id;
    const transactionId = c.req.param("transactionId");
    if (!transactionId) {
      throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
        message: Messages.TRANSACTION_ID_REQUIRED,
      });
    }
    const _ = await deleteTransactionService(transactionId, userId);
    return c.json(
      {
        message: Messages.TRANSACTION_DELETED_SUCCESSFULLY,
      },
      HttpStatusCodes.OK,
    );
  } catch (error) {
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: Messages.SOMETHING_WENT_WRONG,
    });
  }
};
export const updateTransaction = async (c: Context) => {
  try {
    const transactionId = c.req.param("transactionId");
    const transactionData = await c.req.json();
    const userId = c.get("user").id;
    if (!transactionId) {
      throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
        message: Messages.TRANSACTION_ID_REQUIRED,
      });
    }
    const validatedData = zodSchemaValidator(
      updateTransactionSchema,
      transactionData,
    );
    if (!validatedData.success) {
      return c.json(
        {
          message: validatedData.error.message,
          field: validatedData.error.field,
        },
        HttpStatusCodes.BAD_REQUEST,
      );
    }
    const transaction = await updateTransactionService(
      transactionId,
      userId,
      validatedData.data,
    );
    return c.json(
      {
        message: Messages.SUCCESS,
        data: transaction,
      },
      HttpStatusCodes.OK,
    );
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json(
        {
          message: error.message,
        },
        error.status,
      );
    }
    return c.json(
      {
        message: Messages.SOMETHING_WENT_WRONG,
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export const getTransactionById = async (c: Context) => {
  try {
    const transactionId = c.req.param("transactionId");
    const userId = c.get("user").id;
    if (!transactionId) {
      throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
        message: Messages.TRANSACTION_ID_REQUIRED,
      });
    }
    const transaction = await getTransactionByIdService(transactionId, userId);
    return c.json(
      {
        message: Messages.TRANSACTION_FETCHED_SUCCESSFULLY,
        data: transaction,
      },
      HttpStatusCodes.OK,
    );
  } catch (error) {
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: Messages.SOMETHING_WENT_WRONG,
    });
  }
};``
