import React from "react"
import { useFormik } from "formik"
import { ReactComponent as SearchLoopIcon } from "../../assets/icons/searchLoop.svg"
import { useNavigate } from "react-router-dom"

interface SearchComponentProps {
    collectionName: string;
}

const QuickSearch: React.FC<SearchComponentProps> = ({collectionName}) => {
    const navigate = useNavigate()

    const handleSearch = (searchText: string) => {
        navigate(`?searchText=${searchText}`)
    }

    const formik = useFormik({
        initialValues: {
            collectionName: collectionName,
            searchText: "",
        },
        onSubmit: (values, { resetForm }) => {
            handleSearch(values.searchText)
            resetForm()
        },
    })

    return <>
        <div className="my-2" data-testid="quickSearchComponent">
            <form onSubmit={formik.handleSubmit} className="flex space-x-2">
                <input
                    type="text"
                    name="searchText"
                    onChange={formik.handleChange}
                    value={formik.values.searchText}
                    className="border border-gray-300 p-2 rounded-lg"
                />
                <button type="submit"
                        className="font-semibold color-button p-2 flex items-center">
                    <span className="mr-1">
                        <SearchLoopIcon />
                    </span>

                    Wyszukaj
                </button>
            </form>
        </div>
        <hr className="border-t border-gray-200 my-4 dark:border-gray-600" />
    </>
}

export default QuickSearch

