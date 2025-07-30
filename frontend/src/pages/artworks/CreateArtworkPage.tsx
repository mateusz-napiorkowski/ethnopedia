import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Formik, Form, FormikHelpers } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Navigation from '../../components/Navigation';
import LoadingPage from '../LoadingPage';
import { useUser } from '../../providers/UserProvider';
import { getAllCategories } from '../../api/categories';
import { getCollection } from '../../api/collections';
import { getArtwork, createArtwork, editArtwork } from '../../api/artworks';
import { getArtworksForPage } from '../../api/artworks'; // Import for getting all artworks
import MetadataForm from '../../components/artwork/MetadataForm';
import { Metadata } from '../../@types/Metadata';

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

    // Pobranie kategorii (w formacie dot.notation) lub metadanych rekordu (w trybie edycji)
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



    // Fetch all artworks for suggestions
    const { data: artworksData } = useQuery(
        ['allArtworks', collectionId],
        () => getArtworksForPage(
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

    // Extract suggestions from existing artworks
    const suggestionsByCategory = useMemo(() => {
        const suggestions: Record<string, Set<string>> = {};

        // Function to extract values from artwork categories
        const extractValues = (categories: Metadata[], prefix: string = '') => {
            categories.forEach((category) => {
                const categoryPath = prefix ? `${prefix}.${category.name}` : category.name;

                if (category.value && category.value.trim()) {
                    if (!suggestions[categoryPath]) {
                        suggestions[categoryPath] = new Set();
                    }
                    suggestions[categoryPath].add(category.value.trim());
                }

                if (category.subcategories && category.subcategories.length > 0) {
                    extractValues(category.subcategories, categoryPath);
                }
            });
        };

        // Extract from all artworks
        artworksData.artworks.forEach((artwork: any, index: number) => {
            if (artwork.categories) {
                extractValues(artwork.categories);
            }
        });

        // Convert Sets to Arrays and sort
        const result: Record<string, string[]> = {};
        Object.keys(suggestions).forEach(key => {
            result[key] = Array.from(suggestions[key]).sort();
        });

        return result;
    }, [artworksData]);

    useEffect(() => {
        if (artworkId) {
            getArtwork(artworkId).then((res) => {
                setInitialMetadataTree(res.artwork.categories);
            });
        } else if (catData?.categories) {
            setInitialCategoryPaths(catData.categories);
        }
    }, [artworkId, catData]);

    if (catsLoading || (!initialCategoryPaths.length && !artworkId)) {
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
                <h2 className="text-2xl mb-4">
                    {collData?.name}
                </h2>

                <Formik<FormValues>
                    initialValues={{categories: initialMetadataTree || []}}
                    enableReinitialize
                    validate={(values) => {
                        const errs: Partial<Record<keyof FormValues, string>> = {};
                        const anyFilled = values.categories.some(
                            (c) => (c.value ?? '').trim().length > 0
                        );
                        if (!anyFilled) {
                            errs.categories = 'Przynajmniej jedno pole musi być wypełnione.';
                        }
                        return errs;
                    }}
                    onSubmit={async (
                        values,
                        {setSubmitting}: FormikHelpers<FormValues>
                    ) => {
                        const payload = {
                            categories: values.categories,
                            collectionName: collData?.name,
                        };
                        try {
                            if (artworkId) {
                                await editArtwork(payload, artworkId, jwtToken!);
                            } else {
                                await createArtwork(payload, jwtToken!);
                            }
                            queryClient.invalidateQueries(['artworks', collectionId]);
                            queryClient.invalidateQueries(['allArtworks', collectionId]); // Invalidate suggestions cache
                            navigate(-1);
                        } catch (e) {
                            console.error(e);
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({setFieldValue, isSubmitting, errors, touched}) => (
                        <Form>
                            <MetadataForm
                                initialMetadataTree={initialMetadataTree}
                                categoryPaths={initialCategoryPaths}
                                setFieldValue={setFieldValue}
                                suggestionsByCategory={suggestionsByCategory}
                            />
                            {/* globalny komunikat jeśli walidacja nie przeszła */}
                            {typeof errors.categories === 'string' && touched.categories && (
                                <p className="mt-2 text-red-500">{errors.categories}</p>
                            )}
                            {/* sticky bottom bar */}
                            <div
                                className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-500 py-3 px-4 flex justify-end gap-2 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] z-50">

                                <div className="max-w-3xl w-full mx-auto flex justify-end">
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
                                        className="px-4 py-2 bg-blue-600 text-white rounded ml-2"
                                    >
                                        {artworkId ? 'Zapisz' : 'Utwórz'}
                                    </button>
                                </div>
                            </div>

                            <div className="h-20"/>
                            {/* Przestrzeń pod sticky barem */}

                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default CreateArtworkPage;