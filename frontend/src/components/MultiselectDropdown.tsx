import React, { useState, useEffect, useRef } from "react";

export type Option = {
    value: string;
    label: string;
};

type MultiselectDropdownProps = {
    selectedValues: string[];
    setSelectedValues: (values: string[]) => void;
    options: Option[];
    specialOptions?: Option[]; // np. Select All / Deselect All
    formatOptionLabel?: (option: Option, context: { context: string }) => React.ReactNode;
    placeholder?: string;
};

const MultiselectDropdown: React.FC<MultiselectDropdownProps> = ({
                                                                     selectedValues,
                                                                     setSelectedValues,
                                                                     options,
                                                                     specialOptions = [],
                                                                     formatOptionLabel = (opt) => opt.label,
                                                                     placeholder = "Wybierz opcje",
                                                                 }) => {
    const [open, setOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (value: string) => {
        if (selectedValues.includes(value)) {
            if (selectedValues.length === 1) return;
            setSelectedValues(selectedValues.filter((v) => v !== value));
        } else {
            setSelectedValues([...selectedValues, value]);
        }
    };

    const handleSpecialOption = (option: Option) => {
        if (option.value === "select_all") {
            const allValues = options.map((opt) => opt.value);
            setSelectedValues(allValues);
        } else if (option.value === "deselect_all") {
            const defaultSelection = options.length ? [options[0].value] : [];
            setSelectedValues(defaultSelection);
        }
    };

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
            const isChecked = selectedValues.includes(option.value);
            return (
                <div
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
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

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setOpen(!open)}
                className="cursor-pointer py-2 px-4 border bg-white dark:bg-gray-800 border-gray-300 rounded-lg text-sm flex items-center justify-between w-full"
            >
                <span className="pr-4">
                    {selectedValues.length > 0 ? `${selectedValues.length}` : placeholder}
                </span>
                <svg
                    className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </div>

            {open && (
                <div
                    className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-300 mt-1 rounded shadow-md max-h-60 overflow-y-auto min-w-full w-max"
                >

                    <div
                        className="sticky top-0 bg-white dark:bg-gray-800 px-4 py-2 border-b border-gray-300 z-10"
                    >
                        <input
                            type="text"
                            placeholder="Szukaj..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                        />
                    </div>

                    {specialOptions.map(renderOptionItem)}
                    {filteredOptions.map(renderOptionItem)}
                </div>
            )}

        </div>
    );
};

export default MultiselectDropdown;
