import { z } from "zod";

export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: {
        field: string;
        message: string;
      };
    };

export const zodSchemaValidator = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): ValidationResult<z.infer<T>> => {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  const firstIssue = result.error.issues[0];

  return {
    success: false,
    error: {
      field: firstIssue?.path.join(".") || "root",
      message: firstIssue?.message || "Validation failed",
    },
  };
};