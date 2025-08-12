import React, { useState } from 'react';
import { Category } from '../../@types/Category';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HiDotsVertical as DotsIcon, HiPlus as PlusIcon, HiTrash as DeleteIcon } from 'react-icons/hi';

interface Props {
    id: string;
    index: string;
    level: number;
    formData: Category;
    handleInputChange: (idx: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    // new: commit on blur
    handleInputBlur: (idx: string, value: string) => void;
    handleRemove: (idx: string) => void;
    handleAddSubcategory: (idx: string) => void;
    isEditMode: boolean;
    hasError?: string;
    errorMessage?: string;
    hasSubmitted: boolean;
}

const StructureFormField: React.FC<Props> = ({
                                                 id, index, level, formData,
                                                 handleInputChange, handleInputBlur, handleRemove, handleAddSubcategory,
                                                 isEditMode, hasError, errorMessage, hasSubmitted
                                             }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });
    const [hover, setHover] = useState(false);

    const canAdd = level < 5;
    const addTitle = canAdd
        ? 'Dodaj podkategorię'
        : 'Osiągnięto maksymalny poziom zagnieżdżenia';

    // Enhanced input change handler with real-time validation
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChange(index, e);
    };

    // commit value on blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        handleInputBlur(index, e.currentTarget.value);
    };

    // Validation logic
    const isNameEmpty = !formData.name.trim();
    const forbiddenChars = /[.]/;
    const hasForbiddenChars = forbiddenChars.test(formData.name);

    // Show required field error only after submit
    const showRequiredError = isNameEmpty && hasSubmitted;

    // Show other errors (forbidden chars, duplicates) immediately
    const showOtherErrors = (hasForbiddenChars || (hasError && hasError !== "Nazwa kategorii jest wymagana"));

    // Determine if there's any error to show
    const hasAnyError = showRequiredError || showOtherErrors;

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.4 : 1,
                marginLeft: `${level * 20}px`,
            }}
            className="mb-3"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div className="inline-flex items-center gap-2 group w-full">
                {/* Drag handle: only drag via the dots icon */}
                <DotsIcon title="Przeciągnij, aby zmienić kolejność"
                          {...attributes}
                          {...listeners}
                          className="w-4 h-4 cursor-grab text-gray-400 hover:text-gray-600 flex-shrink-0"
                />
                <div className="flex-1">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={level === 0 ? "Nazwa kategorii" : "Nazwa podkategorii"}
                        className={`w-full border-b focus:outline-none p-1 ${
                            hasAnyError
                                ? "border-red-500 text-red-600"
                                : "border-gray-300 text-gray-700 dark:text-white dark:border-gray-600"
                        }`}
                    />
                    {hasAnyError && (
                        <div className="text-red-500 text-xs mt-1">
                            {showRequiredError
                                ? "Nazwa kategorii jest wymagana"
                                : hasForbiddenChars
                                    ? "Nazwa zawiera zakazane znaki"
                                    : errorMessage}
                        </div>
                    )}
                </div>
                {(isEditMode || !isEditMode) && (
                    <div className="inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
                        <button
                            onClick={() => canAdd && handleAddSubcategory(index)}
                            disabled={!canAdd}
                            title={addTitle}
                            className={`p-2 text-sm rounded-md transition-colors
                                ${hover ? 'opacity-100' : 'opacity-0'}
                                ${canAdd
                                ? 'text-blue-600 hover:text-blue-800 cursor-pointer'
                                : 'text-gray-400 cursor-not-allowed'}
                            `}
                            type="button"
                        >
                            <PlusIcon className="w-4 h-4"/>
                        </button>
                        <button
                            onClick={() => handleRemove(index)}
                            disabled={isEditMode && !formData.isNew}
                            title={isEditMode && !formData.isNew ? "Usuwanie tylko nowych kategorii w trybie edycji" : "Usuń"}
                            className={`p-2 text-sm rounded-md transition-colors
                                ${hover ? 'opacity-100' : 'opacity-0'}
                                text-red-600 hover:text-red-800
                                ${isEditMode && !formData.isNew ? 'opacity-50 cursor-not-allowed hover:text-red-600' : ''}
                            `}
                            type="button"
                        >
                            <DeleteIcon className="w-4 h-4"/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(StructureFormField);
