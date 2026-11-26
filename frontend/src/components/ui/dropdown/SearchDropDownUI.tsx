import { Link } from "react-router-dom";
import type { SearchDropDownProps } from "@/types/search";

export default function SearchDropDownUI({
  value,
  listSearch,
  onSelect,
}: SearchDropDownProps) {
  const suggestions =
    listSearch.length > 0 ? listSearch : value.trim() ? [value] : [];

  return (
    <div className="absolute left-0 top-[calc(100%+8px)] z-[60] w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-2 text-black shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
      {suggestions.length > 0 ? (
        <ul className="m-0 list-none space-y-1 p-0">
          {suggestions.map((item, index) => (
            <li key={`${item}-${index}`}>
              <Link
                to={`/search?q=${encodeURIComponent(item)}`}
                onClick={() => onSelect?.(item)}
                className="flex h-9 w-full items-center rounded-lg px-3 text-left text-sm text-black transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
                {item}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex h-9 items-center px-3 text-sm text-gray-500">
          Start typing to see suggestions
        </div>
      )}
    </div>
  );
}
