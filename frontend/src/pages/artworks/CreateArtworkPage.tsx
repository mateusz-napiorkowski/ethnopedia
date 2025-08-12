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

interface FormValues {
    categories: Metadata[];
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
                'createdAt-desc',
                '',
                {}
            ),
        { enabled: !!collectionId }
    );

    const [initialCategoryPaths, setInitialCategoryPaths] = useState<string[]>([]);
    const [initialMetadataTree, setInitialMetadataTree] = useState<Metadata[] | undefined>(
        undefined
    );
    const [isInitialized, setIsInitialized] = useState(false);

    // Fixed: Use a stable initial state that doesn't change on every render
    const stableInitialState = useMemo(() => ({
        categories: [] as Metadata[],
    }), []);

    const {
        state: formValues,
        setState: setFormValues,
        undo: handleUndo,
        redo: handleRedo,
        canUndo,
        canRedo,
    } = useUndoRedoFormState<FormValues>(stableInitialState);

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

    // Fixed: Initialize the form state only once when data is ready
    useEffect(() => {
        if (isInitialized) return;

        if (artworkId) {
            getArtwork(artworkId).then((res) => {
                setInitialMetadataTree(res.artwork.categories);
                setFormValues({ categories: res.artwork.categories || [] });
                setIsInitialized(true);
            });
        } else if (catData?.categories) {
            setInitialCategoryPaths(catData.categories);
            // Build hierarchy from category paths
            const hierarchy = buildHierarchyFromPaths(catData.categories);
            setInitialMetadataTree(hierarchy);
            setFormValues({ categories: hierarchy });
            setIsInitialized(true);
        }
    }, [artworkId, catData, isInitialized, setFormValues]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});

    const handleSetFieldValue = (field: keyof FormValues, value: any) => {
        setFormValues((prev: FormValues) => ({
            ...prev,
            [field]: value,
        }));
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
        const payload = {
            categories: formValues.categories,
            collectionName: collData?.name,
        };

        try {
            if (artworkId) {
                await editArtwork(payload, artworkId, jwtToken!);
            } else {
                await createArtwork(payload, jwtToken!);
            }

            queryClient.invalidateQueries(['artworks', collectionId]);
            queryClient.invalidateQueries(['allArtworks', collectionId]);

            navigate(-1);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (
        catsLoading ||
        !isInitialized ||
        !artworksData?.artworks
    ) {
        return <LoadingPage />;
    }

    return (
        <div className="min-h-screen flex flex-col overflow-y-auto">
            <Navbar />
            <div className="container px-8 mt-6 max-w-3xl mx-auto">
                <Navigation />
                <h2 className="text-2xl font-bold mt-2">
                    {artworkId ? 'Edytuj rekord z kolekcji' : 'Dodaj nowy rekord do kolekcji'}
                </h2>
                <h2 className="text-2xl mb-4">{collData?.name}</h2>

                <form onSubmit={handleSubmit}>
                    <MetadataForm
                        categories={formValues.categories}
                        setFieldValue={(field, value) => {
                            if (field === 'categories') {
                                handleSetFieldValue(field, value);
                            }
                        }}
                        suggestionsByCategory={suggestionsByCategory}
                    />

                    {typeof errors.categories === 'string' && touched.categories && (
                        <p className="mt-2 text-red-500">{errors.categories}</p>
                    )}

                    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-500 py-3 px-4 flex justify-end gap-2 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] z-50">
                        <div className="max-w-3xl w-full mx-auto gap-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleUndo}
                                disabled={!canUndo}
                                className={`px-2 py-2 border rounded ${
                                    !canUndo
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
                                disabled={!canRedo}
                                className={`px-2 py-2 border rounded ${
                                    !canRedo
                                        ? "text-gray-400 border-gray-300 cursor-not-allowed"
                                        : "text-blue-600 border-blue-600"
                                }`}
                                title="Przywróć (Ctrl+Y)"
                            >
                                <RedoArrow className="w-5 h-5"/>
                            </button>

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