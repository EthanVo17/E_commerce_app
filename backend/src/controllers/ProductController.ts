import type { Request, Response } from "express";

import ProductModel from "../models/Product.model.js";

export async function getProducts(res: Response) {
  try {
    const products = await ProductModel.find({ isActive: true })
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ total: products.length, data: products });
  } catch {
    return res.status(500).json({ message: "Unable to load products" });
  }
}
