import React, { useEffect, useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Category } from '../../@types/Category';
import FormField from './StructureFormField';
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg";

interface StructureFormProps {
  initialFormData: Category[];
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  isEditMode: boolean;
}

const StructureForm: React.FC<StructureFormProps> = ({ initialFormData, setFieldValue, isEditMode }) => {
  const [formDataList, setFormDataList] = useState<Category[]>(initialFormData);

  useEffect(() => {
    setFieldValue('categories', formDataList);
  }, [formDataList, setFieldValue]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = parseInt(active.id as string);
      const newIndex = parseInt(over.id as string);

      setFormDataList((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleInputChange = (index: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const indexParts = index.split('-').map(Number);
    setFormDataList((prevDataList) => {
      const newDataList = [...prevDataList];
      let currentLevel = newDataList;

      for (let i = 0; i < indexParts.length - 1; i++) {
        const part = indexParts[i];
        currentLevel[part] = {
          ...currentLevel[part],
          subcategories: [...(currentLevel[part].subcategories || [])],
        };
        currentLevel = currentLevel[part].subcategories!;
      }

      const finalPart = indexParts[indexParts.length - 1];
      currentLevel[finalPart] = {
        ...currentLevel[finalPart],
        [name]: value,
      };

      return newDataList;
    });
  };

  const handleAddCategory = () => {
    setFormDataList((prevDataList) => [
      ...prevDataList,
      { name: '', subcategories: [], isNew: true },
    ]);
  };

  const handleAddSubcategory = (index: string) => {
    const indexParts = index.split('-').map(Number);
    setFormDataList((prevDataList) =>
        addSubcategory(prevDataList, indexParts, true)
    );
  };

  const addSubcategory = (dataList: Category[], indexParts: number[], isNew: boolean): Category[] => {
    if (indexParts.length === 0) {
      return [...dataList, { name: '', subcategories: [], isNew }];
    }
    const [currentIndex, ...remainingIndexParts] = indexParts;
    return dataList.map((item, i) => {
      if (i === currentIndex) {
        if (remainingIndexParts.length === 0) {
          return {
            ...item,
            subcategories: [...(item.subcategories || []), { name: '', subcategories: [], isNew }],
          };
        } else {
          const updatedSubcategories = addSubcategory(item.subcategories || [], remainingIndexParts, isNew);
          return { ...item, subcategories: updatedSubcategories };
        }
      } else {
        return item;
      }
    });
  };

  const handleRemove = (index: string) => {
    const indexParts = index.split('-').map(Number);
    setFormDataList((prevDataList) =>
        removeCategory(prevDataList, indexParts)
    );
  };

  const removeCategory = (dataList: Category[], indexParts: number[]): Category[] => {
    if (indexParts.length === 0) return dataList;
    const [currentIndex, ...remainingIndexParts] = indexParts;
    return dataList.map((item, i) => {
      if (i === currentIndex) {
        if (remainingIndexParts.length === 0) {
          return null;
        } else {
          const updatedSubcategories = removeCategory(item.subcategories || [], remainingIndexParts);
          return { ...item, subcategories: updatedSubcategories };
        }
      } else {
        return item;
      }
    }).filter(item => item !== null) as Category[];
  };

  return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={formDataList.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
          <form className="flex flex-col">
            {formDataList.map((formData, index) => (
                <FormField
                    key={index.toString()}
                    id={index.toString()}
                    index={index.toString()}
                    level={0}
                    formData={formData}
                    formDataList={formDataList}
                    handleInputChange={handleInputChange}
                    handleRemove={handleRemove}
                    handleAddSubcategory={handleAddSubcategory}
                    isEditMode={isEditMode}
                />
            ))}
          </form>
        </SortableContext>
        {!isEditMode && (
            <div className="actions mt-1">
              <button
                  type="button"
                  onClick={handleAddCategory}
                  title="Dodaj kategorię"
              >
                <PlusIcon/>
              </button>
            </div>
        )}
      </DndContext>
  );
};

export default StructureForm;
