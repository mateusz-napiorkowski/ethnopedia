import React, { useMemo, useCallback } from 'react';
import { Metadata } from '../../@types/Metadata';
import FormField from './FormField';

interface MetadataFormProps {
    categories: Metadata[];
    setFieldValue: (
        field: string,
        value: any,
        isUserTyping?: boolean,
        fieldPath?: string
    ) => void;
    suggestionsByCategory?: Record<string, string[]>;
}

const MetadataForm: React.FC<MetadataFormProps> = ({
                                                       categories,
                                                       setFieldValue,
                                                       suggestionsByCategory = {},
                                                   }) => {

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

    // Get category path for suggestions
    const getCategoryPath = useCallback((path: number[]): string => {
        let currentList = categories;
        const pathParts: string[] = [];

        for (const index of path) {
            if (currentList[index]) {
                pathParts.push(currentList[index].name);
                currentList = currentList[index].subcategories || [];
            }
        }

        return pathParts.join('.');
    }, [categories]);

    // Handle navigation between fields
    const handleFieldNavigation = useCallback((path: number[], e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            // Only prevent default for navigation, not when suggestions are showing
            const input = e.target as HTMLInputElement;
            const suggestionDropdown = input.parentElement?.querySelector('[data-suggestions-dropdown]');
            const showingSuggestions = suggestionDropdown && !suggestionDropdown.classList.contains('hidden');

            if (!showingSuggestions || e.key === 'Enter') {
                e.preventDefault();

                // znajdź nasz indeks w mapie wszystkich ścieżek
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
        }
    }, [allPaths]);

    // Update a single node value
    const updateValue = useCallback((path: number[], value: string, isUserTyping: boolean = false) => {
        // Create a deep copy of the categories array
        const deepCopyCategories = (cats: Metadata[]): Metadata[] => {
            return cats.map(cat => ({
                ...cat,
                subcategories: cat.subcategories ? deepCopyCategories(cat.subcategories) : []
            }));
        };

        const newTree = deepCopyCategories(categories);

        // Navigate to the target node and update its value
        let nodeList = newTree;
        for (let i = 0; i < path.length - 1; i++) {
            const index = path[i];
            nodeList = nodeList[index].subcategories!;
        }

        const lastIndex = path[path.length - 1];
        nodeList[lastIndex] = { ...nodeList[lastIndex], value };

        // Create field path for debouncing (each field gets its own debounce)
        const fieldPath = `field-${path.join('-')}`;

        setFieldValue('categories', newTree, isUserTyping, fieldPath);
    }, [categories, setFieldValue]);

    // Recursive renderer
    const renderFields = (
        list: Metadata[],
        basePath: number[] = []
    ) =>
        list.map((meta, idx) => {
            const path = [...basePath, idx];
            const key = path.join('-');
            const level = basePath.length;
            const isLastInThisList = idx === list.length - 1;
            const categoryPath = getCategoryPath(path);
            const suggestions = suggestionsByCategory[categoryPath] || [];
            const hasSubcategories = meta.subcategories && meta.subcategories.length > 0;

            return (
                <div key={key} className={`relative ${level > 0 ? 'pl-6' : ''}`}>
                    {/* Vertical line - only for direct parent-child connections */}
                    {level > 0 && (
                        <div
                            className="absolute left-0 w-px bg-gray-300 dark:bg-gray-600"
                            style={{
                                top: '-0.5rem',
                                // End the line at the current element if it's the last in this list
                                // This prevents lines from extending to unrelated deeper subcategories
                                bottom: isLastInThisList ? '2.1rem' : '0'
                            }}
                        />
                    )}

                    {/* Horizontal line */}
                    {level > 0 && (
                        <div className="absolute left-0 top-6 h-px w-6 bg-gray-300 dark:bg-gray-600" />
                    )}

                    <FormField
                        id={`field-${key}`}
                        label={meta.name}
                        value={meta.value || ''}
                        onChange={(val, isUserTyping) => updateValue(path, val, isUserTyping)}
                        onKeyDown={(e) => handleFieldNavigation(path, e)}
                        level={level}
                        suggestions={suggestions}
                    />

                    {hasSubcategories && (
                        <div className="ml-4 relative">
                            {renderFields(meta.subcategories!, path)}
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