import { z } from "zod";

export const createTransactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"], { message: "Type is required" }),
    amount: z
      .number()
      .positive({ message: "Amount must be greater than 0" })
      .transform((value) => value.toString()),
    description: z
      .string()
      .min(1, { message: "Description is required" })
      .max(100, { message: "Description must be less than 100 characters" }),
    categoryId: z.string({ message: "Category is required" }),
    budgetId: z.string().uuid().nullable().optional(),
    transactionDate: z.coerce.date({
      message: "Transaction date is required",
    }),
  })
  .strict();

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = createTransactionSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type UpdateTransactionSchema = z.infer<typeof updateTransactionSchema>;
