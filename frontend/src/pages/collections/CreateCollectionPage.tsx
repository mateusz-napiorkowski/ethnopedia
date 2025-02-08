import { Formik, Form, Field, ErrorMessage } from "formik";
import { createCollection } from "../../api/collections";
import { useUser } from "../../providers/UserProvider";
import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Navigation from "../../components/Navigation";
import StructureForm from "./StructureForm"
import { Category } from "../../@types/Category"
import { useLocation, useNavigate } from "react-router-dom";


let example_data: Category[] = [
    { name: "", subcategories: [] }
]


const CreateCollectionPage = () => {
    const { jwtToken } = useUser();
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const navigate = useNavigate();

    const [dataToInsert, setDataToInsert] = useState({})
    const location = useLocation();

    // Inicjalizacja danych formularza
    let initialFormData: Category[] = example_data
    if(location.state && location.state.categories) {
        initialFormData = location.state.categories
    }


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
                        <div className="flex items-start rounded-t border-b pb-2">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {/*{(!location.state) ? "Dodaj nową kolekcję" : "Edytuj kolekcję"}*/}
                                Dodaj nową kolekcję
                            </h3>
                        </div>
                        <Formik
                            initialValues={{ name: "", description: "" }}
                            onSubmit={async (values, { setSubmitting }) => {
                                const { name, description } = values;
                                try {
                                    await createCollection(name, description, jwtToken);
                                    setShowErrorMessage(false);
                                    navigate("/"); // Po udanym dodaniu przekieruj do listy kolekcji
                                } catch (error) {
                                    console.error(error);
                                    setShowErrorMessage(true);
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {({ isSubmitting }) => (
                                <Form>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-bold text-gray-700 dark:text-white my-2"
                                    >
                                        Nazwa
                                    </label>
                                    <Field
                                        id="name"
                                        name="name"
                                        type="text"
                                        className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none"
                                    />
                                    <ErrorMessage
                                        name="name"
                                        component="div"
                                        className="text-red-500 text-sm"
                                    />

                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-bold text-gray-700 dark:text-white my-2"
                                    >
                                        Opis
                                    </label>
                                    <Field
                                        as="textarea"
                                        id="description"
                                        name="description"
                                        rows={4}
                                        className="w-full resize-y mb-8 px-4 py-2 border rounded-lg focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                    />
                                    <ErrorMessage
                                        name="description"
                                        component="div"
                                        className="text-red-500 text-sm"
                                    />

                                    {showErrorMessage && (
                                        <p className="text-red-500 text-sm my-2">
                                            Kolekcja o podanej nazwie już istnieje.
                                        </p>
                                    )}

                                    <hr />
                                    <label
                                        htmlFor="categories"
                                        className="block text-sm mt-4 font-bold text-gray-700 dark:text-white my-2"
                                    >
                                        Struktura metadanych w kolekcji
                                    </label>
                                    <div className="flex-grow">
                                        <StructureForm
                                            initialFormData={initialFormData}
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
                                            Utwórz
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

export default CreateCollectionPage;
