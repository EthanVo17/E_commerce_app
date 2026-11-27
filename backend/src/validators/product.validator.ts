import { z } from "zod";

const optionalNonNegativeNumber = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return value;
}, z.coerce.number().min(0, "Price must be non-negative").optional());

export const PRODUCT_SORT_VALUES = [
  "relevance",
  "newest",
  "bestselling",
  "price_asc",
  "price_desc",
] as const;

export const searchProductsQuerySchema = z
  .object({
    q: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z.string().max(100, "Search keyword is too long"),
    ),
    page: z.preprocess(
      (value) => (value === undefined || value === "" ? 1 : value),
      z.coerce.number().int().min(1).max(1000),
    ),
    limit: z.preprocess(
      (value) => (value === undefined || value === "" ? 10 : value),
      z.coerce.number().int().min(1).max(50),
    ),
    sort: z.preprocess(
      (value) =>
        value === undefined || value === "" ? "relevance" : String(value),
      z.enum(PRODUCT_SORT_VALUES),
    ),
    minPrice: optionalNonNegativeNumber,
    maxPrice: optionalNonNegativeNumber,
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: "minPrice cannot be greater than maxPrice",
      path: ["minPrice"],
    },
  );

export const productSlugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Product identifier is required")
    .max(200, "Product identifier is too long")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Product identifier contains invalid characters",
    ),
});

export type SearchProductsQuery = z.infer<typeof searchProductsQuerySchema>;
export type ProductSlugParams = z.infer<typeof productSlugParamSchema>;
