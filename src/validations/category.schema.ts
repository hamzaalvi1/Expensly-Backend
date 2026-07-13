import { z } from "zod";

export const createCategorySchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    icon: z.string().min(2, { message: "Icon must be at least 2 characters long" }),
    color: z.string().min(2, { message: "Color must be at least 2 characters long" }),
    type: z.enum(["EXPENSE", "INCOME"]),
});

export type CreateCategoryType = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field is required" },
);

export type UpdateCategoryType = z.infer<typeof updateCategorySchema>;
