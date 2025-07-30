import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';

interface FormFieldProps {
    id?: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    level?: number;
    suggestions?: string[];
}

const MAX_LENGTH = 100;

const FormField: React.FC<FormFieldProps> = ({
                                                 id,
                                                 label,
                                                 value,
                                                 onChange,
                                                 onKeyDown,
                                                 level,
                                                 suggestions = [],
                                             }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isFocused) {
            setFilteredSuggestions([]);
            setActiveSuggestionIndex(-1);
            return;
        }

        if (suggestions.length === 0) {
            setFilteredSuggestions([]);
            setActiveSuggestionIndex(-1);
            return;
        }

        if (value) {
            // filtruj wg wpisanej wartości
            const filtered = suggestions
                .filter(s =>
                    s.toLowerCase().includes(value.toLowerCase()) &&
                    s.toLowerCase() !== value.toLowerCase()
                )
                .slice(0, 5);
            setFilteredSuggestions(filtered);
        } else {
            // jeśli puste pole - pokaż pierwsze 5 sugestii
            setFilteredSuggestions(suggestions.slice(0, 5));
        }
        setActiveSuggestionIndex(-1);
    }, [value, suggestions, isFocused]);

    // showSuggestions pokaż tylko gdy jest fokus i są filtrowane sugestie
    const showSuggestions = isFocused && filteredSuggestions.length > 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let sanitized = DOMPurify.sanitize(e.target.value);
        if (sanitized.length > MAX_LENGTH) {
            sanitized = sanitized.slice(0, MAX_LENGTH);
        }
        onChange(sanitized);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showSuggestions && filteredSuggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestionIndex(prev =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : prev
                );
                return;
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
                return;
            }

            if (e.key === 'Tab' && activeSuggestionIndex >= 0) {
                e.preventDefault();
                onChange(filteredSuggestions[activeSuggestionIndex]);
                setIsFocused(false);
                return;
            }

            if (e.key === 'Escape') {
                setIsFocused(false);
                setActiveSuggestionIndex(-1);
                return;
            }
        }

        if (onKeyDown) {
            onKeyDown(e);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        onChange(suggestion);
        setIsFocused(false);
        inputRef.current?.focus();
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // delay, żeby kliknięcie w sugestię nie zamknęło od razu dropdowna
        setTimeout(() => {
            if (!suggestionsRef.current?.contains(document.activeElement)) {
                setIsFocused(false);
            }
        }, 150);
    };

    return (
        <div className="relative w-full mb-2">
            <label
                htmlFor={id}
                className="absolute left-2 top-2 text-xs text-gray-500 dark:text-gray-400 bg-white px-1 z-10 dark:bg-gray-800"
            >
                {label}
            </label>

            <input
                ref={inputRef}
                id={id}
                type="text"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onFocus={() => setIsFocused(true)}
                maxLength={MAX_LENGTH}
                className="block w-full rounded-none border border-gray-300 bg-white px-3 pt-7 pb-2 text-sm
               placeholder-transparent focus:border-blue-400 focus:outline-none
               focus:shadow-[inset_0_0_3px_rgba(59,130,246,0.3)]
               dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500
               dark:focus:border-blue-400 dark:focus:shadow-[inset_0_0_3px_rgba(59,130,246,0.3)]"
            />

            {showSuggestions && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto"
                >
                    {filteredSuggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                index === activeSuggestionIndex
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-900 dark:text-gray-100'
                            }`}
                            onClick={() => handleSuggestionClick(suggestion)}
                            onMouseEnter={() => setActiveSuggestionIndex(index)}
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default React.memo(FormField);
