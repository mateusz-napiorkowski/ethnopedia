import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Metadata } from '../../@types/Metadata';
import FormField from './FormField';

interface MetadataFormProps {
    initialMetadataTree?: Metadata[];
    categoryPaths?: string[];
    setFieldValue: (
        field: string,
        value: any,
        shouldValidate?: boolean
    ) => void;
}

const buildHierarchy = (paths: string[]): Metadata[] => {
    const map: Record<string, Metadata> = {};
    const result: Metadata[] = [];

    paths.forEach((path) => {
        const parts = path.split('.');
        let parentList = result;
        let prefix = '';

        parts.forEach((part, idx) => {
            prefix = idx === 0 ? part : `${prefix}.${part}`;
            if (!map[prefix]) {
                map[prefix] = { name: part, value: '', subcategories: [] };
                parentList.push(map[prefix]);
            }
            parentList = map[prefix].subcategories!;
        });
    });

    return result;
};

const MetadataForm: React.FC<MetadataFormProps> = ({
                                                       initialMetadataTree,
                                                       categoryPaths,
                                                       setFieldValue,
                                                   }) => {
    const [categories, setCategories] = useState<Metadata[]>([]);

    // Build tree from API or dot-paths
    useEffect(() => {
        if (initialMetadataTree) {
            setCategories(initialMetadataTree);
        } else if (categoryPaths) {
            setCategories(buildHierarchy(categoryPaths));
        }
    }, [initialMetadataTree, categoryPaths]);

    // Sync to Formik
    useEffect(() => {
        setFieldValue('categories', categories, false);
    }, [categories, setFieldValue]);

    // Flatten all field indices
    const allPaths = useMemo(() => {
        const paths: number[][] = [];
        const traverse = (list: Metadata[], base: number[] = []) => {
            list.forEach((item, idx) => {
                const path = [...base, idx];
                paths.push(path);
                if (item.subcategories) traverse(item.subcategories, path);
            });
        };
        traverse(categories);
        return paths;
    }, [categories]);

    // Handle Enter → next field
    const handleKeyDown = useCallback((path: number[], e: React.KeyboardEvent<HTMLInputElement>) => {
        // nie pozwalamy Enterowi na submit
        if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();

            // znajdź nasz indeks w mapa wszystkich ścieżek
            const idx = allPaths.findIndex(p => p.join('-') === path.join('-'));
            let targetIdx = idx;

            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                // w dół
                targetIdx = idx + 1;
            } else if (e.key === 'ArrowUp') {
                // w górę
                targetIdx = idx - 1;
            }

            // jeśli target jest w granicach
            if (targetIdx >= 0 && targetIdx < allPaths.length) {
                const nextId = `field-${allPaths[targetIdx].join('-')}`;
                const next = document.getElementById(nextId);
                if (next) (next as HTMLElement).focus();
            }
        }
    }, [allPaths]);


    // Update a single node value
    const updateValue = useCallback(
        (path: number[], value: string) => {
            const newTree = [...categories];
            let nodeList = newTree;
            for (let i = 0; i < path.length - 1; i++) {
                nodeList = nodeList[path[i]].subcategories!;
            }
            nodeList[path[path.length - 1]].value = value;
            setCategories(newTree);
        },
        [categories]
    );

    // Recursive renderer
    const renderFields = (
        list: Metadata[],
        basePath: number[] = [],
        parentLast: boolean[] = []
    ) =>
        list.map((meta, idx) => {
            const path = [...basePath, idx];
            const key = path.join('-');
            const level = basePath.length;
            const isLastInThisList = idx === list.length - 1;
            const updatedParentLast = [...parentLast, isLastInThisList];

            return (
                <div key={key} className={`relative ${level > 0 ? 'pl-6' : ''}`}>
                    {/* Pionowa linia */}
                    {level > 0 && (
                        <div
                            className="absolute left-0 w-px bg-gray-300 dark:bg-gray-600"
                            style={{
                                top: '-0.5rem',
                                // Jeśli jest to ostatnia podkategoria na tym poziomie lub tylko jedna podkategoria,
                                // linia powinna kończyć się przed poziomą linią
                                bottom: isLastInThisList  ? '2.1rem' : 0,
                            }}
                        />
                    )}

                    {/* Pozioma linia */}
                    {level > 0 && (
                        <div className="absolute left-0 top-6 h-px w-6 bg-gray-300 dark:bg-gray-600" />
                    )}

                    <FormField
                        id={`field-${key}`}
                        label={meta.name}
                        value={meta.value || ''}
                        onChange={(val) => updateValue(path, val)}
                        onKeyDown={(e) => handleKeyDown(path, e)}
                        level={level}
                    />

                    {meta.subcategories && (
                        <div className="ml-4">
                            {renderFields(meta.subcategories, path, updatedParentLast)}
                        </div>
                    )}
                </div>
            );
        });


    return (
        <div>
            {renderFields(categories)}
        </div>
    );
};

export default MetadataForm;
