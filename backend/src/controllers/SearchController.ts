import express from "express";

import ProductModel from "../models/Product.model.js";

const searchProductByName = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const keyword = String(req.query.q ?? "").trim();

    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const products = await ProductModel.find({
      name: {
        $regex: escapedKeyword,
        $options: "i",
      },
    })
      .limit(20)
      .lean();

    return res.status(200).json({
      total: products.length,
      data: products,
    });
  } catch {
    res.status(500).json({ message: "Product not found" });
  }
};

export default searchProductByName;
