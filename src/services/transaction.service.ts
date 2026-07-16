import { and, asc, desc, eq, gte, ilike, lte } from 'drizzle-orm';
import { db } from "../config/db";
import { transactions } from "../db/schema";
import { GetAllTransactionsParams } from "../types";
import { getNextPage, getOffset, getPreviousPage, getTotalPages } from "../utils/pagination";
import { SortOrder } from '../constants/pagination';

export const getAllTransactionsService = async (transactionParams: GetAllTransactionsParams, userId: string) => {
   const { page, limit, sortBy, search, startDate, endDate, categoryId } = transactionParams;

   const offset = getOffset(page, limit);
   
   const whereCondition = and(
    eq(transactions.userId, userId),
    search ? ilike(transactions.description, `%${search}%`) : undefined,
    startDate ? gte(transactions.transactionDate, new Date(startDate)) : undefined,
    endDate ? lte(transactions.transactionDate, new Date(endDate)) : undefined,
    categoryId ? eq(transactions.categoryId, categoryId) : undefined,
   );
   const sortColumn =
   sortBy === SortOrder.ASC
     ? asc(transactions.transactionDate)
     : desc(transactions.transactionDate);
  const transactionsDetails = await db.select().from(transactions).where(whereCondition).orderBy(sortColumn).limit(limit).offset(offset);

  const total = await db.$count(transactions, whereCondition);
  const totalPages = getTotalPages(total, limit);
  const nextPage = getNextPage(page, totalPages);
  const previousPage = getPreviousPage(page, totalPages);

  return {
    transactions: transactionsDetails,
    count:total,
    totalPages,
    nextPage,
    previousPage,
  };
}