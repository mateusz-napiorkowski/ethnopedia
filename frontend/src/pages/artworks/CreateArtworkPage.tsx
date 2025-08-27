// src/pages/artwork/CreateArtworkPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Navigation from '../../components/Navigation';
import LoadingPage from '../LoadingPage';
import { useUser } from '../../providers/UserProvider';
import { getAllCategories } from '../../api/categories';
import { getCollection } from '../../api/collections';
import { getArtwork, createArtwork, editArtwork, getArtworksForPage } from '../../api/artworks';
import MetadataForm from '../../components/artwork/MetadataForm';
import FileErrorsPopup from './FileErrorsPopup';
import { Metadata } from '../../@types/Metadata';
import useUndoRedoFormState from '../../hooks/useUndoRedoFormState';
import { MdRedo as RedoArrow, MdUndo as UndoArrow } from "react-icons/md";

interface FormValues {
    categories: Metadata[];
}

/**
 * Lokalny typ przyczyn błędów plików — powinien odpowiadać literalom
 * używanym w FileErrorsPopup. Nazwa jest inna, żeby uniknąć ewentualnych konfliktów nazewniczych.
 */
type FileErrorCause =
    | "File not found"
    | "Internal server error"
    | "Invalid file extension"
    | "File size exceeded";

const normalizeCause = (raw: any): FileErrorCause => {
    if (!raw || typeof raw !== 'string') return "Internal server error";
    const s = raw.toLowerCase();
    if (s.includes('not') && s.includes('found')) return "File not found";
    if (s.includes('invalid') || s.includes('extension')) return "Invalid file extension";
    if (s.includes('size') || s.includes('exceed')) return "File size exceeded";
    // fallback
    return "Internal server error";
};

const CreateArtworkPage: React.FC = () => {
    const { collectionId, artworkId } = useParams<{ collectionId: string; artworkId?: string }>();
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

    // Pobranie wszystkich dzieł w kolekcji do sugestii (limit 1000)
    const { data: artworksData } = useQuery(
        ['allArtworks', collectionId],
        () => getArtworksForPage([collectionId as string], 1, 1000, "createdAt", "asc", null, {}),
        { enabled: !!collectionId }
    );

    const [initialCategoryPaths, setInitialCategoryPaths] = useState<string[]>([]);
    const [initialMetadataTree, setInitialMetadataTree] = useState<Metadata[] | undefined>(undefined);
    const [isInitialized, setIsInitialized] = useState(false);

    // files / file errors
    const [filesToUpload, setFilesToUpload] = useState<any[]>([]);
    const [currentFiles, setCurrentFiles] = useState<any[]>([]);
    const [filesToDelete, setFilesToDelete] = useState<any[]>([]);
    const [showFileErrorsPopup, setShowFileErrorsPopup] = useState(false);
    const [failedUploadsCauses, setFailedUploadsCauses] = useState<{ filename: string; cause: FileErrorCause }[]>([]);
    const [failedDeletesCauses, setFailedDeletesCauses] = useState<{ filename: string; cause: FileErrorCause }[]>([]);

    // undo/redo form state
    const stableInitialState = useMemo(() => ({ categories: [] as Metadata[] }), []);
    const {
        state: formValues,
        setState: setFormValues,
        undo: handleUndo,
        redo: handleRedo,
        canUndo,
        canRedo,
        initializeState,
    } = useUndoRedoFormState<FormValues>(stableInitialState);

    const safeCanUndo = isInitialized && canUndo;
    const safeCanRedo = isInitialized && canRedo;

    // suggestions from existing artworks
    const suggestionsByCategory = useMemo(() => {
        const suggestions: Record<string, Set<string>> = {};
        const extractValues = (categories: Metadata[], prefix = '') => {
            categories.forEach((category) => {
                const categoryPath = prefix ? `${prefix}.${category.name}` : category.name;
                if (category.value?.trim()) {
                    if (!suggestions[categoryPath]) suggestions[categoryPath] = new Set();
                    suggestions[categoryPath].add(category.value.trim());
                }
                if (category.subcategories?.length) extractValues(category.subcategories, categoryPath);
            });
        };

        if (!artworksData?.artworks) return {};
        artworksData.artworks.forEach((artwork: any) => {
            if (artwork.categories) extractValues(artwork.categories);
        });

        const result: Record<string, string[]> = {};
        Object.keys(suggestions).forEach((key) => {
            result[key] = Array.from(suggestions[key]).sort();
        });
        return result;
    }, [artworksData]);

    // Initialize form values once
    useEffect(() => {
        if (isInitialized) return;

        if (artworkId) {
            getArtwork(artworkId).then((res) => {
                const initialData = { categories: res.artwork.categories || [] };
                setInitialMetadataTree(res.artwork.categories || []);
                setCurrentFiles(res.artwork.files || []);
                initializeState(initialData);
                setIsInitialized(true);
            });
        } else if (catData?.categories) {
            setInitialCategoryPaths(catData.categories);
            const hierarchy = buildHierarchyFromPaths(catData.categories);
            const initialData = { categories: hierarchy };
            setInitialMetadataTree(hierarchy);
            initializeState(initialData);
            setIsInitialized(true);
        }
    }, [artworkId, catData, initializeState, isInitialized]);

    // handleSetFieldValue — zgodne z MetadataForm.setFieldValue (przyjmujemy 'field' jako string)
    const handleSetFieldValue = (field: string, value: any, isUserTypingOrShouldValidate?: any, fieldPath?: string) => {
        // only 'categories' field is handled here (same as before)
        if (field !== 'categories') {
            // jeśli kiedyś MetadataForm wywoła z filesToUpload/filesToDelete: zastosuj bezpośrednio setFormValues lub zignoruj
            setFormValues((prev: FormValues) => ({ ...prev, [field]: value } as any), { shouldDebounce: false });
            return;
        }

        const isUserTyping = Boolean(isUserTypingOrShouldValidate);
        if (isUserTyping && fieldPath) {
            setFormValues((prev: FormValues) => ({ ...prev, categories: value }), {
                shouldDebounce: true,
                fieldKey: fieldPath,
                debounceMs: 800,
            });
        } else {
            setFormValues((prev: FormValues) => ({ ...prev, categories: value }), { shouldDebounce: false });
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const anyFilled = formValues.categories.some((c) => (c.value ?? '').trim().length > 0);

        if (!anyFilled) {
            setErrors({ categories: 'Przynajmniej jedno pole musi być wypełnione.' });
            setTouched({ categories: true });
            return;
        }

        setIsSubmitting(true);

        try {
            let resData: any;
            if (artworkId) {
                // editArtwork(artworkId, collectionId, categories, filesToUpload, filesToDelete, jwtToken)
                resData = await editArtwork(
                    artworkId,
                    collectionId!,
                    formValues.categories,
                    filesToUpload,
                    filesToDelete,
                    jwtToken!
                );
            } else {
                // createArtwork(collectionId, categories, filesToUpload, jwtToken)
                resData = await createArtwork(collectionId!, formValues.categories, filesToUpload, jwtToken!);
            }

            // handle file errors returned by API — normalize to our local FileErrorCause
            if (resData?.failedUploadsCount > 0 || resData?.failedDeletesCount > 0) {
                const mapUpload = (resData.failedUploadsCauses || []).map((f: any) => ({
                    filename: f?.filename ?? String(f),
                    cause: normalizeCause(f?.cause ?? f?.reason ?? f?.error),
                }));
                const mapDelete = (resData.failedDeletesCauses || []).map((f: any) => ({
                    filename: f?.filename ?? String(f),
                    cause: normalizeCause(f?.cause ?? f?.reason ?? f?.error),
                }));

                setFailedUploadsCauses(mapUpload);
                setFailedDeletesCauses(mapDelete);
                setShowFileErrorsPopup(true);
            } else {
                queryClient.invalidateQueries(['artworks', collectionId]);
                queryClient.invalidateQueries(['allArtworks', collectionId]);
                navigate(-1);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // keyboard handlers for undo/redo
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            }
            if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
                e.preventDefault();
                handleRedo();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleUndo, handleRedo]);

    if (catsLoading || !isInitialized || !artworksData?.artworks) {
        return <LoadingPage />;
    }

    return (
        <div className="min-h-screen flex flex-col overflow-y-auto">
            <Navbar />
            {showFileErrorsPopup && (
                <FileErrorsPopup
                    onClose={() => {
                        setShowFileErrorsPopup(false);
                        navigate(-1);
                    }}
                    failedUploadsCauses={failedUploadsCauses}
                    failedDeletesCauses={failedDeletesCauses}
                />
            )}
            <div className="container px-8 mt-6 max-w-3xl mx-auto">
                <Navigation />
                <h2 className="text-2xl font-bold mt-2">
                    {artworkId ? 'Edytuj rekord z kolekcji' : 'Dodaj nowy rekord do kolekcji'}
                </h2>
                <h2 className="text-2xl mb-4 break-words max-w-full">{collData?.name}</h2>

                <form onSubmit={handleSubmit}>
                    <MetadataForm
                        metadataTree={formValues.categories}
                        setFieldValue={handleSetFieldValue}
                        suggestionsByCategory={suggestionsByCategory}
                        filesToUpload={filesToUpload}
                        setFilesToUpload={setFilesToUpload}
                        currentFiles={currentFiles}
                        setCurrentFiles={setCurrentFiles}
                        filesToDelete={filesToDelete}
                        setFilesToDelete={setFilesToDelete}
                        categoryPaths={initialCategoryPaths}
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
                                    className={`px-2 py-2 border rounded ${!safeCanUndo ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-blue-600 border-blue-600"}`}
                                    title="Cofnij (Ctrl+Z)"
                                >
                                    <UndoArrow className="w-5 h-5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleRedo}
                                    disabled={!safeCanRedo}
                                    className={`px-2 py-2 border rounded ${!safeCanRedo ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-blue-600 border-blue-600"}`}
                                    title="Przywróć (Ctrl+Y)"
                                >
                                    <RedoArrow className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Cancel/Save buttons on the right */}
                            <div className="flex gap-2">
                                <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">
                                    Anuluj
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">
                                    {artworkId ? 'Zapisz' : 'Utwórz'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="h-20" />
                </form>
            </div>
        </div>
    );
};

// Helper to build tree from dot notation (kept from your branch)
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
