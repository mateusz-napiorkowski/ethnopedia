import CreateCollectionModal from "./CreateCollectionModal"
import SortOptions from "../../components/SortOptions"
import LoadingPage from "../LoadingPage"
import React, { useEffect, useState } from "react"
import WarningPopup from "./WarningPopup"
import { Collection } from "../../@types/Collection"
import { ReactComponent as FileExportIcon } from "../../assets/icons/fileExport.svg"
import { ReactComponent as FileImportIcon } from "../../assets/icons/fileImport.svg"
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg"
import { getAllCollections, useBatchDeleteCollectionMutation } from "../../api/collections"
import { useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "react-query"
import { useUser } from "../../providers/UserProvider"
import Pagination from "../../components/Pagination"
import { getXlsxWithCollectionData } from "../../api/dataExport"
import ImportOptions from "../../components/ImportOptions"

interface Option {
    value: string
    label: string
}

const CollectionsPage = () => {
    const { firstName } = useUser()
    const [showImportOptions, setShowImportOptions] = useState<boolean>(false)
    const [checkedCollections, setCheckedCollections] = useState<{ [key: string]: boolean }>({})
    const [showWarningPopup, setShowWarningPopup] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [exportErrorMessage, setExportErrorMessage] = useState("")
    const { jwtToken } = useUser();
    const pageSize = 10

    const queryClient = useQueryClient()

    const { mutate: batchDeleteMutation } = useBatchDeleteCollectionMutation()

    const[newCollection, setNewCollection]=useState<string>("");

    useEffect(() => {
        refetch()
// eslint-disable-next-line
    }, [newCollection]);

    const { data: fetchedData, refetch } = useQuery(
        ["collection", currentPage, pageSize, newCollection],
        () => getAllCollections(currentPage, pageSize),
        {
            keepPreviousData: true,
        },
    )
    const checkAll = () => {
        const newCheckedCollections = fetchedData?.collections?.reduce(
            (acc: any, collection: any) => ({
                ...acc,
                [collection.id!]: true,
            }),
            {},
        ) as Record<string, boolean>

        setCheckedCollections(newCheckedCollections)
    }

    const uncheckAll = () => {
        setCheckedCollections({})
    }

    const handleCheck = (id: string) => {
        setCheckedCollections((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    const deleteSelected = () => {
        const selectedIds = Object.keys(checkedCollections).filter(id => checkedCollections[id])
        if (selectedIds.length > 0) {
            batchDeleteMutation([selectedIds, jwtToken],
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries(["collection"])
                        setShowWarningPopup(!showWarningPopup)
                    },
                })
        }
    }

    const [showPopup, setShowNewCollectionPopup] = useState(false)
    const [sortOrder, setSortOrder] = useState("A-Z")

    const navigate = useNavigate()

    if (fetchedData === undefined) {
        return <LoadingPage />
    } else {
        const sortedCollections = fetchedData.collections ? [...fetchedData.collections].sort((a, b) => {
            if (sortOrder === "A-Z") {
                return a.name.localeCompare(b.name)
            } else {
                return b.name.localeCompare(a.name)
            }
        }) : []

        const allCollections = sortedCollections.map((collection: Collection) => (
            <div
                className="px-4 py-3 bg-white dark:bg-gray-800 shadow-md rounded-lg mb-4 border border-gray-300 dark:border-gray-600 cursor-pointer"
                key={collection.id}
                onClick={() => navigate(`/collections/${collection.name}/artworks`)}
            >

                <div className="flex flex-row justify-between">
                    <div className="flex">
                        <span className="mr-4 items-center flex">
                            <input
                                type="checkbox"
                                checked={checkedCollections[collection.id!] || false}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => {
                                    handleCheck(collection.id!)
                                }} />
                        </span>

                        <div className="flex-grow">
                            <h2 className="text-lg font-semibold">{collection.name}</h2>
                            <p className="text-gray-600 dark:text-gray-300">{collection.description}</p>
                        </div>
                    </div>

                    {/* <div className="flex flex-col"> */}
                        <h2 className="text-md min-w-fit items-center flex mx-2">
                        <span className="font-bold mr-1">
                            {collection.artworksCount ?? 0}
                        </span>
                            {
                                (collection.artworksCount ?? 0) === 1 ? "rekord" :
                                    (collection.artworksCount ?? 0) > 1 && (collection.artworksCount ?? 0) < 5 ? "rekordy" : "rekordów"
                            }
                        </h2>
                </div>
            </div>
        ))

        const sortOptions: Option[] = [
            { value: "A-Z", label: "Kolekcja rosnąco" },
            { value: "Z-A", label: "Kolekcja malejąco" },
        ]

        return <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 h-full">
            {showPopup && <CreateCollectionModal stateChanger={setNewCollection} onClose={() => setShowNewCollectionPopup(!showPopup)} />}
            {showWarningPopup && <WarningPopup onClose={() => setShowWarningPopup(!showWarningPopup)}
                                               deleteSelected={deleteSelected}
                                               warningMessage={"Czy na pewno chcesz usunąć zaznaczone kolekcje?"} />}
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
                            type="button"
                            className="flex items-center justify-center dark:text-white
                                    text-sm px-4 py-2 mb-2 hover:bg-gray-700 bg-gray-800 text-white border-gray-800
                                    font-semibold mr-2"
                            onClick={() => setShowNewCollectionPopup(!showPopup)}>
                            <span className="mr-2">
                                <PlusIcon />
                            </span>
                            Nowa kolekcja
                        </button>

                        <button
                            className="flex items-center justify-center dark:text-white
                                    text-sm px-4 py-2 mb-2 hover:bg-gray-700 bg-gray-800 text-white border-gray-800
                                    font-semibold mr-2"
                            type="button"
                            onClick={() => {
                                if(Object.keys(checkedCollections).length === 1) {
                                    for(const key in fetchedData.collections) {
                                        if(fetchedData.collections[key].id === Object.keys(checkedCollections)[0]) {
                                            getXlsxWithCollectionData(fetchedData.collections[key].name)
                                            setExportErrorMessage("")
                                        }
                                    }
                                } else {
                                    if(Object.keys(checkedCollections).length === 0){
                                        setExportErrorMessage("Najpierw należy zaznaczyć kolekcję do wyeksportowania.")
                                    } else {
                                        const checkedCollectionsNames = Object.keys(checkedCollections)
                                            .filter((checkedCollection) => checkedCollections[checkedCollection])
                                            .map((checkedCollection) => {
                                                const collection = fetchedData.collections.find((col) => col.id == checkedCollection);
                                                return collection!.name;
                                            })
                                        for(const collectionName of checkedCollectionsNames) {
                                            getXlsxWithCollectionData(collectionName)
                                        }
                                        setExportErrorMessage("")
                                    }
                                }
                            }}
                        >
                            <span className="text-white">
                                <FileExportIcon />
                            </span>
                            Eksportuj kolekcję
                        </button>
                        {
                            jwtToken && <button
                            className="flex items-center justify-center dark:text-white
                                    text-sm px-4 py-2 mb-2 hover:bg-gray-700 bg-gray-800 text-white border-gray-800
                                    font-semibold"
                            type="button"
                            onClick={() => setShowImportOptions(showImportOptions => !showImportOptions)}
                        >
                            <FileImportIcon />
                            Importuj kolekcję
                        </button>
                        }
                        {
                            !jwtToken && <button
                            className="flex items-center justify-center dark:text-white
                                    text-sm px-4 py-2 mb-2 hover:bg-gray-600 bg-gray-600 text-white border-gray-800
                                    font-semibold"
                            type="button" disabled={true} title={"Aby zaimportować kolecję musisz się zalogować."}
                            onClick={() => setShowImportOptions(showImportOptions => !showImportOptions)}
                        >
                            <FileImportIcon />
                            Importuj kolekcję
                        </button>
                        }
                        

                    </div>
                </div>
                {showImportOptions && <ImportOptions onClose={() => setShowImportOptions(false)} />}
                <div className="flex flex-row">
                    <div className="flex flex-1">
                        <button type="button" className="px-4 py-2 mb-2 bg-white"
                                onClick={checkAll}>
                            Zaznacz wszystkie
                        </button>

                        <button type="button" className="px-4 py-2 mb-2 ml-2 bg-white"
                                onClick={uncheckAll}>
                            Odznacz wszystkie
                        </button>

                        {jwtToken && <button type="button" className="px-4 py-2 mb-2 ml-2 bg-white"
                                onClick={() => {
                                    if (Object.keys(checkedCollections).length !== 0)
                                        setShowWarningPopup(!showWarningPopup)
                                }}>
                            Usuń zaznaczone
                        </button>}
                        {!jwtToken && <button type="button" disabled={true} title={"Aby usuwać kolecje musisz się zalogować."} className="px-4 py-2 mb-2 ml-2 bg-gray-100 hover:bg-gray-100"
                                onClick={() => {
                                    if (Object.keys(checkedCollections).length !== 0)
                                        setShowWarningPopup(!showWarningPopup)
                                }}>
                            Usuń zaznaczone
                        </button>}
                    </div>
                    <span className="mb-2">
                    <SortOptions
                        options={sortOptions}
                        onSelect={(value: string) => setSortOrder(value)}
                        sortOrder=""
                        setCurrentPage={() => setCurrentPage}
                    />
                    </span>
                </div>

                {allCollections}

                <div className="flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(fetchedData.total / pageSize)}
                        setCurrentPage={(page) => setCurrentPage(page)}
                    />
                </div>
            </div>
        </section>
    }
}
export default CollectionsPage