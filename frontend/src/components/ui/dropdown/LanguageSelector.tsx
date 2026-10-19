"use strict";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import DropDown from "@/components/ui/dropdown/DropDown";

interface LanguageSelectorProps {
  languages?: string[];
  value?: string;
  onChange?: (language: string) => void;
}

const defaultLanguages = ["English", "Vietnamese", "Chinese"];

export default function LanguageSelector({
  languages = defaultLanguages,
  value,
  onChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState(value ?? languages[0] ?? "Language");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (value !== undefined) setSelectedLanguage(value);
  }, [value]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [isOpen]);

  const selectLanguage = (language: string) => {
    setSelectedLanguage(language);
    onChange?.(language);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Select language, current language: ${selectedLanguage}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex h-10 items-center gap-2 rounded-md px-2 text-black hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        onClick={() => setIsOpen((open) => !open)}>
        <FontAwesomeIcon icon={faGlobe} className="text-xl" />
        <span className="sr-only">{selectedLanguage}</span>
      </button>
      {isOpen && <DropDown items={languages} onClick={selectLanguage} />}
    </div>
  );
}
