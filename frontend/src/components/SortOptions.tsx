import React, { useState } from "react"

interface Option {
    value: string
    label: string
}

interface SortOptionsProps {
    options: Option[]
    onSelect: (value: string) => void,
    sortOrder: string
}

const SortOptions: React.FC<SortOptionsProps> = ({ options, onSelect, sortOrder }) => {
    const [selectedOption, setSelectedOption] = useState<string>(sortOrder)

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value)
        onSelect(event.target.value)
    }

    return <div className="flex flex-row items-center ml-2 custom-dropdown text-sm">
        <p className="pr-2">Sortuj:</p>
        <select
            value={selectedOption}
            onChange={handleChange}
            className="py-2 px-4 border bg-white border border-gray-300 rounded-lg cursor-pointer"
        >
            {options.map((option, index) => (
                <option key={index} value={option.value} className="py-2 px-4 cursor-pointer">
                    {option.label}
                </option>
            ))}
        </select>
    </div>
}

export default SortOptions
