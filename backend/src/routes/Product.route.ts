import express from "express";

import { getProducts } from "../controllers/ProductController.js";
import searchProductByName from "../controllers/SearchController.js";

const router: express.Router = express.Router();

router.get("/", getProducts);
router.get("/search", searchProductByName);

export { router };
