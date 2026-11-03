import mongoose from "mongoose";
import type {
  ProductOptionType,
  ProductType,
  ProductVariantType,
} from "../types/Product.type.js";

const ProductOptionValueSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, trim: true },
    label: { type: String, trim: true },
    image: { type: String, trim: true },
  },
  { _id: false },
);

const ProductOptionSchema = new mongoose.Schema<ProductOptionType>(
  {
    name: { type: String, required: true, trim: true },
    values: { type: [ProductOptionValueSchema], default: [] },
  },
  { _id: false },
);

const ProductVariantSchema = new mongoose.Schema<ProductVariantType>(
  {
    sku: { type: String, required: true, trim: true },
    // Example: { size: "42", color: "black" }
    options: { type: Map, of: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    image: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
);

const ProductSchema = new mongoose.Schema<ProductType>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    brand: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    highlights: { type: [String], default: [] },
    images: { type: [String], default: [] },
    // Base/default price is used when the product has no variants.
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    currency: { type: String, default: "VND", uppercase: true, trim: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    soldCount: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    options: { type: [ProductOptionSchema], default: [] },
    variants: { type: [ProductVariantSchema], default: [] },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

const ProductModel = mongoose.model<ProductType>("products", ProductSchema);

export default ProductModel;
