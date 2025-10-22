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
        canRedo,
        initializeState
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
                    errors.categories![currentPath] = "Nazwa nie może zawierać znaku: .";
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

    // Handle name changes with debouncing for typing
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setFormValues({ ...formValues, name: newValue }, {
            shouldDebounce: true,
            fieldKey: 'name',
            debounceMs: 500
        });

        // Only clear name error if it's not a required field error, or if field is now valid
        if (formErrors.name) {
            if (formErrors.name !== "Nazwa jest wymagana" || (newValue.trim() && !hasSubmitted)) {
                if (newValue.trim() && !/[.]/.test(newValue)) {
                    setFormErrors({ ...formErrors, name: undefined });
                }
            }
            // Clear required field error only after submit if field becomes valid
            if (formErrors.name === "Nazwa jest wymagana" && hasSubmitted && newValue.trim()) {
                setFormErrors({ ...formErrors, name: undefined });
            }
        }
    };

    // Handle description changes with debouncing for typing
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setFormValues({ ...formValues, description: newValue }, {
            shouldDebounce: true,
            fieldKey: 'description',
            debounceMs: 500
        });

        // Only clear description error if it's not a required field error or if field is now valid after submit
        if (formErrors.description) {
            if (formErrors.description !== "Opis jest wymagany" || (hasSubmitted && newValue.trim())) {
                if (newValue.trim()) {
                    setFormErrors({ ...formErrors, description: undefined });
                }
            }
        }
    };

    // Function to update category errors with real-time validation
    const updateCategoryErrors = (categories: Category[]) => {
        const currentErrors = formErrors.categories || {};
        const newErrors = validate({ ...formValues, categories }, false); // Don't show required errors here

        const updatedErrors: { [key: string]: string } = {};

        // Keep existing required field errors if we haven't submitted yet
        Object.keys(currentErrors).forEach(key => {
            if (currentErrors[key] === "Nazwa kategorii jest wymagana" && !hasSubmitted) {
                updatedErrors[key] = currentErrors[key];
            }
        });

        // Add new validation errors (forbidden chars, duplicates) - these show immediately
        Object.keys(newErrors.categories || {}).forEach(key => {
            const errorType = newErrors.categories![key];
            if (errorType !== "Nazwa kategorii jest wymagana") {
                // Non-required errors show immediately
                updatedErrors[key] = errorType;
            } else if (hasSubmitted) {
                // Required errors only show after submit
                updatedErrors[key] = errorType;
            }
        });

        // Clear errors for fields that are now valid (only if hasSubmitted for required field errors)
        Object.keys(currentErrors).forEach(key => {
            const path = key.split('-').map(Number);
            let current: any = categories;

            // Navigate to the specific category
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]].subcategories;
            }
            const category = current[path[path.length - 1]];

            if (category && category.name.trim() && !(/[.]/.test(category.name))) {
                // Check if it's not a duplicate
                const allNames = getAllCategoryNames(categories);
                const trimmedName = category.name.trim().toLowerCase();
                const isDuplicate = allNames.filter(name => name === trimmedName).length > 1;

                if (!isDuplicate) {
                    // For required field errors, only clear after submit
                    if (currentErrors[key] === "Nazwa kategorii jest wymagana") {
                        if (hasSubmitted) {
                            delete updatedErrors[key];
                        }
                    } else {
                        // For other errors, clear immediately
                        delete updatedErrors[key];
                    }
                }
            }
        });

        setFormErrors(prev => ({ ...prev, categories: updatedErrors }));
    };

    // Handle category changes - distinguish between structural changes and typing
    const handleSetFieldValue = (field: string, value: any, isStructuralChange: boolean = false) => {
        if (field === 'categories') {
            if (isStructuralChange) {
                setFormValues({ ...formValues, [field]: value }, { shouldDebounce: false });
            } else {
                setFormValues({ ...formValues, [field]: value }, { shouldDebounce: false });
            }
            updateCategoryErrors(value);
        } else {
            setFormValues({ ...formValues, [field]: value }, { shouldDebounce: false });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Set hasSubmitted FIRST, before validation
        setHasSubmitted(true);

        // Then validate with submit validation (which will show required field errors)
        const errors = validate(formValues, true);
        setFormErrors(errors);

        // Check if there are any errors
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

    // Prevent Enter key from submitting form when pressed in input fields
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
            e.preventDefault();
        }
    };

    // Add keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            } else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
                e.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [handleUndo, handleRedo]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-y-auto">
            <Navbar />
            <div className="container px-8 mt-6 max-w-3xl mx-auto">
                <Navigation />
                <h2 className="text-2xl font-bold mt-2">
                    {isEditMode ? "Edytuj kolekcję" : "Dodaj nową kolekcję"}
                </h2>

                <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                    <label className="block text-sm text-gray-700 dark:text-white my-2 mt-4">Nazwa</label>
                    <input
                        type="text"
                        aria-label="name"
                        value={formValues.name}
                        onChange={handleNameChange}
                        maxLength={100}
                        className={`w-full px-4 py-2 border rounded-lg text-gray-700 dark:text-white dark:bg-gray-700 focus:outline-none ${
                            formErrors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                        }`}
                    />
                    {formErrors.name && (
                        <div className="text-red-500 text-sm mt-1">{formErrors.name}</div>
                    )}

                    <label className="block text-sm text-gray-700 dark:text-white my-2 mt-4">Opis</label>
                    <textarea
                        aria-label="description"
                        value={formValues.description}
                        onChange={handleDescriptionChange}
                        maxLength={1000}
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
                        setFieldValue={handleSetFieldValue}
                        isEditMode={isEditMode}
                        categoryErrors={formErrors.categories || {}}
                        hasSubmitted={hasSubmitted}
                        // Pass the undo/redo system for structural changes
                        undoRedoSystem={{
                            setState: setFormValues,
                            currentState: formValues
                        }}
                    />

                    {submitError && (
                        <div className="text-red-500 text-sm my-2">{submitError}</div>
                    )}

                    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-500 py-3 px-4 flex justify-between items-center shadow-[0_-2px_4px_rgba(0,0,0,0.05)] z-50">
                        <div className="max-w-3xl w-full mx-auto flex justify-between items-center">
                            {/* Undo/Redo buttons on the left */}
                            <div className="flex gap-2">
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
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    {isEditMode ? "Zapisz zmiany" : "Utwórz"}
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

export default CreateCollectionPage;