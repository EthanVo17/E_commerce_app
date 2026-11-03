import mongoose from "mongoose";

interface SearchType {
  userId: mongoose.Types.ObjectId;
  keyword: string;
  normalizedKeyword: string;
  createAt: Date;
}

export type { SearchType };
