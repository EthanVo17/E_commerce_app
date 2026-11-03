import type { Request, Response } from "express";
import mongoose from "mongoose";

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

export async function getProductById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
    const product = await ProductModel.findOne({ ...query, isActive: true })
      .populate("category")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ data: product });
  } catch {
    return res.status(500).json({ message: "Unable to load product" });
  }
}
