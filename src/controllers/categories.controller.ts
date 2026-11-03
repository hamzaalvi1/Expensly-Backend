import { Context } from "hono";
import {
  DEFAULT_PAGINATION,
  LIMIT,
  ORDER,
  PAGE,
  SEARCH,
  SortOrder,
  FILTER_BY,
  FilterByType,
} from "../constants/pagination";
import {
  createCategoryService,
  deleteCategoryService,
  getAllCategoriesService,
  updateCategoryService,
} from "../services/category.service";
import { HttpStatusCodes } from "../constants/http";
import { Messages } from "../constants/messages";
import { createCategorySchema, updateCategorySchema } from "../validations/category.schema";
import { zodSchemaValidator } from "../utils/zod-schema-validator";
import { HTTPException } from "hono/http-exception";

export const getAllCategories = async (c: Context) => {
  try {
    const page = Number(c.req.query(PAGE)) || DEFAULT_PAGINATION.PAGE;
    const limit = Number(c.req.query(LIMIT)) || DEFAULT_PAGINATION.LIMIT;
    const sortBy =
      (c.req.query(ORDER) as SortOrder) || SortOrder.DESC;
    const search = c.req.query(SEARCH) || DEFAULT_PAGINATION.SEARCH;
    const userId = c.get("user").id;
    const filterBy = c.req.query(FILTER_BY) as FilterByType;
    const categoryParams = {
      page,
      limit,
      search,
      sortBy,
      userId,
      filterBy,
    };
    const { count, data, currentPage, totalPages, nextPage, previousPage } =
      await getAllCategoriesService(categoryParams);
    return c.json(
      {
        message: Messages.SUCCESS,
        data,
        pagination: {
          count,
          currentPage,
          totalPages,
          nextPage,
          previousPage,
        },
      },
      HttpStatusCodes.OK,
    );
  } catch (error) {
    return c.json(
      {
        message: Messages.SOMETHING_WENT_WRONG,
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
export const createCategory = async (c: Context) => {
  try {
    const categoryData = await c.req.json();
    const userId = c.get("user").id;
    const validatedData = zodSchemaValidator(
      createCategorySchema,
      categoryData,
    );
    if (validatedData.success === false) {
      return c.json(
        {
          message: validatedData.error.message,
          field: validatedData.error.field,
        },
        HttpStatusCodes.BAD_REQUEST,
      );
    }
    const category = await createCategoryService(validatedData.data, userId);
    return c.json(
      {
        message: Messages.SUCCESS,
        data: category,
      },
      HttpStatusCodes.CREATED,
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

export const deleteCategory = async (c: Context) => {
  try {
    const categoryId = c.req.param("categoryId");
    const userId = c.get("user").id;
    if (!categoryId) {
      throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
        message: Messages.CATEGORY_ID_REQUIRED,
      });
    }
    const _ = await deleteCategoryService(categoryId, userId);
    return c.json(
      {
        message: Messages.CATEGORY_DELETED,
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

export const updateCategory = async (c: Context) => {
  try {
    const categoryId = c.req.param("categoryId");
    const categoryData = await c.req.json();
    const userId = c.get("user").id;
    if (!categoryId) {
      throw new HTTPException(HttpStatusCodes.BAD_REQUEST, {
        message: Messages.CATEGORY_ID_REQUIRED,
      });
    }
    const validatedData = zodSchemaValidator(
      updateCategorySchema,
      categoryData,
    );
    if (validatedData.success === false) {
      return c.json(
        {
          message: validatedData.error.message,
          field: validatedData.error.field,
        },
        HttpStatusCodes.BAD_REQUEST,
      );
    }
    const category = await updateCategoryService(
      categoryId,
      userId,
      validatedData.data,
    );
    return c.json(
      {
        message: Messages.CATEGORY_UPDATED,
        data: category,
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
