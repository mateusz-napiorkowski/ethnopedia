import React, { useState } from 'react';
import { Metadata } from '../../@types/Metadata';
import DOMPurify from 'dompurify';

interface FormFieldProps {
    formData: Metadata;
    index: string;
    level: number;
    handleInputChange: (index: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (index: string, e: React.KeyboardEvent<HTMLInputElement>) => void;
    errorPaths: string[];
}

const MAX_LENGTH = 100;

const FormField: React.FC<FormFieldProps> = ({
                                                 formData,
                                                 index,
                                                 level,
                                                 handleInputChange,
                                                 handleKeyDown,
                                                 errorPaths,
                                             }) => {
    const [localError, setLocalError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const sanitized = DOMPurify.sanitize(input);

        if (input !== sanitized) {
            setLocalError('Wartość zawiera niedozwolone znaki (np. <, >)');
            return;
        }

        if (input.length > MAX_LENGTH) {
            setLocalError(`Wartość nie może przekraczać ${MAX_LENGTH} znaków.`);
            return;
        }

        setLocalError(null);
        handleInputChange(index, e);
    };

    return (
        <div className="relative flex flex-col mt-1">
            {/* Obszar dla pola kategorii i przycisków */}
            <div className="field-container relative flex items-center">
                {level > 0 && (
                    <>
                        <div className="tree-line vertical" />
                        <div className="tree-line horizontal" />
                    </>
                )}
                <label className="flex items-center">
                    <span className="">{formData.name} :</span>
                </label>
                <label className="flex items-center px-2">
                    <input
                        id={`field-${index}`}
                        type="text"
                        name="value"
                        value={formData.value || ''}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        maxLength={MAX_LENGTH}
                        className={`p-2 border rounded ${
                            errorPaths.includes(index) || localError ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                </label>
            </div>
            {localError && (
                <p className="text-sm text-red-500 ml-28 mt-1">{localError}</p>
            )}
            {/* Podkategorie */}
            <div className="children-container ml-8">
                {formData.subcategories &&
                    formData.subcategories.map((subCategory, subIndex) => {
                        const uniqueSubIndex = `${index}-${subIndex}`;
                        return (
                            <div key={uniqueSubIndex} className="relative">
                                <div className="tree-line vertical-helper" />
                                <FormField
                                    index={uniqueSubIndex}
                                    level={level + 1}
                                    formData={subCategory}
                                    handleInputChange={handleInputChange}
                                    handleKeyDown={handleKeyDown}
                                    errorPaths={errorPaths}
                                />
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default React.memo(FormField);
