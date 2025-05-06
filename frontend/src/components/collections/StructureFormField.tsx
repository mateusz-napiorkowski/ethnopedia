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
    const [error, setError] = useState<string | null>(null);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        // Walidacja: sprawdzenie czy nazwa zawiera kropkę
        if (value.includes('.')) {
            setError('Nazwa kategorii nie może zawierać kropki');
        } else {
            setError(null); // Jeśli nie zawiera kropki, usuwamy komunikat o błędzie
        }

        handleInputChange(index, e); // Wywołanie oryginalnej funkcji zmiany danych
    };

    return (
        <div className="relative flex flex-col mt-1">
            <div
                className="field-container relative flex items-center"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {level > 0 && (
                    <>
                        <div className="tree-line vertical" />
                        <div className="tree-line horizontal" />
                    </>
                )}
                <label className="flex items-center">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleNameChange} // Zmieniamy na handleNameChange
                        placeholder={`Podaj nazwę kategorii...`}
                        className={`p-2 border rounded ${
                            error ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                    {isHovered && formData.isNew && (
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            title={`Usuń kategorię`}
                        >
                            <MinusIcon />
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="text-red-500 text-sm mt-1">{error}</div>
            )}

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
