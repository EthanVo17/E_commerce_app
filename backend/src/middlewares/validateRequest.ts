import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

export interface RequestValidationSchemas {
  query?: ZodType;
  params?: ZodType;
  body?: ZodType;
}

export interface ValidatedRequestData {
  query?: unknown;
  params?: unknown;
  body?: unknown;
}

export function validateRequest(schemas: RequestValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validated: ValidatedRequestData =
      (res.locals.validated as ValidatedRequestData | undefined) ?? {};

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        next(
          new AppError(
            "Invalid route parameters",
            400,
            result.error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          ),
        );
        return;
      }
      validated.params = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        next(
          new AppError(
            "Invalid query parameters",
            400,
            result.error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          ),
        );
        return;
      }
      validated.query = result.data;
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        next(
          new AppError(
            "Invalid request body",
            400,
            result.error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            })),
          ),
        );
        return;
      }
      validated.body = result.data;
    }

    res.locals.validated = validated;
    next();
  };
}
