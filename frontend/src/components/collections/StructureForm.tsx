import React, { useState, ChangeEvent, useEffect } from 'react';
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg";
import FormField from './StructureFormField';
import { Category } from '../../@types/Category';


interface StructureFormProps {
  initialFormData: Category[];
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  isEditMode: boolean;
}

const StructureForm: React.FC<StructureFormProps> = ({ initialFormData, setFieldValue, isEditMode }) => {
  const [formDataList, setFormDataList] = useState<Category[]>(initialFormData);

  useEffect(() => {
    setFieldValue('categories', formDataList); // Update Formik's categories field whenever formDataList changes
  }, [formDataList, setFieldValue]);

  const [jsonOutput] = useState<string>('');

  const handleInputChange = (index: string, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const indexParts = index.split('-').map(Number);

    setFormDataList((prevDataList) => {
      // Tworzymy kopię poprzedniego stanu
      const newDataList = [...prevDataList];
      let currentLevel = newDataList;

      // Przechodzimy przez zagnieżdżone poziomy na podstawie indexParts
      for (let i = 0; i < indexParts.length - 1; i++) {
        const part = indexParts[i];
        currentLevel[part] = {
          ...currentLevel[part],
          subcategories: [...(currentLevel[part].subcategories || [])],
        };
        currentLevel = currentLevel[part].subcategories!;
      }

      // Aktualizujemy docelowe pole
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
        addSubcategory(prevDataList, indexParts, true) // Flaga dla nowych subkategorii
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
      <div style={{ overflowY: 'auto' }}>
        <form>
          {formDataList.map((formData, index) => (
              <FormField
                  key={index.toString()}
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
          <div className="actions mt-1">
            <button
                type="button"
                onClick={handleAddCategory}
                title="Dodaj kategorię"
            >
              <PlusIcon/>
            </button>
          </div>
        </form>
        <pre>{jsonOutput}</pre>
      </div>
  );
};

export default StructureForm;
