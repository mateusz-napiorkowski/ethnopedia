import React from 'react';
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

    const isLastChild = (index: string, formDataList: Category[]): boolean => {
        const parts = index.split('-').map(Number);

        if (parts.length === 1) {
            // Poziom główny
            return formDataList[parts[0]] === formDataList.slice(-1)[0];
        }

        // Poziom zagnieżdżony
        const parentCategory = formDataList[parts[0]];
        if (!parentCategory || !parentCategory.subcategories) {
            return false; // Nieprawidłowe dane
        }

        const subcategories = parentCategory.subcategories;
        return subcategories[parts[1]] === subcategories.slice(-1)[0];
    };


    return (
        <div key={index} className="flex flex-col pb-1 mt-1 relative">
            <div className="flex items-center group relative">
                {level > 0 && (
                    <>
                        {/* Pionowa linia drzewa */}
                        <div
                            className={`tree-line vertical`}
                            style={{
                                height: isLastChild(index, formDataList) ? '50%' : '100%',
                                top: '0',
                                left: '-16px',
                            }}
                        ></div>
                        {/* Pozioma linia drzewa */}
                        <div
                            className={`tree-line horizontal`}
                            style={{
                                left: '-16px',
                            }}
                        ></div>
                    </>
                )}
                {/* Pole nazwy kategorii */}
                <label className="flex items-center">
                    <input
                        type="text"
                        name={`name`}
                        value={formData.name}
                        onChange={(e) => handleInputChange(index, e)}
                        placeholder="Podaj nazwę kategorii..."
                        className="mx-2 p-2"
                        list="name-options"
                    />
                </label>
                {/* Pole wartości kategorii */}
                <label className="flex items-center">
                    <span>:</span>
                    <input
                        type="text"
                        name={`values`}
                        value={formData.values[0]}
                        onChange={(e) => handleInputChange(index, e)}
                        className="mx-2 p-2"
                        list="values-options"
                    />
                </label>
                {/* Przyciski + i - */}
                <div className="actions opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                    {level < 5 && (
                        <button type="button" onClick={() => handleAddSubcategory(index)} title="Dodaj podkategorię">
                            <PlusIcon />
                        </button>
                    )}
                    <button type="button" onClick={() => handleRemove(index)} title="Usuń kategorię">
                        <MinusIcon />
                    </button>
                </div>
            </div>

            {/* render subcategories */}
            {formData.subcategories &&
                formData.subcategories.map((subCategory, subIndex) => {
                    const uniqueSubIndex = `${index}-${subIndex}`;  // e.g. index '2-0-1'
                    return (
                        <div className="ml-8 flex flex-row relative mt-1">
                            <FormField
                                key={uniqueSubIndex}
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

export default FormField;
