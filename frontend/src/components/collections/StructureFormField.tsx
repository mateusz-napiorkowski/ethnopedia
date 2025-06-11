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
    handleRemove: (idx: string) => void;
    handleAddSubcategory: (idx: string) => void;
    isEditMode: boolean;
}

const StructureFormField: React.FC<Props> = ({
                                                 id, index, level, formData,
                                                 handleInputChange, handleRemove, handleAddSubcategory,
                                                 isEditMode
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

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.4 : 1,
                marginLeft: `${level * 20}px`,
            }}
            className="mb-1"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div className="inline-flex items-center gap-2 group w-full">
                {!isEditMode && (
                    <DotsIcon
                        {...attributes}
                        {...listeners}
                        className="w-4 h-4 cursor-grab text-gray-400 hover:text-gray-600"
                    />
                )}
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={e => handleInputChange(index, e)}
                    placeholder={level === 0 ? "Nazwa kategorii" : "Nazwa podkategorii"}
                    className="border-b border-gray-300 focus:outline-none p-1 w-full"
                />
                {!isEditMode && (
                    <div
                        className="inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
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
                        >
                            <PlusIcon className="w-4 h-4"/>
                        </button>
                        <button
                            onClick={() => handleRemove(index)}
                            className="p-2 text-sm text-red-600 hover:text-red-800 rounded-md transition-colors"
                            title="Usuń"
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
