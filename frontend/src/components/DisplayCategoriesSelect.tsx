import React, { useState, useEffect, useRef } from "react";

export type Option = {
    value: string;
    label: string;
};

type DisplayCategoriesSelectProps = {
    selectedDisplayCategories: string[];
    setSelectedDisplayCategories: (categories: string[]) => void;
    categoryOptions: Option[];
    customOptions: Option[];
    formatOptionLabel: (option: Option, context: { context: string }) => React.ReactNode;
};

const DisplayCategoriesSelect: React.FC<DisplayCategoriesSelectProps> = ({
                                                                             selectedDisplayCategories,
                                                                             setSelectedDisplayCategories,
                                                                             categoryOptions,
                                                                             customOptions,
                                                                             formatOptionLabel,
                                                                         }) => {
    const [open, setOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Zamykamy dropdown przy kliknięciu poza obszarem komponentu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Funkcja przełączająca zaznaczenie pojedynczej kategorii
    const toggleCategory = (categoryValue: string) => {
        if (selectedDisplayCategories.includes(categoryValue)) {
            // Zapobiegamy usunięciu ostatniej zaznaczonej kategorii
            if (selectedDisplayCategories.length === 1) return;
            setSelectedDisplayCategories(selectedDisplayCategories.filter((cat) => cat !== categoryValue));
        } else {
            setSelectedDisplayCategories([...selectedDisplayCategories, categoryValue]);
        }
    };

    // Obsługa opcji specjalnych
    const handleSpecialOption = (option: Option) => {
        if (option.value === "select_all") {
            const allCategories = categoryOptions.map((opt) => opt.value);
            setSelectedDisplayCategories(allCategories);
        } else if (option.value === "deselect_all") {
            const defaultSelection = categoryOptions.length ? [categoryOptions[0].value] : [];
            setSelectedDisplayCategories(defaultSelection);
        }
    };

    // Renderowanie pojedynczej opcji
    const renderOptionItem = (option: Option) => {
        if (option.value === "select_all" || option.value === "deselect_all") {
            return (
                <div
                    key={option.value}
                    onClick={() => {
                        handleSpecialOption(option);
                        setOpen(false);
                    }}
                    className="cursor-pointer py-2 px-4 border-b border-gray-300"
                >
                    {formatOptionLabel(option, { context: "menu" })}
                </div>
            );
        } else {
            const isChecked = selectedDisplayCategories.includes(option.value);
            return (
                <div
                    key={option.value}
                    onClick={() => toggleCategory(option.value)}
                    className="cursor-pointer flex items-center py-2 px-4 border-b border-gray-300"
                >
                    <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="mr-2"
                    />
                    <span>{option.label}</span>
                </div>
            );
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Pole wyboru – wyświetla liczbę zaznaczonych kategorii*/}
            <div
                onClick={() => setOpen(!open)}
                className="cursor-pointer py-2 px-4 border bg-white dark:bg-gray-800 border-gray-300 rounded-lg text-sm flex items-center justify-between w-full"
            >
    <span className="pr-4">
        {selectedDisplayCategories.length > 0
            ? `${selectedDisplayCategories.length}`
            : "Wybierz kategorię"}
    </span>
                {/* Strzałka */}
                <svg
                    className={`h-4 w-4 transition-transform duration-200 ${open ? "transform rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </div>
            {/* Rozwijana lista */}
            {open && (
                <div
                    className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-300 mt-1 rounded shadow-md max-h-60 overflow-y-auto"
                    style={{minWidth: "100%", width: "auto"}}
                >
                    {customOptions.map((option) => renderOptionItem(option))}
                </div>
            )}
        </div>
    );
};

export default DisplayCategoriesSelect;
