import { useMutation, useQuery, useQueryClient } from "react-query";
import { getArtworksForPage, deleteArtworks } from "../../api/artworks";
import { getCollection } from "../../api/collections";
import { getUserById } from "../../api/auth";
import LoadingPage from "../LoadingPage";
import { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import SearchComponent from "../../components/search/SearchComponent";
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg";
import { ReactComponent as FileImportIcon } from "../../assets/icons/fileImport.svg";
import { ReactComponent as FileExportIcon } from "../../assets/icons/fileExport.svg";
import WarningPopup from "../WarningPopup";
import SortOptions from "../../components/SortOptions";
import Navigation from "../../components/Navigation";
import Pagination from "../../components/Pagination";
import { useUser } from "../../providers/UserProvider";
import { getAllCategories } from "../../api/categories";
import MultiselectDropdown from "../../components/MultiselectDropdown";
import { ReactComponent as EditIcon } from "../../assets/icons/edit.svg"
import ArtworksList from '../../components/artwork/ArtworksList';

const ArtworksListPage = ({ pageSize = 10 }) => {
    const [selectedArtworks, setSelectedArtworks] = useState<{ [key: string]: boolean }>({});
    const [showDeleteRecordsWarning, setShowDeleteRecordsWarning] = useState(false);
    const [sortCategory, setSortCategory] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<string>("asc");
    const [selectedDisplayCategories, setSelectedDisplayCategories] = useState<string[]>([]);
    const { jwtToken } = useUser();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(1);
    const { collectionId } = useParams();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const hasSearchParams = new URLSearchParams(location.search).toString().length > 0;
    const [showFullDescription, setShowFullDescription] = useState<boolean>(false);

    const findValue = (artwork: any, categoryPath: any): string => {
        const parts = categoryPath.split(".");
        const searchCategory = (categories: any[], parts: string[]): string => {
            if (parts.length === 0) return "";
            const current = categories.find((cat) => cat.name === parts[0]);
            if (!current) return "";
            if (parts.length === 1) return current.value || "";
            if (current.subcategories && current.subcategories.length > 0) {
                return searchCategory(current.subcategories, parts.slice(1));
            }
            return "";
        };
        return searchCategory(artwork.categories, parts);
    };

    const { data: artworkData, isLoading: isLoadingArtworks, isFetching: isFetchingArtworks } = useQuery({
        queryKey: ["artwork", [collectionId], currentPage, location.search, sortCategory, sortDirection],
        queryFn: () =>
            getArtworksForPage(
                [collectionId as string],
                currentPage,
                pageSize,
                sortCategory || "createdAt", // sortBy
                sortDirection || "asc",      // sortOrder
                new URLSearchParams(location.search).get("searchText"),
                Object.fromEntries(new URLSearchParams(location.search).entries()),
                jwtToken
            ),
        enabled: !!collectionId,
        keepPreviousData: false,
    });

    const { data: collectionData } = useQuery({
        queryKey: [collectionId],
        enabled: !!collectionId,
        queryFn: () => getCollection(collectionId as string, jwtToken),
    });

    const { data: categoriesData } = useQuery({
        queryKey: ["allCategories", collectionId],
        queryFn: () => getAllCategories([collectionId as string], jwtToken),
        enabled: !!collectionId,
    });

    const { data: collectionOwnerData } = useQuery({
        queryKey: ["user", collectionId],
        queryFn: () => getUserById(collectionData.owner),
        enabled: !!collectionData?.owner,
    });

    type Option = { value: string; label: string };

    const categoryOptions: Option[] = [
        ...(categoriesData?.categories?.map((cat: string) => ({ value: cat, label: cat })) || []),
        { value: "createdAt", label: "Data utworzenia rekordu" },
        { value: "updatedAt", label: "Data ostatniej modyfikacji" },
    ];

    useEffect(() => {
        if (categoriesData?.categories?.length > 0 && !sortCategory) {
            setSortCategory(categoriesData.categories[0]);
        }
    }, [categoriesData, sortCategory]);

    useEffect(() => {
        if (categoriesData?.categories?.length && selectedDisplayCategories.length === 0) {
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

    const deselectAll = () => setSelectedArtworks({});

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
                setShowDeleteRecordsWarning(false);
                deselectAll();
            },
        }
    );

    if (!artworkData || !collectionData) return (
        <div data-testid="loading-page-container">
            <LoadingPage />
        </div>
    );

    return (
        <div data-testid="loaded-artwork-page-container">
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
                    {/* Nazwa + opis */}
                    <div 
                        data-testid="collection-name-and-description-container"
                        className="flex flex-row mb-4 mt-2 items-start w-full"
                    >
                        <div className="flex-1 min-w-0 pr-4">
                            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-1 break-words leading-tight">
                                {collectionData?.name}
                            </h2>
                            {(() => {
                                const desc = collectionData?.description || "";
                                const limit = 200;
                                const isLong = desc.length > limit;
                                const truncated = isLong && desc.slice(0, limit).lastIndexOf(" ") > 0
                                    ? desc.slice(0, desc.slice(0, limit).lastIndexOf(" "))
                                    : desc.slice(0, limit);
                                return (
                                    <div className="description-container">
                                        <p className="text-xl text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                                            {showFullDescription || !isLong ? desc : `${truncated}...`}
                                        </p>
                                        {isLong && (
                                            <button
                                                onClick={() => setShowFullDescription((s) => !s)}
                                                className="bg-transparent border-0 p-0 focus:outline-none inline-flex items-center mt-2"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    className={`w-5 h-5 text-gray-700 dark:text-gray-200 transform transition-transform duration-200 ${showFullDescription ? "-rotate-90" : "rotate-90"}`}
                                                >
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                );
                            })()}
                            <p className="text-l text-gray-800 dark:text-white break-words leading-relaxed font-normal mt-1">
                                {collectionData?.isPrivate ? "Kolekcja prywatna": "Kolekcja publiczna"} użytkownika <span className="font-medium">{`${collectionOwnerData.firstName}`}</span>
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                disabled={!jwtToken}
                                className={`text-sm font-semibold h-fit ml-4 flex items-center ${jwtToken ? "" : "bg-gray-100 hover:bg-gray-100"}`}
                                onClick={() => navigate(`/collections/${collectionId}/edit`, { state: { collectionId, mode: "edit", name: collectionData?.name, description: collectionData?.description, categories: collectionData?.categories, isCollectionPrivate: collectionData?.isPrivate, owner: collectionData?.owner } })}
                            >
                                <EditIcon /> <p className="ml-1">Edytuj</p>
                            </button>
                        </div>
                    </div>

                    {collectionId && <SearchComponent collectionIds={collectionId} mode="local" />}

                    {/* PRZYWRÓCONE PRZYCISKI - wygląd jak podałaś */}
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
                                    <PlusIcon/>
                                </span>
                                Nowy rekord
                            </button>
                            <button
                                className="flex items-center justify-center dark:text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium px-4 py-2 dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                type="button"
                                onClick={() => {navigate(
                                    `/collections/${collectionId}/export-data`,
                                    {
                                        state: {
                                            initialFilename: collectionData.name,
                                            initialArchiveFilename: collectionData.name,
                                            selectedArtworks: selectedArtworks,
                                            searchParams: searchParams.toString()
                                        }
                                    }
                                )}}
                            >
                                <span className="text-white dark:text-gray-400">
                                    <FileExportIcon/>
                                </span>
                                Eksportuj dane
                            </button>
                            <button
                                disabled={jwtToken ? false : true}
                                className={`flex items-center justify-center dark:text-white hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2 dark:focus:ring-primary-800 font-semibold text-white ${
                                    jwtToken
                                        ? "bg-gray-800 hover:bg-gray-700 border-gray-800"
                                        : "bg-gray-600 hover:bg-gray-600 border-gray-800"
                                }`}
                                type="button"
                                // onClick={() => setShowImportOptions((prev) => !prev)}
                                onClick={() => navigate(`/collections/${collectionId}/import-data`)}
                            >
                                <span className="text-white dark:text-gray-400">
                                    <FileImportIcon/>
                                </span>
                                Importuj dane
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

                    {/* Kategorie + sortowanie */}
                    <div 
                        className="flex w-full md:w-auto pt-4 flex-row items-center text-sm"
                    >
                        <p className="pr-2">Wyświetlane kategorie:</p>
                        <MultiselectDropdown
                            selectedValues={selectedDisplayCategories}
                            setSelectedValues={setSelectedDisplayCategories}
                            options={categoryOptions}
                            specialOptions={[{ value: "select_all", label: "Zaznacz wszystko" }, { value: "deselect_all", label: "Odznacz wszystko" }]}
                            placeholder="Wybierz kategorię"
                        />
                        <p className="pl-2 pr-2">Sortuj według:</p>
                        <SortOptions
                            options={categoryOptions}
                            sortCategory={sortCategory}
                            sortDirection={sortDirection}
                            onSelectCategory={setSortCategory}
                            onSelectDirection={setSortDirection}
                            setCurrentPage={setCurrentPage}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-row w-full justify-center">
                <div 
                    data-testid="artworks-listed"
                    className="w-full max-w-screen-xl lg:px-6"
                >
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
    );
};

export default ArtworksListPage;
