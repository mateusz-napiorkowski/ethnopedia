import React, { useState, ChangeEvent, useEffect } from 'react';
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg"
import { ReactComponent as MinusIcon } from "../../assets/icons/minus.svg";
import FormField from './FormField';
import { Category } from '../../@types/Category';


// let example_data: Category[] = [
//   { name: "Tytuł", values: ["tytuł utworu"], subcategories: [] },
//   { name: "Wykonawca", values: ["nazwa zespołu"], subcategories: [
//     { name: "Wykonawca nr 1", values: ["Imię Nazwisko 1"] },
//     { name: "Wykonawca nr 2", values: ["Imię Nazwisko 2"] } ] },
//   { name: "Region", values: ["Wielkopolska"], subcategories: [
//     { name: "Podregion", values: ["WielkopQolska Północna"] },
//     { name: "Podregion etnograficzny", values: ["Szamotulskie"] },
//     { name: "Powiat", values: ["Szamotulski"]} ] }
// ]

function transformToNewStructure(data: Category[], collectionName: string): { categories: Category[]; collectionName: string } {
  return { categories: data, collectionName: collectionName };
}



interface MetadataFormProps {
  initialFormData: Category[];
  setDataToInsert: any
}


const MetadataForm: React.FC<MetadataFormProps> = ({ initialFormData, setDataToInsert }) => {
  const [formDataList, setFormDataList] = React.useState<Category[]>(initialFormData); // Ustaw początkowe dane

  const createOrEdit = window.location.href.split("/")[window.location.href.split("/").length-1]
  let collectionName = window.location.href.split("/")[window.location.href.split("/").length-2]
  if(createOrEdit === "edit-artwork") {
    collectionName = window.location.href.split("/")[window.location.href.split("/").length-4]
  }

  useEffect(() => {
    setDataToInsert(transformToNewStructure(formDataList, collectionName))
  }, [formDataList, collectionName, setDataToInsert])

  useEffect(() => {
    const handleResize = () => {
      setFormDataList((prev) => [...prev]); // Wymuszenie ponownego renderowania
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const [jsonOutput, setJsonOutput] = useState<string>('');
  const handleShowJson = () => {
    let jsonData = transformToNewStructure(formDataList, collectionName);
    setJsonOutput(JSON.stringify(jsonData, null, 2));
  };

  const handleInputChange = (index: string, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const indexParts = index.split('-').map(Number);  // e.g. index '2-0-1' -> [2, 0, 1]

    setFormDataList((prevDataList) =>
        updateNestedValue(prevDataList, indexParts, name, value)
    );
  };

  // recursively update the value of a nested object
  const updateNestedValue = (dataList: Category[], indexParts: number[], name: string, value: string): Category[] => {
    if (indexParts.length === 0) {
      return dataList;
    }

    const [currentIndex, ...remainingIndexParts] = indexParts;

    return dataList.map((item, i) => {
      if (i === currentIndex) {
        if (remainingIndexParts.length === 0) {
          if (name === 'values') {
            // If it is a value field
            return { ...item, [name]: [value] };
          } else {
            // If it is a name field
            return { ...item, [name]: value };
          }
        } else {
          // We need to go deeper, recurse
          const updatedSubcategories = updateNestedValue(item.subcategories || [], remainingIndexParts, name, value);
          return { ...item, subcategories: updatedSubcategories };
        }
      } else {
        return item;
      }
    });
  };

  const handleAddCategory = () => {
    setFormDataList((prevDataList) => [...prevDataList, { name: '', values: [''], subcategories: [] }]);
  };

  const handleAddSubcategory = (index: string) => {
    const indexParts = index.split('-').map(Number);  // e.g. index '2-0-1' -> [2, 0, 1]

    setFormDataList((prevDataList) =>
        addSubcategory(prevDataList, indexParts)
    );
  };

  const addSubcategory = (dataList: Category[], indexParts: number[]): Category[] => {
    if (indexParts.length === 0) {
      return [...dataList, { name: '', values: [''], subcategories: [] }];
    }

    const [currentIndex, ...remainingIndexParts] = indexParts;

    return dataList.map((item, i) => {
      if (i === currentIndex) {
        if (remainingIndexParts.length === 0) {
          // We're at the correct item, add a subcategory
          return {
            ...item,
            subcategories: [
              ...(item.subcategories || []),
              { name: '', values: [''] }
            ]
          };
        } else {
          // We need to go deeper, recurse
          const updatedSubcategories = addSubcategory(item.subcategories || [], remainingIndexParts);
          return { ...item, subcategories: updatedSubcategories };
        }
      } else {
        return item;
      }
    });
  };


  const handleRemove = (index: string) => {
    const indexParts = index.split('-').map(Number);  // e.g. index '2-0-1' -> [2, 0, 1]

    setFormDataList((prevDataList) =>
        removeCategory(prevDataList, indexParts)
    );
  };

  const removeCategory = (dataList: Category[], indexParts: number[]): Category[] => {
    if (indexParts.length === 0) {
      return dataList;
    }

    const [currentIndex, ...remainingIndexParts] = indexParts;

    return dataList.map((item, i) => {
      if (i === currentIndex) {
        if (remainingIndexParts.length === 0) {
          // We're at the correct item, remove it
          return null;
        } else {
          // We need to go deeper, recurse
          const updatedSubcategories = removeCategory(item.subcategories || [], remainingIndexParts);
          return { ...item, subcategories: updatedSubcategories };
        }
      } else {
        return item;
      }
    }).filter(item => item !== null) as Category[];
  };

  return (
      // <div style={{ overflowY: 'auto', height: '70vh', minWidth: '2000px'}}> {/* TODO */}
        <div style={{ overflowY: 'auto'}}> {/* TODO */}
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
              {/*<button type="button" onClick={handleShowJson}>*/}
              {/*  Show JSON*/}
              {/*</button>*/}
            </div>
          </form>
          <pre>{jsonOutput}</pre>
      </div>
  );
}

export default MetadataForm;
