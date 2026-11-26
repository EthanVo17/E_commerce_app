const SEARCH_HISTORY_KEY = "search_history";
const MAX_HISTORY_ITEMS = 10;

export function loadSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function saveSearchHistory(history: string[]): void {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

export function addSearchHistoryItem(prev: string[], keyword: string): string[] {
  const trimmed = keyword.trim();
  if (!trimmed) return prev;

  const filtered = prev.filter(
    (item) => item.toLocaleLowerCase() !== trimmed.toLocaleLowerCase(),
  );
  return [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
}
