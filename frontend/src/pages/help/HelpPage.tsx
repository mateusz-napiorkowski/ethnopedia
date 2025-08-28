import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Navigation from "../../components/Navigation";

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "Jak dodać nowe dzieło?",
        answer: "Kliknij przycisk 'Dodaj dzieło', wypełnij formularz i zapisz."
    },
    {
        question: "Jak wyszukiwać w systemie?",
        answer: "Użyj QuickSearch lub AdvancedSearch w widoku kolekcji lub globalnego wyszukiwania."
    },
    {
        question: "Jak eksportować dane?",
        answer: "Kliknij przycisk eksportu w widoku kolekcji lub dzieł. Możesz wybrać format XLSX lub CSV."
    },
    {
        question: "Jak edytować kolekcję?",
        answer: "Wejdź w widok kolekcji i kliknij 'Edytuj kolekcję'."
    }
];

const HelpPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="flex flex-col min-h-screen" data-testid="collections-page-container">
            {/* Navbar */}
            <Navbar/>

            {/* Główna zawartość */}
            <main className="p-6 max-w-4xl mx-auto w-full">

                <Navigation />
                <h1 className="text-3xl font-bold mt-2 mb-6">Pomoc i FAQ</h1>

                {faqData.map((item, idx) => (
                    <div key={idx} className="mb-4 border rounded-lg overflow-hidden">
                        <button
                            className="w-full text-left px-4 py-3 bg-gray-100 dark:bg-gray-800 flex justify-between items-center"
                            onClick={() => toggleFAQ(idx)}
                        >
                            <span className="font-semibold">{item.question}</span>
                            <span className="ml-2">{openIndex === idx ? "−" : "+"}</span>
                        </button>
                        {openIndex === idx && (
                            <div className="px-4 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                                {item.answer}
                            </div>
                        )}
                    </div>
                ))}

                <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                    Jeśli nie znalazłeś odpowiedzi, skontaktuj się z administratorem systemu.
                </div>
            </main>
        </div>

    );
};

export default HelpPage;
