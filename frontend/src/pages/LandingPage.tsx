import React from "react";
import Navbar from "../components/navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { ReactComponent as ArrowRight } from "../assets/icons/angleRight.svg";
import { ReactComponent as HeroGraphic } from "../assets/icons/HeroGraphic.svg";
import { ReactComponent as StructureIcon } from "../assets/icons/StructureIcon.svg";
import { ReactComponent as AddCollection } from "../assets/icons/AddCollection.svg";
import { ReactComponent as AddRecord } from "../assets/icons/AddRecord.svg";
import { ReactComponent as SearchCollection } from "../assets/icons/SearchCollection.svg";


const LandingPage = () => {

    const navigate = useNavigate();

    const scrollToCollections = () => {
        const element = document.getElementById("collections-section");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="flex flex-col h-full">
            <Navbar />
            <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 h-full">
                <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
                    <section className="hero py-4">
                        <div className="pt-4 flex flex-col lg:flex-row items-center justify-between gap-8">
                            {/* LEWA KOLUMNA - tekst */}
                            <div className="flex-1 text-left py-4">
                                <h1 className="text-2xl font-semibold mb-4">
                                    Cyfrowe repozytorium wiedzy kulturowej i naukowej
                                </h1>
                                <p className="text-lg mb-8 max-w-2xl text-gray-600 dark:text-gray-300">
                                    Ethnopedia to system do zarządzania metadanymi dla projektów naukowych i
                                    dokumentacyjnych.
                                    Twórz i organizuj kolekcje opisujące artefakty, nagrania, zbiory archiwalne i inne
                                    zasoby wiedzy...
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/login")}
                                        className="px-16 py-2 dark:text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                    >
                                        Zaloguj się
                                    </button>
                                    <button
                                        type={"button"}
                                        onClick={() => navigate("/register")}
                                        className="px-16 py-2 bg-white"
                                    >
                                        Zarejestruj się
                                    </button>
                                </div>
                                <div className="mt-8">
                                    <button
                                        onClick={scrollToCollections}
                                        className="text-lg font-normal text-gray-500 dark:text-gray-400 hover:text-gray-600 flex items-center gap-2 border-0 dark:border-0 bg-transparent dark:bg-transparent p-1"
                                    >
                                        <span>Przeglądaj bez logowania</span>
                                        <ArrowRight className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>

                            {/* PRAWA KOLUMNA - grafika */}
                            <div className="flex-1 flex items-center justify-center pb-6">
                                <HeroGraphic className="max-w-xs w-full h-auto max-h-80"/>
                            </div>

                        </div>
                    </section>

                    <section className="bg-white py-12">
                        <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
                            <h2 className="text-2xl font-semibold mb-10 text-center">Jak działa Ethnopedia?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                                <div className="flex flex-col items-center">
                                    <AddCollection className="w-12 h-12 mb-4 text-gray-700"/>
                                    <h3 className="text-lg font-medium mb-2">Utwórz kolekcję</h3>
                                    <p className="text-gray-600 text-sm max-w-xs">
                                        Kolekcja to zbiór metadanych o ustalonej strukturze, który może dotyczyć różnych zasobów, takich jak nagrania audio, zdjęcia, dokumenty i inne dane.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <StructureIcon className="w-12 h-12 mb-4 text-gray-700"/>
                                    <h3 className="text-lg font-medium mb-2">Zaprojektuj strukturę</h3>
                                    <p className="text-gray-600 text-sm max-w-xs">
                                        Określ kategorie, które będą opisem Twoich danych. System pozwala tworzyć rozbudowane, hierarchiczne układy metadanych.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <AddRecord className="w-12 h-12 mb-4 text-gray-700"/>
                                    <h3 className="text-lg font-medium mb-2">Dodawaj rekordy</h3>
                                    <p className="text-gray-600 text-sm max-w-xs">
                                        Wprowadzaj opisy poszczególnych obiektów zgodnie z ustaloną strukturą kolekcji. Każdy rekord to komplet metadanych.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <SearchCollection className="w-12 h-12 mb-4 text-gray-700"/>
                                    <h3 className="text-lg font-medium mb-2">Wyszukuj i przeglądaj dane</h3>
                                    <p className="text-gray-600 text-sm max-w-xs">
                                        Korzystaj z wygodnych narzędzi wyszukiwania i filtrowania, aby szybko znaleźć potrzebne informacje w swoich zbiorach.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>


                    <section id="collections-section" className="py-12">
                        <h2 className="text-xl mb-6">Przeglądaj istniejące kolekcje:</h2>
                        {/* Tutaj komponent listy kolekcji */}
                    </section>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
