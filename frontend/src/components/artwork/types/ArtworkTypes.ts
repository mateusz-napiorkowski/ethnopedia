import React from "react"

export interface Subcategory {
    label?: string;
    name?: string;
    values: string[];
    value: string
    subcategories?: Subcategory[];
    isSelectable?: boolean;
}

export interface EditingState {
    isEditing: boolean
    editingIndex: number | null
    editValue: string
}

export interface SelectedDetail {
    collectionName: any
    subcategories: Subcategory[]
    label: string
    values?: string[]
    date: string
    value: string
}

export interface LocationDetail {
    label?: string
    name?: string
    values?: string[]
    subcategories?: Subcategory[]
    isSelectable: boolean
}

export interface SubcategoryListProps {
    identifier: string
    subcategories: Subcategory[]
    selectedDetails: { [key: string]: SelectedDetail };
    setSelectedDetails: React.Dispatch<React.SetStateAction<{ [key: string]: SelectedDetail }>>;
    editingState: EditingState
    handleDoubleClick: (index: number, name: string) => void
    handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    handleBlur: () => void
    deleteSubcategory: (identifier: string, index: number) => void
    inputRef: React.RefObject<HTMLTextAreaElement>
    handleSubcategoryChange: (identifier: string, index: number, value: string) => void
    setEditingState: React.Dispatch<React.SetStateAction<EditingState>>
}

export interface RecursiveSubcategoryProps {
    identifier: string;
    subcategories?: Subcategory[];
    addSubcategory: (path: number[]) => void;
    addValueToSubcategory: (path: number[], newValue: string, index?: number) => void;
    deleteSubcategory: (path: number[]) => void;
    path?: number[];
    handleSubcategoryLabelChange: (path: number[], newName: string) => void;
    replaceValuesInSubcategory: (path: number[], newValues: string[]) => void;
    values?: string[];
    setValues: React.Dispatch<React.SetStateAction<string[]>>;
    modalState: ModalState;
    setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
    handleNameChange: (path: number[], newName: string) => void;
    inputVisibility: { [key: string]: boolean };
    setInputVisibility: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
    setValueToSubcategory: (path: number[], newValue: string) => void;
    handleDeleteValueInSubcategory: (path: number[]) => void;
}


export interface ModalState {
    isOpen: boolean
    data: {
        values: string[]
        path: number[]
        index: number
    }
}





export interface Category {
    name: string;
    values: string[];
    subcategories?: Category[];
    isSelectable?: boolean;
  }