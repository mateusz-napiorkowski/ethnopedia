import { Formik, Form, Field, ErrorMessage } from "formik";
import { createCollection, updateCollection } from "../../api/collections";
import { useUser } from "../../providers/UserProvider";
import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Navigation from "../../components/Navigation";
import StructureForm from "../../components/collections/StructureForm";
import { Category } from "../../@types/Category";
import { useLocation, useNavigate } from "react-router-dom";

let initial_structure: Category[] = [{ name: "", subcategories: [] }];

interface FormValues {
    name: string;
    description: string;
    categories: Category[];
}

interface FormErrors {
    name?: string;
    description?: string;
    categories?: string;
}

const CreateCollectionPage = () => {
    const { jwtToken } = useUser();
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Sprawdzenie, czy mamy tryb edycji
    const isEditMode = location.state && location.state.mode === "edit";

    const collectionId = location.state && location.state.collectionId;

    // Pobranie wartości początkowych dla nazwy i opisu, jeśli edycja
    const initialName = isEditMode && location.state.name ? location.state.name : "";
    const initialDescription =
        isEditMode && location.state.description ? location.state.description : "";

    // Ustawiamy inicjalne dane formularza – w trybie edycji pobieramy też strukturę kategorii
    let initialFormData: Category[] = initial_structure;
    if (isEditMode && location.state.categories) {
        initialFormData = location.state.categories;
    } else if (location.state && location.state.categories) {
        initialFormData = location.state.categories;
    }

    // Funkcja do usunięcia flagi isNew z kategorii (rekurencyjnie)
    const removeIsNewFlag = (categories: Category[]): Category[] => {
        return categories.map((category) => {
            const { isNew, subcategories, ...rest } = category;
            return {
                ...rest,
                subcategories: subcategories ? removeIsNewFlag(subcategories) : [],
            };
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Navbar />
            <div className="container mx-auto px-24 sm:px-32 md:px-40 lg:px-48 mt-4 max-w-screen-lg">
                <Navigation />
                <div className="mt-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-600 p-8">
                        <div className="flex items-start rounded-t border-b pb-2">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isEditMode ? "Edytuj kolekcję" : "Dodaj nową kolekcję"}
                            </h3>
                        </div>
                        <Formik
                            initialValues={{
                                name: initialName,
                                description: initialDescription,
                                categories: initialFormData,
                            }}
                            validate={(values: FormValues): FormErrors => {
                                const errors: FormErrors = {};
                                if (!values.name) {
                                    errors.name = "Nazwa jest wymagana";
                                }
                                if (!values.description) {
                                    errors.description = "Opis jest wymagany";
                                }
                                if (!values.categories || values.categories.length === 0) {
                                    errors.categories = "Struktura metadanych jest wymagana";
                                }
                                return errors;
                            }}
                            onSubmit={async (values, { setSubmitting, setErrors, setStatus }) => {
                                const { name, description, categories } = values;
                                try {
                                    if (isEditMode) {
                                        // Usuń flagi isNew przed aktualizacją
                                        const updatedCategories = removeIsNewFlag(categories);
                                        console.log("Data to update: id:", collectionId, "name:", name, description, updatedCategories);
                                        await updateCollection(
                                            collectionId,
                                            name,
                                            description,
                                            updatedCategories,
                                            jwtToken
                                        );
                                    } else {
                                        await createCollection(name, description, categories, jwtToken);
                                    }
                                    setShowErrorMessage(false);
                                    navigate("/"); // Po udanym zapisie przekieruj użytkownika
                                } catch (error: any) {
                                    console.error(error);
                                    setShowErrorMessage(true);
                                    // Obsługa błędów po stronie backendu
                                    if (error.response && error.response.data && error.response.data.error) {
                                        const serverError = error.response.data.error;
                                        if (serverError === "Collection with provided name already exists") {
                                            setErrors({ name: serverError });
                                        } else if (serverError === "Incorrect request body provided") {
                                            setStatus({ generalError: "Niepoprawne dane formularza" });
                                        } else {
                                            setStatus({ generalError: "Błąd serwera" });
                                        }
                                    } else {
                                        setStatus({ generalError: "Nieoczekiwany błąd" });
                                    }
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {({ isSubmitting, setFieldValue, status }) => (
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

                                    <hr />
                                    <label className="block text-sm mt-4 font-bold text-gray-700 dark:text-white my-2">
                                        Struktura metadanych w kolekcji
                                    </label>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Podaj strukturę metadanych, które chcesz przechowywać w tej kolekcji...
                                    </p>
                                    <div className="flex-grow">
                                        <StructureForm
                                            initialFormData={initialFormData}
                                            setFieldValue={setFieldValue}
                                            isEditMode={isEditMode}
                                        />
                                    </div>

                                    {showErrorMessage && status && status.generalError && (
                                        <p className="text-red-500 text-sm my-2">{status.generalError}</p>
                                    )}

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
                                            {isEditMode ? "Zapisz zmiany" : "Utwórz"}
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
