"use strict";

import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

import SearchInput from "@/components/ui/search/SearchInput";

export default function LeftHeader() {
  const categories = [];
  const [hover, setHover] = React.useState(false);
  return (
    <>
      {/**Logo */}
      <div id="logo" className="w-[120px] h-[50px] ml-[70px]">
        <div className="bg-[#9b9c9e] w-[120px] h-[60px]" />
      </div>

      {/**Left header */}
      <div id="left-header" className="flex ml-[20px]">
        {/**Search bar */}
        <div id="search-bar">
          <SearchInput />
        </div>

        <div className="flex items-center ml-[15px] ">
          <div
            id="explore"
            className="flex items-center justify-center w-auto h-[36px] pl-[10px] pr-[10px] ml-[15px] mr-[15px] hover:border-[#d4d6d6] hover:border-black hover:border rounded-sm cursor-pointer">
            <Link to="/explore">
              <p className="text-black text-lg font-medium">Explore</p>
            </Link>
          </div>

          <div
            id="category"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="flex items-center justify-center w-auto h-[36px] pl-[10px] pr-[10px] ml-[15px] mr-[15px]  hover:border-[#d4d6d6] hover:border-black hover:border rounded-sm cursor-pointer">
            <p className="text-black text-lg font-medium">Categories</p>
            <FontAwesomeIcon icon={faAngleDown} />
          </div>

          {hover && <div className=""></div>}
        </div>
      </div>
    </>
  );
}
