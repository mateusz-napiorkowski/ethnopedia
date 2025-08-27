import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Metadata } from '../../@types/Metadata';
import FormField from './FormField';
import { ReactComponent as File } from "../../assets/icons/file.svg";
import { ReactComponent as DragAndDrop } from "../../assets/icons/dragAndDrop.svg";
import { ReactComponent as Close } from "../../assets/icons/close.svg";

interface MetadataFormProps {
    // twoje propsy (search-all-frontend)
    categories?: Metadata[]; // kept for backward compatibility
    setFieldValue: (
        field: string,
        value: any,
        isUserTypingOrShouldValidate?: any,
        fieldPath?: string
    ) => void;
    suggestionsByCategory?: Record<string, string[]>;

    // main's file-related props (optional here)
    metadataTree?: Metadata[]; // used by merged CreateArtworkPage
    initialMetadataTree?: Metadata[]; // also accept older name
    categoryPaths?: string[];

    filesToUpload?: any[];
    setFilesToUpload?: (files: any) => void;
    currentFiles?: any[];
    setCurrentFiles?: (files: any) => void;
    filesToDelete?: any[];
    setFilesToDelete?: (files: any) => void;
}

const buildHierarchyFromPaths = (paths: string[]): Metadata[] => {
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
                                                       // search-all
                                                       categories: categoriesProp,
                                                       setFieldValue,
                                                       suggestionsByCategory = {},

                                                       // main / merged variations
                                                       metadataTree,
                                                       initialMetadataTree,
                                                       categoryPaths,

                                                       // files (optional)
                                                       filesToUpload = [],
                                                       setFilesToUpload,
                                                       currentFiles = [],
                                                       setCurrentFiles,
                                                       filesToDelete = [],
                                                       setFilesToDelete,
                                                   }) => {
    // Decide source of truth for the tree:
    // priority: metadataTree | initialMetadataTree | categoriesProp | categoryPaths -> built tree
    const [categories, setCategories] = useState<Metadata[]>([]);

    useEffect(() => {
        if (metadataTree) {
            setCategories(metadataTree);
            return;
        }
        if (initialMetadataTree) {
            setCategories(initialMetadataTree);
            return;
        }
        if (categoriesProp) {
            setCategories(categoriesProp);
            return;
        }
        if (categoryPaths && categoryPaths.length) {
            setCategories(buildHierarchyFromPaths(categoryPaths));
            return;
        }
        setCategories([]);
    }, [metadataTree, initialMetadataTree, categoriesProp, categoryPaths]);

    // Flatten all field indices (for navigation)
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

    // Get category path (dot notation) from numeric path
    const getCategoryPath = useCallback((path: number[]): string => {
        let currentList = categories;
        const pathParts: string[] = [];

        for (const index of path) {
            if (currentList[index]) {
                pathParts.push(currentList[index].name);
                currentList = currentList[index].subcategories || [];
            } else {
                break;
            }
        }

        return pathParts.join('.');
    }, [categories]);

    // Navigation between fields (Enter / ArrowDown / ArrowUp)
    const handleFieldNavigation = useCallback((path: number[], e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            // Check whether suggestion dropdown is showing — if so, skip navigation (except Enter)
            const input = e.target as HTMLInputElement;
            const suggestionDropdown = input.parentElement?.querySelector('[data-suggestions-dropdown]');
            const showingSuggestions = suggestionDropdown && !(suggestionDropdown as HTMLElement).classList.contains('hidden');

            if (!showingSuggestions || e.key === 'Enter') {
                e.preventDefault();

                const idx = allPaths.findIndex(p => p.join('-') === path.join('-'));
                let targetIdx = idx;

                if (e.key === 'Enter' || e.key === 'ArrowDown') {
                    targetIdx = idx + 1;
                } else if (e.key === 'ArrowUp') {
                    targetIdx = idx - 1;
                }

                if (targetIdx >= 0 && targetIdx < allPaths.length) {
                    const nextId = `field-${allPaths[targetIdx].join('-')}`;
                    const next = document.getElementById(nextId);
                    if (next) (next as HTMLElement).focus();
                }
            }
        }
    }, [allPaths]);

    // Utility: deep copy categories (preserve structure)
    const deepCopyCategories = useCallback((cats: Metadata[]): Metadata[] => {
        return cats.map(cat => ({
            ...cat,
            subcategories: cat.subcategories ? deepCopyCategories(cat.subcategories) : []
        }));
    }, []);

    // Update a single node value (keeps your debouncing per field approach)
    const updateValue = useCallback((path: number[], value: string, isUserTyping: boolean = false) => {
        const newTree = deepCopyCategories(categories);

        let nodeList = newTree;
        for (let i = 0; i < path.length - 1; i++) {
            nodeList = nodeList[path[i]].subcategories!;
        }

        const lastIndex = path[path.length - 1];
        nodeList[lastIndex] = { ...nodeList[lastIndex], value };

        // fieldPath used for per-field debounce in your hook
        const fieldPath = `field-${path.join('-')}`;

        // update local (for main's variant) so UI updates immediately
        setCategories(newTree);

        // call host's setter. We always pass four args; Formik's setFieldValue will ignore extras.
        setFieldValue('categories', newTree, isUserTyping, fieldPath);
    }, [categories, deepCopyCategories, setFieldValue]);

    // Recursive renderer (keeps your visual lines / nesting)
    const renderFields = (list: Metadata[], basePath: number[] = []) =>
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
                    {/* Vertical line */}
                    {level > 0 && (
                        <div
                            className="absolute left-0 w-px bg-gray-300 dark:bg-gray-600"
                            style={{
                                top: '-0.5rem',
                                bottom: isLastInThisList ? '2.1rem' : 0
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
                        onChange={(val: string, isUserTyping?: boolean) => updateValue(path, val, !!isUserTyping)}
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

    // --- Files handling (from main) ---
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        // push into filesToUpload via setter if provided
        if (setFilesToUpload) {
            setFilesToUpload((prev: any[]) => [...(prev || []), file]);
        }
        // also call setFieldValue so parent Formik receives changes if it expects filesToUpload field
        try {
            setFieldValue("filesToUpload", (prev: any[]) => ([...(prev || []), file]), false);
        } catch {
            // ignore if parent does not accept this pattern
        }
    };

    const handleNotUploadedFileRemove = (fileName: string) => {
        if (setFilesToUpload) {
            setFilesToUpload((prev: any[]) => (prev || []).filter((f: any) => f.name !== fileName));
        }
        try {
            setFieldValue("filesToUpload", (prev: any[]) => (prev || []).filter((f: any) => f.name !== fileName));
        } catch {}
    };

    const handleUploadedFileRemove = (fileToRemove: any) => {
        if (setCurrentFiles) {
            setCurrentFiles((prev: any[]) => (prev || []).filter((file: any) => file.originalFilename !== fileToRemove.originalFilename));
        }
        if (setFilesToDelete) {
            setFilesToDelete((prev: any[]) => [...(prev || []), fileToRemove]);
        }
        try {
            // propagate to parent form
            setFieldValue("filesToDelete", (prev: any[]) => ([...(prev || []), fileToRemove]));
        } catch {}
    };

    return (
        <>
            <div data-testid='category-tree'>
                {renderFields(categories)}
            </div>

            {/* Files UI (if parent provided setters/arrays, we render upload UI) */}
            <div className="mt-4">
                <label
                    htmlFor="dropzone-file"
                    className="block text-sm font-bold text-gray-700 dark:text-white my-2"
                >
                    Wgraj pliki
                </label>
                <p className='block text-sm font-normal'>Obsługiwane formaty plików: mei, midi, musicxml, xml, wav, mp3, txt.</p>
                <p className='block text-sm font-normal mb-2'>Maksymalny rozmiar pliku: <span className=''>25 MB.</span></p>

                {/* Currently uploaded files (from server) */}
                {currentFiles && currentFiles.map((file: any) => (
                    <div key={`uploaded-${file.originalFilename}`} className="flex flex-col items-start justify-start p-2 border-2 border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 mt-2 mb-2">
                        <div className="flex flex-row items-center justify-between w-full">
                            <div className='flex flex-row items-center justify-center gap-4'>
                                <File className="w-12 h-12"/>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                    {file.originalFilename}
                                </p>
                            </div>
                            <button
                                aria-label="remove uploaded"
                                type="button"
                                className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 text-sm dark:hover:bg-gray-600 dark:hover:text-white p-2 rounded-lg cursor-pointer"
                                onClick={() => handleUploadedFileRemove(file)}
                            >
                                <Close />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Files staged for upload */}
                {filesToUpload && filesToUpload.map((file: any) => (
                    <div key={`staged-${file.name}`} className="flex flex-col items-start justify-start p-2 border-2 border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 mt-2 mb-2">
                        <div className="flex flex-row items-center justify-between w-full">
                            <div className='flex flex-row items-center justify-center gap-4'>
                                <File className="w-12 h-12"/>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                    {file.name}
                                </p>
                            </div>
                            <button
                                aria-label="remove staged"
                                type="button"
                                className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 text-sm dark:hover:bg-gray-600 dark:hover:text-white p-2 rounded-lg cursor-pointer"
                                onClick={() => handleNotUploadedFileRemove(file.name)}
                            >
                                <Close />
                            </button>
                        </div>
                    </div>
                ))}

                {/* upload control, limit to 5 total (as in main) */}
                {((currentFiles?.length || 0) + (filesToUpload?.length || 0)) < 5 && (
                    <label
                        aria-label="upload"
                        htmlFor="dropzone-file"
                        className="flex flex-col items-start justify-start p-2 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-600 dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                    >
                        <div className="flex flex-row items-center justify-center gap-4">
                            <DragAndDrop className="w-12 h-12 text-gray-500 dark:text-gray-400"/>
                            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                {`Kliknij, aby przesłać ${(currentFiles?.length || 0) + (filesToUpload?.length || 0) ? "kolejny" : "pierwszy"} plik`}
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
