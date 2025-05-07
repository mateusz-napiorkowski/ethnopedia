import { useMutation, useQuery, useQueryClient } from "react-query";
import { getArtworksForCollectionPage, deleteArtworks } from "../../api/artworks";
import { getCollection } from "../../api/collections";
import LoadingPage from "../LoadingPage";
import { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SearchComponent from "../../components/search/SearchComponent";
import ImportOptions from "../../components/ImportOptions";
import ExportOptions from "../../components/ExportOptions";
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg";
import { ReactComponent as FileImportIcon } from "../../assets/icons/fileImport.svg";
import { ReactComponent as FileExportIcon } from "../../assets/icons/fileExport.svg";
import WarningPopup from "../WarningPopup";
import SortOptions from "../../components/SortOptions";
import Navigation from "../../components/Navigation";
import Pagination from "../../components/Pagination";
import { useUser } from "../../providers/UserProvider";
import { getAllCategories } from "../../api/categories";
import DisplayCategoriesSelect from "../../components/DisplayCategoriesSelect";
import { ReactComponent as EditIcon } from "../../assets/icons/edit.svg"
import ArtworksList from '../../components/artwork/ArtworksList';



const ArtworksListPage = ({ pageSize = 10 }) => {
    const [selectedArtworks, setSelectedArtworks] = useState<{ [key: string]: boolean }>({});
    const [showImportOptions, setShowImportOptions] = useState<boolean>(false);
    const [showExportOptions, setShowExportOptions] = useState<boolean>(false);
    const [showDeleteRecordsWarning, setShowDeleteRecordsWarning] = useState(false);
    const [sortCategory, setSortCategory] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<string>("asc");
    const [selectedDisplayCategories, setSelectedDisplayCategories] = useState<string[]>([]);
    const { jwtToken } = useUser();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(1);
    const { collectionId } = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const hasSearchParams = new URLSearchParams(location.search).toString().length > 0;

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
            collectionId,
            currentPage,
            location.search,
            sortCategory,
            sortDirection,
        ],
        queryFn: () =>
            getArtworksForCollectionPage(
                collectionId as string,
                currentPage,
                pageSize,
                `${sortCategory}-${sortDirection}`,
                new URLSearchParams(location.search).get("searchText"),
                Object.fromEntries(new URLSearchParams(location.search).entries())
            ),
        enabled: !!collectionId,
        keepPreviousData: false,
    });


    const { data: collectionData } = useQuery({
        queryKey: [collectionId],
        enabled: !!collectionId,
        queryFn: () => getCollection(collectionId as string),
    });

    const { data: categoriesData } = useQuery({
        queryKey: ["allCategories", collectionId],
        queryFn: () => getAllCategories(collectionId as string),
        enabled: !!collectionId,
    });


    // Przygotowanie opcji – lista wszyskich kategorii
    const categoryOptions: Option[] =
        categoriesData?.categories?.map((cat: string) => ({
            value: cat,
            label: cat,
        })) || [];


    // Ustaw domyślnie wybraną kategorię sortowania na pierwszą kategorię z listy (jeśli istnieje)
    useEffect(() => {
        if (categoriesData && categoriesData.categories && categoriesData.categories.length > 0 && !sortCategory) {
            setSortCategory(categoriesData.categories[0]);
        }
    }, [categoriesData, sortCategory]);

    // Ustaw domyślnie pierwsze 3 kategorie, jeśli jeszcze nie wybrano żadnych
    useEffect(() => {
        if (categoriesData && categoriesData.categories && selectedDisplayCategories.length === 0) {
            // Wyciągamy pierwsze 3 kategorie z listy
            setSelectedDisplayCategories(categoriesData.categories.slice(0, 3));
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

    if (!artworkData || !collectionData) {
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

    // Dodanie opcji specjalnych na początku listy
    const customOptions = [
        { value: "select_all", label: "Zaznacz wszystkie" },
        { value: "deselect_all", label: "Odznacz wszystkie" },
        ...categoryOptions,
    ];

    const formatOptionLabel = (option: Option, { context }: { context: string }) => {
        if (context === "menu") {
            if (option.value === "select_all" || option.value === "deselect_all") {
                return (
                    <div
                        className="text-gray-500 dark:text-gray-300 underline"
                    >
                        {option.label}
                    </div>
                );
            }
        }
        return option.label;
    };

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
                    <Navigation />
                    <div
                        data-testid="collection-name-and-description-container"
                        className="flex flex-row mb-4 mt-2"
                    >
                        <div className="flex flex-col w-full">
                            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-1">
                                {collectionData?.name}
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300">
                                {collectionData?.description}
                            </p>
                        </div>
                        {/* Edytuj kolekcję */}
                        <div>
                            <button
                                disabled={jwtToken ? false : true}
                                className={
                                    jwtToken
                                        ? "text-sm font-semibold h-fit mr-4 flex items-center"
                                        : "text-sm font-semibold h-fit mr-4 bg-gray-100 hover:bg-gray-100 flex items-center"
                                }
                                onClick={() =>  navigate(`/collections/${collectionId}/edit`, {
                                    state: {
                                        collectionId: collectionId,
                                        mode: 'edit',
                                        name: collectionData?.name,
                                        description: collectionData?.description,
                                        categories: collectionData?.categories
                                    }
                                })}
                            >
                                <EditIcon/>
                                <p className="ml-1">Edytuj</p>
                            </button>

                        </div>
                    </div>
                    {collectionId && <SearchComponent collectionId={collectionId} />}
                    <div className="flex w-full md:w-auto">
                        <div className="flex flex-1 space-x-2">
                            <button
                                disabled={jwtToken ? false : true}
                                className={`flex items-center justify-center dark:text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2 dark:focus:ring-primary-800 font-semibold text-white ${
                                    jwtToken
                                        ? "bg-gray-800 hover:bg-gray-700 border-gray-800"
                                        : "bg-gray-600 hover:bg-gray-600 border-gray-800"
                                }`}
                                type="button"
                                onClick={() => navigate(`/collections/${collectionId}/create-artwork`)}
                            >
                                <span className="mr-2 text-white dark:text-gray-400">
                                    <PlusIcon />
                                </span>
                                Nowy rekord
                            </button>
                            <button
                                className="flex items-center justify-center dark:text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium px-4 py-2 dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                type="button"
                                onClick={async () => {
                                    setShowExportOptions((prev) => !prev);
                                }}
                            >
                                <span className="text-white dark:text-gray-400">
                                    <FileExportIcon />
                                </span>
                                Eksportuj plik
                            </button>
                            <button
                                disabled={jwtToken ? false : true}
                                className={`flex items-center justify-center dark:text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2 dark:focus:ring-primary-800 font-semibold text-white ${
                                    jwtToken
                                        ? "bg-gray-800 hover:bg-gray-700 border-gray-800"
                                        : "bg-gray-600 hover:bg-gray-600 border-gray-800"
                                }`}
                                type="button"
                                onClick={() => setShowImportOptions((prev) => !prev)}
                            >
                                <span className="text-white dark:text-gray-400">
                                    <FileImportIcon />
                                </span>
                                Importuj plik
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
                    {showImportOptions && <ImportOptions onClose={() => setShowImportOptions(false)} collectionData={collectionData}/>}
                    {showExportOptions && <ExportOptions onClose={() => setShowExportOptions(false)} selectedArtworks={selectedArtworks} initialFilename={`${collectionData?.name}.xlsx`} />}
                    <div className="flex w-full md:w-auto pt-4 flex-row items-center text-sm">
                        <p className="pr-2">Wyświetlane kategorie:</p>
                        <DisplayCategoriesSelect
                            selectedDisplayCategories={selectedDisplayCategories}
                            setSelectedDisplayCategories={setSelectedDisplayCategories}
                            categoryOptions={categoryOptions} // wcześniej zdefiniowana tablica opcji
                            customOptions={customOptions}     // wcześniej zdefiniowana tablica z opcjami specjalnymi i zwykłymi
                            formatOptionLabel={formatOptionLabel} // funkcja wyróżniająca opcje specjalne
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
                        collectionId={collectionId as string}
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

export default ArtworksListPage;
