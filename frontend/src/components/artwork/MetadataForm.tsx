import React, { ChangeEvent, useEffect, useState, useCallback } from 'react';
import FormField from './FormField';
import { Metadata } from '../../@types/Metadata';

interface MetadataFormProps {
  initialFormData: Metadata[];
  collectionName: string;
  setDataToInsert: (data: { categories: Metadata[]; collectionName: string }) => void;
  hasSubmitted: boolean;
}

const MetadataForm: React.FC<MetadataFormProps> = ({
                                                     initialFormData,
                                                     collectionName,
                                                     setDataToInsert,
                                                     hasSubmitted,
                                                   }) => {
  const [formDataList, setFormDataList] = useState<Metadata[]>(initialFormData);
  const [errorPaths, setErrorPaths] = useState<string[]>([]);

  const collectErrorPaths = useCallback((items: Metadata[], basePath = ''): string[] => {
    let paths: string[] = [];
    items.forEach((item, idx) => {
      const currentPath = basePath ? `${basePath}-${idx}` : `${idx}`;
      if (item.subcategories?.length) {
        paths = paths.concat(collectErrorPaths(item.subcategories, currentPath));
      }
    });
    return paths;
  }, []);


  useEffect(() => {
    setFormDataList(initialFormData);
  }, [initialFormData]);

  useEffect(() => {
    if (collectionName) {
      setDataToInsert({ categories: formDataList, collectionName });
    }
  }, [formDataList, collectionName, setDataToInsert]);

  useEffect(() => {
    setErrorPaths(hasSubmitted ? collectErrorPaths(formDataList) : []);
  }, [formDataList, hasSubmitted, collectErrorPaths]);

  const handleInputChange = useCallback(
      (index: string, e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const indexParts = index.split('-').map(Number);
        setFormDataList((prev) => updateNestedValue(prev, indexParts, name, value));
      },
      []
  );

  const updateNestedValue = (
      dataList: Metadata[],
      indexParts: number[],
      name: string,
      value: string
  ): Metadata[] => {
    if (!indexParts.length) return dataList;
    const [head, ...rest] = indexParts;

    return dataList.map((item, i) => {
      if (i !== head) return item;
      if (!rest.length) return { ...item, [name]: value };
      return {
        ...item,
        subcategories: updateNestedValue(item.subcategories || [], rest, name, value),
      };
    });
  };

  return (
      <div style={{ overflowY: 'auto', height: 'auto', minWidth: '2000px' }}>
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
};

export default MetadataForm;
