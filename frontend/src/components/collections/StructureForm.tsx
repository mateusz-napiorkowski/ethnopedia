import React from 'react';
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

interface UndoRedoSystem<T> {
  setState: (updater: T | ((prev: T) => T), options?: any) => void;
  currentState: T;
}

interface StructureFormProps {
  initialFormData: Category[];
  // now supports isStructuralChange flag
  setFieldValue: (field: string, value: any, isStructuralChange?: boolean) => void;
  isEditMode: boolean;
  categoryErrors: { [key: string]: string };
  hasSubmitted: boolean;
  // optional undo/redo system (passed from CreateCollectionPage)
  undoRedoSystem?: UndoRedoSystem<any>;
}

const StructureForm: React.FC<StructureFormProps> = ({
                                                       initialFormData,
                                                       setFieldValue,
                                                       isEditMode,
                                                       categoryErrors,
                                                       hasSubmitted,
                                                       undoRedoSystem
                                                     }) => {
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

  const handleDragEnd = (e: DragEndEvent) => {
    // jeśli jesteśmy w trybie edycji, blokujemy wszelkie operacje drag&drop
    if (isEditMode) return;

    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const fromPath = (active.id as string).split('-').map(Number);
    const toPath = (over.id as string).split('-').map(Number);

    const parentFrom = fromPath.slice(0, -1).join();
    const parentTo = toPath.slice(0, -1).join();
    if (parentFrom !== parentTo) return;

    const oldIndex = fromPath.pop()!;
    const newIndex = toPath.pop()!;

    const newData = moveAt(initialFormData, fromPath, oldIndex, newIndex);
    // traktujemy przestawienie jako zmiane strukturalną
    if (undoRedoSystem) {
      undoRedoSystem.setState(
        {
          ...undoRedoSystem.currentState,
          categories: newData,
        },
        { shouldDebounce: false }
      );
    } else {
      setFieldValue('categories', newData, true);
    }
  };


  const addSub = (list: Category[], path: number[]): Category[] => {
    if (path.length === 0)
      return [...list, { name: '', subcategories: [], isNew: true }];
    const [head, ...rest] = path;
    return list.map((item, i) =>
        i !== head
            ? item
            : { ...item, subcategories: addSub(item.subcategories || [], rest) }
    );
  };

  const handleAddSub = (idx: string) => {
    const path = idx.split('-').map(Number);
    const newData = addSub(initialFormData, path);
    // Structural change -> commit immediately
    if (undoRedoSystem) {
      undoRedoSystem.setState(
        {
          ...undoRedoSystem.currentState,
          categories: newData,
        },
        { shouldDebounce: false }
      );
    } else {
      setFieldValue('categories', newData, true);
    }
  };

  const handleAddCat = () => {
    const newData = [
      ...initialFormData,
      { name: '', subcategories: [], isNew: true }
    ];
    // Structural change -> commit immediately
    if (undoRedoSystem) {
      undoRedoSystem.setState(
        {
          ...undoRedoSystem.currentState,
          categories: newData,
        },
        { shouldDebounce: false }
      );
    } else {
      setFieldValue('categories', newData, true);
    }
  };

  const removeAt = (list: Category[], path: number[]): Category[] => {
    if (path.length === 1) return list.filter((_, i) => i !== path[0]);
    const [head, ...rest] = path;
    return list.map((item, i) =>
        i !== head
            ? item
            : { ...item, subcategories: removeAt(item.subcategories || [], rest) }
    );
  };

  const handleRemove = (idx: string) => {
    const newData = removeAt(initialFormData, idx.split('-').map(Number));
    // Structural change -> commit immediately
    if (undoRedoSystem) {
      undoRedoSystem.setState(
        {
          ...undoRedoSystem.currentState,
          categories: newData,
        },
        { shouldDebounce: false }
      );
    } else {
      setFieldValue('categories', newData, true);
    }
  };

  // Handle typing / input changes. We try to use undoRedoSystem.setState with per-field debounce
  // when it's available. Otherwise fall back to setFieldValue (non-debounced).
  const handleInputChange = (
      idx: string,
      e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const parts = idx.split('-').map(Number);
    const newValue = e.target.value;

    // Tworzymy głęboką kopię
    const clone = JSON.parse(JSON.stringify(initialFormData)) as Category[];
    let cur: any = clone;
    parts.slice(0, -1).forEach((i) => {
      cur = cur[i].subcategories;
    });
    cur[parts[parts.length - 1]][e.target.name] = newValue;

    // Jeśli mamy dostęp do undoRedoSystem, użyjemy jego setState z opcją debounce per-field.
    if (undoRedoSystem && typeof undoRedoSystem.setState === 'function') {
      undoRedoSystem.setState(
        { ...undoRedoSystem.currentState, categories: clone },
        { shouldDebounce: true, fieldKey: `category-${idx}`, debounceMs: 500 }
      );
    } else {
      // fallback: zwykłe ustawienie (nie structural)
      if (undoRedoSystem) {
        undoRedoSystem.setState(
          {
            ...undoRedoSystem.currentState,
            categories: clone,
          },
          { shouldDebounce: false }
        );
    } else {
      setFieldValue('categories', clone, true);
    }
    }
  };

  // commit immediately on blur (no debounce)
  const handleInputBlur = (idx: string, value: string) => {
    const parts = idx.split('-').map(Number);
    const clone = JSON.parse(JSON.stringify(initialFormData)) as Category[];
    let cur: any = clone;
    parts.slice(0, -1).forEach((i) => {
      cur = cur[i].subcategories;
    });
    cur[parts[parts.length - 1]]['name'] = value;

    // Commit immediate (non-structural)
    if (undoRedoSystem) {
      undoRedoSystem.setState(
        {
          ...undoRedoSystem.currentState,
          categories: clone,
        },
        { shouldDebounce: false }
      );
    } else {
      setFieldValue('categories', clone, true);
    }
  };


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
                      handleInputBlur={handleInputBlur}
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
        {renderList(initialFormData, [], 0)}
        <button
            onClick={handleAddCat}
            className={`inline-flex items-center gap-1 p-3 text-sm bg-white dark:bg-gray-800 text-blue-600 hover:dark:text-white hover:text-blue-800 rounded-md ${
                !isEditMode ? "ml-[24px]" : ""
            }`}
            type="button"
            title="Dodaj nową kategorię"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="px-1">Dodaj kategorię</span>
        </button>
      </DndContext>
  );
};

export default StructureForm;
