import React, { useEffect, useState } from 'react';
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
import MetadataForm from '../../components/artwork/MetadataForm';
import { Metadata } from '../../@types/Metadata';
import FileErrorsPopup from './FileErrorsPopup';

interface FormValues {
    categories: Metadata[],
    filesToUpload: any[],
    filesToDelete: any[]
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

    const [initialCategoryPaths, setInitialCategoryPaths] = useState<string[]>([]);
    const [initialMetadataTree, setInitialMetadataTree] = useState<Metadata[] | undefined>(
        undefined
    );

    const [filesToUpload, setFilesToUpload] = useState([])
    const [currentFiles, setCurrentFiles] = useState([])
    const [filesToDelete, setFilesToDelete] = useState([])
    const [showFileErrorsPopup, setShowFileErrorsPopup] = useState(false)
    const [failedUploadsCauses, setFailedUploadsCauses] = useState([])
    const [failedDeletesCauses, setFailedDeletesCauses] = useState([])

    useEffect(() => {
        if (artworkId) {
            getArtwork(artworkId).then((res) => {
                setInitialMetadataTree(res.artwork.categories);
                setCurrentFiles(res.artwork.files)
            });
        } else if (catData?.categories) {
            setInitialCategoryPaths(catData.categories);
        }
    }, [artworkId, catData]);

    if (catsLoading || (!initialCategoryPaths.length && !artworkId)) {
        return <>
            <div data-testid="loading-page-container">
                <LoadingPage />
            </div>
        </>;
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
                <h2 className="text-2xl mb-4">
                    {collData?.name}
                </h2>

                <Formik<FormValues>
                    initialValues={{categories: initialMetadataTree || [], filesToUpload: filesToUpload, filesToDelete: filesToDelete}}
                    enableReinitialize={initialMetadataTree ? true : false}
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
                        try {
                            const resData = artworkId ? 
                                await editArtwork(artworkId, collectionId as string, values.categories,
                                    filesToUpload, filesToDelete, jwtToken!) :
                                await createArtwork(collectionId, values.categories, filesToUpload, jwtToken!);
                            queryClient.invalidateQueries(['artworks', collectionId]);
                            if(resData.failedUploadsCount > 0 || resData.failedDeletesCount > 0) {
                                setShowFileErrorsPopup(true)
                                setFailedUploadsCauses(resData.failedUploadsCauses)
                                setFailedDeletesCauses(resData.failedDeletesCauses)
                            } else {
                                navigate(-1);
                            }
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
                                filesToUpload={filesToUpload}
                                setFilesToUpload={setFilesToUpload}
                                currentFiles={currentFiles}
                                setCurrentFiles={setCurrentFiles}
                                filesToDelete={filesToDelete}
                                setFilesToDelete={setFilesToDelete}
                                categoryPaths={initialCategoryPaths}
                                setFieldValue={setFieldValue}
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
