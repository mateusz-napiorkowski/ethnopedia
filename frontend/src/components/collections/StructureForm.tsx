import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Category } from '../../@types/Category';
import FormField from './StructureFormField';
import { HiPlus as PlusIcon } from "react-icons/hi";

interface StructureFormProps {
  initialFormData: Category[];
  setFieldValue: (field: string, value: any) => void;
  isEditMode: boolean;
  categoryErrors: { [key: string]: string };
  hasSubmitted: boolean;
}

const StructureForm: React.FC<StructureFormProps> = ({
                                                       initialFormData,
                                                       setFieldValue,
                                                       isEditMode,
                                                       categoryErrors,
                                                       hasSubmitted
                                                     }) => {
  // Inicjalizacja stanu tylko raz przy mountowaniu
  const [data, setData] = useState<Category[]>(() => initialFormData);

  // Helper do przesuwania elementów w drzewie kategorii (w obrębie jednej listy)
  const moveAt = (
      list: Category[],
      path: number[],
      from: number,
      to: number
  ): Category[] => {
    if (path.length === 0) {
      return arrayMove(list, from, to);
    }
    const [head, ...rest] = path;
    return list.map((item, i) =>
        i !== head
            ? item
            : {
              ...item,
              subcategories: moveAt(item.subcategories || [], rest, from, to)
            }
    );
  };

  // Handler drag & drop
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    // Zamiana id "0-1-2" na [0,1,2]
    const fromPath = (active.id as string).split('-').map(Number);
    const toPath = (over.id as string).split('-').map(Number);

    // Poruszamy tylko w obrębie tej samej listy (tego samego rodzica)
    const parentFrom = fromPath.slice(0, -1).join();
    const parentTo = toPath.slice(0, -1).join();
    if (parentFrom !== parentTo) return;

    const oldIndex = fromPath.pop()!;
    const newIndex = toPath.pop()!;

    setData(d => {
      const newData = moveAt(d, fromPath, oldIndex, newIndex);
      setFieldValue('categories', newData);
      return newData;
    });
  };

  // Dodawanie podkategorii w zadanym miejscu
  const addSub = (list: Category[], path: number[]): Category[] => {
    if (path.length === 0) return [...list, { name: '', subcategories: [], isNew: true }];
    const [head, ...rest] = path;
    return list.map((item, i) =>
        i !== head
            ? item
            : { ...item, subcategories: addSub(item.subcategories || [], rest) }
    );
  };

  const handleAddSub = (idx: string) => {
    const path = idx.split('-').map(Number);
    setData(d => {
      const newData = addSub(d, path);
      setFieldValue('categories', newData);
      return newData;
    });
  };

  // Dodawanie nowej kategorii na najwyższym poziomie
  const handleAddCat = () => {
    setData(d => {
      const newData = [...d, { name: '', subcategories: [], isNew: true }];
      setFieldValue('categories', newData);
      return newData;
    });
  };

  // Usuwanie kategorii/podkategorii wg ścieżki
  const removeAt = (list: Category[], path: number[]): Category[] => {
    if (path.length === 1) return list.filter((_, i) => i !== path[0]);
    const [head, ...rest] = path;
    return list.map((item, i) =>
        i !== head ? item : { ...item, subcategories: removeAt(item.subcategories || [], rest) }
    );
  };

  const handleRemove = (idx: string) => {
    setData(d => {
      const newData = removeAt(d, idx.split('-').map(Number));
      setFieldValue('categories', newData);
      return newData;
    });
  };

  // Obsługa zmiany pola tekstowego nazwy kategorii/podkategorii
  const handleInputChange = (idx: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const parts = idx.split('-').map(Number);
    const newValue = e.target.value;

    setData(d => {
      // Głęboka kopia (możesz zoptymalizować jeśli chcesz)
      const clone = JSON.parse(JSON.stringify(d)) as Category[];
      let cur: any = clone;
      parts.slice(0, -1).forEach(i => {
        cur = cur[i].subcategories;
      });
      cur[parts[parts.length - 1]][e.target.name] = newValue;
      setFieldValue('categories', clone);
      return clone;
    });
  };

  // Renderowanie listy kategorii i podkategorii rekurencyjnie
  const renderList = (list: Category[], path: number[], lvl: number) => {
    const ids = list.map((_, i) => [...path, i].join('-'));
    return (
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {list.map((item, i) => {
            const id = [...path, i].join('-');
            const hasError = categoryErrors[id];

            return (
                <React.Fragment key={id}>
                  <FormField
                      id={id}
                      index={id}
                      level={lvl}
                      formData={item}
                      handleInputChange={handleInputChange}
                      handleRemove={handleRemove}
                      handleAddSubcategory={handleAddSub}
                      isEditMode={isEditMode}
                      hasError={hasError}
                      errorMessage={hasError}
                      hasSubmitted={hasSubmitted}
                  />
                  {item.subcategories && renderList(item.subcategories, [...path, i], lvl + 1)}
                </React.Fragment>
            );
          })}
        </SortableContext>
    );
  };

  return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {renderList(data, [], 0)}
        {(isEditMode || !isEditMode) && (
            <button
                onClick={handleAddCat}
                className={`mt-4 inline-flex items-center gap-1 p-3 text-sm text-blue-600 hover:text-blue-800 rounded-md transition-colors ${
                    !isEditMode ? "ml-[20px]" : ""
                }`}
                type="button"
            >
              <PlusIcon className="w-4 h-4"/>
              <span className="px-1">Dodaj kategorię</span>
            </button>

        )}
      </DndContext>
  );
};

export default StructureForm;