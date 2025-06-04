import React from 'react';
import { Category } from '../../@types/Category';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HiDotsVertical as DotsIcon } from "react-icons/hi";
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg";
import { ReactComponent as MinusIcon } from "../../assets/icons/minus.svg";

interface FormFieldProps {
    id: string;
    index: string;
    level: number;
    formData: Category;
    formDataList: Category[];
    handleInputChange: (index: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemove: (index: string) => void;
    handleAddSubcategory: (index: string) => void;
    isEditMode: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
                                                 id,
                                                 index,
                                                 level,
                                                 formData,
                                                 handleInputChange,
                                                 handleRemove,
                                                 handleAddSubcategory,
                                                 isEditMode,
                                             }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={{...style, marginLeft: `${level * 20}px`}}
            className="form-field group flex flex-col"
        >
            <div className="flex items-center gap-2 py-1">
                {/* Drag handle */}
                {!isEditMode && (
                    <div
                        className="cursor-grab"
                        {...attributes}
                        {...listeners}
                        title="Przeciągnij"
                    >
                        <DotsIcon className="w-4 h-4 text-gray-400 hover:text-gray-600"/>
                    </div>
                )}

                {/* Pole tekstowe */}
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange(index, e)}
                    className="flex-grow border-b border-gray-300 focus:outline-none px-1"
                    placeholder={level === 0 ? 'Nazwa kategorii' : 'Nazwa podkategorii'}
                />

                {/* Akcje */}
                {!isEditMode && (
                    <div className="flex gap-1 items-center">
                        <button
                            type="button"
                            onClick={() => handleAddSubcategory(index)}
                            title="Dodaj podkategorię"
                            className="p-0 m-0 w-5 h-5 flex items-center justify-center bg-transparent border-none"
                        >
                            <PlusIcon className="w-4 h-4 text-green-500 hover:text-green-700"/>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            title="Usuń"
                            className="p-0 m-0 w-5 h-5 flex items-center justify-center bg-transparent border-none"
                        >
                            <MinusIcon className="w-4 h-4 text-red-500 hover:text-red-700"/>
                        </button>
                    </div>

                )}
            </div>

            {/* Subcategories */}
            {formData.subcategories && formData.subcategories.map((sub, subIndex) => {
                const subIndexPath = `${index}-${subIndex}`;
                return (
                    <FormField
                        key={subIndexPath}
                        id={subIndexPath}
                        index={subIndexPath}
                        level={level + 1}
                        formData={sub}
                        formDataList={formData.subcategories ?? []}
                        handleInputChange={handleInputChange}
                        handleRemove={handleRemove}
                        handleAddSubcategory={handleAddSubcategory}
                        isEditMode={isEditMode}
                    />
                );
            })}
        </div>

    );
};

export default FormField;
