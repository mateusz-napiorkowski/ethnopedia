import React from 'react';
import DOMPurify from 'dompurify';

interface FormFieldProps {
    id?: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    level?: number;
}

const MAX_LENGTH = 100;

const FormField: React.FC<FormFieldProps> = ({
                                                 id,
                                                 label,
                                                 value,
                                                 onChange,
                                                 onKeyDown,
                                                 level = 0,
                                             }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let sanitized = DOMPurify.sanitize(e.target.value);
        if (sanitized.length > MAX_LENGTH) {
            sanitized = sanitized.slice(0, MAX_LENGTH);
        }
        onChange(sanitized);
    };

    return (
        <div
            className="relative w-full mb-2"
        >
            {/* Etykieta osadzona wewnątrz pola */}
            <label
                htmlFor={id}
                className="absolute left-2 top-2 text-xs text-gray-500 dark:text-gray-400 bg-white px-1 z-10 dark:bg-gray-800"
            >
                {label}
            </label>

            <input
                id={id}
                type="text"
                value={value}
                onChange={handleChange}
                onKeyDown={onKeyDown}
                maxLength={MAX_LENGTH}
                className="block w-full rounded-none border border-gray-300 bg-white px-3 pt-7 pb-2 text-sm
               placeholder-transparent focus:border-blue-400 focus:outline-none
               focus:shadow-[inset_0_0_3px_rgba(59,130,246,0.3)]
               dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500
               dark:focus:border-blue-400 dark:focus:shadow-[inset_0_0_3px_rgba(59,130,246,0.3)]"
            />


        </div>
    );
};

export default React.memo(FormField);
