import { Context } from "hono";
import { HttpStatusCodes } from "../constants/http";
import { Messages } from "../constants/messages";
import {
  DEFAULT_PAGINATION,
  END_DATE,
  LIMIT,
  ORDER,
  PAGE,
  SEARCH,
  SortOrder,
  START_DATE,
} from "../constants/pagination";
import { getAllTransactionsService } from "../services/transaction.service";
import { HTTPException } from "hono/http-exception";
import { Query } from "../constants/query";

export const getTransactions = async (c: Context) => {
  try {
    const userId = c.get("user").id;
    const categoryId = c.req.query(Query.CATEGORY_ID) || undefined;
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
      categoryId
    };
    const transactions = await getAllTransactionsService(transactionParams,userId);

    return c.json({
        message: Messages.TRANSACTIONS_FETCHED_SUCCESSFULLY,
        data: transactions,
    }, HttpStatusCodes.OK);
  } catch (error) {
    throw new HTTPException(HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: Messages.SOMETHING_WENT_WRONG,
    });
  }
};
