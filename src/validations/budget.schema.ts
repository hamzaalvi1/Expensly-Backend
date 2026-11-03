import { z } from "zod";

const budgetFieldsSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }).max(50),
    description: z.string().min(1, { message: "Description is required" }),
    amount: z
      .number({ message: "Amount is required" })
      .positive({ message: "Amount must be greater than 0" })
      .transform((value) => value.toString()),
    startDate: z.coerce.date({ message: "Start date is required" }),
    endDate: z.coerce.date({ message: "End date is required" }),
    categoryId: z.string({ message: "Category is required" }),
  })
  .strict();

export const createBudgetSchema = budgetFieldsSchema
  .strict()
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be greater than or equal to start date",
    path: ["endDate"],
  });

export const updateBudgetSchema = budgetFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate >= data.startDate,
    {
      message: "End date must be greater than or equal to start date",
      path: ["endDate"],
    },
  );

export type CreateBudgetType = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetType = z.infer<typeof updateBudgetSchema>;
