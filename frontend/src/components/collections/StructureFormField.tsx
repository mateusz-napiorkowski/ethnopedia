import React, { useState } from 'react';
import { Category } from '../../@types/Category';
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg";
import { ReactComponent as MinusIcon } from "../../assets/icons/minus.svg";

interface FormFieldProps {
    formData: Category;
    formDataList: Category[];
    index: string;
    level: number;
    handleInputChange: (index: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemove: (index: string) => void;
    handleAddSubcategory: (index: string) => void;
    isEditMode: boolean;
}

const StructureFormField: React.FC<FormFieldProps> = ({
                                                          formData,
                                                          formDataList,
                                                          index,
                                                          level,
                                                          handleInputChange,
                                                          handleRemove,
                                                          handleAddSubcategory,
                                                          isEditMode,
                                             }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="relative flex flex-col mt-1">
            {/* Obszar dla pola kategorii i przycisków */}
            <div
                className="field-container relative flex items-center"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
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
                        onChange={(e) => handleInputChange(index, e)}
                        // placeholder={`[${index}] Podaj nazwę kategorii...`}
                        placeholder={`Podaj nazwę kategorii...`}
                        className="p-2 border rounded"
                    />
                </label>
                <div className="actions ml-1 space-x-1">
                    {level < 5 && isHovered && (
                        <button
                            type="button"
                            onClick={() => handleAddSubcategory(index)}
                            title={`Dodaj podkategorię`}
                        >
                            <PlusIcon />
                        </button>
                    )}
                    {isHovered && (
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            disabled={isEditMode}
                            title={`Usuń kategorię`}
                        >
                            <MinusIcon />
                        </button>
                    )}
                </div>
            </div>
            {/* Obszar renderowania podkategorii – oddzielony od obszaru pola */}
            <div className="children-container ml-8">
                {formData.subcategories &&
                    formData.subcategories.map((subCategory, subIndex) => {
                        const uniqueSubIndex = `${index}-${subIndex}`;
                        return (
                            <div key={uniqueSubIndex} className="relative">
                                <div className="tree-line vertical-helper" />
                                <StructureFormField
                                    index={uniqueSubIndex}
                                    level={level + 1}
                                    formData={subCategory}
                                    formDataList={formDataList}
                                    handleInputChange={handleInputChange}
                                    handleRemove={handleRemove}
                                    handleAddSubcategory={handleAddSubcategory}
                                    isEditMode={isEditMode}
                                />
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default React.memo(StructureFormField);
