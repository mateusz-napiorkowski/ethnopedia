import React, {useEffect, useState} from "react";
import Navbar from "../../components/navbar/Navbar";
import Navigation from "../../components/Navigation";
import StructureForm from "../../components/collections/StructureForm";
import { createCollection, updateCollection } from "../../api/collections";
import { useUser } from "../../providers/UserProvider";
import { useLocation, useNavigate } from "react-router-dom";
import { Category } from "../../@types/Category";
import { MdUndo as UndoArrow, MdRedo as RedoArrow } from "react-icons/md";
import { useUndoRedoFormState } from "../../hooks/useUndoRedoFormState";


interface FormValues {
    name: string;
    description: string;
    categories: Category[];
}

interface FormErrors {
    name?: string;
    description?: string;
    categories?: { [key: string]: string };
}

const CreateCollectionPage = () => {
    const { jwtToken } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const isEditMode = location.state?.mode === "edit";
    const collectionId = location.state?.collectionId;

    const {
        state: formValues,
        setState: setFormValues,
        undo: handleUndo,
        redo: handleRedo,
        canUndo,
        canRedo
    } = useUndoRedoFormState<FormValues>({
        name: location.state?.name || "",
        description: location.state?.description || "",
        categories: location.state?.categories || [{ name: "", subcategories: [] }],
    });


    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const removeIsNewFlag = (categories: Category[]): Category[] => {
        return categories.map(({ isNew, subcategories, ...rest }) => ({
            ...rest,
            subcategories: subcategories ? removeIsNewFlag(subcategories) : [],
        }));
    };

    const getAllCategoryNames = (categories: Category[]): string[] => {
        const names: string[] = [];
        const traverse = (cats: Category[]) => {
            cats.forEach(cat => {
                if (cat.name.trim()) {
                    names.push(cat.name.trim().toLowerCase());
                }
                if (cat.subcategories) {
                    traverse(cat.subcategories);
                }
            });
        };
        traverse(categories);
        return names;
    };

    const findDuplicateCategories = (categories: Category[]): { [key: string]: string } => {
        const errors: { [key: string]: string } = {};
        const allNames = getAllCategoryNames(categories);

        const checkDuplicates = (cats: Category[], path: string = "") => {
            cats.forEach((cat, index) => {
                const currentPath = path ? `${path}-${index}` : `${index}`;
                const trimmedName = cat.name.trim().toLowerCase();

                if (trimmedName && allNames.filter(name => name === trimmedName).length > 1) {
                    errors[currentPath] = "Nazwa kategorii już istnieje";
                }

                if (cat.subcategories) {
                    checkDuplicates(cat.subcategories, currentPath);
                }
            });
        };

        checkDuplicates(categories);
        return errors;
    };

    const validate = (values: FormValues, isSubmitValidation: boolean = false): FormErrors => {
        const errors: FormErrors = { categories: {} };
        const forbiddenChars = /[.]/;

        // Name validation
        if (!values.name.trim()) {
            if (isSubmitValidation) {
                errors.name = "Nazwa jest wymagana";
            }
        } else if (forbiddenChars.test(values.name)) {
            errors.name = "Nazwa zawiera zakazane znaki";
        }

        // Description validation
        if (!values.description.trim() && isSubmitValidation) {
            errors.description = "Opis jest wymagany";
        }

        // Category validation
        const validateCategories = (cats: Category[], pathPrefix: string = "") => {
            cats.forEach((cat, index) => {
                const currentPath = pathPrefix ? `${pathPrefix}-${index}` : `${index}`;

                // Empty name validation - only on submit
                if (!cat.name.trim() && isSubmitValidation) {
                    errors.categories![currentPath] = "Nazwa kategorii jest wymagana";
                }
                // Forbidden characters - always validate
                else if (forbiddenChars.test(cat.name)) {
                    errors.categories![currentPath] = "Nazwa zawiera zakazane znaki";
                }

                if (cat.subcategories) {
                    validateCategories(cat.subcategories, currentPath);
                }
            });
        };

        validateCategories(values.categories);

        // Check for duplicate category names - always validate
        const duplicateErrors = findDuplicateCategories(values.categories);
        errors.categories = { ...errors.categories, ...duplicateErrors };

        return errors;
    };

    // Real-time validation for name field
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setFormValues({ ...formValues, name: newValue });

        // Clear existing name error if field is now valid
        if (formErrors.name && newValue.trim() && !/[.]/.test(newValue)) {
            setFormErrors({ ...formErrors, name: undefined });
        }

        // Show error for forbidden characters immediately
        if (/[.]/.test(newValue)) {
            setFormErrors({ ...formErrors, name: "Nazwa zawiera zakazane znaki" });
        }
    };

    // Real-time validation for description field
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setFormValues({ ...formValues, description: newValue });

        // Clear description error if field is now valid
        if (formErrors.description && newValue.trim()) {
            setFormErrors({ ...formErrors, description: undefined });
        }
    };

    // Function to update category errors with real-time validation
    const updateCategoryErrors = (categories: Category[]) => {
        const currentErrors = formErrors.categories || {};
        const newErrors = validate({ ...formValues, categories }, false);

        // Only update errors, don't clear required field errors unless hasSubmitted is true
        const updatedErrors: { [key: string]: string } = {};

        // Keep existing required field errors if we haven't submitted yet
        Object.keys(currentErrors).forEach(key => {
            if (currentErrors[key] === "Nazwa kategorii jest wymagana" && !hasSubmitted) {
                updatedErrors[key] = currentErrors[key];
            }
        });

        // Add new validation errors (forbidden chars, duplicates)
        Object.keys(newErrors.categories || {}).forEach(key => {
            if (newErrors.categories![key] !== "Nazwa kategorii jest wymagana" || hasSubmitted) {
                updatedErrors[key] = newErrors.categories![key];
            }
        });

        // Clear errors for fields that are now valid
        if (hasSubmitted) {
            Object.keys(currentErrors).forEach(key => {
                const path = key.split('-').map(Number);
                let current: any = categories;

                // Navigate to the specific category
                for (let i = 0; i < path.length - 1; i++) {
                    current = current[path[i]].subcategories;
                }
                const category = current[path[path.length - 1]];

                // If field is now valid, remove the error
                if (category && category.name.trim() && !(/[.]/.test(category.name))) {
                    // Check if it's not a duplicate
                    const allNames = getAllCategoryNames(categories);
                    const trimmedName = category.name.trim().toLowerCase();
                    const isDuplicate = allNames.filter(name => name === trimmedName).length > 1;

                    if (!isDuplicate) {
                        delete updatedErrors[key];
                    }
                }
            });
        }

        setFormErrors(prev => ({ ...prev, categories: updatedErrors }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setHasSubmitted(true);
        const errors = validate(formValues, true);
        setFormErrors(errors);

        if (Object.keys(errors).some(key =>
            key === 'name' && errors.name ||
            key === 'description' && errors.description ||
            key === 'categories' && errors.categories && Object.keys(errors.categories).length > 0
        )) {
            return;
        }

        try {
            if (isEditMode) {
                const cleaned = removeIsNewFlag(formValues.categories);
                console.log("Kategorie do zapisania:", JSON.stringify(cleaned, null, 2));
                await updateCollection(collectionId, formValues.name, formValues.description, cleaned, jwtToken);
                navigate(`/collections/${collectionId}/artworks`);
            } else {
                await createCollection(formValues.name, formValues.description, formValues.categories, jwtToken);
                navigate("/");
            }

        } catch (error: any) {
            if (error.response?.data?.error === "Collection with provided name already exists") {
                setFormErrors({ name: "Kolekcja o tej nazwie już istnieje" });
            } else {
                setSubmitError("Wystąpił błąd. Spróbuj ponownie.");
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Navbar />
            <div className="container mx-auto px-24 sm:px-32 md:px-40 lg:px-48 mt-4 max-w-screen-lg">
                <Navigation />
                <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-600 p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {isEditMode ? "Edytuj kolekcję" : "Dodaj nową kolekcję"}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <label className="block text-sm text-gray-700 dark:text-white my-2">Nazwa</label>
                        <input
                            type="text"
                            value={formValues.name}
                            onChange={handleNameChange}
                            className={`w-full px-4 py-2 border rounded-lg text-gray-700 dark:text-white dark:bg-gray-700 focus:outline-none ${
                                formErrors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                            }`}
                        />
                        {formErrors.name && (
                            <div className="text-red-500 text-sm mt-1">{formErrors.name}</div>
                        )}

                        <label className="block text-sm text-gray-700 dark:text-white my-2 mt-4">Opis</label>
                        <textarea
                            value={formValues.description}
                            onChange={handleDescriptionChange}
                            className={`w-full px-4 py-2 border rounded-lg resize-y focus:outline-none dark:bg-gray-700 dark:text-white ${
                                formErrors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                            }`}
                            rows={4}
                        />
                        {formErrors.description && (
                            <div className="text-red-500 text-sm mt-1">{formErrors.description}</div>
                        )}

                        <hr className="mt-6"/>
                        <label className="block text-sm font-bold text-gray-700 dark:text-white my-2 mt-4">
                            Struktura metadanych w kolekcji
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Zbuduj hierarchię kategorii i podkategorii dla tej kolekcji.
                            Dodawaj i usuwaj elementy za pomocą przycisków po prawej stronie pola.
                        </p>

                        <StructureForm
                            initialFormData={formValues.categories}
                            setFieldValue={(field, value) => {
                                setFormValues({
                                    ...formValues,
                                    [field]: value,
                                });
                                if (field === 'categories') {
                                    updateCategoryErrors(value);
                                }
                            }}
                            isEditMode={isEditMode}
                            categoryErrors={formErrors.categories || {}}
                            hasSubmitted={hasSubmitted}
                        />

                        {submitError && (
                            <div className="text-red-500 text-sm my-2">{submitError}</div>
                        )}

                        <div className="flex justify-end mt-6 gap-4">
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
                                className="px-4 py-2"
                            >
                                Anuluj
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 color-button"
                            >
                                {isEditMode ? "Zapisz zmiany" : "Utwórz"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCollectionPage;