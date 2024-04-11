import React, { useState } from "react"
import { useFormik } from "formik"
import { useQuery } from "react-query"
import { getCategories, getAllCategories } from "../../api/categories"
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg"
import { ReactComponent as CloseIcon } from "../../assets/icons/close.svg"
import { ReactComponent as SearchLoopIcon } from "../../assets/icons/searchLoop.svg"
import LoadingPage from "../../pages/LoadingPage"
import { useNavigate, useParams } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"

const initialRule = { id: Date.now(), field: "", operator: "", value: "" }

type Subcategory = {
    name: string
    values?: string[]
}

type Category = {
    category: string
    subcategories?: Subcategory[]
}

interface SearchComponentProps {
    id: string;
}

const AdvancedSearch: React.FC<SearchComponentProps> = ({ id }) => {
    const [rules, setRules] = useState<any[]>([])
    const [showValidationMessage, setShowValidationMessage] = useState<boolean>(false)

    // const { data: categoriesData } = useQuery<Category[], Error>(
    //     ["allCategories"],
    //     () => getCategories(id),
    //     {
    //         enabled: !!id,
    //     },
    // )
    const collection = window.location.href.split("/")[window.location.href.split("/").findIndex((element) => element === "collections") + 1];
    const { data: categoriesData } = useQuery({
        queryKey: ["allCategories"],
        queryFn: () => getAllCategories(collection as string),
        enabled: !!collection,
    })


    const navigate = useNavigate()

    const formik = useFormik({
        initialValues: initialRule,
        onSubmit: (values, { resetForm }) => {
            if (values.field && values.value) {
                setRules([...rules, { ...values, id: Date.now() }])
                resetForm()
                setShowValidationMessage(() => false)
            } else {
                setShowValidationMessage(() => true)
            }
        },
    })

    const deleteRule = (id: string) => {
        setRules(rules.filter((rule) => rule.id !== id))
    }

    const handleSearch = () => {
        navigate(`/artworks/search?${rules.map(rule => `${rule.field}=${rule.value}`).join("&")}`)
        setShowValidationMessage(() => false)
    }

    if (categoriesData === undefined) {
        return <LoadingPage />
    }
    return (
        <div className="my-2">
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <select
                        name="field"
                        onChange={formik.handleChange}
                        value={formik.values.field}
                        className="border p-2"
                    >
                        <option hidden selected>Wybierz kategorię</option>
                        {categoriesData.categories.map((categoryName: string) => (
                            <option value={categoryName} key={uuidv4()}>{categoryName}</option>
                        ))}
                    </select>
                    <input
                        name="value"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.value}
                        className="border p-2 rounded-lg"
                    />

                    <button type="submit" className="border-gray-800 flex items-center bg-gray-800 hover:bg-gray-700 text-white p-2
                            font-semibold">
                        <span className="mr-1">
                            <PlusIcon />
                        </span>
                        Dodaj regułę
                    </button>
                    <button className="flex items-center font-semibold color-button p-2"
                            onClick={handleSearch}
                    >
                        <span className="mr-1">
                            <SearchLoopIcon />
                        </span>
                        Wyszukaj
                    </button>
                    {showValidationMessage && <span className="text-red-500 ml-2">
                        All fields are required to add a rule.
                    </span>}
                </div>
            </form>

            {rules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-2 mt-4">
                    <button onClick={() => deleteRule(rule.id)} className="border-none p-0 mr-2">
                        <CloseIcon />
                    </button>
                    <span className="border border-blue-300 p-2 rounded-lg bg-blue-100 text-blue-500 font-semibold">
                        {rule.field}
                    </span>
                    <span className="border border-blue-300 p-2 rounded-lg bg-blue-100 text-blue-500 font-semibold">
                        {rule.value}
                    </span>
                </div>
            ))}

            <hr className="border-t border-gray-200 my-4 dark:border-gray-600" />
        </div>
    )
}

export default AdvancedSearch