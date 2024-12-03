import { Category } from '../../@types/Category';
import React from "react";
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg"
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
    // Generate options for the category name input based on the example_data structure
    // const nameOptions = example_data
    //   .filter((category) => !formDataList.some((data) => data.name === category.name))
    //   .map((category, i) => (
    //     <option key={i} value={category.name} />
    //   ));

    // // Generate options for the value input based on the selected key
    // const valueOptions = example_data
    //   .find((category) => category.name === formData.name)
    //   ?.subcategories?.filter((subcategory) => !formData.subcategories?.some((data) => data.name === subcategory.name))
    //   .map((subcategory, i) => (
    //     <option key={i} value={subcategory.values[0]} />
    // ));

    return (
        <div key={index} className="flex flex-col pb-1 mt-1 relative">
            <div className="flex items-center group relative">
                {level > 0 && (
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 border-l-2 border-gray-400 h-full"></span>
                )}
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