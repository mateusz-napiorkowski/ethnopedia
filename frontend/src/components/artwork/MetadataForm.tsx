import React, { ChangeEvent, useEffect } from 'react';
import FormField from './FormField';
import { Metadata } from '../../@types/Metadata';


interface MetadataFormProps {
  initialFormData: Metadata[];
  collectionName: string;
  setDataToInsert: (data: { categories: Metadata[]; collectionName: string }) => void;
  hasSubmitted: boolean;
}

const MetadataForm: React.FC<MetadataFormProps> = ({ initialFormData, collectionName, setDataToInsert, hasSubmitted }) => {
  // Inicjalizujemy stan tylko raz przy pierwszym renderze lub gdy initialFormData się zmieni.
  const [formDataList, setFormDataList] = React.useState<Metadata[]>(initialFormData);
  const [errorPaths, setErrorPaths] = React.useState<string[]>([]);

  useEffect(() => {
    if (hasSubmitted) {
      const pathsWithErrors: string[] = [];
      const collectErrorPaths = (items: Metadata[], basePath = '') => {
        items.forEach((item, idx) => {
          const currentPath = basePath ? `${basePath}-${idx}` : `${idx}`;
          if (!item.value.trim()) {
            pathsWithErrors.push(currentPath);
          }
          if (item.subcategories && item.subcategories.length > 0) {
            collectErrorPaths(item.subcategories, currentPath);
          }
        });
      };
      collectErrorPaths(formDataList);
      setErrorPaths(pathsWithErrors);
    } else {
      // Jeśli użytkownik jeszcze nie kliknął submit, nie pokazuj błędów
      setErrorPaths([]);
    }
  }, [formDataList, hasSubmitted]);


  // Ustaw stan formularza, gdy initialFormData się zmieni (np. przy pierwszym pobraniu)
  useEffect(() => {
    setFormDataList(initialFormData);
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
          if (name === 'value') {
            // If it is a value field
            console.log("D")
            return { ...item, [name]: value };
          } else {
            // If it is a name field
            console.log("GI")
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


  return (
      <div style={{ overflowY: 'auto', height: 'auto', minWidth: '2000px'}}> {/* TODO */}
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
                    errorPaths={errorPaths}
                />
            ))}
          </form>
        </div>
      </div>
  );
}

export default MetadataForm;