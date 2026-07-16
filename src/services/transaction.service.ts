import { and, asc, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { db } from "../config/db";
import { categories, transactions } from "../db/schema";
import { GetAllTransactionsParams } from "../types";
import {
  getNextPage,
  getOffset,
  getPreviousPage,
  getTotalPages,
} from "../utils/pagination";
import { SortOrder } from "../constants/pagination";
import { CreateTransactionSchema, UpdateTransactionSchema } from "../validations/transaction.schema";
import { Messages } from "../constants/messages";
import { HttpStatusCodes } from "../constants/http";
import { HTTPException } from "hono/http-exception";

export const getAllTransactionsService = async (
  transactionParams: GetAllTransactionsParams,
  userId: string,
) => {
  const { page, limit, sortBy, search, startDate, endDate, categoryId } =
    transactionParams;

  const offset = getOffset(page, limit);

  const whereCondition = and(
    eq(transactions.userId, userId),
    search ? ilike(transactions.description, `%${search}%`) : undefined,
    startDate
      ? gte(transactions.transactionDate, new Date(startDate))
      : undefined,
    endDate ? lte(transactions.transactionDate, new Date(endDate)) : undefined,
    categoryId ? eq(transactions.categoryId, categoryId) : undefined,
  );
  const sortColumn =
    sortBy === SortOrder.ASC
      ? asc(transactions.transactionDate)
      : desc(transactions.transactionDate);
  const transactionsDetails = await db
    .select()
    .from(transactions)
    .where(whereCondition)
    .orderBy(sortColumn)
    .limit(limit)
    .offset(offset);

  const total = await db.$count(transactions, whereCondition);
  const totalPages = getTotalPages(total, limit);
  const nextPage = getNextPage(page, totalPages);
  const previousPage = getPreviousPage(page, totalPages);

  return {
    transactions: transactionsDetails,
    count: total,
    totalPages,
    nextPage,
    previousPage,
  };
};
export const createTransactionService = async (
  transactionData: CreateTransactionSchema,
  userId: string,
) => {
  const transaction = await db
    .insert(transactions)
    .values({
      ...transactionData,
      userId,
    })
    .returning({
      id: transactions.id,
      type: transactions.type,
      description: transactions.description,
      amount: transactions.amount,
      categoryId: transactions.categoryId,
      transactionDate: transactions.transactionDate,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
    });
  return transaction;
};

export const deleteTransactionService = async (
  transactionId: string,
  userId: string,
) => {
  const transaction = await db
    .delete(transactions)
    .where(
      and(eq(transactions.id, transactionId), eq(transactions.userId, userId)),
    )
    .returning({ id: transactions.id });

  if (!transaction.length) {
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
      message: Messages.TRANSACTION_NOT_FOUND,
    });
  }

  return transaction;
};

export const updateTransactionService = async (
  transactionId: string,
  userId: string,
  transactionData: UpdateTransactionSchema,
) => {
  const transaction = await db
    .update(transactions)
    .set(transactionData)
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
    .returning();

  if (!transaction.length) {
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
      message: Messages.TRANSACTION_NOT_FOUND,
    });
  }

  return transaction[0];
};

export const getTransactionByIdService = async (
  transactionId: string,
  userId: string,
) => {
  const transaction = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      transactionDate: transactions.transactionDate,
      description: transactions.description,
      amount: transactions.amount,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(transactions)
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .limit(1);
  return transaction[0];
};