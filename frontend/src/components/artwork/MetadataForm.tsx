import React, { useMemo, useCallback } from 'react';
import { Metadata } from '../../@types/Metadata';
import FormField from './FormField';
import { ReactComponent as File } from "../../assets/icons/file.svg";
import { ReactComponent as DragAndDrop } from "../../assets/icons/dragAndDrop.svg";
import { ReactComponent as Close } from "../../assets/icons/close.svg";

interface MetadataFormProps {
    categories: Metadata[];
    setFieldValue: (
        field: string,
        value: any,
        isUserTyping?: boolean,
        fieldPath?: string
    ) => void;
    suggestionsByCategory?: Record<string, string[]>;
    // File upload props from main branch
    filesToUpload: any[];
    setFilesToUpload: (files: any) => void;
    currentFiles: any[];
    setCurrentFiles: (files: any) => void;
    filesToDelete: any[];
    setFilesToDelete: (files: any) => void;
    onFileFieldChange: (field: string, value: any) => void;
}

const MetadataForm: React.FC<MetadataFormProps> = ({
                                                       categories,
                                                       setFieldValue,
                                                       suggestionsByCategory = {},
                                                       filesToUpload,
                                                       setFilesToUpload,
                                                       currentFiles,
                                                       setCurrentFiles,
                                                       filesToDelete,
                                                       setFilesToDelete,
                                                       onFileFieldChange,
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

    // File upload handlers from main branch
    const handleFileUpload = (event: any) => {
        const file = event.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = (evt: any) => {
            const newFiles = [...filesToUpload, file];
            setFilesToUpload(newFiles);
            onFileFieldChange("filesToUpload", newFiles);
        };

        reader.readAsArrayBuffer(file);
    };

    const handleNotUploadedFileRemove = (fileToRemove: string) => {
        const newFiles = filesToUpload.filter((file: any) => file.name !== fileToRemove);
        setFilesToUpload(newFiles);
        onFileFieldChange("filesToUpload", newFiles);
    };

    const handleUploadedFileRemove = (fileToRemove: any) => {
        const newCurrentFiles = currentFiles.filter((file: any) => file.originalFilename !== fileToRemove.originalFilename);
        const newFilesToDelete = [...filesToDelete, fileToRemove];
        setCurrentFiles(newCurrentFiles);
        setFilesToDelete(newFilesToDelete);
        onFileFieldChange("filesToDelete", newFilesToDelete);
    };

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
        <>
            <div data-testid='category-tree'>
                {renderFields(categories)}
            </div>

            {/* File upload section from main branch */}
            <div>
                <label
                    htmlFor="dropzone-file"
                    className="block text-sm font-bold text-gray-700 dark:text-white my-2"
                >
                    Wgraj pliki
                </label>
                <p className='block text-sm font-normal'>Obsługiwane formaty plików: mei, midi, musicxml, xml, wav, mp3, txt.</p>
                <p className='block text-sm font-normal mb-2'>Maksymalny rozmiar pliku: <span className=''>25 MB.</span></p>

                {/* Current uploaded files */}
                {currentFiles.map((file, index) => {
                    return (
                        <div
                            key={`current-${index}`}
                            className="flex flex-col items-start justify-start p-2 border-2 border-gray-200
                                border-solid rounded-lg bg-gray-50
                              dark:bg-gray-800 dark:border-gray-600 mt-2 mb-2"
                        >
                            <div className="flex flex-row items-center justify-between w-full">
                                <div className='flex flex-row items-center justify-center gap-4'>
                                    <File className="w-12 h-12"/>
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                        {file.originalFilename}
                                    </p>
                                </div>
                                <button
                                    aria-label="exit"
                                    type="button"
                                    className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 text-sm
                                            dark:hover:bg-gray-600 dark:hover:text-white p-2 rounded-lg cursor-pointer"
                                    onClick={() => handleUploadedFileRemove(file)}
                                >
                                    <Close />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Files to upload */}
                {filesToUpload.map((file, index) => {
                    return (
                        <div
                            key={`upload-${index}`}
                            className="flex flex-col items-start justify-start p-2 border-2 border-gray-200
                                border-solid rounded-lg bg-gray-50
                                dark:bg-gray-800 dark:border-gray-600 mt-2 mb-2"
                        >
                            <div className="flex flex-row items-center justify-between w-full">
                                <div className='flex flex-row items-center justify-center gap-4'>
                                    <File className="w-12 h-12"/>
                                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                        {file.name}
                                    </p>
                                </div>
                                <button
                                    aria-label="exit"
                                    type="button"
                                    className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 text-sm
                                            dark:hover:bg-gray-600 dark:hover:text-white p-2 rounded-lg cursor-pointer"
                                    onClick={() => handleNotUploadedFileRemove(file.name)}
                                >
                                    <Close />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Upload button */}
                {(currentFiles.length + filesToUpload.length) < 5 && (
                    <label
                        aria-label="upload"
                        htmlFor="dropzone-file"
                        className="flex flex-col items-start justify-start p-2 border-2 border-gray-200
                                    border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-600
                                    dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600
                                    dark:hover:border-gray-500 dark:hover:bg-gray-700"
                    >
                        <div className="flex flex-row items-center justify-center gap-4">
                            <DragAndDrop className="w-12 h-12 text-gray-500 dark:text-gray-400"/>
                            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                {`Kliknij, aby przesłać ${(currentFiles.length + filesToUpload.length) ? "kolejny" : "pierwszy"} plik`}
                            </p>
                        </div>
                        <input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </label>
                )}
            </div>
        </>
    );
};

export default MetadataForm;