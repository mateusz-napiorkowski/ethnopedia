import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Metadata } from '../../@types/Metadata';
import FormField from './FormField';
import { ReactComponent as File } from "../../assets/icons/file.svg"
import { ReactComponent as DragAndDrop } from "../../assets/icons/dragAndDrop.svg"
import { ReactComponent as Close } from "../../assets/icons/close.svg"

interface MetadataFormProps {
    initialMetadataTree?: Metadata[],
    filesToUpload: any[],
    setFilesToUpload: (files: any) => void,
    currentFiles: any[],
    setCurrentFiles: (files: any) => void,
    filesToDelete: any[],
    setFilesToDelete: (files: any) => void,
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
                                                       filesToUpload,
                                                       setFilesToUpload,
                                                       currentFiles,
                                                       setCurrentFiles,
                                                       filesToDelete,
                                                       setFilesToDelete,
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
            setFieldValue('categories', newTree, false);
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

    const handleFileUpload = (event: any) => {
        const file = event.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = (evt: any) => {
            setFilesToUpload(((prevFiles: any) => [...prevFiles, file]));
            setFieldValue("filesToUpload", ((prevFiles: any) => [...prevFiles, file]), false)
        };

        reader.readAsArrayBuffer(file);
    }

    const handleNotUploadedFileRemove = (fileToRemove: string) => {
        setFilesToUpload((prevFiles: any) =>
            prevFiles.filter((file: any) => file.name !== fileToRemove)
        );
        setFieldValue("filesToUpload", (prevFiles: any) =>
            prevFiles.filter((file: any) => file.name !== fileToRemove))
    }

    const handleUploadedFileRemove = (fileToRemove: any) => {
        setCurrentFiles((prevFiles: any) =>
            prevFiles.filter((file: any) => file.originalFilename !== fileToRemove.originalFilename)
        );
        setFilesToDelete((prev: any) => [...prev, fileToRemove]);
        setFieldValue("filesToDelete", (prevFiles: any[]) =>
            prevFiles.filter((prev: any) => [...prev, fileToRemove]))
    }

    return (
        <>
            <div data-testid='category-tree'>
                {renderFields(categories)}
            </div>
            <div>
                <label
                    htmlFor="dropzone-file"
                    className="block text-sm font-bold text-gray-700 dark:text-white my-2"
                >
                    Wgraj pliki
                </label>
                <p className='block text-sm font-normal'>Obsługiwane formaty plików: mei, midi, musicxml, xml, txt.</p>
                <p className='block text-sm font-normal mb-2'>Maksymalny rozmiar pliku: <span className=''>25 MB.</span></p>
                {
                    currentFiles.map((file) => {
                        return <>
                            <div
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
                        </>
                    })
                }
                {filesToUpload.map((file) => {
                    return <>
                        <div
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
                    </>
                })}
                {
                    (currentFiles.length + filesToUpload.length) < 5 && 
                    <>
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
                    </>
                }
                
            </div>
        </>
    );
};

export default MetadataForm;
