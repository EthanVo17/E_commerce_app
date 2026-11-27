import mongoose from "mongoose";

import CategoriesModel from "../models/Categories.model.js";
import ProductModel from "../models/Product.model.js";
import redis from "../config/redis.js";
import type {
  ProductPaginationMeta,
  ProductSortOption,
  SearchProductsParams,
} from "../types/Product.type.js";
import { AppError } from "../utils/AppError.js";
import {
  buildSafeSearchRegex,
  hashSearchQueryParams,
} from "../utils/searchSanitizer.js";

const SEARCH_CACHE_TTL_SECONDS = 300;
const DETAIL_CACHE_TTL_SECONDS = 600;

const PRODUCT_CARD_PROJECTION = {
  _id: 1,
  name: 1,
  slug: 1,
  brand: 1,
  category: 1,
  price: 1,
  oldPrice: 1,
  images: { $slice: 1 },
  soldCount: 1,
  soldLabel: 1,
  rating: 1,
  reviewCount: 1,
  location: 1,
  stock: 1,
} as const;

export interface ProductCardResponseItem {
  _id: unknown;
  name: string;
  slug: string;
  brand?: string;
  category?: unknown;
  price: number;
  oldPrice?: number;
  originalPrice?: number;
  discountPercentage: number;
  images: string[];
  soldCount: number;
  soldLabel?: number;
  rating: number;
  reviewCount: number;
  location?: string;
  stock?: number;
}

export interface SearchProductsServiceResult {
  success: true;
  data: ProductCardResponseItem[];
  pagination: ProductPaginationMeta;
}

function computeDiscountPercentage(price: number, oldPrice?: number): number {
  if (
    typeof oldPrice !== "number" ||
    oldPrice <= 0 ||
    typeof price !== "number" ||
    oldPrice <= price
  ) {
    return 0;
  }
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function formatCardItem(doc: Record<string, unknown>): ProductCardResponseItem {
  const price = Number(doc.price ?? 0);
  const oldPrice =
    typeof doc.oldPrice === "number" ? doc.oldPrice : undefined;
  const discountPercentage = computeDiscountPercentage(price, oldPrice);
  const rawImages = Array.isArray(doc.images)
    ? (doc.images as string[]).slice(0, 1)
    : [];

  const slug =
    typeof doc.slug === "string" && doc.slug.trim() ? doc.slug.trim() : "";

  return {
    _id: doc._id,
    name: String(doc.name ?? ""),
    slug,
    ...(typeof doc.brand === "string" ? { brand: doc.brand } : {}),
    ...(doc.category !== undefined ? { category: doc.category } : {}),
    price,
    ...(oldPrice !== undefined ? { oldPrice, originalPrice: oldPrice } : {}),
    discountPercentage,
    images: rawImages,
    soldCount: Number(doc.soldCount ?? 0),
    ...(typeof doc.soldLabel === "number" ? { soldLabel: doc.soldLabel } : {}),
    rating: Number(doc.rating ?? 0),
    reviewCount: Number(doc.reviewCount ?? 0),
    ...(typeof doc.location === "string" ? { location: doc.location } : {}),
    ...(typeof doc.stock === "number" ? { stock: doc.stock } : {}),
  };
}

function normalizeVariantOptions(
  options: unknown,
): Record<string, string> {
  if (options instanceof Map) {
    return Object.fromEntries(options.entries());
  }
  if (options && typeof options === "object") {
    return options as Record<string, string>;
  }
  return {};
}

function formatDetailItem(doc: Record<string, unknown>): Record<string, unknown> {
  const price = Number(doc.price ?? 0);
  const oldPrice =
    typeof doc.oldPrice === "number" ? doc.oldPrice : undefined;
  const discountPercentage = computeDiscountPercentage(price, oldPrice);

  const rawVariants = Array.isArray(doc.variants)
    ? (doc.variants as Array<Record<string, unknown>>).map((variant) => ({
        ...variant,
        options: normalizeVariantOptions(variant.options),
      }))
    : [];

  return {
    ...doc,
    price,
    ...(oldPrice !== undefined ? { oldPrice, originalPrice: oldPrice } : {}),
    discountPercentage,
    variants: rawVariants,
    specifications: Array.isArray(doc.specifications) ? doc.specifications : [],
    highlights: Array.isArray(doc.highlights) ? doc.highlights : [],
    images: Array.isArray(doc.images) ? doc.images : [],
  };
}

function buildSortStage(
  sort: ProductSortOption,
  useTextScore: boolean,
): Record<string, unknown> {
  switch (sort) {
    case "newest":
      return { createdAt: -1, _id: -1 };
    case "bestselling":
      return { soldCount: -1, createdAt: -1 };
    case "price_asc":
      return { price: 1, soldCount: -1 };
    case "price_desc":
      return { price: -1, soldCount: -1 };
    case "relevance":
    default:
      return useTextScore
        ? { score: { $meta: "textScore" }, soldCount: -1 }
        : { soldCount: -1, createdAt: -1 };
  }
}

/**
 * Safely resolves `category` for products whose `category` field may be either
 * an ObjectId referencing `categories` or a legacy plain string (e.g. "Thể thao").
 */
async function hydrateCategories(
  docs: Record<string, unknown>[],
): Promise<void> {
  const categoryIds = Array.from(
    new Set(
      docs
        .map((doc) => doc.category)
        .filter(
          (cat): cat is string | mongoose.Types.ObjectId =>
            (typeof cat === "string" || cat instanceof mongoose.Types.ObjectId) &&
            mongoose.Types.ObjectId.isValid(String(cat)),
        )
        .map((cat) => String(cat)),
    ),
  );

  if (categoryIds.length === 0) return;

  const categories = await CategoriesModel.find(
    { _id: { $in: categoryIds } },
    { name: 1, slug: 1 },
  ).lean();

  const categoryMap = new Map(
    categories.map((cat) => [String(cat._id), cat]),
  );

  for (const doc of docs) {
    const key = doc.category ? String(doc.category) : "";
    if (key && categoryMap.has(key)) {
      doc.category = categoryMap.get(key);
    }
  }
}

export class ProductService {
  static async listActiveProducts(): Promise<Record<string, unknown>[]> {
    const products = (await ProductModel.find({ isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .lean()) as unknown as Record<string, unknown>[];

    await hydrateCategories(products);
    return products.map((item) => formatDetailItem(item));
  }

  static async searchProducts(
    params: SearchProductsParams,
  ): Promise<SearchProductsServiceResult> {
    const cacheKey = `search:products:v2:${hashSearchQueryParams(params)}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached) as SearchProductsServiceResult;
      } catch {
        // Ignore corrupted cache entry and query DB
      }
    }

    const baseFilter: Record<string, unknown> = { isActive: { $ne: false } };
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (params.minPrice !== undefined) priceFilter.$gte = params.minPrice;
      if (params.maxPrice !== undefined) priceFilter.$lte = params.maxPrice;
      baseFilter.price = priceFilter;
    }

    const keyword = params.q.trim();
    const skip = (params.page - 1) * params.limit;

    let docs: Record<string, unknown>[] = [];
    let totalItems = 0;

    // 1. Try MongoDB $text search first for multi-char relevance queries
    let textSearchMatched = false;
    if (keyword.length >= 2 && params.sort === "relevance") {
      try {
        const textFilter = {
          ...baseFilter,
          $text: { $search: keyword },
        };

        const [textDocs, textTotal] = await Promise.all([
          ProductModel.find(textFilter, {
            ...PRODUCT_CARD_PROJECTION,
            score: { $meta: "textScore" },
          })
            .sort(buildSortStage("relevance", true) as Record<string, 1 | -1 | { $meta: "textScore" }>)
            .skip(skip)
            .limit(params.limit)
            .lean(),
          ProductModel.countDocuments(textFilter),
        ]);

        if (textTotal > 0) {
          docs = textDocs as unknown as Record<string, unknown>[];
          totalItems = textTotal;
          textSearchMatched = true;
        }
      } catch {
        // Fallback to safe regex if text index is not yet created
      }
    }

    // 2. Fallback / primary regex search (supports short keywords, substrings, Vietnamese accents)
    if (!textSearchMatched) {
      const filter: Record<string, unknown> = { ...baseFilter };

      if (keyword) {
        const safePattern = buildSafeSearchRegex(keyword);
        if (safePattern) {
          const regexCondition = { $regex: safePattern, $options: "i" };
          filter.$or = [
            { name: regexCondition },
            { brand: regexCondition },
            { description: regexCondition },
          ];
        }
      }

      const [regexDocs, regexTotal] = await Promise.all([
        ProductModel.find(filter, PRODUCT_CARD_PROJECTION)
          .sort(buildSortStage(params.sort, false) as Record<string, 1 | -1>)
          .skip(skip)
          .limit(params.limit)
          .lean(),
        ProductModel.countDocuments(filter),
      ]);

      docs = regexDocs as unknown as Record<string, unknown>[];
      totalItems = regexTotal;
    }

    await hydrateCategories(docs);

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / params.limit);
    const result: SearchProductsServiceResult = {
      success: true,
      data: docs.map(formatCardItem),
      pagination: {
        page: params.page,
        limit: params.limit,
        totalItems,
        totalPages,
      },
    };

    await redis.set(
      cacheKey,
      JSON.stringify(result),
      "EX",
      SEARCH_CACHE_TTL_SECONDS,
    );

    return result;
  }

  static async getProductDetail(
    slugOrId: string,
  ): Promise<Record<string, unknown>> {
    const trimmed = slugOrId.trim();
    const normalizedSlug = trimmed.toLowerCase();
    const cacheKey = `product:detail:v2:${normalizedSlug}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached) as Record<string, unknown>;
      } catch {
        // Ignore corrupted cache entry and query DB
      }
    }

    const query: Record<string, unknown> = mongoose.Types.ObjectId.isValid(
      trimmed,
    )
      ? {
          isActive: { $ne: false },
          $or: [{ slug: normalizedSlug }, { _id: trimmed }],
        }
      : {
          isActive: { $ne: false },
          slug: normalizedSlug,
        };

    const product = (await ProductModel.findOne(query).lean()) as
      | Record<string, unknown>
      | null;

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    await hydrateCategories([product]);
    const detail = formatDetailItem(product);

    await redis.set(
      cacheKey,
      JSON.stringify(detail),
      "EX",
      DETAIL_CACHE_TTL_SECONDS,
    );

    return detail;
  }
}
