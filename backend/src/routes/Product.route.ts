import express from "express";

import {
  getProductById,
  getProducts,
} from "../controllers/ProductController.js";

const router: express.Router = express.Router();

router.get("/", getProducts);
router.get("/:id=", getProductById);

export { router };
