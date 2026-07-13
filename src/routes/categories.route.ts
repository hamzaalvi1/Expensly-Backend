import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../controllers/categories.controller";

const categoriesPrefix = "/categories";

const categoriesRoutesObject = {
  GET_ALL_CATEGORIES: "/all",
  CREATE_CATEGORY: "/create",
  UPDATE_CATEGORY: "/update/:categoryId",
  DELETE_CATEGORY: "/delete/:categoryId",
} as const;

const categoriesRoutes = new Hono()


categoriesRoutes.get(categoriesRoutesObject.GET_ALL_CATEGORIES, authMiddleware, async (c) => {
  return await getAllCategories(c);
});

categoriesRoutes.post(categoriesRoutesObject.CREATE_CATEGORY, authMiddleware, async (c) => {
  return await createCategory(c);
});

categoriesRoutes.patch(categoriesRoutesObject.UPDATE_CATEGORY, authMiddleware, async (c) => {
  return await updateCategory(c);
});

categoriesRoutes.delete(categoriesRoutesObject.DELETE_CATEGORY,authMiddleware,async(c)=>{
  return await deleteCategory(c)
})

export { categoriesRoutes, categoriesPrefix };
