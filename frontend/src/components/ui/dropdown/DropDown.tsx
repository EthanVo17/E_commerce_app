"use strict";

interface Props {
  items: string[];
  onClick: (item: string) => void;
}

export default function DropDown({ items, onClick }: Props) {
  return (
    <div
      id="dropdownNavbar"
      className="absolute right-0 top-full z-10 mt-2 w-44 rounded-base border border-default-medium bg-white shadow-lg">
      <ul
        className="p-2 text-sm text-body font-medium"
        aria-labelledby="dropdownLargeButton">
        {items.map((item) => (
          <li key={item}>
            <button
              type="button"
              onClick={() => onClick(item)}
              className="inline-flex w-full items-center rounded p-2 text-left hover:bg-[#f0f0f0] hover:text-heading">
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
