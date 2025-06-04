import { useState, useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { ReactComponent as ArrowRight } from "../assets/icons/angleRight.svg";
import { ReactComponent as HeroGraphic } from "../assets/icons/HeroSectionIcon.svg";
import { ReactComponent as HeroGraphicDark } from "../assets/icons/HeroSectionIconDark.svg";
import SortOptions from "../components/SortOptions";
import { getAllCollections } from "../api/collections";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";

import { HiOutlineFolderAdd } from "react-icons/hi";
import { BsDiagram3 } from "react-icons/bs";
import { AiOutlinePlusSquare } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { useQuery } from "react-query";
import LoadingPage from "./LoadingPage";

const LandingPage = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    // Nowe stany dla sortowania – w tym przypadku sortujemy jedynie po nazwie,
    // więc sortCategory jest stały ("name"), a użytkownik może wybrać kierunek sortowania.
    const [sortCategory, setSortCategory] = useState<string>("name");
    const [sortDirection, setSortDirection] = useState<string>("asc");

    const [newCollection] = useState<string>("");
    
    useEffect(() => {
        refetch();
        // eslint-disable-next-line
    }, [newCollection]);

    const { data: fetchedData, refetch } = useQuery({
            queryKey: ["collection", currentPage, pageSize, newCollection, sortDirection],
            queryFn: () => getAllCollections(currentPage, pageSize, sortDirection),
            keepPreviousData: true
        }
    );

    const scrollToCollections = () => {
        const element = document.getElementById("collections-section");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    if(!fetchedData?.collections)
        return <LoadingPage></LoadingPage>

    return (
        <div className="flex flex-col h-full w-full">
            <Navbar />
            <section className="h-full">
                <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
                    {/* Hero */}
                    <section className="hero bg-gray-50 dark:bg-gray-900">
                        <div className="mt-24 flex flex-col lg:flex-row items-center justify-between gap-8">
                            {/* LEWA KOLUMNA */}
                            <div className="flex-1 text-left pb-10">
                                <h1 className="text-2xl font-semibold mb-4">
                                    Zarządzaj metadanymi tekstowymi i&nbsp;transkrypcją utworów muzycznych
                                </h1>
                                <p className="text-lg mb-8 max-w-2xl text-gray-600 dark:text-gray-300">
                                    Ethnopedia to system do zarządzania metadanymi dla projektów naukowych
                                    i&nbsp;dokumentacyjnych. Twórz i&nbsp;organizuj kolekcje opisujące artefakty,
                                    nagrania, zbiory archiwalne i&nbsp;inne zasoby wiedzy...
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        type="button"
                                        aria-label="landing-page-login"
                                        onClick={() => navigate("/login")}
                                        className="px-16 py-2 dark:text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                    >
                                        Zaloguj się
                                    </button>
                                    <button type="button" onClick={() => navigate("/register")}
                                            aria-label="landing-page-register"
                                            className="px-16 py-2 bg-white">
                                        Zarejestruj się
                                    </button>
                                </div>
                                <div className="mt-8">
                                    <button
                                        onClick={scrollToCollections}
                                        aria-label={'browse-without-logging-in'}
                                        className="text-lg font-normal p-1 text-gray-500 dark:text-gray-400 hover:text-gray-600 flex items-center gap-2 border-0 bg-transparent dark:border-0 dark:bg-transparent"
                                    >
                                        <span>Przeglądaj bez logowania</span>
                                        <ArrowRight className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>

                            {/* PRAWA KOLUMNA */}
                            <div className="flex-1 flex items-center justify-center">
                                <HeroGraphic className="max-w-lg w-auto h-full max-h-lg block dark:hidden"/>
                                <HeroGraphicDark className="max-w-lg w-auto h-full max-h-lg hidden dark:block"/>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sekcja z ikonami, opis działania aplikacji */}
                <section className="bg-white dark:bg-gray-800 py-16 w-full">
                    <div className="max-w-screen-xl mx-auto px-4 lg:px-12">
                        <h2 className="text-2xl font-semibold mb-12 text-center">Jak działa Ethnopedia?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                            <div className="flex flex-col items-center">
                                <HiOutlineFolderAdd className="w-12 h-12 mb-4 text-gray-700 dark:text-gray-400" />
                                <h3 className="text-lg font-medium mb-2">Utwórz kolekcję</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm max-w-xs">
                                    Kolekcja to zbiór metadanych o ustalonej strukturze, który może dotyczyć różnych
                                    zasobów, takich jak nagrania audio, zdjęcia, dokumenty i inne dane.
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <BsDiagram3 className="w-12 h-12 mb-4 text-gray-700 dark:text-gray-400" />
                                <h3 className="text-lg font-medium mb-2">Zaprojektuj strukturę</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm max-w-xs">
                                    Określ kategorie, które będą opisem Twoich danych. System pozwala tworzyć
                                    rozbudowane, hierarchiczne układy metadanych.
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <AiOutlinePlusSquare className="w-12 h-12 mb-4 text-gray-700 dark:text-gray-400" />
                                <h3 className="text-lg font-medium mb-2">Dodawaj rekordy</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm max-w-xs">
                                    Wprowadzaj opisy poszczególnych obiektów zgodnie z ustaloną strukturą kolekcji.
                                    Każdy rekord to komplet metadanych.
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <FiSearch className="w-12 h-12 mb-4 text-gray-700 dark:text-gray-400" />
                                <h3 className="text-lg font-medium mb-2">Wyszukuj i przeglądaj dane</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm max-w-xs">
                                    Korzystaj z wygodnych narzędzi wyszukiwania i filtrowania, aby szybko znaleźć
                                    potrzebne informacje w swoich zbiorach.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Podgląd kolekcji */}
                <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
                    <section id="collections-section" className="py-12 mt-4 bg-gray-50 dark:bg-gray-900">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold px-4">Przeglądaj istniejące kolekcje:</h2>
                            <SortOptions
                                // Jako opcje przekazujemy jeden element – sortowanie po nazwie (kolekcja).
                                options={[{value: "name", label: "Nazwa kolekcji"}]}
                                sortCategory={sortCategory}
                                sortDirection={sortDirection}
                                onSelectCategory={setSortCategory}
                                onSelectDirection={setSortDirection}
                                setCurrentPage={() => {
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {fetchedData?.collections.map((collection) => (
                                <div
                                    key={collection.id}
                                    aria-label={collection.id}
                                    className="relative group px-4 py-3 bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() =>
                                        navigate(`/collections/${collection.id}/artworks`, {
                                            state: {collectionId: collection.id},
                                        })
                                    }
                                >
                                    <div className="flex flex-col h-full">
                                        <h2 className="text-lg font-semibold mb-2">{collection.name}</h2>
                                        <p className="text-gray-600 dark:text-gray-300 flex-grow">{collection.description}</p>
                                        <div className="mt-2 text-md flex items-center">
                                            <span className="font-bold mr-1">{collection.artworksCount ?? 0}</span>
                                            {(collection.artworksCount ?? 0) === 1
                                                ? "rekord"
                                                : (collection.artworksCount ?? 0) > 1 &&
                                                (collection.artworksCount ?? 0) < 5
                                                    ? "rekordy"
                                                    : "rekordów"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>


                    <div className="flex justify-center mb-16">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(fetchedData.total / pageSize)}
                            setCurrentPage={setCurrentPage}
                            onPageChange={() => {
                            }}
                        />
                    </div>
                </div>

                <Footer />

            </section>
        </div>
    );
};

export default LandingPage;
