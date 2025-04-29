import React from 'react';
import { Metadata } from '../../@types/Metadata';

interface FormFieldProps {
    formData: Metadata;
    index: string;
    level: number;
    handleInputChange: (index: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (index: string, e: React.KeyboardEvent<HTMLInputElement>) => void;
    errorPaths: string[];
}

const FormField: React.FC<FormFieldProps> = ({
                                                 formData,
                                                 index,
                                                 level,
                                                 handleInputChange,
                                                 handleKeyDown,
                                                 errorPaths,
                                             }) => {

    return (
        <div className="relative flex flex-col mt-1">
            {/* Obszar dla pola kategorii i przycisków */}
            <div
                className="field-container relative flex items-center"
            >
                {level > 0 && (
                    <>
                        {/* Pionowa linia */}
                        <div className="tree-line vertical" />
                        {/* Pozioma linia */}
                        <div className="tree-line horizontal" />
                    </>
                )}
                <label className="flex items-center">
                    <span className="">{formData.name} :</span>
                </label>
                <label className="flex items-center px-2">
                    <input
                        id={`field-${index}`}  // Dodajemy id dla łatwiejszego dostępu
                        type="text"
                        name="value"
                        value={formData.value || ''}
                        onChange={(e) => handleInputChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}  // Obsługuje przejście przy Enter
                        className={`p-2 border rounded ${
                            errorPaths.includes(index) ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                </label>
            </div>
            {/* Obszar renderowania podkategorii – oddzielony od obszaru pola */}
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
