import React, { useEffect, useState } from 'react';
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
}

const StructureForm: React.FC<StructureFormProps> = ({
                                                       initialFormData,
                                                       setFieldValue,
                                                       isEditMode
                                                     }) => {
  const [data, setData] = useState<Category[]>(initialFormData);

  useEffect(() => {
    setFieldValue('categories', data);
  }, [data, setFieldValue]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    // zamiana id "0-1-2" na [0,1,2]
    const fromPath = (active.id as string).split('-').map(Number);
    const toPath   = (over.id   as string).split('-').map(Number);

    // poruszamy tylko w tej samej liście
    const parentFrom = fromPath.slice(0, -1).join();
    const parentTo   = toPath.slice(0, -1).join();
    if (parentFrom !== parentTo) return;

    const oldIndex = fromPath.pop()!;
    const newIndex = toPath.pop()!;

    // helper: przesuwa w odpowiednim poddrzewie
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

    setData(d => moveAt(d, fromPath, oldIndex, newIndex));
  };

  // reszta crud: add, remove, edit
  const handleInputChange = (idx: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const parts = idx.split('-').map(Number);
    setData(d => {
      const clone = JSON.parse(JSON.stringify(d)) as Category[];
      let cur: any = clone;
      parts.slice(0, -1).forEach(i => cur = cur[i].subcategories);
      cur[parts[parts.length-1]][e.target.name] = e.target.value;
      return clone;
    });
  };

  const addSub = (list: Category[], path: number[]): Category[] => {
    if (path.length === 0) return [...list, { name: '', subcategories: [], isNew: true }];
    const [h, ...r] = path;
    return list.map((it,i) =>
        i !== h
            ? it
            : { ...it, subcategories: addSub(it.subcategories || [], r) }
    );
  };

  const handleAddSub = (idx: string) => {
    const path = idx.split('-').map(Number);
    setData(d => addSub(d, path));
  };

  const handleAddCat = () => setData(d => [...d, {name:'', subcategories:[], isNew:true} ]);
  const removeAt = (list: Category[], path: number[]): Category[] => {
    if (path.length===1) return list.filter((_,i) => i!==path[0]);
    const [h,...r] = path;
    return list.map((it,i) =>
        i!==h ? it : {...it, subcategories: removeAt(it.subcategories||[],r)}
    );
  };
  const handleRemove = (idx: string) =>
      setData(d => removeAt(d, idx.split('-').map(Number)));

  const renderList = (list: Category[], path: number[], lvl: number) => {
    const ids = list.map((_,i) => [...path,i].join('-'));
    return (
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {list.map((item,i) => {
            const id = [...path,i].join('-');
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
                  />
                  {item.subcategories && renderList(item.subcategories, [...path,i], lvl+1)}
                </React.Fragment>
            );
          })}
        </SortableContext>
    );
  };

  return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {renderList(data, [], 0)}
        {!isEditMode && (
            <button
                onClick={handleAddCat}
                className="mt-4 ml-[20px] inline-flex items-center gap-1 p-3 text-sm text-blue-600 hover:text-blue-800 rounded-md transition-colors"
            >
              <PlusIcon className="w-4 h-4"/>
              <span className="px-1">Dodaj kategorię</span>
            </button>


        )}
      </DndContext>
  );
};

export default StructureForm;
