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
import DOMPurify from "dompurify"
import Dropdown from "../Dropdown"

interface SearchComponentProps {
    collectionIds: string | string[];
    mode: "local" | "global";
}


interface Rule {
    field: string
    value: string
    id: string
}

const AdvancedSearch: React.FC<SearchComponentProps> = ({ collectionIds, mode }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [rules, setRules] = useState<Rule[]>([])
    const [currentRuleCategory, setCurrentRuleCategory] = useState("")
    const [currentRuleValue, setCurrentRuleValue] = useState("")
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [duplicateCategoryError, setDuplicateCategoryError] = useState(false)
    const [valueError, setValueError] = useState(false)

    useEffect(() => {
        if (location.state && location.state.rules) {
            setRules(location.state.rules)
        } else {
            setRules([]) // set default if no rules
        }
    }, [location])

    const { data: categoriesData, isLoading } = useQuery({
        queryKey: ["allCategories", mode, collectionIds],
        queryFn: () =>
            Array.isArray(collectionIds)
                ? getAllCategories(collectionIds)
                : getAllCategories([collectionIds]),
        enabled: !!collectionIds,
    });

    useEffect(() => {
        console.log("AdvancedSearch collectionIds:", collectionIds);
    }, [collectionIds]);

    const options: { label: string; value: string }[] = React.useMemo(() => {
        if (!categoriesData?.categories) return [];

        const allCategories = categoriesData.categories;

        // Jeśli global – usuwamy duplikaty
        const uniqueCategories = mode === "global"
            ? Array.from(new Set(allCategories))
            : allCategories;

        return uniqueCategories.map((cat: string) => ({
            value: cat,
            label: cat,
        }));
    }, [categoriesData, mode]);



    const formik = useFormik({
        initialValues: {},
        onSubmit: () => {
            const queryString = rules.map(rule => `${rule.field}=${rule.value}`).join("&");

            if (mode === "global") {
                navigate(`/global-search?${queryString}`, { state: { rules } });
            } else {
                navigate(`/collections/${collectionIds}/artworks?${queryString}`, { state: { rules } });
            }
        },
    })

    const handleCurrentRuleCategoryChange = (value: string) => {
        setCurrentRuleCategory(value)
        setDuplicateCategoryError(false) // resetujemy błąd, kiedy kategoria się zmienia
        setErrorMessage(null)
    }

    const handleCurrentRuleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMessage(null)
        setCurrentRuleValue(event.target.value)
    }

    const handleAddRule = () => {
        const trimmedRawValue = currentRuleValue.trim()
        const sanitizedValue = DOMPurify.sanitize(trimmedRawValue)

        setValueError(false)
        setErrorMessage(null)
        setDuplicateCategoryError(false)

        if (!currentRuleCategory) {
            setErrorMessage("Wybierz kategorię przed dodaniem reguły.")
            setDuplicateCategoryError(true)
            return
        }

        // if (!trimmedRawValue) {
        //     setErrorMessage("Wprowadź wartość – to pole nie może być puste.")
        //     setValueError(true)
        //     return
        // }

        if (sanitizedValue !== trimmedRawValue) {
            setErrorMessage("Wartość zawiera niedozwolone znaki, np. <, >, lub inne specjalne znaki. Proszę usuń je i spróbuj ponownie.")
            setValueError(true)
            return
        }

        // TODO czy powinna być opcja dodania kilku regół dla tej samej kategorii? Łączenie na zasadzie OR?
        const isRuleCategoryUnique = rules.every(rule => currentRuleCategory !== rule.field)
        if (!isRuleCategoryUnique) {
            setErrorMessage("Reguła dla tej kategorii została już dodana. Wybierz inną kategorię.")
            setDuplicateCategoryError(true)
            return
        }

        setRules([...rules, {
            field: currentRuleCategory,
            value: sanitizedValue,
            id: uuidv4()
        }])

        setCurrentRuleCategory("")
        setCurrentRuleValue("")
        setErrorMessage(null)
        setValueError(false)
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
            <form onSubmit={formik.handleSubmit} className="flex gap-2 items-center flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                    <Dropdown
                        options={options}
                        value={currentRuleCategory}
                        onChange={handleCurrentRuleCategoryChange}
                        placeholder="Wybierz kategorię"
                        error={duplicateCategoryError}
                    />

                    <input
                        name="value"
                        type="text"
                        maxLength={250}
                        onChange={handleCurrentRuleValueChange}
                        value={currentRuleValue}
                        className={`border px-2 py-1.5 rounded-lg ${valueError ? "border-red-500" : ""}`}
                        style={{width: "250px"}}
                    />

                    <button
                        type="button"
                        onClick={handleAddRule}
                        className="border-gray-800 flex items-center bg-gray-800 hover:bg-gray-700 text-white py-2 pl-3 pr-4 gap-1 font-semibold"
                    >
                        <span>
                            <PlusIcon/>
                        </span>
                        Dodaj regułę
                    </button>

                    <button
                        type="submit"
                        className="flex items-center font-semibold color-button py-2 pl-3 pr-4 gap-1"
                    >
                        <span>
                            <SearchLoopIcon/>
                        </span>
                        Wyszukaj
                    </button>
                </div>

                {errorMessage && (
                    <p className="w-full text-red-500 text-sm mt-2 ml-1">
                        {errorMessage}
                    </p>
                )}



            </form>

            <div data-testid="rules-container">
                {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center gap-2 mt-4">
                        <button aria-label={`delete ${rule.field}`} onClick={() => handleDeleteRule(rule.id)}
                                className="border-none p-0 mr-2">
                            <CloseIcon/>
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
            <hr className="border-t border-gray-200 my-4 dark:border-gray-600"/>
        </div>
    )
}

export default AdvancedSearch
