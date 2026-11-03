import mongoose from "mongoose";

import type { CategoriesType } from "../types/Categories.type.js";

const CategoriesSchema = new mongoose.Schema<CategoriesType>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
});

const CategoriesModel = mongoose.model<CategoriesType>(
  "categories",
  CategoriesSchema,
);

export default CategoriesModel;
