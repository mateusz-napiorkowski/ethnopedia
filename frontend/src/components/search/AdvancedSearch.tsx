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

interface SearchComponentProps {
    collectionName: string;
}

interface Rule {
    field: string,
    value: string,
    id: string
}

const AdvancedSearch: React.FC<SearchComponentProps> = ({ collectionName }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [rules, setRules] = useState<Rule[]>([])
    const [currentRuleCategory, setCurrentRuleCategory] = useState((""))
    const [currentRuleValue, setCurrentRuleValue] = useState((""))
    const [showErrorMessage, setShowErrorMessage] = useState(false)

    useEffect(() => {
        if(location.state) {  
            setRules(location.state.rules)
        }
      }, [location]);
    
    const { data: categoriesData } = useQuery({
        queryKey: ["allCategories"],
        queryFn: () => getAllCategories(collectionName as string),
        enabled: !!collectionName,
    })

    const formik = useFormik({
        initialValues: {},
        onSubmit: () => {
            const queryString = rules.map(rule => `${rule.field}=${rule.value}`).join("&")
            navigate(`/collections/${collectionName}/artworks?${queryString}`, {state: {rules: rules}})
        }
    })

    const handleCurrentRuleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setShowErrorMessage(false)
        setCurrentRuleCategory(event.target.value);
    }

    const handleCurrentRuleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentRuleValue(event.target.value);
    }

    const handleAddRule = () => {
        if (!currentRuleCategory) return;

        const isRuleCategoryUnique = rules.every(rule => currentRuleCategory !== rule.field)
        if(isRuleCategoryUnique) {
            setRules([...rules, { field: currentRuleCategory, value: currentRuleValue, id: uuidv4() }])
            setCurrentRuleCategory("")
            setCurrentRuleValue("")
        } else {
            setShowErrorMessage(true)
        }
    }

    const handleDeleteRule = (id: string) => {
        setRules(rules.filter(rule => rule.id !== id))
    }

    if (!categoriesData)
        return <div data-testid="loading-advanced-search-container">
            <LoadingPage />
        </div>
    return (
        <div className="my-2" data-testid="advancedSearchComponent">
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <select
                        name="field"
                        onChange={handleCurrentRuleCategoryChange}
                        value={currentRuleCategory}
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
                        onChange={handleCurrentRuleValueChange}
                        value={currentRuleValue}
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
                    {showErrorMessage &&
                    <p className="ml-auto text-red-500 text-sm">Reguła z tą nazwą kategorii już istnieje.</p>}
                </div>
            </form>
            <div data-testid="rules-container">
                {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center gap-2 mt-4">
                        <button data-testid={`delete-${rule.field}`} onClick={() => handleDeleteRule(rule.id)} className="border-none p-0 mr-2">
                            <CloseIcon />
                        </button>
                        <span className="border border-blue-300 p-2 rounded-lg bg-blue-100 text-blue-500 font-semibold">
                            {rule.field}
                        </span>
                        <span className="border border-blue-300 p-2 rounded-lg bg-blue-100 text-blue-500 font-semibold">
                            {rule.value !== "" ? rule.value : '\u00A0'}
                        </span>
                    </div>
                ))}
            </div>
            <hr className="border-t border-gray-200 my-4 dark:border-gray-600" />
        </div>
    )
}

export default AdvancedSearch