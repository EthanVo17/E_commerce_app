import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import {
  buildSafeSearchRegex,
  escapeRegex,
  hashSearchQueryParams,
} from "../utils/searchSanitizer.js";
import {
  productSlugParamSchema,
  searchProductsQuerySchema,
} from "../validators/product.validator.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { AppError } from "../utils/AppError.js";
import { ErrorHandler } from "../middlewares/ErrorHandler.js";
import { ProductService } from "../services/ProductService.js";
import ProductModel from "../models/Product.model.js";
import redis from "../config/redis.js";

describe("Backend Product Search & Detail unit tests", () => {
  describe("searchSanitizer", () => {
    it("escapes regex metacharacters to prevent ReDoS", () => {
      const dangerous = "(a+)+$^[0-9]*.*";
      const escaped = escapeRegex(dangerous);
      assert.equal(escaped, "\\(a\\+\\)\\+\\$\\^\\[0-9\\]\\*\\.\\*");
      assert.doesNotThrow(() => new RegExp(escaped, "i"));
    });

    it("builds Vietnamese accent-insensitive regex safely", () => {
      const pattern = buildSafeSearchRegex("giay the thao");
      const regex = new RegExp(pattern, "i");
      assert.equal(regex.test("Giày thể thao Nike"), true);
      assert.equal(regex.test("giay the thao adidas"), true);
      assert.equal(regex.test("Áo sơ mi"), false);
    });

    it("hashes normalized search params deterministically", () => {
      const h1 = hashSearchQueryParams({
        q: "  Nike ",
        page: 1,
        limit: 10,
        sort: "relevance",
      });
      const h2 = hashSearchQueryParams({
        q: "nike",
        page: 1,
        limit: 10,
        sort: "relevance",
      });
      const h3 = hashSearchQueryParams({
        q: "nike",
        page: 2,
        limit: 10,
        sort: "relevance",
      });
      assert.equal(h1, h2);
      assert.notEqual(h1, h3);
    });
  });

  describe("Zod validators & validateRequest middleware", () => {
    it("parses and coerces valid search query params with defaults", () => {
      const parsed = searchProductsQuerySchema.parse({
        q: "  pegasus  ",
        page: "2",
        limit: "12",
        sort: "price_asc",
        minPrice: "100000",
        maxPrice: "500000",
      });

      assert.deepEqual(parsed, {
        q: "pegasus",
        page: 2,
        limit: 12,
        sort: "price_asc",
        minPrice: 100000,
        maxPrice: 500000,
      });
    });

    it("rejects invalid sort or minPrice > maxPrice", () => {
      const badSort = searchProductsQuerySchema.safeParse({
        q: "nike",
        sort: "unknown",
      });
      assert.equal(badSort.success, false);

      const badRange = searchProductsQuerySchema.safeParse({
        q: "nike",
        minPrice: "500",
        maxPrice: "100",
      });
      assert.equal(badRange.success, false);
    });

    it("validates slug params cleanly", () => {
      assert.equal(
        productSlugParamSchema.safeParse({ slug: "nike-pegasus-41" }).success,
        true,
      );
      assert.equal(
        productSlugParamSchema.safeParse({ slug: "bad slug!!" }).success,
        false,
      );
    });

    it("validateRequest attaches validated query to res.locals.validated", () => {
      const mw = validateRequest({ query: searchProductsQuerySchema });
      const req = { query: { q: "nike", page: "1" }, params: {}, body: {} } as never;
      const res = { locals: {} as Record<string, unknown> } as never;
      let nextErr: unknown = "NOT_CALLED";

      mw(req, res, (err?: unknown) => {
        nextErr = err;
      });

      assert.equal(nextErr, undefined);
      assert.deepEqual(
        (res as { locals: { validated: { query: unknown } } }).locals.validated.query,
        {
          q: "nike",
          page: 1,
          limit: 10,
          sort: "relevance",
        },
      );
    });
  });

  describe("AppError & ErrorHandler", () => {
    it("formats AppError 404 responses", () => {
      const err = new AppError("Product not found", 404);
      let capturedStatus = 0;
      let capturedBody: unknown = null;

      const res = {
        headersSent: false,
        status(code: number) {
          capturedStatus = code;
          return this;
        },
        json(payload: unknown) {
          capturedBody = payload;
          return this;
        },
      } as never;

      ErrorHandler(err, {} as never, res, () => {});
      assert.equal(capturedStatus, 404);
      assert.deepEqual(capturedBody, {
        success: false,
        message: "Product not found",
      });
    });
  });

  describe("ProductService Cache-Aside & Detail Lookup", () => {
    beforeEach(() => {
      mock.restoreAll();
    });

    it("returns cached search results on Redis hit without querying MongoDB", async () => {
      const cachedPayload = {
        success: true as const,
        data: [
          {
            _id: "p1",
            name: "Cached Shoe",
            slug: "cached-shoe",
            price: 100000,
            discountPercentage: 0,
            images: ["img.jpg"],
            soldCount: 5,
            rating: 4.5,
            reviewCount: 2,
          },
        ],
        pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
      };

      mock.method(redis, "get", async () => JSON.stringify(cachedPayload));
      const findSpy = mock.method(ProductModel, "find", () => {
        throw new Error("Should not hit DB on cache hit");
      });

      const result = await ProductService.searchProducts({
        q: "cached",
        page: 1,
        limit: 10,
        sort: "newest",
      });

      assert.deepEqual(result, cachedPayload);
      assert.equal(findSpy.mock.callCount(), 0);
    });

    it("throws 404 AppError when product detail is not found", async () => {
      mock.method(redis, "get", async () => null);
      mock.method(ProductModel, "findOne", () => ({
        lean: async () => null,
      }) as never);

      await assert.rejects(
        () => ProductService.getProductDetail("non-existent-slug"),
        (err: unknown) =>
          err instanceof AppError &&
          err.statusCode === 404 &&
          err.message === "Product not found",
      );
    });

    it("fetches product detail by ObjectId or slug and caches with 600s TTL", async () => {
      const objectId = new mongoose.Types.ObjectId().toString();
      const setSpy = mock.method(redis, "set", async () => "OK");
      mock.method(redis, "get", async () => null);
      mock.method(ProductModel, "findOne", () => ({
        lean: async () => ({
          _id: objectId,
          slug: "test-shoe",
          name: "Test Shoe",
          price: 200000,
          oldPrice: 250000,
          images: ["a.jpg", "b.jpg"],
          variants: [],
          specifications: [{ key: "Size", value: "42" }],
          highlights: ["Light"],
        }),
      }) as never);

      const detail = await ProductService.getProductDetail(objectId);

      assert.equal(detail.slug, "test-shoe");
      assert.equal(detail.discountPercentage, 20);
      assert.equal(detail.originalPrice, 250000);
      assert.equal(setSpy.mock.callCount(), 1);
      assert.equal(setSpy.mock.calls[0]?.arguments[2], "EX");
      assert.equal(setSpy.mock.calls[0]?.arguments[3], 600);
    });
  });
});
