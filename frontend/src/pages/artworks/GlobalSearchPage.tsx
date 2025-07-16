import { useMutation, useQuery, useQueryClient } from "react-query";
import { getArtworksForPage, deleteArtworks } from "../../api/artworks";
import { getCollection } from "../../api/collections";
import LoadingPage from "../LoadingPage";
import { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SearchComponent from "../../components/search/SearchComponent";
import ExportOptions from "../../components/ExportOptions";
import { ReactComponent as FileExportIcon } from "../../assets/icons/fileExport.svg";
import WarningPopup from "../WarningPopup";
import SortOptions from "../../components/SortOptions";
import Navigation from "../../components/Navigation";
import Pagination from "../../components/Pagination";
import { useUser } from "../../providers/UserProvider";
import { getAllCategories } from "../../api/categories";
import MultiselectDropdown from "../../components/MultiselectDropdown";
import ArtworksList from '../../components/artwork/ArtworksList';
import { getAllCollections } from "../../api/collections";
import {Collection} from "../../@types/Collection";



const GlobalSearchPage = ({ pageSize = 10 }) => {
    const [selectedArtworks, setSelectedArtworks] = useState<{ [key: string]: boolean }>({});
    const [showExportOptions, setShowExportOptions] = useState<boolean>(false);
    const [showDeleteRecordsWarning, setShowDeleteRecordsWarning] = useState(false);
    const [sortCategory, setSortCategory] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<string>("asc");
    const [selectedDisplayCategories, setSelectedDisplayCategories] = useState<string[]>([]);
    const { jwtToken } = useUser();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [allCollectionIds, setAllCollectionIds] = useState<string[]>([]);

    const hasSearchParams = new URLSearchParams(location.search).toString().length > 0;

    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);


    // Funkcja wyszukująca wartość dla danej kategorii
    const findValue = (artwork: any, categoryPath: any): string => {
        const parts = categoryPath.split(".");

        const searchCategory = (categories: any[], parts: string[]): string => {
            if (parts.length === 0) return "";
            const current = categories.find((cat) => cat.name === parts[0]);
            if (!current) return "";
            if (parts.length === 1) {
                return current.value || "";
            }
            if (current.subcategories && current.subcategories.length > 0) {
                return searchCategory(current.subcategories, parts.slice(1));
            }
            return "";
        };

        return searchCategory(artwork.categories, parts);
    };


    const {
        data: artworkData,
        isLoading: isLoadingArtworks,
        isFetching: isFetchingArtworks,
    } = useQuery({
        queryKey: [
            "artwork",
            selectedCollectionIds,
            currentPage,
            location.search,
            sortCategory,
            sortDirection,
        ],
        queryFn: () =>
            getArtworksForPage(
                selectedCollectionIds, // tablica wszystkich kolekcji
                currentPage,
                pageSize,
                `${sortCategory}-${sortDirection}`,
                new URLSearchParams(location.search).get("searchText"),
                Object.fromEntries(new URLSearchParams(location.search).entries())
            ),
        enabled: selectedCollectionIds.length > 0,
        keepPreviousData: false,
    });


    const { data: categoriesData } = useQuery({
        queryKey: ["selectedCategories", selectedCollectionIds],
        queryFn: () => getAllCategories(selectedCollectionIds),
        enabled: selectedCollectionIds.length > 0,
    });

    useEffect(() => {
        if (categoriesData) {
            console.log("Kategorie:", categoriesData.categories);
        }
    }, [categoriesData]);


    // Przygotowanie opcji – lista wszyskich kategorii
    const categoryOptions: Option[] =
        categoriesData?.categories?.map((cat: string) => ({
            value: cat,
            label: cat,
        })) || [];


    // Pobranie listy wszystkich kolekcji
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const data = await getAllCollections(1, 1000);
                console.log("Pobrane kolekcje:", data);
                const ids = data.collections.map((col: any) => col.id);
                setAllCollectionIds(ids);
                const valid = data.collections.filter(
                    (c): c is Collection & { id: string } => typeof c.id === 'string'
                );
                setCollections(valid);
                setSelectedCollectionIds(valid.map(c => c.id));
                console.log("allCollectionIds:", ids);
            } catch (error) {
                console.error("Błąd pobierania kolekcji", error);
            }
        };
        fetchCollections();
    }, []);

    useEffect(() => {
        console.log("allCollectionIds zmieniło się:", allCollectionIds);
    }, [allCollectionIds]);

    // Ustaw domyślnie wybraną kategorię sortowania na pierwszą kategorię z listy (jeśli istnieje)
    useEffect(() => {
        if (categoriesData?.categories?.length && !sortCategory) {
            setSortCategory(categoriesData.categories[0]);
        }
    }, [categoriesData, sortCategory]);

    // Ustaw domyślnie pierwsze 3 kategorie, jeśli jeszcze nie wybrano żadnych
    useEffect(() => {
        if (categoriesData?.categories?.length && !selectedDisplayCategories.length) {
            setSelectedDisplayCategories([categoriesData.categories[0]]);
        }
    }, [categoriesData, selectedDisplayCategories]);

    const selectAll = () => {
        const newSelection = artworkData?.artworks.reduce((acc: any, artwork: any) => {
            acc[artwork._id] = true;
            return acc;
        }, {});
        setSelectedArtworks(newSelection);
    };

    const deselectAll = () => {
        setSelectedArtworks({});
    };

    const handleCheck = (id: string) => {
        setSelectedArtworks((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const deleteArtworksMutation = useMutation(
        () =>
            deleteArtworks(
                Object.keys(selectedArtworks).filter((id) => selectedArtworks[id]),
                jwtToken as string
            ),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("artwork");
                setShowDeleteRecordsWarning((prev) => !prev);
                deselectAll();
            },
        }
    );

    if (!artworkData) {
        return (
            <div data-testid="loading-page-container">
                <LoadingPage />
            </div>
        );
    }


    type Option = {
        value: string;
        label: string;
    };

    const collectionOptions: Option[] = collections.map(col => ({
        value: col.id!,
        label: col.name
    }));



    return (
        <><div data-testid="loaded-artwork-page-container">
            <Navbar />
            {showDeleteRecordsWarning && (
                <WarningPopup
                    onClose={() => setShowDeleteRecordsWarning(false)}
                    deleteSelected={() => deleteArtworksMutation.mutate()}
                    warningMessage={"Czy na pewno chcesz usunąć zaznaczone rekordy?"}
                />
            )}
            <div className="flex flex-col w-full items-center bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
                <div className="flex flex-col max-w-screen-xl w-full lg:px-6">
                    <Navigation/>
                    <div
                        data-testid="collection-name-and-description-container"
                        className="flex flex-row mb-4 mt-2"
                    >
                        <div className="flex flex-col w-full">
                            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-1">
                                Wyszukiwanie
                            </h2>
                        </div>

                    </div>

                    <div className="mb-4 flex items-center space-x-2">
                        <p className="font-medium">Wybierz kolekcje:</p>
                        <MultiselectDropdown
                            selectedValues={selectedCollectionIds}
                            setSelectedValues={setSelectedCollectionIds}
                            options={collectionOptions}
                            specialOptions={[
                                {value: "select_all", label: "Zaznacz wszystkie"},
                                {value: "deselect_all", label: "Odznacz wszystkie"}
                            ]}
                            formatOptionLabel={(option, context) =>
                                context.context === "menu" ? (
                                    <span className="text-gray-500 font-semibold">{option.label}</span>
                                ) : (
                                    option.label
                                )
                            }
                            placeholder="Wybierz kolekcje"
                        />
                    </div>

                    {selectedCollectionIds && <SearchComponent collectionIds={selectedCollectionIds} mode="global"/>}
                    <div className="flex w-full md:w-auto">
                        <div className="flex flex-1 space-x-2">

                            <button
                                className="flex items-center justify-center dark:text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium px-4 py-2 dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                type="button"
                                onClick={async () => {
                                    setShowExportOptions((prev) => !prev);
                                }}
                            >
                                <span className="text-white dark:text-gray-400">
                                    <FileExportIcon/>
                                </span>
                                Eksportuj plik
                            </button>

                            <button
                                className="flex items-center justify-center dark:text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2 dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                type="button"
                                onClick={selectAll}
                            >
                                Zaznacz wszystkie
                            </button>
                            <button
                                className="flex items-center justify-center dark:text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2 dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                type="button"
                                onClick={deselectAll}
                            >
                                Odznacz wszystkie
                            </button>
                            <button
                                disabled={
                                    !(jwtToken && !Object.values(selectedArtworks).every((value) => value === false))
                                }
                                className={`flex items-center justify-center dark:text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2 dark:focus:ring-primary-800 font-semibold text-white ${
                                    jwtToken && !Object.values(selectedArtworks).every((value) => value === false)
                                        ? "bg-gray-800 hover:bg-gray-700 border-gray-800"
                                        : "bg-gray-600 hover:bg-gray-600 border-gray-800"
                                }`}
                                type="button"
                                onClick={() => {
                                    setShowDeleteRecordsWarning((prev) => !prev);
                                }}
                            >
                                Usuń zaznaczone
                            </button>
                        </div>
                    </div>
                    {showExportOptions &&
                        <ExportOptions onClose={() => setShowExportOptions(false)} selectedArtworks={selectedArtworks}
                                       initialFilename={`eksport.xlsx`}/>}
                    <div className="flex w-full md:w-auto pt-4 flex-row items-center text-sm">
                        <p className="pr-2">Wyświetlane kategorie:</p>
                        <MultiselectDropdown
                            selectedValues={selectedDisplayCategories}
                            setSelectedValues={setSelectedDisplayCategories}
                            options={categoryOptions}
                            specialOptions={[
                                {value: "select_all", label: "Zaznacz wszystko"},
                                {value: "deselect_all", label: "Odznacz wszystko"}
                            ]}
                            formatOptionLabel={(option, context) =>
                                context.context === "menu" ? (
                                    <span className="text-gray-500 font-semibold">{option.label}</span>
                                ) : (
                                    option.label
                                )
                            }
                            placeholder="Wybierz kategorię"
                        />

                        <p className="pl-2 pr-2">Sortuj według:</p>
                        {categoryOptions && (
                            <SortOptions
                                options={categoryOptions}
                                sortCategory={sortCategory}
                                sortDirection={sortDirection}
                                onSelectCategory={setSortCategory}
                                onSelectDirection={setSortDirection}
                                setCurrentPage={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-row">
                <div className="flex mx-auto flex-1 justify-end w-full"></div>
                <div data-testid="artworks-listed" className="w-full flex-2 lg:px-6 max-w-screen-xl">
                    <ArtworksList
                        artworksData={artworkData}
                        isLoading={isLoadingArtworks}
                        isFetching={isFetchingArtworks}
                        hasSearchParams={hasSearchParams}
                        selectedDisplayCategories={selectedDisplayCategories}
                        selectedArtworks={selectedArtworks}
                        onToggleSelect={handleCheck}
                        findValue={findValue}
                        jwtToken={jwtToken}
                    />
                </div>

                <div className="mx-auto w-full flex-1"></div>
            </div>
            <div className="flex justify-center mb-2">
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(artworkData.total / pageSize)}
                    setCurrentPage={(page) => setCurrentPage(page)}
                    onPageChange={deselectAll}
                />
            </div>
        </div>
        </>
    );
};

export default GlobalSearchPage;
