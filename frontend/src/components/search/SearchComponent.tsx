import React, { useState, useEffect } from "react"
import QuickSearch from "./QuickSearch"
import AdvancedSearch from "./AdvancedSearch"

interface SearchComponentProps {
    collectionId: string
}

const SearchComponent: React.FC<SearchComponentProps> = ({ collectionId }) => {
    const [activeTab, setActiveTab] = useState<string>("quickSearch")

    useEffect(() => {
        const savedTab = localStorage.getItem("activeSearchTab")
        if (savedTab) {
            setActiveTab(savedTab)
        }
    }, [])

    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName)
        localStorage.setItem("activeSearchTab", tabName)
    }

    return (
        <div className="mb-2" data-testid="searchComponent">
            <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-600 dark:text-gray-300">
                <li className="me-2">
                    <div
                        onClick={() => handleTabClick("quickSearch")}
                        className={`inline-block p-2 rounded-t-lg cursor-pointer ${activeTab === "quickSearch"
                            ? "text-gray-800 font-semibold bg-gray-100 dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600"
                            : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"}`}>
                        Szybkie wyszukiwanie
                    </div>
                </li>
                <li className="me-2">
                    <div
                        onClick={() => handleTabClick("advancedSearch")}
                        className={`inline-block p-2 rounded-t-lg cursor-pointer ${activeTab === "advancedSearch"
                            ? "text-gray-800 font-semibold bg-gray-100 dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600"
                            : "hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"}`}>
                        Zaawansowane wyszukiwanie
                    </div>
                </li>
            </ul>

            {activeTab === "quickSearch" && <QuickSearch collectionId={collectionId} />}
            {activeTab === "advancedSearch" && <AdvancedSearch collectionId={collectionId} />}
        </div>
    )
}

export default SearchComponent
