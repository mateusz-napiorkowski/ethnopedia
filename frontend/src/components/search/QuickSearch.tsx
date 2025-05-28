import React, { useState } from "react"
import { useFormik } from "formik"
import { ReactComponent as SearchLoopIcon } from "../../assets/icons/searchLoop.svg"
import { useNavigate } from "react-router-dom"
import DOMPurify from 'dompurify'

interface QuickSearchProps {
    collectionIds: string | string[];
    mode: 'global' | 'local';
}

const QuickSearch: React.FC<QuickSearchProps> = ({ collectionIds, mode }) => {
    const navigate = useNavigate()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleSearch = (searchText: string) => {
        const query = searchText ? `?searchText=${encodeURIComponent(searchText)}` : "";

        if (mode === "global") {
            navigate(`/global-search${query}`);
        } else {
            navigate(`/collections/${collectionIds}/artworks${query}`);
        }
    };

    const formik = useFormik({
        initialValues: {
            searchText: "",
        },
        onSubmit: (values, { resetForm }) => {
            const trimmedText = values.searchText.trim();
            const sanitizedText = DOMPurify.sanitize(trimmedText);

            if (sanitizedText !== trimmedText) {
                setErrorMessage("Wartość zawiera niedozwolone znaki, np. <, >, lub inne specjalne znaki.");
                return;
            }

            setErrorMessage(null);
            handleSearch(sanitizedText);
            resetForm();
        },
    });

    return (
        <>
            <div className="my-2" data-testid="quickSearchComponent">
                <form onSubmit={formik.handleSubmit} className="flex space-x-2">
                    <input
                        type="text"
                        maxLength={100}
                        name="searchText"
                        onChange={formik.handleChange}
                        value={formik.values.searchText}
                        className="border border-gray-300 p-2 rounded-lg"
                    />
                    <button type="submit" className="font-semibold color-button p-2 flex items-center">
                        <span className="mr-1">
                            <SearchLoopIcon />
                        </span>
                        Wyszukaj
                    </button>
                </form>
                {errorMessage && (
                    <p className="w-full text-red-500 text-sm mt-2 ml-1">
                        {errorMessage}
                    </p>
                )}
            </div>
            <hr className="border-t border-gray-200 my-4 dark:border-gray-600" />
        </>
    )
}

export default QuickSearch
