import React from 'react';
// import { useState } from 'react';
import { Metadata } from '../../@types/Metadata';
// import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg";
// import { ReactComponent as MinusIcon } from "../../assets/icons/minus.svg";

interface FormFieldProps {
    formData: Metadata;
    formDataList: Metadata[];
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
    // const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="relative flex flex-col mt-1">
            {/* Obszar dla pola kategorii i przycisków */}
            <div
                className="field-container relative flex items-center"
                // onMouseEnter={() => setIsHovered(true)}
                // onMouseLeave={() => setIsHovered(false)}
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
                        // placeholder={`Podaj nazwę kategorii...`}
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
                        className="p-2 border rounded"
                    />
                </label>
                {/*<div className="actions ml-1 space-x-1">*/}
                {/*    {level < 5 && isHovered && (*/}
                {/*        <button*/}
                {/*            type="button"*/}
                {/*            onClick={() => handleAddSubcategory(index)}*/}
                {/*            title={`Dodaj podkategorię dla [${index}]`}*/}
                {/*        >*/}
                {/*            <PlusIcon/>*/}
                {/*        </button>*/}
                {/*    )}*/}
                {/*    {isHovered && (*/}
                {/*        <button*/}
                {/*            type="button"*/}
                {/*            onClick={() => handleRemove(index)}*/}
                {/*            title={`Usuń kategorię [${index}]`}*/}
                {/*        >*/}
                {/*            <MinusIcon/>*/}
                {/*        </button>*/}
                {/*    )}*/}
                {/*</div>*/}
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
                                    handleRemove={handleRemove}
                                    handleAddSubcategory={handleAddSubcategory}
                                />
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default React.memo(FormField);
