import React, { ChangeEvent, useEffect } from 'react';
// import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg"
import FormField from './FormField';
import { Metadata } from '../../@types/Metadata';


interface MetadataFormProps {
  initialFormData: Metadata[];
  collectionName: string;
  setDataToInsert: (data: { categories: Metadata[]; collectionName: string }) => void;
}

const MetadataForm: React.FC<MetadataFormProps> = ({ initialFormData, collectionName, setDataToInsert }) => {
  // Inicjalizujemy stan tylko raz przy pierwszym renderze lub gdy initialFormData się zmieni.
  const [formDataList, setFormDataList] = React.useState<Metadata[]>(initialFormData);


  // Ustaw stan formularza, gdy initialFormData się zmieni (np. przy pierwszym pobraniu)
  useEffect(() => {
    setFormDataList(initialFormData);
    console.log('Initial Form Data:', initialFormData);
  }, [initialFormData]);


  // Każdorazowo, gdy zmieni się formDataList lub collectionName, przekażemy zmodyfikowane dane do rodzica.
  useEffect(() => {
    if (collectionName) {
      setDataToInsert({ categories: formDataList, collectionName });
    }
  }, [formDataList, collectionName, setDataToInsert]);


  const handleInputChange = (index: string, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const indexParts = index.split('-').map(Number);  // e.g. index '2-0-1' -> [2, 0, 1]

    setFormDataList((prevDataList) =>
        updateNestedValue(prevDataList, indexParts, name, value)
    );
  };

  // recursively update the value of a nested object
  const updateNestedValue = (dataList: Metadata[], indexParts: number[], name: string, value: string): Metadata[] => {
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

  // const handleAddCategory = () => {
  //   setFormDataList((prevDataList) => [...prevDataList, { name: '', values: [''], subcategories: [] }]);
  // };

  const handleAddSubcategory = (index: string) => {
    const indexParts = index.split('-').map(Number);  // e.g. index '2-0-1' -> [2, 0, 1]

    setFormDataList((prevDataList) =>
        addSubcategory(prevDataList, indexParts)
    );
  };

  const addSubcategory = (dataList: Metadata[], indexParts: number[]): Metadata[] => {
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
              { name: '', values: [''], subcategories: [] }
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

  const removeCategory = (dataList: Metadata[], indexParts: number[]): Metadata[] => {
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
    }).filter(item => item !== null) as Metadata[];
  };

  return (
      <div style={{ overflowY: 'auto', height: '70vh', minWidth: '2000px'}}> {/* TODO */}
        <div className="m-4">
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
            {/*<div className="actions mt-1">*/}
            {/*  <button type="button" onClick={handleAddCategory} title="Dodaj kategorię">*/}
            {/*    <PlusIcon />*/}
            {/*  </button>*/}
            {/*  /!*<button type="button" onClick={handleShowJson}>*!/*/}
            {/*  /!*  Show JSON*!/*/}
            {/*  /!*</button>*!/*/}
            {/*</div>*/}
          </form>
          {/* <pre>{jsonOutput}</pre> */}
        </div>
      </div>
  );
}

export default MetadataForm;