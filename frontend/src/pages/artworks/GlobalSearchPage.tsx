// src/pages/GlobalSearchPage.tsx
import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Navigation from "../../components/Navigation";

const GlobalSearchPage: React.FC = () => {
    const [query, setQuery] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSearch = () => {
        setSubmitted(true);
        // tutaj później będziemy wywoływać API
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Navbar />
            <div className="container mx-auto px-6 pt-6 max-w-3xl">
                <Navigation />

                <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                    Globalne wyszukiwanie
                </h1>

                <div className="flex mb-6">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Szukaj we wszystkich kolekcjach..."
                        className="flex-1 px-4 py-2 rounded-l-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        Szukaj
                    </button>
                </div>

                {!submitted && (
                    <p className="text-gray-600 dark:text-gray-400">
                        Wpisz frazę powyżej i kliknij „Szukaj”, aby zobaczyć wyniki.
                    </p>
                )}

                {submitted && (
                    <div className="p-6 bg-white dark:bg-gray-800 rounded shadow">
                        <p className="text-gray-600 dark:text-gray-400">
                            Tutaj pojawią się wyniki wyszukiwania dla frazy:&nbsp;
                            <span className="font-semibold">{query}</span>
                        </p>
                        {/* później wrzucisz tu swój komponent listy wyników */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalSearchPage;
