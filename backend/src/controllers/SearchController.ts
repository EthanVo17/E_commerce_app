import express from "express";

import "../models/Categories.model.js";
import ProductModel from "../models/Product.model.js";

const searchProductByName = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const keyword = String(req.query.q ?? "").trim();
    if (!keyword) {
      return res.status(400).json({
        message: "Search keyword is required",
      });
    }

    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const products = await ProductModel.find({
      name: {
        $regex: escapedKeyword,
        $options: "i",
      },
      isActive: true,
    })
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Search successful",
      total: products.length,
      data: {
        keyword,
        products,
      },
    });
  } catch {
    return res.status(500).json({ message: "Unable to search products" });
  }
};

export default searchProductByName;
