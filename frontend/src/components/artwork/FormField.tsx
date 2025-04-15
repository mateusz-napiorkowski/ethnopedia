import React from 'react';
import { Metadata } from '../../@types/Metadata';

interface FormFieldProps {
    formData: Metadata;
    formDataList: Metadata[];
    index: string;
    level: number;
    handleInputChange: (index: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    errorPaths: string[];
}

const FormField: React.FC<FormFieldProps> = ({
                                                 formData,
                                                 formDataList,
                                                 index,
                                                 level,
                                                 handleInputChange,
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
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        className="p-2 border rounded"
                        onChange={(e) => handleInputChange(index, e)}
                        disabled
                    />
                </label>
                <label className="flex items-center">
                    <span className="ml-1 mr-1">
                        :
                    </span>
                    <input
                        type="text"
                        name="value"
                        value={formData.value || ""}
                        onChange={(e) => handleInputChange(index, e)}
                        // placeholder={`Podaj wartość kategorii...`}
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
                                    formDataList={formDataList}
                                    handleInputChange={handleInputChange}
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
