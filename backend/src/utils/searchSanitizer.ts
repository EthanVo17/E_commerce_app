import crypto from "node:crypto";
import type { SearchProductsParams } from "../types/Product.type.js";

const MAX_REGEX_KEYWORD_LENGTH = 80;

const VIETNAMESE_CHAR_GROUPS: Record<string, string> = {
  a: "[aàáảãạăằắẳẵặâầấẩẫậ]",
  d: "[dđ]",
  e: "[eèéẻẽẹêềếểễệ]",
  i: "[iìíỉĩị]",
  o: "[oòóỏõọôồốổỗộơờớởỡợ]",
  u: "[uùúủũụưừứửữự]",
  y: "[yỳýỷỹỵ]",
};

export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripDiacritics(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function buildSafeSearchRegex(rawKeyword: string): string {
  const normalized = rawKeyword
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, MAX_REGEX_KEYWORD_LENGTH);

  if (!normalized) {
    return "";
  }

  let pattern = "";
  for (const ch of normalized) {
    if (ch === " ") {
      pattern += "\\s+";
      continue;
    }

    const base = stripDiacritics(ch).toLowerCase();
    const isAsciiOriginal = ch.toLowerCase() === base;

    if (isAsciiOriginal && VIETNAMESE_CHAR_GROUPS[base]) {
      pattern += VIETNAMESE_CHAR_GROUPS[base];
    } else {
      pattern += escapeRegex(ch);
    }
  }

  return pattern;
}

export function hashSearchQueryParams(params: SearchProductsParams): string {
  const normalized = {
    q: params.q.trim().toLowerCase(),
    page: params.page,
    limit: params.limit,
    sort: params.sort,
    minPrice: params.minPrice ?? null,
    maxPrice: params.maxPrice ?? null,
  };

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(normalized))
    .digest("hex")
    .slice(0, 24);
}
