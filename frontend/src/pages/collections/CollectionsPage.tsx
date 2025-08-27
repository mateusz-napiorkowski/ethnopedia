import SortOptions from "../../components/SortOptions";
import LoadingPage from "../LoadingPage";
import React, { useEffect, useState } from "react";
import WarningPopup from "../WarningPopup";
import { Collection } from "../../@types/Collection";
import { ReactComponent as FileExportIcon } from "../../assets/icons/fileExport.svg";
import { ReactComponent as FileImportIcon } from "../../assets/icons/fileImport.svg";
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg";
import { deleteCollections, getAllCollections } from "../../api/collections";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useUser } from "../../providers/UserProvider";
import Pagination from "../../components/Pagination";
import { getXlsxWithCollectionData } from "../../api/dataExport";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/Footer";

interface Option {
    value: string;
    label: string;
}

const CollectionsPage = () => {
    const { firstName, jwtToken } = useUser();
    const [showImportOptions, setShowImportOptions] = useState<boolean>(false);
    const [checkedCollections, setCheckedCollections] = useState<{ [key: string]: boolean }>({});
    const [showWarningPopup, setShowWarningPopup] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [exportErrorMessage, setExportErrorMessage] = useState("");
    const pageSize = 9;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const selectedIds = Object.keys(checkedCollections).filter(id => checkedCollections[id]);

    const deleteCollectionMutation = useMutation(() => deleteCollections(selectedIds, jwtToken), {
        onSuccess: () => {
            queryClient.invalidateQueries(["collection"]);
            setShowWarningPopup(!showWarningPopup);
        }
    })

    // Nowe stany dla sortowania
    const [sortCategory, setSortCategory] = useState<string>("name");
    const [sortDirection, setSortDirection] = useState<string>("asc");

    // Jeśli pojawiła się nowa kolekcja – odśwież dane
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

    const checkAll = () => {
        const newCheckedCollections = fetchedData?.collections?.reduce(
            (acc: any, collection: any) => ({
                ...acc,
                [collection.id!]: true,
            }),
            {}
        ) as Record<string, boolean>;
        setCheckedCollections(newCheckedCollections);
    };

    const uncheckAll = () => {
        setCheckedCollections({});
    };

    const handleCheck = (id: string) => {
        setCheckedCollections((prev) => {
            const newSelection = { ...prev };
            if (newSelection[id]) {
                delete newSelection[id];
            } else {
                newSelection[id] = true;
            }
            return newSelection;
        });
    };

    const deleteSelected = () => {
        if (selectedIds.length > 0) {
            deleteCollectionMutation.mutate()
        }
    };

    if (fetchedData === undefined) {
        return <LoadingPage />;
    } else {
        // Sortowanie kolekcji – sortujemy wyłącznie po nazwie, zgodnie ze stanem sortDirection
        const sortedCollections = fetchedData.collections
            ? [...fetchedData.collections].sort((a, b) => {
                if (sortDirection === "asc") {
                    return a.name.localeCompare(b.name);
                } else {
                    return b.name.localeCompare(a.name);
                }
            })
            : [];

        // Opcje dla sortowania kategorii – tutaj mamy tylko jedną opcję (sortuj po nazwie)
        const categorySortOptions: Option[] = [
            { value: "name", label: "Nazwa kolekcji" }
        ];

        return (
            <div className="flex flex-col h-full" data-testid="collections-page-container">
                {/* Navbar */}
                <Navbar />
                <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 h-full">
                    {showWarningPopup && (
                        <WarningPopup
                            onClose={() => setShowWarningPopup(!showWarningPopup)}
                            deleteSelected={deleteSelected}
                            warningMessage={"Czy na pewno chcesz usunąć zaznaczone kolekcje?"}
                        />
                    )}
                    <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
                        <div className="flex justify-end text-red-500 ml-2 px-1 h-5">
                            <p>{exportErrorMessage}</p>
                        </div>
                        <div className="flex flex-row">
                            <div className="w-full">
                                <h1 className="font-bold text-4xl mb-4">
                                    Witaj{firstName ? ` ${firstName}` : ""}!
                                </h1>
                                <h2 className="mb-2 text-lg">
                                    Twoje kolekcje:
                                </h2>
                            </div>

                            <div className="flex items-center justify-end w-full">
                                <button
                                    disabled={!jwtToken}
                                    type="button"
                                    className={`flex items-center justify-center dark:text-white text-sm px-4 py-2 mb-2
                    text-white border-gray-800 font-semibold mr-2 ${
                                        jwtToken
                                            ? "bg-gray-800 hover:bg-gray-700"
                                            : "bg-gray-600 hover:bg-gray-600"
                                    }`}
                                    onClick={() => navigate("/create-collection")}
                                >
                  <span className="mr-2">
                    <PlusIcon />
                  </span>
                                    Nowa kolekcja
                                </button>
                                <button
                                    className="flex items-center justify-center dark:text-white text-sm px-4 py-2 mb-2 hover:bg-gray-700 bg-gray-800 text-white border-gray-800 font-semibold mr-2"
                                    type="button"
                                    onClick={() => {
                                        if(Object.keys(checkedCollections).length === 0) {
                                            setExportErrorMessage("Najpierw należy zaznaczyć kolekcję do wyeksportowania.");
                                            return
                                        }
                                        const checkedCollectionsIds = Object.keys(checkedCollections)
                                            .filter((checkedCollection) => checkedCollections[checkedCollection])
                                            .map((checkedCollection) => {
                                                const collection = fetchedData.collections.find((col) => col.id === checkedCollection);
                                                return collection!.id;
                                            });
                                        for (const collectionId of checkedCollectionsIds) {
                                            getXlsxWithCollectionData(collectionId);
                                        }
                                        setExportErrorMessage("");
                                    }}
                                >
                  <span className="text-white">
                    <FileExportIcon />
                  </span>
                                    Eksportuj kolekcje
                                </button>
                                <button
                                    className="flex items-center justify-center dark:text-white text-sm px-4 py-2 mb-2 hover:bg-gray-700 bg-gray-800 text-white border-gray-800 font-semibold"
                                    type="button"
                                    onClick={() => navigate("/import-collection")}
                                >
                                    <FileImportIcon />
                                    Importuj kolekcję
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <div className="flex flex-1">
                                <button type="button" className="px-4 py-2 mb-2 bg-white" onClick={checkAll}>
                                    Zaznacz wszystkie
                                </button>
                                <button type="button" className="px-4 py-2 mb-2 ml-2 bg-white" onClick={uncheckAll}>
                                    Odznacz wszystkie
                                </button>
                                <button type="button"
                                    disabled={Object.keys(checkedCollections).length === 0}
                                    className={`px-4 py-2 mb-2 ml-2 ${Object.keys(checkedCollections).length === 0 ? "bg-gray-100 hover:bg-gray-100" : "bg-white"}`}
                                    onClick={() => setShowWarningPopup((prev) => !prev)}
                                >
                                    Usuń zaznaczone
                                </button>
                            </div>
                            <span className="mb-2">
                                <SortOptions
                                    options={categorySortOptions}
                                    sortCategory={sortCategory}
                                    sortDirection={sortDirection}
                                    onSelectCategory={setSortCategory}
                                    onSelectDirection={setSortDirection}
                                    setCurrentPage={setCurrentPage}
                                />
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {sortedCollections.map((collection: Collection) => {
                                const isChecked = checkedCollections[collection.id!] || false;

                                // przycinamy nazwy i opisy jeśli są za długie
                                const maxNameLength = 65;
                                const maxDescLength = 120;
                                const name =
                                    collection.name.length > maxNameLength
                                        ? collection.name.slice(0, maxNameLength) + "..."
                                        : collection.name;
                                const description =
                                    collection.description && collection.description.length > maxDescLength
                                        ? collection.description.slice(0, maxDescLength) + "..."
                                        : collection.description;

                                return (
                                    <div
                                        key={collection.id}
                                        aria-label={collection.id}
                                        className="relative group px-4 py-3 bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        title={collection.name}
                                        onClick={() =>
                                            navigate(`/collections/${collection.id}/artworks`, {
                                                state: { collectionId: collection.id },
                                            })
                                        }
                                    >
                                        {/* Checkbox */}
                                        <div
                                            className={`absolute top-2 right-2 transition-opacity ${
                                                isChecked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={() => handleCheck(collection.id!)}
                                                className="cursor-pointer"
                                            />
                                        </div>

                                        {/* Zawartość */}
                                        <div className="flex flex-col h-full pr-2"> {/* <-- pr-2 = odstęp od checkboxa */}
                                            <h2 className="text-lg font-semibold mb-2 break-words">{name}</h2>
                                            <p className="text-gray-600 dark:text-gray-300 flex-grow break-words">
                                                {description}
                                            </p>
                                            <div className="mt-2 text-md flex items-center">
          <span className="font-bold mr-1">
            {collection.artworksCount ?? 0}
          </span>
                                                {(collection.artworksCount ?? 0) === 1
                                                    ? "rekord"
                                                    : (collection.artworksCount ?? 0) > 1 &&
                                                    (collection.artworksCount ?? 0) < 5
                                                        ? "rekordy"
                                                        : "rekordów"}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-center mt-4 mb-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(fetchedData.total / pageSize)}
                                setCurrentPage={(page) => setCurrentPage(page)}
                                onPageChange={uncheckAll}
                            />
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        );
    }
};

export default CollectionsPage;
