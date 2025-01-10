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
    const [isHovered, setIsHovered] = useState(false); // Stan hovera dla każdego elementu
    const [subCategoryHovered, setSubCategoryHovered] = useState(false); // Stan hovera dla subkategorii

    // Funkcja sprawdzająca, czy to ostatni element w danym poziomie
    const isLastChild = (index: string, formDataList: Category[]): boolean => {
        const parts = index.split('-').map(Number);

        let currentList = formDataList;
        for (let i = 0; i < parts.length - 1; i++) {
            const parentIndex = parts[i];
            currentList = currentList[parentIndex]?.subcategories || [];
        }

        const currentIndex = parts[parts.length - 1];
        return currentList[currentIndex] === currentList[currentList.length - 1];
    };

    return (
        <div
            className="relative flex flex-col pb-1 mt-1"
            onMouseEnter={() => setIsHovered(true)} // Zmiana stanu na true, gdy myszka nad elementem
            onMouseLeave={() => setIsHovered(false)} // Zmiana stanu na false, gdy myszka opuści element
        >
            <div className="relative flex items-center">
                {level > 0 && (
                    <>
                        {/* Pionowa linia */}
                        <div
                            className="tree-line vertical"
                            style={{
                                height: isLastChild(index, formDataList) ? '50%' : '100%',
                                top: 0,
                                left: '-16px',
                            }}
                        />
                        {/* Pozioma linia */}
                        <div
                            className="tree-line horizontal"
                            style={{
                                width: '16px',
                                left: '-16px',
                                top: '50%',
                            }}
                        />
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
                    {/* Tylko przyciski dla aktualnej kategorii/subkategorii */}
                    {level < 5 && isHovered && !subCategoryHovered && (
                        <button
                            type="button"
                            onClick={() => handleAddSubcategory(index)}
                            title="Dodaj podkategorię"
                        >
                            <PlusIcon />
                        </button>
                    )}
                    {isHovered && !subCategoryHovered && (
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
                            onMouseEnter={() => setSubCategoryHovered(true)} // Ustawienie hovera na subkategorię
                            onMouseLeave={() => setSubCategoryHovered(false)} // Ustawienie hovera na false po opuszczeniu subkategorii
                        >
                            <div
                                className="tree-line vertical-helper"
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '-16px',
                                    height: '100%',
                                    width: '2px',
                                    backgroundColor: '#ccc',
                                }}
                            />
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
