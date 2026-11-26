import React from "react";
import { useNavigate } from "react-router-dom";
import SearchDropDownUI from "../dropdown/SearchDropDownUI";
import {
  addSearchHistoryItem,
  loadSearchHistory,
  saveSearchHistory,
} from "@/utils/searchHistory";

export default function SearchInput() {
  const navigate = useNavigate();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState("");
  const [storequery, setStoreQuery] =
    React.useState<string[]>(loadSearchHistory);
  const [showSearchHistory, setShowSearchHistory] = React.useState(false);

  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setShowSearchHistory(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  React.useEffect(() => {
    saveSearchHistory(storequery);
  }, [storequery]);

  const handleAdd = (keyword: string) => {
    setStoreQuery((prev) => addSearchHistoryItem(prev, keyword));
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;

    handleAdd(value);
    setShowSearchHistory(false);
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const handleSelectSuggestion = (keyword: string) => {
    setQuery(keyword);
    handleAdd(keyword);
    setShowSearchHistory(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-[320px]">
      <form className="w-full" autoComplete="off" onSubmit={handleSearch}>
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
            <svg
              className="h-4 w-4 text-black"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="search"
            className="block w-full rounded-sm border border-gray-300 bg-white p-3 ps-9 text-sm text-black shadow-xs placeholder:text-gray-500 focus:border-gray-500 focus:ring-gray-300"
            placeholder="Search"
            value={query}
            onFocus={() => setShowSearchHistory(true)}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            type="submit"
            className="absolute end-1.5 bottom-1.5 cursor-pointer rounded bg-brand px-3 py-1.5 text-xs font-medium leading-5 text-black shadow-xs hover:bg-brand-strong focus:outline-none focus:ring-4 focus:ring-brand-medium">
            Search
          </button>
        </div>
      </form>
      {showSearchHistory && (
        <SearchDropDownUI
          value={query}
          listSearch={storequery}
          onSelect={handleSelectSuggestion}
        />
      )}
    </div>
  );
}
