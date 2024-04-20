import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg"
import { ReactComponent as MinusIcon } from "../../assets/icons/minus.svg";
import { createArtwork } from '../../api/artworks';

import { Category } from './types/ArtworkTypes';

// interface Category {
//   name: string;
//   values: string[];
//   subcategories?: Category[];
//   isSelectable?: boolean;
// }

let example_data: Category[] = [
  { name: "Tytuł", values: ["tytuł utworu"], subcategories: [] },
  { name: "Wykonawca", values: ["nazwa zespołu"], subcategories: [
    { name: "Wykonawca nr 1", values: ["Imię Nazwisko 1"] },
    { name: "Wykonawca nr 2", values: ["Imię Nazwisko 2"] } ] },
  { name: "Region", values: ["Wielkopolska"], subcategories: [
    { name: "Podregion", values: ["Wielkopolska Północna"] },
    { name: "Podregion etnograficzny", values: ["Szamotulskie"] },
    { name: "Powiat", values: ["Szamotulski"]} ] }
]

function transformToNewStructure(data: Category[], collectionName: string): { categories: Category[]; collectionName: string } {
  return { categories: data, collectionName: collectionName };
}

interface FormFieldProps {
  formData: Category;
  formDataList: Category[];
  index: string;
  level: number;
  handleInputChange: (index: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemove: (index: string) => void;
  handleAddSubcategory: (index: string) => void;
}

const FormField: React.FC<FormFieldProps> = ({
  formData,
  formDataList,
  index,
  level,
  handleInputChange,
  handleRemove,
  handleAddSubcategory,
}) => {
  // Generate options for the category name input based on the example_data structure
  const nameOptions = example_data
    .filter((category) => !formDataList.some((data) => data.name === category.name))
    .map((category, i) => (
      <option key={i} value={category.name} />
    ));

  // Generate options for the value input based on the selected key
  const valueOptions = example_data
    .find((category) => category.name === formData.name)
    ?.subcategories?.filter((subcategory) => !formData.subcategories?.some((data) => data.name === subcategory.name))
    .map((subcategory, i) => (
      <option key={i} value={subcategory.values[0]} />
  ));
    
  return (
    <div key={index} className="flex flex-col pb-1 mt-1 relative">
      <div className="flex items-center group relative">
        {level > 0 && (
          <span className="absolute left-0 top-1/2 transform -translate-y-1/2 border-l-2 border-gray-400 h-full"></span>
        )}
        <label className="flex items-center">
          <input
            type="text"
            name={`name`}
            value={formData.name}
            onChange={(e) => handleInputChange(index, e)}
            placeholder="Podaj nazwę kategorii..."
            className="mx-2 p-2"
            list="name-options"
          />
        </label>
        <label className="flex items-center">
          <span>:</span>
          <input
            type="text"
            name={`values`}
            value={formData.values[0]}
            onChange={(e) => handleInputChange(index, e)}
            className="mx-2 p-2"
            list="values-options"
          />
        </label>
        <div className="actions opacity-0 group-hover:opacity-100 transition-opacity duration-100">
          {level < 5 && (
            <button type="button" onClick={() => handleAddSubcategory(index)} title="Dodaj podkategorię">
              <PlusIcon />
            </button>
          )}
          <button type="button" onClick={() => handleRemove(index)} title="Usuń kategorię">
            <MinusIcon />
          </button>
        </div>
      </div>
      {/* render subcategories */}
      {formData.subcategories &&
        formData.subcategories.map((subCategory, subIndex) => {
          const uniqueSubIndex = `${index}-${subIndex}`;  // e.g. index '2-0-1'
          return (
            <div className="ml-8 flex flex-row relative mt-1">
              <FormField
                key={uniqueSubIndex}
                index={uniqueSubIndex}
                level={level + 1}
                formData={subCategory}
                formDataList={formDataList}
                handleInputChange={handleInputChange}
                handleRemove={handleRemove}
                handleAddSubcategory={handleAddSubcategory}
              />
            </div>
          );
        })}
    </div>
  );
};


interface NewArtworkStructureProps {
  initialFormData: Category[];
  setDataToInsert: any
}


const NewArtworkStructure: React.FC<NewArtworkStructureProps> = ({ initialFormData, setDataToInsert }) => {
  const [formDataList, setFormDataList] = React.useState<Category[]>(initialFormData); // Ustaw początkowe dane

  const createOrEdit = window.location.href.split("/")[window.location.href.split("/").length-1]
  let collectionName = window.location.href.split("/")[window.location.href.split("/").length-2]
  if(createOrEdit === "edit-artwork") {
    collectionName = window.location.href.split("/")[window.location.href.split("/").length-4]
  }
  
  useEffect(() => {
    setDataToInsert(transformToNewStructure(formDataList, collectionName))
  }, [formDataList])

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

  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault();

  //   let mongoDBData = transformToNewStructure(formDataList);
    
  //   // Przekazanie danych formularza do funkcji createArtwork
  //   try {
  //     const response = await createArtwork(mongoDBData);
  //     console.log(response.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

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
    <div style={{ overflowY: 'auto', height: '70vh', minWidth: '2000px'}}> {/* TODO */}
      <div className="m-4">
        {/* <form onSubmit={handleSubmit}> */}
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
          <div className="flex flex-col justify-between items-start mt-4 space-y-4">
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
    </div>
  );
}

export default NewArtworkStructure;
