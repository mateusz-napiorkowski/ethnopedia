import React, { useState, useEffect } from 'react';
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
}

const FormField: React.FC<FormFieldProps> = ({
                                                 formData,
                                                 formDataList,
                                                 index,
                                                 level,
                                                 handleInputChange,
                                                 handleRemove,
                                                 handleAddSubcategory,
                                             }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isSubCategoryHovered, setIsSubCategoryHovered] = useState(false);

    // Funkcja resetująca stan hovera
    useEffect(() => {
        if (!formDataList.some((category) => category.name === formData.name)) {
            setIsHovered(false);
            setIsSubCategoryHovered(false);
        }
    }, [formDataList]);

    return (
        <div
            className="relative flex flex-col pb-1 mt-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative flex items-center">
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
                        placeholder="Podaj nazwę kategorii..."
                        className="mx-2 p-2"
                    />
                </label>
                <label className="flex items-center">
                    <span>:</span>
                    <input
                        type="text"
                        name="values"
                        value={formData.values[0]}
                        onChange={(e) => handleInputChange(index, e)}
                        className="mx-2 p-2"
                    />
                </label>
                <div className="actions">
                    {level < 5 && isHovered && !isSubCategoryHovered && (
                        <button
                            type="button"
                            onClick={() => handleAddSubcategory(index)}
                            title="Dodaj podkategorię"
                        >
                            <PlusIcon />
                        </button>
                    )}
                    {isHovered && !isSubCategoryHovered && (
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            title="Usuń kategorię"
                        >
                            <MinusIcon />
                        </button>
                    )}
                </div>
            </div>
            {/* Podkategorie */}
            {formData.subcategories &&
                formData.subcategories.map((subCategory, subIndex) => {
                    const uniqueSubIndex = `${index}-${subIndex}`;
                    return (
                        <div
                            key={uniqueSubIndex}
                            className="ml-8 relative"
                            onMouseEnter={() => setIsSubCategoryHovered(true)}
                            onMouseLeave={() => setIsSubCategoryHovered(false)}
                        >
                            <div className="tree-line vertical-helper" />
                            <FormField
                                index={uniqueSubIndex}
                                level={level + 1}
                                formData={subCategory}
                                formDataList={formDataList}
                                handleInputChange={handleInputChange}
                                handleRemove={handleRemove}
                                handleAddSubcategory={handleAddSubcategory}
                            />
                        </div>
                    );
                })}
        </div>
    );
};

export default React.memo(FormField);
