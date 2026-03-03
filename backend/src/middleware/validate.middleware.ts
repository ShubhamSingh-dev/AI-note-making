import { NextFunction, Request, Response } from "express";
import z from "zod";
import { ApiError } from "../utils/ApiError.js";

// Validates request body against provided Zod schema and returns detailed validation errors
export function validateData(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(new ApiError(400, "Validation failed", errors));
    }

    // Attach validated and transformed data to request body
    req.body = result.data;
    next();
  };
}
