import SortOptions from "../../components/SortOptions";
import LoadingPage from "../LoadingPage";
import React, { useEffect, useState } from "react";
import WarningPopup from "../WarningPopup";
import { Collection } from "../../@types/Collection";
import { ReactComponent as FileExportIcon } from "../../assets/icons/fileExport.svg";
import { ReactComponent as FileImportIcon } from "../../assets/icons/fileImport.svg";
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg";
import { getAllCollections, useBatchDeleteCollectionMutation } from "../../api/collections";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { useUser } from "../../providers/UserProvider";
import Pagination from "../../components/Pagination";
import { getXlsxWithCollectionData } from "../../api/dataExport";
import ImportOptions from "../../components/ImportOptions";
import Navbar from "../../components/navbar/Navbar";

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
    const pageSize = 10;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { mutate: batchDeleteMutation } = useBatchDeleteCollectionMutation();

    // Nowe stany dla sortowania
    const [sortCategory, setSortCategory] = useState<string>("name");
    const [sortDirection, setSortDirection] = useState<string>("asc");

    // Jeśli pojawiła się nowa kolekcja – odśwież dane
    const [newCollection] = useState<string>("");

    useEffect(() => {
        refetch();
        // eslint-disable-next-line
    }, [newCollection]);

    const { data: fetchedData, refetch } = useQuery(
        ["collection", currentPage, pageSize, newCollection],
        () => getAllCollections(currentPage, pageSize),
        {
            keepPreviousData: true,
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
        setCheckedCollections((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const deleteSelected = () => {
        const selectedIds = Object.keys(checkedCollections).filter(id => checkedCollections[id]);
        if (selectedIds.length > 0) {
            batchDeleteMutation([selectedIds, jwtToken], {
                onSuccess: () => {
                    queryClient.invalidateQueries(["collection"]);
                    setShowWarningPopup(!showWarningPopup);
                },
            });
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
            <div className="flex flex-col h-full">
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
                                        if (Object.keys(checkedCollections).length === 1) {
                                            for (const key in fetchedData.collections) {
                                                if (fetchedData.collections[key].id === Object.keys(checkedCollections)[0]) {
                                                    getXlsxWithCollectionData(fetchedData.collections[key].name);
                                                    setExportErrorMessage("");
                                                }
                                            }
                                        } else {
                                            if (Object.keys(checkedCollections).length === 0) {
                                                setExportErrorMessage("Najpierw należy zaznaczyć kolekcję do wyeksportowania.");
                                            } else {
                                                const checkedCollectionsNames = Object.keys(checkedCollections)
                                                    .filter((checkedCollection) => checkedCollections[checkedCollection])
                                                    .map((checkedCollection) => {
                                                        const collection = fetchedData.collections.find((col) => col.id === checkedCollection);
                                                        return collection!.name;
                                                    });
                                                for (const collectionName of checkedCollectionsNames) {
                                                    getXlsxWithCollectionData(collectionName);
                                                }
                                                setExportErrorMessage("");
                                            }
                                        }
                                    }}
                                >
                  <span className="text-white">
                    <FileExportIcon />
                  </span>
                                    Eksportuj kolekcję
                                </button>
                                {jwtToken && (
                                    <button
                                        className="flex items-center justify-center dark:text-white text-sm px-4 py-2 mb-2 hover:bg-gray-700 bg-gray-800 text-white border-gray-800 font-semibold"
                                        type="button"
                                        onClick={() => setShowImportOptions((prev) => !prev)}
                                    >
                                        <FileImportIcon />
                                        Importuj kolekcję
                                    </button>
                                )}
                                {!jwtToken && (
                                    <button
                                        className="flex items-center justify-center dark:text-white text-sm px-4 py-2 mb-2 hover:bg-gray-600 bg-gray-600 text-white border-gray-800 font-semibold"
                                        type="button"
                                        disabled={true}
                                        title={"Aby zaimportować kolekcję musisz się zalogować."}
                                        onClick={() => setShowImportOptions((prev) => !prev)}
                                    >
                                        <FileImportIcon />
                                        Importuj kolekcję
                                    </button>
                                )}
                            </div>
                        </div>
                        {showImportOptions && <ImportOptions onClose={() => setShowImportOptions(false)} />}
                        <div className="flex flex-row">
                            <div className="flex flex-1">
                                <button type="button" className="px-4 py-2 mb-2 bg-white" onClick={checkAll}>
                                    Zaznacz wszystkie
                                </button>
                                <button type="button" className="px-4 py-2 mb-2 ml-2 bg-white" onClick={uncheckAll}>
                                    Odznacz wszystkie
                                </button>
                                {jwtToken && (
                                    <button
                                        type="button"
                                        className="px-4 py-2 mb-2 ml-2 bg-white"
                                        onClick={() => {
                                            if (Object.keys(checkedCollections).length !== 0)
                                                setShowWarningPopup((prev) => !prev);
                                        }}
                                    >
                                        Usuń zaznaczone
                                    </button>
                                )}
                                {!jwtToken && (
                                    <button
                                        type="button"
                                        disabled={true}
                                        title={"Aby usuwać kolekcje musisz się zalogować."}
                                        className="px-4 py-2 mb-2 ml-2 bg-gray-100 hover:bg-gray-100"
                                        onClick={() => {
                                            if (Object.keys(checkedCollections).length !== 0)
                                                setShowWarningPopup((prev) => !prev);
                                        }}
                                    >
                                        Usuń zaznaczone
                                    </button>
                                )}
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
                                return (
                                    <div
                                        key={collection.id}
                                        className="relative group px-4 py-3 bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        onClick={() => navigate(`/collections/${collection.name}/artworks`, { state: { collectionId: collection.id } })}
                                    >
                                        {/* Checkbox – widoczny stale, jeśli zaznaczony, lub przy hover */}
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
                                        <div className="flex flex-col h-full">
                                            <h2 className="text-lg font-semibold mb-2">{collection.name}</h2>
                                            <p className="text-gray-600 dark:text-gray-300 flex-grow">{collection.description}</p>
                                            <div className="mt-2 text-md flex items-center">
                                                <span className="font-bold mr-1">{collection.artworksCount ?? 0}</span>
                                                {(collection.artworksCount ?? 0) === 1
                                                    ? "rekord"
                                                    : (collection.artworksCount ?? 0) > 1 && (collection.artworksCount ?? 0) < 5
                                                        ? "rekordy"
                                                        : "rekordów"}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-center mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(fetchedData.total / pageSize)}
                                setCurrentPage={(page) => setCurrentPage(page)}
                                onPageChange={uncheckAll}
                            />
                        </div>
                    </div>
                </section>
            </div>
        );
    }
};

export default CollectionsPage;
