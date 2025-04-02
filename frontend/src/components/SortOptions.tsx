import React, { useState, useRef, useEffect } from "react";

interface Option {
    value: string;
    label: string;
}

interface SortOptionsProps {
    options: Option[];
    onSelect: (value: string) => void;
    sortOrder: string;
    setCurrentPage: (pageNumber: number) => void;
}

const SortOptions: React.FC<SortOptionsProps> = ({ options, onSelect, sortOrder, setCurrentPage }) => {
    const [selectedOption, setSelectedOption] = useState<string>(sortOrder);
    const [open, setOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const [dropdownWidth, setDropdownWidth] = useState<string>("auto");

    // Zamknięcie dropdowna po kliknięciu poza komponentem
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Oblicz szerokość na podstawie najdłuższego tekstu
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

    const handleSelect = (value: string) => {
        setSelectedOption(value);
        onSelect(value);
        setCurrentPage(1);
        setOpen(false);
    };

    return (
        <div className="relative flex items-center text-sm" ref={dropdownRef}>
            <div
                ref={buttonRef}
                onClick={() => setOpen(!open)}
                className="cursor-pointer py-2 px-4 border bg-white dark:bg-gray-800 border-gray-300 rounded-lg flex items-center justify-between"
                style={{ minWidth: dropdownWidth }}
            >
                <span>{options.find(opt => opt.value === selectedOption)?.label || "Sortuj"}</span>
                {/* Strzałka */}
                <svg
                    className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {open && (
                <div
                    className="absolute top-full mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-300 rounded shadow-md max-h-52 overflow-y-auto"
                    style={{ minWidth: dropdownWidth }}
                >
                    {options.map((option, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelect(option.value)}
                            className="cursor-pointer py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SortOptions;
