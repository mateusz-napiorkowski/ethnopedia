import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Navigation from '../../components/Navigation';
import LoadingPage from '../LoadingPage';
import { useUser } from '../../providers/UserProvider';
import { getAllCategories } from '../../api/categories';
import { getCollection } from '../../api/collections';
import { getArtwork, createArtwork, editArtwork } from '../../api/artworks';
import { getArtworksForPage } from '../../api/artworks';
import MetadataForm from '../../components/artwork/MetadataForm';
import { Metadata } from '../../@types/Metadata';
import useUndoRedoFormState from '../../hooks/useUndoRedoFormState';
import {MdRedo as RedoArrow, MdUndo as UndoArrow} from "react-icons/md";
import FileErrorsPopup from './FileErrorsPopup';
import { UploadedFileData } from '../../@types/Files';

interface FormValues {
    categories: Metadata[];
    filesToUpload: any[];
    filesToDelete: any[];
}

const CreateArtworkPage: React.FC = () => {
    const { collectionId, artworkId } = useParams<{
        collectionId: string;
        artworkId?: string;
    }>();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { jwtToken } = useUser();

    const { data: catData, isLoading: catsLoading } = useQuery(
        ['categories', collectionId],
        () => getAllCategories([collectionId as string]),
        { enabled: !!collectionId }
    );

    const { data: collData } = useQuery(
        ['collection', collectionId],
        () => getCollection(collectionId!),
        { enabled: !!collectionId }
    );

    const { data: artworksData } = useQuery(
        ['allArtworks', collectionId],
        () =>
            getArtworksForPage(
                [collectionId as string],
                1,
                1000,
                'createdAt',
                'desc',
                '',
                {},
                jwtToken
            ),
        { enabled: !!collectionId }
    );

    const [isInitialized, setIsInitialized] = useState(false);

    // File upload state from main branch
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [currentFiles, setCurrentFiles] = useState([]);
    const [filesToDelete, setFilesToDelete] = useState<UploadedFileData[]>([]);
    const [showFileErrorsPopup, setShowFileErrorsPopup] = useState(false);
    const [failedUploadsCauses, setFailedUploadsCauses] = useState([]);
    const [failedDeletesCauses, setFailedDeletesCauses] = useState([]);

    // Stable initial state that doesn't change on every render
    const stableInitialState = useMemo(() => ({
        categories: [] as Metadata[],
        filesToUpload: [] as any[],
        filesToDelete: [] as any[],
    }), []);

    const {
        state: formValues,
        setState: setFormValues,
        undo: handleUndo,
        redo: handleRedo,
        canUndo,
        canRedo,
        initializeState,
    } = useUndoRedoFormState<FormValues>(stableInitialState);

    // Prevent undo/redo until form is properly initialized
    const safeCanUndo = isInitialized && canUndo;
    const safeCanRedo = isInitialized && canRedo;

    const suggestionsByCategory = useMemo(() => {
        const suggestions: Record<string, Set<string>> = {};

        const extractValues = (categories: Metadata[], prefix: string = '') => {
            categories.forEach((category) => {
                const categoryPath = prefix ? `${prefix}.${category.name}` : category.name;
                if (category.value?.trim()) {
                    if (!suggestions[categoryPath]) {
                        suggestions[categoryPath] = new Set();
                    }
                    suggestions[categoryPath].add(category.value.trim());
                }
                if (category.subcategories?.length) {
                    extractValues(category.subcategories, categoryPath);
                }
            });
        };

        if (!artworksData?.artworks) return {};
        artworksData.artworks.forEach((artwork: any) => {
            if (artwork.categories) {
                extractValues(artwork.categories);
            }
        });

        const result: Record<string, string[]> = {};
        Object.keys(suggestions).forEach((key) => {
            result[key] = Array.from(suggestions[key]).sort();
        });
        return result;
    }, [artworksData]);

    // Initialize the form state only once when data is ready
    useEffect(() => {
        if (isInitialized) return;

        if (artworkId) {
            getArtwork(artworkId, jwtToken).then((res) => {
                const initialData = {
                    categories: res.artwork.categories || [],
                    filesToUpload: [],
                    filesToDelete: []
                };
                setCurrentFiles(res.artwork.files || []);
                initializeState(initialData);
                setIsInitialized(true);
            });
        } else if (catData?.categories) {
            // Build hierarchy from category paths
            const hierarchy = buildHierarchyFromPaths(catData.categories);
            const initialData = {
                categories: hierarchy,
                filesToUpload: [],
                filesToDelete: []
            };
            initializeState(initialData);
            setIsInitialized(true);
        }
    }, [artworkId, catData, isInitialized, initializeState]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});

    // Handle field value changes with appropriate debouncing
    const handleSetFieldValue = (field: keyof FormValues, value: any, isUserTyping: boolean = false, fieldPath?: string) => {
        if (isUserTyping && fieldPath) {
            // For user typing, debounce per field path
            setFormValues((prev: FormValues) => ({
                ...prev,
                [field]: value,
            }), {
                shouldDebounce: true,
                fieldKey: fieldPath,
                debounceMs: 800
            });
        } else {
            // For programmatic changes (autocomplete selection, etc.), commit immediately
            setFormValues((prev: FormValues) => ({
                ...prev,
                [field]: value,
            }), { shouldDebounce: false });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const anyFilled = formValues.categories.some(
            (c) => (c.value ?? '').trim().length > 0
        );

        if (!anyFilled) {
            setErrors({ categories: 'Przynajmniej jedno pole musi być wypełnione.' });
            setTouched({ categories: true });
            return;
        }

        setIsSubmitting(true);

        try {
            const resData = artworkId ?
                await editArtwork(artworkId, collectionId as string, formValues.categories,
                    filesToUpload, filesToDelete, jwtToken!) :
                await createArtwork(collectionId!, formValues.categories, filesToUpload, jwtToken!);

            queryClient.invalidateQueries(['artworks', collectionId]);
            queryClient.invalidateQueries(['allArtworks', collectionId]);

            if(resData.failedUploadsCount > 0 || resData.failedDeletesCount > 0) {
                setShowFileErrorsPopup(true);
                setFailedUploadsCauses(resData.failedUploadsCauses);
                setFailedDeletesCauses(resData.failedDeletesCauses);
            } else {
                navigate(-1);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Add keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            } else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
                e.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    if (
        catsLoading ||
        !isInitialized ||
        !artworksData?.artworks
    ) {
        return (
            <div data-testid="loading-page-container">
                <LoadingPage />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col overflow-y-auto" data-testid="create-artwork-page-container">
            {showFileErrorsPopup && (
                <FileErrorsPopup
                    onClose={() => {setShowFileErrorsPopup(false); navigate(-1)}}
                    failedUploadsCauses={failedUploadsCauses}
                    failedDeletesCauses={failedDeletesCauses}
                />
            )}
            <Navbar />
            <div className="container px-8 mt-6 max-w-3xl mx-auto">
                <Navigation />
                <h2 className="text-2xl font-bold mt-2">
                    {artworkId ? 'Edytuj rekord z kolekcji' : 'Dodaj nowy rekord do kolekcji'}
                </h2>
                <h2 className="text-2xl mb-4 break-words max-w-full">
                    {collData?.name}
                </h2>

                <form onSubmit={handleSubmit}>
                    <MetadataForm
                        categories={formValues.categories}
                        setFieldValue={(field, value, isUserTyping, fieldPath) => {
                            if (field === 'categories') {
                                handleSetFieldValue(field, value, isUserTyping, fieldPath);
                            }
                        }}
                        suggestionsByCategory={suggestionsByCategory}
                        // File-related props
                        filesToUpload={filesToUpload}
                        setFilesToUpload={setFilesToUpload}
                        currentFiles={currentFiles}
                        setCurrentFiles={setCurrentFiles}
                        filesToDelete={filesToDelete}
                        setFilesToDelete={setFilesToDelete}
                        onFileFieldChange={(field, value) => handleSetFieldValue(field as keyof FormValues, value, false)}
                    />

                    {typeof errors.categories === 'string' && touched.categories && (
                        <p className="mt-2 text-red-500">{errors.categories}</p>
                    )}

                    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-500 py-3 px-4 flex justify-between items-center shadow-[0_-2px_4px_rgba(0,0,0,0.05)] z-50">
                        <div className="max-w-3xl w-full mx-auto flex justify-between items-center">
                            {/* Undo/Redo buttons on the left */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleUndo}
                                    disabled={!safeCanUndo}
                                    className={`px-2 py-2 border rounded ${
                                        !safeCanUndo
                                            ? "text-gray-400 border-gray-300 cursor-not-allowed"
                                            : "text-blue-600 border-blue-600"
                                    }`}
                                    title="Cofnij (Ctrl+Z)"
                                >
                                    <UndoArrow className="w-5 h-5"/>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleRedo}
                                    disabled={!safeCanRedo}
                                    className={`px-2 py-2 border rounded ${
                                        !safeCanRedo
                                            ? "text-gray-400 border-gray-300 cursor-not-allowed"
                                            : "text-blue-600 border-blue-600"
                                    }`}
                                    title="Przywróć (Ctrl+Y)"
                                >
                                    <RedoArrow className="w-5 h-5"/>
                                </button>
                            </div>

                            {/* Cancel/Save buttons on the right */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-4 py-2 border rounded"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    {artworkId ? 'Zapisz' : 'Utwórz'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="h-20"/>
                </form>
            </div>
        </div>
    );
};

// Helper function to build hierarchy from dot-separated paths
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

export default CreateArtworkPage;