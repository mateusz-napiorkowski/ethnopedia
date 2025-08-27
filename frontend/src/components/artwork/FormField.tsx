import React, { useState, useRef, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';

interface FormFieldProps {
    id?: string;
    label: string;
    value: string;
    onChange: (value: string, isUserTyping?: boolean) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    level?: number;
    suggestions?: string[];
}

const MAX_LENGTH = 250;

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
    const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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

    // Calculate dropdown position to avoid sticky bottom bar
    const calculateDropdownPosition = useCallback(() => {
        if (!containerRef.current || !isFocused || filteredSuggestions.length === 0) return;

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const stickyBarHeight = 80; // Height of the sticky bottom bar
        const dropdownMaxHeight = 160; // max-h-40 = 10rem = 160px

        // Calculate space below the input
        const spaceBelow = viewportHeight - rect.bottom - stickyBarHeight;

        // If there's not enough space below, position above
        if (spaceBelow < dropdownMaxHeight && rect.top > dropdownMaxHeight) {
            setDropdownPosition('top');
        } else {
            setDropdownPosition('bottom');
        }
    }, [isFocused, filteredSuggestions.length]);

    // Recalculate position when suggestions change or on scroll/resize
    useEffect(() => {
        calculateDropdownPosition();

        const handleResize = () => calculateDropdownPosition();
        const handleScroll = () => calculateDropdownPosition();

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [calculateDropdownPosition]);

    // showSuggestions pokaż tylko gdy jest fokus i są filtrowane sugestie
    const showSuggestions = isFocused && filteredSuggestions.length > 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let sanitized = DOMPurify.sanitize(e.target.value);
        if (sanitized.length > MAX_LENGTH) {
            sanitized = sanitized.slice(0, MAX_LENGTH);
        }
        // This is user typing, so mark it as such for debouncing
        onChange(sanitized, true);
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
                // This is autocomplete selection, not user typing
                onChange(filteredSuggestions[activeSuggestionIndex], false);
                setIsFocused(false);
                return;
            }

            if (e.key === 'Escape') {
                setIsFocused(false);
                setActiveSuggestionIndex(-1);
                return;
            }
        }

        // Pass through to parent handler for field navigation
        if (onKeyDown) {
            onKeyDown(e);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        // This is autocomplete selection, not user typing
        onChange(suggestion, false);
        setIsFocused(false);
        inputRef.current?.focus();
    };

    const handleFocus = () => {
        setIsFocused(true);
        // Calculate position when focused
        setTimeout(() => calculateDropdownPosition(), 0);
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
        <div ref={containerRef} className="relative w-full mb-2">
            <label
                htmlFor={id}
                className="absolute left-2 top-2 text-xs text-gray-500 dark:text-gray-400 bg-white px-1 z-10 dark:bg-gray-800 max-w-[calc(100%-16px)] truncate"
                title={label} // tooltip pokazujący pełną nazwę
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
                onFocus={handleFocus}
                maxLength={MAX_LENGTH}
                autoComplete="off"
                className="block w-full rounded-none border border-gray-300 bg-white px-3 pt-7 pb-2 text-sm
               placeholder-transparent focus:border-blue-400 focus:outline-none
               focus:shadow-[inset_0_0_3px_rgba(59,130,246,0.3)]
               dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500
               dark:focus:border-blue-400 dark:focus:shadow-[inset_0_0_3px_rgba(59,130,246,0.3)]"
            />

            {showSuggestions && (
                <div
                    ref={suggestionsRef}
                    data-suggestions-dropdown
                    className={`absolute z-20 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto ${
                        dropdownPosition === 'top'
                            ? 'bottom-full mb-1'
                            : 'top-full mt-1'
                    }`}
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