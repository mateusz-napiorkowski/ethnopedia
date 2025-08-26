import React, { useState, useEffect, useRef } from "react"

export interface Option {
    value: string
    label: string
}

interface DropdownProps {
    options: Option[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    error?: boolean
}

const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, placeholder = "Wybierz...", error }) => {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLDivElement>(null)
    const [dropdownWidth, setDropdownWidth] = useState<string>("auto")

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        if (buttonRef.current) {
            const longestOption = options.reduce(
                (max, opt) => (opt.label.length > max.length ? opt.label : max),
                ""
            )
            const tempSpan = document.createElement("span")
            tempSpan.style.visibility = "hidden"
            tempSpan.style.position = "absolute"
            tempSpan.style.whiteSpace = "nowrap"
            tempSpan.textContent = longestOption
            document.body.appendChild(tempSpan)
            setDropdownWidth(`${tempSpan.offsetWidth + 40}px`)
            document.body.removeChild(tempSpan)
        }
    }, [options])

    const handleSelect = (value: string) => {
        onChange(value)
        setOpen(false)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                ref={buttonRef}
                data-testid="dropdown-menu"
                onClick={() => setOpen((prev) => !prev)}
                className={`cursor-pointer py-2 px-4 border text-sm rounded-lg flex items-center justify-between
                bg-white dark:bg-gray-800
                 ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
    `}
                style={{minWidth: dropdownWidth, maxWidth: "300px"}} // <- dodany maxWidth
            >
                <span className="truncate" title={options.find((opt) => opt.value === value)?.label || placeholder}>
                    {options.find((opt) => opt.value === value)?.label || placeholder}
                </span>
                <svg
                    className={`h-4 w-4 ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </div>

            {open && (
                <div
                    className="absolute top-full mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-md max-h-52 overflow-y-auto"
                    style={{ minWidth: dropdownWidth, maxWidth: "400px" }} // <- max szerokość dropdownu
                >
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            aria-label={option.value}
                            className="cursor-pointer py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-700 truncate"
                            title={option.label} // <- tooltip z pełną nazwą
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}

export default Dropdown
