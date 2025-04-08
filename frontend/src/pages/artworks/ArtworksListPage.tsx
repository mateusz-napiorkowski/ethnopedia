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
import DisplayCategoriesSelect, { Option } from "../../components/DisplayCategoriesSelect";
import { ReactComponent as EditIcon } from "../../assets/icons/edit.svg"
import EmptyCollectionMessage from "../../components/artwork/EmptyCollectionMessage";


const ArtworksListPage = ({ pageSize = 10 }) => {
    const [selectedArtworks, setSelectedArtworks] = useState<{ [key: string]: boolean }>({});
    const [showImportOptions, setShowImportOptions] = useState<boolean>(false);
    const [showExportOptions, setShowExportOptions] = useState<boolean>(false);
    const [showDeleteRecordsWarning, setShowDeleteRecordsWarning] = useState(false);
    const [sortOrder, setSortOrder] = useState<string>("Tytuł-asc");
    // Stan dla multiselect – kategorie, które mają być wyświetlane
    const [selectedDisplayCategories, setSelectedDisplayCategories] = useState<string[]>([]);
    const { jwtToken } = useUser();

    const location = useLocation();

    const { collectionId } = location.state as { collectionId?: string } || {};

    const [currentPage, setCurrentPage] = useState(1);
    const { collection } = useParams<string>();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Funkcja wyszukująca wartość dla danej kategorii
    const findValue = (artwork: any, categoryName: string) => {
        let val = "";
        artwork.categories.forEach((category: any) => {
            if (category.name === categoryName) {
                val = category.value;
                return;
            }
        });
        return val;
    };

    const { data: artworkData } = useQuery({
        queryKey: ["artwork", currentPage, location.search, location, sortOrder],
        queryFn: () =>
            getArtworksForCollectionPage(
                collection as string,
                currentPage,
                pageSize,
                sortOrder,
                new URLSearchParams(location.search).get("searchText"),
                Object.fromEntries(new URLSearchParams(location.search).entries())
            ),
        enabled: !!collection,
    });

    const { data: collectionData } = useQuery({
        queryKey: [collection],
        enabled: !!collection,
        queryFn: () => getCollection(collection as string),
    });

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


    const { data: categoriesData } = useQuery({
        queryKey: ["allCategories", collection],
        queryFn: () => getAllCategories(collection as string),
        enabled: !!collection,
    });


    const sortOptions = categoriesData?.categories?.flatMap((category: string) => [
        { value: `${category}`, label: `${category}` }
    ]);

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


    const allArtworks = artworkData.artworks.map((artwork: any) => (
        <div
            className="px-4 max-w-screen-xl py-4 bg-white dark:bg-gray-800 shadow-md w-full rounded-lg mb-4 border border-gray-300 dark:border-gray-600 cursor-pointer"
            key={artwork._id}
            data-testid={artwork._id}
            onClick={() => navigate(`/collections/${collection}/artworks/${artwork._id}`)}
        >
            <div className="flex flex-row">
                <span className="mr-4 flex items-center">
                    <input
                        type="checkbox"
                        data-testid={`${artwork._id}-checkbox`}
                        checked={selectedArtworks[artwork._id] || false}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleCheck(artwork._id)}
                    />
                </span>
                <div>
                    {selectedDisplayCategories.length > 0 ? (
                        selectedDisplayCategories.map((catName) => {
                            // Jeśli nazwa zawiera kropkę, pobieramy ostatnią część
                            const label = catName.includes('.') ? catName.split('.').pop() : catName;
                            return (
                                <div key={label} className="text-lg text-gray-800 dark:text-white">
                                    <p className="text-gray-400 inline">{label}: </p>
                                    {findValue(artwork, catName)}
                                </div>
                            );
                        })
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {findValue(artwork, "Tytuł")}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-1">
                                {findValue(artwork, "Artyści")}
                            </p>
                            <p className="text-gray-500 dark:text-gray-300">
                                {findValue(artwork, "Rok")}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    ));

    type Option = {
        value: string;
        label: string;
    };

    // Przygotowanie opcji z kategorii
    const categoryOptions: Option[] =
        categoriesData?.categories?.map((cat: string) => ({
            value: cat,
            label: cat,
        })) || [];

    // Dodanie opcji specjalnych na początku listy
    const customOptions = [
        { value: "select_all", label: "Zaznacz wszystkie" },
        { value: "deselect_all", label: "Odznacz wszystkie" },
        ...categoryOptions,
    ];

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
                                onClick={() =>  navigate(`/collections/${collection}/edit`, {
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
                    {collection && <SearchComponent collectionName={collection}/>}
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
                                onClick={() => navigate(`/collections/${collection}/create-artwork`)}
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
                    {showExportOptions && <ExportOptions onClose={() => setShowExportOptions(false)} selectedArtworks={selectedArtworks} />}
                    <div className="flex w-full md:w-auto pt-4 flex-row items-center">
                        <p className="pr-2 text-sm">Wyświetlane kategorie:</p>
                        <DisplayCategoriesSelect
                            selectedDisplayCategories={selectedDisplayCategories}
                            setSelectedDisplayCategories={setSelectedDisplayCategories}
                            categoryOptions={categoryOptions} // wcześniej zdefiniowana tablica opcji
                            customOptions={customOptions}     // wcześniej zdefiniowana tablica z opcjami specjalnymi i zwykłymi
                            formatOptionLabel={formatOptionLabel} // funkcja wyróżniająca opcje specjalne
                        />
                        <p className="pl-2 pr-2 text-sm">Sortuj według:</p>
                        {sortOptions && (
                            <SortOptions
                                options={sortOptions}
                                onSelect={(field, order) => setSortOrder(`${field}_${order}`)}
                                sortOrder={sortOrder.split("_")[1]} // żeby przekazać tylko 'asc' lub 'desc'
                                setCurrentPage={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-row">
                <div className="flex mx-auto flex-1 justify-end w-full"></div>
                <div data-testid="artworks-listed" className="w-full flex-2 lg:px-6 max-w-screen-xl">
                    {artworkData.artworks.length === 0 ? (
                        <EmptyCollectionMessage
                            setShowImportOptions={setShowImportOptions}
                            jwtToken={jwtToken}
                        />
                    ) : (
                        allArtworks
                    )}
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
        </div></>
    );
};

export default ArtworksListPage;
