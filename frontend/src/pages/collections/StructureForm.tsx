import React, { useState, ChangeEvent, useEffect } from 'react';
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg";
import FormField from './FormField';
import { Category } from '../../@types/Category';

// function transformToNewStructure(data: Category[], collectionName: string): { categories: Category[]; collectionName: string } {
//   return { categories: data, collectionName: collectionName };
// }

interface MetadataFormProps {
  initialFormData: Category[];
  setDataToInsert: any;
}

const StructureForm: React.FC<MetadataFormProps> = ({ initialFormData, setDataToInsert }) => {
  const [formDataList, setFormDataList] = useState<Category[]>(initialFormData);

  // const createOrEdit = window.location.href.split("/")[window.location.href.split("/").length - 1];
  // let collectionName = window.location.href.split("/")[window.location.href.split("/").length - 2];
  // if (createOrEdit === "edit-artwork") {
  //   collectionName = window.location.href.split("/")[window.location.href.split("/").length - 4];
  // }

  // useEffect(() => {
  //   setDataToInsert(transformToNewStructure(formDataList, collectionName));
  // }, [formDataList, collectionName, setDataToInsert]);

  useEffect(() => {
    const handleResize = () => {
      setFormDataList((prev) => [...prev]);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [jsonOutput, setJsonOutput] = useState<string>('');
  const handleShowJson = () => {
    // let jsonData = transformToNewStructure(formDataList, collectionName);
    // setJsonOutput(JSON.stringify(jsonData, null, 2));
    setJsonOutput(JSON.stringify(formDataList, null, 2));
  };

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
    setFormDataList((prevDataList) => [...prevDataList, { name: '', subcategories: [] }]);
  };

  const handleAddSubcategory = (index: string) => {
    const indexParts = index.split('-').map(Number);
    setFormDataList((prevDataList) =>
        addSubcategory(prevDataList, indexParts)
    );
  };

  const addSubcategory = (dataList: Category[], indexParts: number[]): Category[] => {
    if (indexParts.length === 0) {
      return [...dataList, { name: '', subcategories: [] }];
    }
    const [currentIndex, ...remainingIndexParts] = indexParts;
    return dataList.map((item, i) => {
      if (i === currentIndex) {
        if (remainingIndexParts.length === 0) {
          return {
            ...item,
            subcategories: [...(item.subcategories || []), { name: '', subcategories: [] }]
          };
        } else {
          const updatedSubcategories = addSubcategory(item.subcategories || [], remainingIndexParts);
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
              />
          ))}
          <div className="flex flex-col justify-between items-start mt-1 space-y-4">
            <button type="button" onClick={handleAddCategory} title="Dodaj kategorię">
              <PlusIcon />
            </button>
            <button type="button" onClick={handleShowJson}>
              Show JSON
            </button>
          </div>
        </form>
        <pre>{jsonOutput}</pre>
      </div>
  );
};

export default StructureForm;
