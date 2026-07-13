import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { SortOrder } from "../constants/pagination";
import {
  getOffset,
  getNextPage,
  getPreviousPage,
  getTotalPages,
} from "../utils/pagination";
import { categories } from "../db/schema";
import { db } from "../config/db";
import { GetAllCategoriesParams } from "../types/categories.types";
import { CreateCategoryType, UpdateCategoryType } from "../validations/category.schema";
import { HTTPException } from "hono/http-exception";
import { HttpStatusCodes } from "../constants/http";
import { Messages } from "../constants/messages";

export const getAllCategoriesService = async (
  categoryParams: GetAllCategoriesParams,
) => {
  const { page, limit, sortBy, search, userId, filterBy } = categoryParams;
  const offset = getOffset(page, limit);
  const whereCondition = and(
    or(eq(categories.userId, userId), eq(categories.isDefault, true)),
    search ? ilike(categories.name, `%${search}%`) : undefined,
    filterBy ? eq(categories.type, filterBy) : undefined,
  );
  const sortColumn =
    sortBy === SortOrder.ASC
      ? asc(categories.createdAt)
      : desc(categories.createdAt);

  const categoriesData = await db
    .select()
    .from(categories)
    .where(whereCondition)
    .orderBy(sortColumn)
    .limit(limit)
    .offset(offset);

  const total = await db.$count(categories, whereCondition);

  const totalPages = getTotalPages(total, limit);
  const nextPage = getNextPage(page, totalPages);
  const previousPage = getPreviousPage(page, totalPages);

  return {
    count: total,
    data: categoriesData,
    currentPage: page,
    totalPages,
    nextPage,
    previousPage,
  };
};

export const createCategoryService = async (
  categoryData: CreateCategoryType,
  userId: string,
) => {
  const [existingCategory] = await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.name, categoryData.name),
        eq(categories.type, categoryData.type),
        eq(categories.userId, userId),
      ),
    )
    .limit(1);

  if (existingCategory) {
    throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
      message: Messages.CATEGORY_ALREADY_EXISTS,
    });
  }

  const [category] = await db
    .insert(categories)
    .values({
      ...categoryData,
      userId,
    })
    .returning();

  return category;
};

export const deleteCategoryService = async (categoryId: string, userId: string) => {
  const [existingCategory] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);
  if(!existingCategory){
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, {
      message: Messages.CATEGORY_NOT_FOUND,
    })
  }
  const [category] = await db
    .delete(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .returning();
  return category;
};

export const updateCategoryService = async (
  categoryId: string,
  userId: string,
  categoryData: UpdateCategoryType,
) => {
  const [existingCategory] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);

  if (!existingCategory) {
    throw new HTTPException(HttpStatusCodes.NOT_FOUND, {
      message: Messages.CATEGORY_NOT_FOUND,
    });
  }

  const [category] = await db
    .update(categories)
    .set(categoryData)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .returning();

  return category;
};
