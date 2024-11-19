import React, { useEffect, useState } from "react"
import { useFormik } from "formik"
import { useQuery } from "react-query"
import { getAllCategories } from "../../api/categories"
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg"
import { ReactComponent as CloseIcon } from "../../assets/icons/close.svg"
import { ReactComponent as SearchLoopIcon } from "../../assets/icons/searchLoop.svg"
import LoadingPage from "../../pages/LoadingPage"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"

const initialRule = { id: Date.now(), field: "", operator: "", value: "" }

// type Subcategory = {
//     name: string
//     values?: string[]
// }

// type Category = {
//     category: string
//     subcategories?: Subcategory[]
// }

interface SearchComponentProps {
    id: string;
}

const AdvancedSearch: React.FC<SearchComponentProps> = ({ id }) => {
    const [rules, setRules] = useState<any[]>([])
    const [textInputCategory, setTextInputCategory] = useState((""))
    const [textInputValue, setTextInputValue] = useState((""))

    const location = useLocation()
    useEffect(() => {
        if(location.state) {  
            if(location.state.newestCategory && location.state.newestValue) {
                setRules([...location.state.rules, { field: location.state.newestCategory, value: location.state.newestValue, id: Date.now() }])
            } else {
                setRules(location.state.rules)
            }
        }
      }, [location]);
    
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
            let lastQueryParamStr = ""
            if(textInputCategory && textInputValue) {
                lastQueryParamStr = `&${textInputCategory}=${textInputValue}`
            }
            navigate(`/collections/${collection}/artworks?${rules.map(rule => `${rule.field}=${rule.value}`).join("&")}${lastQueryParamStr}`, {state: {rules: rules, newestCategory: textInputCategory, newestValue: textInputValue}})
        },
    })

    const deleteRule = (id: string) => {
        setRules(rules.filter((rule) => rule.id !== id))
    }

    const handletextInputCategoryChange = (e: any) => {
        setTextInputCategory(e.target.value);
    }

    const handletextInputValueChange = (e: any) => {
        setTextInputValue(e.target.value);
    }

    const handleAddRule = () => {
        if(textInputCategory !== "" && textInputValue !== "") {
            setRules([...rules, { field: textInputCategory, value: textInputValue, id: Date.now() }])
            setTextInputCategory("")
            setTextInputValue("")
        }
    }
    
    // const handleSearch = () => {
    //     navigate(`/collections/${collection}/artworks?${rules.map(rule => `${rule.field}=${rule.value}`).join("&")}`, {state: {rules: rules}})
    // }

    if (categoriesData === undefined) {
        return <div data-testid="loading-advanced-search-container">
            <LoadingPage />
        </div>
    }
    return (
        <div className="my-2" data-testid="advancedSearchComponent">
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <select
                        name="field"
                        onChange={handletextInputCategoryChange}
                        value={textInputCategory}
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
                        onChange={handletextInputValueChange}
                        value={textInputValue}
                        className="border p-2 rounded-lg"
                    />

                    <button type="button" className="border-gray-800 flex items-center bg-gray-800 hover:bg-gray-700 text-white p-2
                            font-semibold" onClick={handleAddRule}>
                        <span className="mr-1">
                            <PlusIcon />
                        </span>
                        Dodaj regułę
                    </button>
                    <button type="submit" className="flex items-center font-semibold color-button p-2">
                        <span className="mr-1">
                            <SearchLoopIcon />
                        </span>
                        Wyszukaj
                    </button>
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