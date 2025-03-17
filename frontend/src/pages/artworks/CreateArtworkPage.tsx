import React, {useEffect, useState} from "react";
import {useQuery, useQueryClient} from "react-query";
import { Form, Formik } from "formik";
import {useLocation, useNavigate} from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import { useUser } from "../../providers/UserProvider";
import Navigation from "../../components/Navigation";
import { Metadata } from '../../@types/Metadata';
import {createArtwork, editArtwork, getArtwork} from "../../api/artworks";
import MetadataForm from "../../components/artwork/MetadataForm";
// import {getCollection} from "../../api/collections";
import LoadingPage from "../LoadingPage";
import {getAllCategories} from "../../api/categories";

let example_data: Metadata[] = [
    { name: "Tytuł", value: "", subcategories: [] },
    { name: "Artyści", value: "", subcategories: [] },
    { name: "Rok", value: "", subcategories: [] }
];


const convertToJson = (data: string[]): Metadata[] => {
    const result: Metadata[] = [];
    const map: { [key: string]: Metadata } = {};

    data.forEach((item) => {
        const parts = item.split('.');
        let currentLevel = result;

        parts.forEach((part) => {
            const existingCategory = map[part];
            if (existingCategory) {
                currentLevel = existingCategory.subcategories!;
            } else {
                const newCategory: Metadata = { name: part, value: "", subcategories: [] };
                currentLevel.push(newCategory);
                map[part] = newCategory;
                currentLevel = newCategory.subcategories!;
            }
        });
    });

    return result;
};


const CreateArtworkPage: React.FC = () => {
    const location = useLocation();
    // const { collectionId } = useParams<{ collectionId: string }>();
    const queryClient = useQueryClient();
    const { jwtToken } = useUser();
    const navigate = useNavigate();
    const [dataToInsert, setDataToInsert] = useState({});  // Przechowywanie danych do wysłania
    const [initialFormData, setInitialFormData] = useState<Metadata[]>(example_data);  // Stan dla początkowych danych formularza

    // TODO skąd biore collectionId?
    // // Pobranie danych kolekcji na podstawie collectionId
    // const { data: collectionData } = useQuery(
    //     ['collection', collectionId],
    //     () => getCollection(collectionId!),
    //     { enabled: !!collectionId }
    // );
    // const collectionName = collectionData?.name || "Nieznana kolekcja";

    // Pobranie nazwy kolekcji z URL
    const pathParts = window.location.pathname.split("/");
    const collectionName = decodeURIComponent(pathParts[pathParts.indexOf("collections") + 1] || "Nieznana kolekcja");

    // Pobierz kategorie
    const { data: categoriesData, isLoading, error } = useQuery({
        queryKey: ["allCategories", collectionName],
        queryFn: () => getAllCategories(collectionName),
        enabled: !!collectionName
    });

    useEffect(() => {
        if (!location.state && categoriesData?.categories) {
            console.log("create");
            setInitialFormData(convertToJson(categoriesData.categories));  // Ustawienie danych po załadowaniu
        } else if (location.state) {
            console.log("edit");
            const artworkID = window.location.href.split("/")[window.location.href.split("/").length - 2];
            getArtwork(artworkID).then((artworkData) => {
                if (artworkData?.artwork?.categories) {
                    setInitialFormData(artworkData.artwork.categories);  // Ustawienie danych dla edycji
                }
            }).catch((error) => {
                console.error("Error fetching artwork data:", error);
            });
        }
    }, [categoriesData, location.state]);


    if (isLoading) {
        return <LoadingPage />;
    }
    if (error) {
        return <div>Error loading categories</div>;
    }


    const handleSubmit = async (formDataList: Metadata[]) => {
        console.log("Submit");
        // Przekazanie danych formularza do funkcji createArtwork
        try {
            if (!location.state) {
                // dodawanie rekordu
                await createArtwork(dataToInsert, jwtToken);
            } else {
                // edycja rekordu
                const artworkID = window.location.href.split("/")[window.location.href.split("/").length - 2];
                await editArtwork(dataToInsert, artworkID, jwtToken);
            }
            queryClient.invalidateQueries(["collection"]);
            navigate(-1); // Powrót do poprzedniej strony
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Pasek nawigacyjny aplikacji */}
            <Navbar />

            {/* Główny kontener treści */}
            <div className="container mx-auto px-24 sm:px-32 md:px-40 lg:px-48 mt-4 max-w-screen-lg">
                {/* Nawigacja */}
                <Navigation />

                {/* Formularz */}
                <div className="mt-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-600 p-8">
                        <div className="flex-row items-start rounded-t border-b pb-2">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {/*{location.state ? "Edytuj rekord z kolekcji" : `Dodaj nowy rekord do kolekcji: ${collectionName}`}*/}
                                {location.state ? "Edytuj rekord z kolekcji" : `Dodaj nowy rekord do kolekcji:`}
                            </h3>
                            <h4 className="text-2xl text-gray-900 dark:text-white">
                                {collectionName}
                            </h4>
                        </div>
                        <Formik
                            initialValues={{formDataList: initialFormData}}
                            onSubmit={(values, {setSubmitting}) => {
                                handleSubmit(values.formDataList);
                                setSubmitting(false);
                            }}
                        >
                            {({ isSubmitting }) => (
                                <Form>
                                    <div className="flex-grow">
                                        <MetadataForm
                                            initialFormData={initialFormData}
                                            collectionName={collectionName}
                                            setDataToInsert={(dataToInsert: any) => setDataToInsert(dataToInsert)} />
                                    </div>
                                    <div className="flex justify-end mt-6">
                                        <button
                                            type="button"
                                            onClick={() => navigate(-1)}
                                            className="px-4 py-2 mr-2 color-button"
                                        >
                                            Anuluj
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2 color-button"
                                        >
                                            {location.state ? "Edytuj" : "Utwórz"}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateArtworkPage;
