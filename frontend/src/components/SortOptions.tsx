import React, { useState, useEffect, useRef } from "react";

export interface Option {
    value: string;
    label: string;
}

interface SortOptionsProps {
    options: Option[];
    sortCategory: string;
    sortDirection: string;
    onSelectCategory: (value: string) => void;
    onSelectDirection: (value: string) => void;
    setCurrentPage: (pageNumber: number) => void;
}

const SortOptions: React.FC<SortOptionsProps> = ({
                                                     options,
                                                     sortCategory,
                                                     sortDirection,
                                                     onSelectCategory,
                                                     onSelectDirection,
                                                     setCurrentPage,
                                                 }) => {
    const [open, setOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const [dropdownWidth, setDropdownWidth] = useState<string>("auto");

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (buttonRef.current) {
            const longestOption = options.reduce(
                (max, opt) => (opt.label.length > max.length ? opt.label : max),
                ""
            );
            const tempSpan = document.createElement("span");
            tempSpan.style.visibility = "hidden";
            tempSpan.style.position = "absolute";
            tempSpan.style.whiteSpace = "nowrap";
            tempSpan.textContent = longestOption;
            document.body.appendChild(tempSpan);
            setDropdownWidth(`${tempSpan.offsetWidth + 40}px`);
            document.body.removeChild(tempSpan);
        }
    }, [options]);

    const handleSelectCategory = (value: string) => {
        onSelectCategory(value);
        setCurrentPage(1);
        setOpen(false);
    };

    const toggleSortDirection = () => {
        onSelectDirection(sortDirection === "asc" ? "desc" : "asc");
        setCurrentPage(1);
    };

    return (
        <div className="flex items-center space-x-1">
            <div className="relative" ref={dropdownRef}>
                <div
                    ref={buttonRef}
                    onClick={() => setOpen((prev) => !prev)}
                    className="cursor-pointer py-2 px-4 border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm rounded-lg flex items-center justify-between"
                    style={{ minWidth: dropdownWidth }}
                    aria-label="sortby-category-dropdown"
                >
                    <span>{options.find((opt) => opt.value === sortCategory)?.label || "Wybierz kategorię"}</span>
                    <svg
                        className={`h-4 w-4 ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                {open && (
                    <div
                        className="absolute top-full mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-md max-h-52 overflow-y-auto"
                        style={{ minWidth: dropdownWidth }}
                    >
                        {options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSelectCategory(option.value)}
                                className="cursor-pointer py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-700"
                                aria-label={option.label}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={toggleSortDirection}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Zmień kierunek sortowania"
                title={sortDirection === "asc" ? "Sortuj rosnąco" : "Sortuj malejąco"}
            >
                <svg
                    className={`h-5 w-5 text-gray-700 dark:text-gray-200 transition-transform duration-200 ${
                        sortDirection === "asc" ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m0 0l6-6m-6 6l-6-6"
                    />
                </svg>


            </button>
        </div>
    );
};

export default SortOptions;
