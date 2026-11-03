import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
} from "drizzle-orm";
import { GetAllBudgetsParams } from "../types";
import {
  getNextPage,
  getOffset,
  getPreviousPage,
  getTotalPages,
} from "../utils/pagination";
import { budgets, categories, transactions } from "../db/schema";
import { SortOrder } from "../constants/pagination";
import { db } from "../config/db";
import { HTTPException } from "hono/http-exception";
import { HttpStatusCodes } from "../constants/http";
import { Messages } from "../constants/messages";
import {
  CreateBudgetType,
  UpdateBudgetType,
} from "../validations/budget.schema";

export const getAllBudgetsService = async (
  budgetParams: GetAllBudgetsParams,
) => {
  const { page, limit, sortBy, search, userId, categoryId } = budgetParams;
  const offset = getOffset(page, limit);
  const whereCondition = and(
    eq(budgets.userId, userId),
    search ? ilike(budgets.name, `%${search}%`) : undefined,
  );
  const sortColumn =
    sortBy === SortOrder.ASC ? asc(budgets.startDate) : desc(budgets.startDate);
  const [budgetRows, countRows] = await Promise.all([
    db
      .select({ budget: budgets, category: categories })
      .from(budgets)
      .innerJoin(
        categories,
        and(
          eq(budgets.categoryId, categories.id),
          eq(categories.type, "EXPENSE"),
          categoryId ? eq(categories.id, categoryId) : undefined,
        ),
      )
      .where(whereCondition)
      .orderBy(sortColumn)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(budgets)
      .innerJoin(
        categories,
        and(
          eq(budgets.categoryId, categories.id),
          eq(categories.type, "EXPENSE"),
        ),
      )
      .where(whereCondition),
  ]);

  const budgetIds = budgetRows.map(({ budget }) => budget.id);
  const transactionRows = budgetIds.length
    ? await db
        .select({
          budgetId: budgets.id,
          id: transactions.id,
          amount: transactions.amount,
          description: transactions.description,
          type: transactions.type,
          transactionDate: transactions.transactionDate,
        })
        .from(transactions)
        .innerJoin(
          budgets,
          eq(transactions.budgetId, budgets.id),
        )
        .where(
          and(
            inArray(budgets.id, budgetIds),
            eq(transactions.userId, userId),
            eq(transactions.type, "EXPENSE"),
          ),
        )
        .orderBy(desc(transactions.transactionDate))
    : [];

  const transactionsByBudget = new Map<string, typeof transactionRows>();
  for (const transaction of transactionRows) {
    const budgetTransactions =
      transactionsByBudget.get(transaction.budgetId) ?? [];
    budgetTransactions.push(transaction);
    transactionsByBudget.set(transaction.budgetId, budgetTransactions);
  }

  const total = Number(countRows[0]?.count ?? 0);
  const totalPages = getTotalPages(total, limit);
  const nextPage = getNextPage(page, totalPages);
  const previousPage = getPreviousPage(page, totalPages);
  return {
    count: total,
    data: budgetRows.map(({ budget, category }) => {
      const budgetTransactions = transactionsByBudget.get(budget.id) ?? [];
      const spentAmount = budgetTransactions.reduce(
        (total, transaction) => total + Number(transaction.amount),
        0,
      );

      return {
        ...budget,
        category,
        transactions: budgetTransactions,
        spentAmount: spentAmount.toFixed(2),
        remainingAmount: (Number(budget.amount) - spentAmount).toFixed(2),
      };
    }),
    currentPage: page,
    totalPages,
    nextPage,
    previousPage,
  };
};

const verifyExpenseCategory = async (categoryId: string, userId: string) => {
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.id, categoryId),
        eq(categories.type, "EXPENSE"),
        or(eq(categories.userId, userId), eq(categories.isDefault, true)),
      ),
    )
    .limit(1);

  if (!category) {
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
      message: Messages.EXPENSE_CATEGORY_REQUIRED,
    });
  }
};

export const createBudgetService = async (
  budgetData: CreateBudgetType,
  userId: string,
) => {
  await verifyExpenseCategory(budgetData.categoryId, userId);

  const [existingBudget] = await db
    .select({ id: budgets.id })
    .from(budgets)
    .where(
      and(
        eq(budgets.userId, userId),
        eq(budgets.categoryId, budgetData.categoryId),
        eq(budgets.startDate, budgetData.startDate),
        eq(budgets.endDate, budgetData.endDate),
      ),
    )
    .limit(1);

  if (existingBudget) {
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
      message: Messages.BUDGET_ALREADY_EXISTS,
    });
  }

  const [budget] = await db
    .insert(budgets)
    .values({ ...budgetData, userId })
    .returning();

  return budget;
};

export const updateBudgetService = async (
  budgetId: string,
  userId: string,
  budgetData: UpdateBudgetType,
) => {
  if (budgetData.categoryId) {
    await verifyExpenseCategory(budgetData.categoryId, userId);
  }

  const [existingBudget] = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
    .limit(1);

  if (!existingBudget) {
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, {
      message: Messages.BUDGET_NOT_FOUND,
    });
  }

  const scheduleChanged =
    (budgetData.categoryId !== undefined &&
      budgetData.categoryId !== existingBudget.categoryId) ||
    (budgetData.startDate !== undefined &&
      budgetData.startDate.getTime() !== existingBudget.startDate.getTime()) ||
    (budgetData.endDate !== undefined &&
      budgetData.endDate.getTime() !== existingBudget.endDate.getTime());

  if (scheduleChanged) {
    const [linkedTransaction] = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(eq(transactions.budgetId, budgetId))
      .limit(1);

    if (linkedTransaction) {
      throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
        message: Messages.BUDGET_LINKED_TRANSACTIONS_CANNOT_CHANGE_DATES,
      });
    }
  }

  const [budget] = await db
    .update(budgets)
    .set(budgetData)
    .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
    .returning();

  if (!budget) {
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, {
      message: Messages.BUDGET_NOT_FOUND,
    });
  }

  return budget;
};

export const deleteBudgetService = async (budgetId: string, userId: string) => {
  const [budget] = await db
    .delete(budgets)
    .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
    .returning({ id: budgets.id });

  if (!budget) {
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, {
      message: Messages.BUDGET_NOT_FOUND,
    });
  }

  return budget;
};

export const getBudgetByIdService = async (
  budgetId: string,
  userId: string,
) => {
  const [budgetRow] = await db
    .select({ budget: budgets, category: categories })
    .from(budgets)
    .innerJoin(
      categories,
      and(
        eq(budgets.categoryId, categories.id),
        eq(categories.type, "EXPENSE"),
      ),
    )
    .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
    .limit(1);

  if (!budgetRow) return null;

  const budgetTransactions = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      description: transactions.description,
      type: transactions.type,
      transactionDate: transactions.transactionDate,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.budgetId, budgetId),
        eq(transactions.userId, userId),
        eq(transactions.type, "EXPENSE"),
      ),
    )
    .orderBy(desc(transactions.transactionDate));

  const spentAmount = budgetTransactions.reduce(
    (total, transaction) => total + Number(transaction.amount),
    0,
  );

  return {
    ...budgetRow.budget,
    category: budgetRow.category,
    transactions: budgetTransactions,
    spentAmount: spentAmount.toFixed(2),
    remainingAmount: (Number(budgetRow.budget.amount) - spentAmount).toFixed(2),
  };
};
