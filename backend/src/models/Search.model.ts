import mongoose from "mongoose";

import type { SearchType } from "../types/Search.type.js";
import { ref } from "node:process";

const SearchSchema = new mongoose.Schema<SearchType>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: false,
    },

    keyword: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    normalizedKeyword: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

SearchSchema.index({ userId: 1, createdAt: -1 });
SearchSchema.index({ userId: 1, normalizedKeyword: 1 });

const SearchModel = mongoose.model<SearchType>("search", SearchSchema);

export default SearchModel;
