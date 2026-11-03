import { and, asc, desc, eq, gte, ilike, lt, lte, ne, sql, sum } from "drizzle-orm";
import { db } from "../config/db";
import { budgets, categories, transactions } from "../db/schema";
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

export const getTransactionTrendService = async (
  userId: string,
  days: number,
) => {
  const today = new Date();
  const endDate = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + 1,
    ),
  );
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - days);

  const transactionDay = sql<string>`
    to_char(
      date_trunc(
        'day',
        ${transactions.transactionDate} AT TIME ZONE 'UTC'
      ),
      'YYYY-MM-DD'
    )
  `;

  const rows = await db
    .select({
      date: transactionDay,
      income: sql<string>`
        COALESCE(
          SUM(${transactions.amount})
            FILTER (WHERE ${transactions.type} = 'INCOME'),
          0
        )
      `,
      expenses: sql<string>`
        COALESCE(
          SUM(${transactions.amount})
            FILTER (WHERE ${transactions.type} = 'EXPENSE'),
          0
        )
      `,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.transactionDate, startDate),
        lt(transactions.transactionDate, endDate),
      ),
    )
    .groupBy(transactionDay);

  const totalsByDate = new Map(
    rows.map((row) => [
      row.date,
      {
        income: Number(row.income),
        expenses: Number(row.expenses),
      },
    ] as const),
  );

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + index);
    const dateKey = date.toISOString().slice(0, 10);

    return {
      date: dateKey,
      ...(totalsByDate.get(dateKey) ?? { income: 0, expenses: 0 }),
    };
  });
};

const toCents = (amount: string | number) => Math.round(Number(amount) * 100);

const resolveExpenseBudgetId = async (
  requestedBudgetId: string | null | undefined,
  userId: string,
  categoryId: string | null,
  transactionDate: Date,
) => {
  if (requestedBudgetId === null) return null;
  if (!categoryId) {
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
      message: Messages.EXPENSE_CATEGORY_REQUIRED,
    });
  }

  const matchingBudgets = await db
    .select({ id: budgets.id })
    .from(budgets)
    .where(
      and(
        eq(budgets.userId, userId),
        eq(budgets.categoryId, categoryId),
        lte(budgets.startDate, transactionDate),
        gte(budgets.endDate, transactionDate),
        requestedBudgetId ? eq(budgets.id, requestedBudgetId) : undefined,
      ),
    );

  if (requestedBudgetId && matchingBudgets.length === 0) {
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
      message: Messages.TRANSACTION_BUDGET_INVALID,
    });
  }

  if (!requestedBudgetId && matchingBudgets.length > 1) {
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
      message: Messages.BUDGET_SELECTION_REQUIRED,
    });
  }

  return matchingBudgets[0]?.id ?? null;
};

const assertWithinBudgetLimit = async (
  transaction: {
    type: "INCOME" | "EXPENSE";
    amount: string;
    budgetId: string | null;
  },
  userId: string,
  excludeTransactionId?: string,
) => {
  const { type, amount, budgetId } = transaction;

  if (type !== "EXPENSE" || !budgetId) return;

  const [budgetWithSpend] = await db
    .select({
      budgetAmount: budgets.amount,
      spent: sum(transactions.amount),
    })
    .from(budgets)
    .leftJoin(
      transactions,
      and(
        eq(transactions.budgetId, budgets.id),
        eq(transactions.type, "EXPENSE"),
        excludeTransactionId
          ? ne(transactions.id, excludeTransactionId)
          : undefined,
      ),
    )
    .where(
      and(
        eq(budgets.id, budgetId),
        eq(budgets.userId, userId),
      ),
    )
    .groupBy(budgets.id, budgets.amount);

  if (
    budgetWithSpend &&
    toCents(budgetWithSpend.spent ?? 0) + toCents(amount) >
      toCents(budgetWithSpend.budgetAmount)
  ) {
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
      message: Messages.BUDGET_LIMIT_EXCEEDED,
    });
  }
};

export const getAllTransactionsService = async (
  transactionParams: GetAllTransactionsParams,
  userId: string,
) => {
  const { page, limit, sortBy, search, startDate, endDate, categoryId, type } =
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
    type ? eq(transactions.type, type) : undefined,
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
  if (transactionData.type === "INCOME" && transactionData.budgetId) {
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
      message: Messages.INCOME_BUDGET_NOT_ALLOWED,
    });
  }

  const budgetId =
    transactionData.type === "EXPENSE"
      ? await resolveExpenseBudgetId(
          transactionData.budgetId,
          userId,
          transactionData.categoryId,
          transactionData.transactionDate,
        )
      : null;

  await assertWithinBudgetLimit(
    { ...transactionData, budgetId },
    userId,
  );

  const transaction = await db
    .insert(transactions)
    .values({
      ...transactionData,
      budgetId,
      userId,
    })
    .returning({
      id: transactions.id,
      type: transactions.type,
      description: transactions.description,
      amount: transactions.amount,
      categoryId: transactions.categoryId,
      budgetId: transactions.budgetId,
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
  const [existingTransaction] = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, userId),
      ),
    )
    .limit(1);

  if (!existingTransaction) {
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
      message: Messages.TRANSACTION_NOT_FOUND,
    });
  }

  const nextTransaction = { ...existingTransaction, ...transactionData };
  const requestedBudgetId =
    transactionData.budgetId !== undefined
      ? transactionData.budgetId
      : existingTransaction.type === "INCOME" && nextTransaction.type === "EXPENSE"
        ? undefined
        : existingTransaction.budgetId;

  if (nextTransaction.type === "INCOME" && transactionData.budgetId) {
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
      message: Messages.INCOME_BUDGET_NOT_ALLOWED,
    });
  }

  const budgetId =
    nextTransaction.type === "EXPENSE"
      ? await resolveExpenseBudgetId(
          requestedBudgetId,
          userId,
          nextTransaction.categoryId,
          nextTransaction.transactionDate,
        )
      : null;

  await assertWithinBudgetLimit(
    { ...nextTransaction, budgetId },
    userId,
    transactionId,
  );

  const transaction = await db
    .update(transactions)
    .set({ ...transactionData, budgetId })
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
      budgetId: transactions.budgetId,
      categoryName: categories.name,
    })
    .from(transactions)
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .limit(1);
  return transaction[0];
};
