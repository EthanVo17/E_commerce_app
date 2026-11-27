import type { NextFunction, Request, Response } from "express";

import { ProductService } from "../services/ProductService.js";
import type {
  ProductSlugParams,
  SearchProductsQuery,
} from "../validators/product.validator.js";

export async function getProducts(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const products = await ProductService.listActiveProducts();
    return res.status(200).json({
      success: true,
      total: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
    return;
  }
}

export async function searchProducts(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const validatedQuery = res.locals.validated?.query as SearchProductsQuery;
    const result = await ProductService.searchProducts(validatedQuery);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
    return;
  }
}

export async function getProductDetail(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const validatedParams = res.locals.validated?.params as ProductSlugParams;
    const product = await ProductService.getProductDetail(validatedParams.slug);
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
    return;
  }
}
