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

const Dropdown: React.FC<DropdownProps> = ({
                                               options,
                                               value,
                                               onChange,
                                               placeholder = "Wybierz...",
                                               error
                                           }) => {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLDivElement>(null)
    const [calculatedWidth, setCalculatedWidth] = useState<number>(120)

    // zamykanie po kliknięciu poza dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // obliczenie szerokości dropdownu według najdłuższej opcji
    useEffect(() => {
        if (buttonRef.current && options.length) {
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
            const width = tempSpan.offsetWidth + 40 // + miejsce na strzałkę
            setCalculatedWidth(width > 300 ? 300 : width) // maxWidth = 300px
            document.body.removeChild(tempSpan)
        }
    }, [options])

    const handleSelect = (val: string) => {
        onChange(val)
        setOpen(false)
    }

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            {/* przycisk */}
            <div
                ref={buttonRef}
                data-testid="dropdown-menu"
                onClick={() => setOpen(prev => !prev)}
                className={`cursor-pointer py-2 px-4 border text-sm rounded-lg flex items-center justify-between
                    bg-white dark:bg-gray-800
                    ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
                `}
                style={{ minWidth: calculatedWidth, maxWidth: 300 }}
            >
                <span
                    className="truncate"
                    title={options.find(opt => opt.value === value)?.label || placeholder}
                >
                    {options.find(opt => opt.value === value)?.label || placeholder}
                </span>
                <svg
                    className={`h-4 w-4 ml-2 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
            </div>

            {/* menu */}
            {open && (
                <div
                    className="absolute top-full mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-md max-h-52 overflow-y-auto"
                    style={{ minWidth: calculatedWidth, maxWidth: 400 }}
                >
                    {options.map(option => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            aria-label={option.value}
                            className="cursor-pointer py-2 px-4 hover:bg-gray-200 dark:hover:bg-gray-700 truncate"
                            title={option.label}
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
