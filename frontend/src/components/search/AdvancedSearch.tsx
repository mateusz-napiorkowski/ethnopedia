import React, { useEffect, useState, useRef } from "react"
import { useFormik } from "formik"
import { useQuery } from "react-query"
import { getAllCategories } from "../../api/categories"
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg"
import { ReactComponent as CloseIcon } from "../../assets/icons/close.svg"
import { ReactComponent as SearchLoopIcon } from "../../assets/icons/searchLoop.svg"
import LoadingPage from "../../pages/LoadingPage"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import DOMPurify from "dompurify"

interface SearchComponentProps {
    collectionId: string;
}

interface Rule {
    field: string;
    value: string;
    id: string;
}

const AdvancedSearch: React.FC<SearchComponentProps> = ({ collectionId }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [rules, setRules] = useState<Rule[]>([])
    const [currentRuleCategory, setCurrentRuleCategory] = useState("")
    const [currentRuleValue, setCurrentRuleValue] = useState("")
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [duplicateCategoryError, setDuplicateCategoryError] = useState(false)

    // Refs to focus on fields
    const categoryRef = useRef<HTMLSelectElement | null>(null)
    const valueRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (location.state && location.state.rules) {
            setRules(location.state.rules)
        } else {
            setRules([]) // set default if no rules
        }
    }, [location])

    const { data: categoriesData } = useQuery({
        queryKey: ["allCategories"],
        queryFn: () => getAllCategories(collectionId),
        enabled: !!collectionId,
    })

    const formik = useFormik({
        initialValues: {},
        onSubmit: () => {
            const queryString = rules.map(rule => `${rule.field}=${rule.value}`).join("&")
            navigate(`/collections/${collectionId}/artworks?${queryString}`, { state: { rules } })
        },
    })

    const handleCurrentRuleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setErrorMessage(null)
        setDuplicateCategoryError(false)
        setCurrentRuleCategory(event.target.value)
    }

    const handleCurrentRuleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMessage(null)
        setCurrentRuleValue(event.target.value)
    }

    const handleAddRule = () => {
        const trimmedRawValue = currentRuleValue.trim()
        const sanitizedValue = DOMPurify.sanitize(trimmedRawValue)
        const isRuleCategoryUnique = rules.every(rule => currentRuleCategory !== rule.field) // Zakomentowane

        // Sprawdzamy, czy wybrano kategorię
        if (!currentRuleCategory) {
            setErrorMessage("Wybierz kategorię przed dodaniem reguły.")
            categoryRef.current?.focus()
            return
        }

        // Sprawdzamy, czy wartość nie jest pusta
        if (!trimmedRawValue) {
            setErrorMessage("Wprowadź wartość – to pole nie może być puste.")
            valueRef.current?.focus()
            return
        }

        // Sprawdzamy, czy nie występują niedozwolone znaki
        if (sanitizedValue !== trimmedRawValue) {
            setErrorMessage("Wartość zawiera niedozwolone znaki, np. <, >, lub inne specjalne znaki. Proszę usuń je i spróbuj ponownie.")
            valueRef.current?.focus()
            return
        }

        //TODO czy reguły nie powinny się łączyć na zasadzie OR?

        // Sprawdzamy, czy kategoria reguły jest unikalna
        if (!isRuleCategoryUnique) {
            setErrorMessage("Reguła dla tej kategorii została już dodana. Wybierz inną kategorię.")
            setDuplicateCategoryError(true)
            categoryRef.current?.focus()
            return
        }

        // Dodajemy regułę do listy
        setRules([...rules, {
            field: currentRuleCategory,
            value: sanitizedValue,
            id: uuidv4()
        }])

        // Resetujemy wartości i komunikaty o błędach
        setCurrentRuleCategory("")
        setCurrentRuleValue("")
        setErrorMessage(null)
        setDuplicateCategoryError(false)
    }

    const handleDeleteRule = (id: string) => {
        setRules(rules.filter(rule => rule.id !== id))
    }

    if (!categoriesData) {
        return (
            <div data-testid="loading-advanced-search-container">
                <LoadingPage />
            </div>
        )
    }

    return (
        <div className="my-2" data-testid="advancedSearchComponent">
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        name="field"
                        onChange={handleCurrentRuleCategoryChange}
                        value={currentRuleCategory}
                        className={`border p-2 ${errorMessage && !currentRuleCategory ? "border-red-500" : ""} ${duplicateCategoryError ? "border-red-500" : ""}`}
                        ref={categoryRef}
                    >
                        <option hidden value="">Wybierz kategorię</option>
                        {categoriesData.categories.map((categoryName: string) => (
                            <option value={categoryName} key={uuidv4()}>{categoryName}</option>
                        ))}
                    </select>
                    <input
                        name="value"
                        type="text"
                        maxLength={100}
                        onChange={handleCurrentRuleValueChange}
                        value={currentRuleValue}
                        className={`border p-2 rounded-lg ${errorMessage && !currentRuleValue ? "border-red-500" : ""}`}
                        ref={valueRef}
                    />
                    <button type="button" onClick={handleAddRule}
                            className="border-gray-800 flex items-center bg-gray-800 hover:bg-gray-700 text-white p-2 font-semibold"
                    >
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
                    {errorMessage && (
                        <p className="w-full text-red-500 text-sm mt-2 ml-1">
                            {errorMessage}
                        </p>
                    )}
                </div>
            </form>

            <div data-testid="rules-container">
                {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center gap-2 mt-4">
                        <button aria-label={`delete ${rule.field}`} onClick={() => handleDeleteRule(rule.id)} className="border-none p-0 mr-2">
                            <CloseIcon />
                        </button>
                        <span className="border border-blue-300 p-2 rounded-lg bg-blue-100 text-blue-500 font-semibold">
                            {rule.field}
                        </span>
                        <span className="border border-blue-300 p-2 rounded-lg bg-blue-100 text-blue-500 font-semibold">
                            {rule.value !== "" ? rule.value : "\u00A0"}
                        </span>
                    </div>
                ))}
            </div>
            <hr className="border-t border-gray-200 my-4 dark:border-gray-600" />
        </div>
    )
}

export default AdvancedSearch
