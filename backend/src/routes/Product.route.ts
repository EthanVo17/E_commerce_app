import express from "express";

import {
  getProductDetail,
  getProducts,
  searchProducts,
} from "../controllers/ProductController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  productSlugParamSchema,
  searchProductsQuerySchema,
} from "../validators/product.validator.js";

const router: express.Router = express.Router();

router.get("/", getProducts);
router.get(
  "/search",
  validateRequest({ query: searchProductsQuerySchema }),
  searchProducts,
);

router.get(
  "/:slug",
  validateRequest({ params: productSlugParamSchema }),
  getProductDetail,
);

export { router };
