import { useQuery, useQueryClient } from "react-query"
import { useBatchDeleteArtworkMutation } from "../../api/artworks"
import { getArtworksInCollection } from "../../api/collections"
import LoadingPage from "../../pages/LoadingPage"
import React, { useEffect, useMemo, useState} from "react"
import Navbar from "../navbar/Navbar"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import SearchComponent from "../search/SearchComponent"
import FileDropzone from "../FileDropzone"
import ExportOptions from "../ExportOptions"
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg"
import { ReactComponent as FileImportIcon } from "../../assets/icons/fileImport.svg"
import { ReactComponent as FileExportIcon } from "../../assets/icons/fileExport.svg"
import WarningPopup from "../../pages/collections/WarningPopup"
import SortOptions from "../SortOptions"
import { getCollection, useBatchDeleteCollectionMutation } from "../../api/collections"
import Navigation from "../Navigation"
import Pagination from "../Pagination"
import { useUser } from "../../providers/UserProvider"

const ArtworksList = () => {
    const [selectedArtworks, setSelectedArtworks] = useState<{ [key: string]: boolean }>({})
    const [showFileDropzone, setShowFileDropzone] = useState<boolean>(false)
    const [showExportOptions, setShowExportOptions] = useState<boolean>(false)
    const [showDeleteRecordsWarning, setShowDeleteRecordsWarning] = useState(false)
    const [showDeleteCollectionWarning, setShowDeleteCollectionWarning] = useState(false)
    const [sortOrder, setSortOrder] = useState<string>("newest-first")
    const [showEditCollection, setShowEditCollection] = useState<boolean>(false)
    const { jwtToken } = useUser();
    const location = useLocation()
    useEffect(() => {

    }, [location]);

    const queryParameters = new URLSearchParams(window.location.search)
    const searchText = queryParameters.get("searchText")
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    const { collection } = useParams()
    const queryClient = useQueryClient()
    const { mutate: batchDeleteMutation } = useBatchDeleteArtworkMutation()

    const findValue = (artwork: any, categoryName: string) => {
        let val = ""
        artwork.categories.forEach((category: any) => {
            if(category.name === categoryName) {
                val = category.values.toString()
                return
            }
        });
        return val
    }

    const sortOptions = [
        { value: "newest-first", label: "Od najnowszych" },
        { value: "oldest-first", label: "Od najstarszych" },
        { value: "title-asc", label: "Tytuł rosnąco" },
        { value: "title-desc", label: "Tytuł malejąco" },
    ]

    const { data: artworkData} = useQuery({
        queryKey: ["artwork", currentPage, searchText, queryParameters, location, sortOrder],
        queryFn: () => getArtworksInCollection(collection as string, currentPage, pageSize, sortOrder, searchText, Object.fromEntries(queryParameters.entries())),
        enabled: !!collection,
    })

    const { data: collectionData } = useQuery({
        queryKey: [`${collection}`],
        enabled: !!collection,
        queryFn: () => getCollection(collection as string),
    })

    const selectAll = () => {
        const newSelection = artworkData?.artworks.reduce((acc: any, artwork: any) => {
            acc[artwork._id] = true
            return acc
        }, {})
        setSelectedArtworks(newSelection)
    }

    const sortArtworks = (artworks: any[], order: string) => {
        return artworks
    }

    const sortedArtworks = useMemo(() => {
        return sortArtworks([...(artworkData?.artworks || [])], sortOrder)
    }, [artworkData, sortOrder])

    const handleCheck = (id: string) => {
        setSelectedArtworks((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    const deselectAll = () => {
        setSelectedArtworks({})
    }

    const deleteSelected = () => {
        const selectedIds = Object.keys(selectedArtworks).filter(id => selectedArtworks[id])

        if (selectedIds.length > 0) {
            batchDeleteMutation([selectedIds, jwtToken],
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries(["artwork"])
                        setShowDeleteRecordsWarning(!showDeleteRecordsWarning)
                    },
                })
        }
    }

    const deleteCollectionMutation = useBatchDeleteCollectionMutation()
    const deleteCollection = () => {
        if (collection) {
            deleteCollectionMutation.mutate([collection], {
                onSuccess: () => {
                    queryClient.invalidateQueries(["artwork"])
                    queryClient.invalidateQueries(["collection"])
                    setShowDeleteCollectionWarning(false)
                    navigate("/")
                },
                onError: (error: any) => {
                    console.error("Error deleting collection: ", error)
                },
            })
        }
    }

    const navigate = useNavigate()

    if (artworkData === undefined || sortedArtworks === undefined) {
        return <LoadingPage />
    } else {
        const allArtworks = sortedArtworks.map((artwork: any) => (
            <div className="px-4 max-w-screen-xl py-4 bg-white dark:bg-gray-800 shadow-md w-full rounded-lg mb-4
                border border-gray-300 dark:border-gray-600 cursor-pointer"
                 key={artwork._id}
                 onClick={() => navigate(`/collections/${collection}/artworks/${artwork._id}`)}>

                <div className="flex flex-row">
                        <span className="mr-4 flex items-center">
                            <input type="checkbox"
                                   checked={selectedArtworks[artwork._id!] || false}
                                   onClick={(e) => e.stopPropagation()}
                                   onChange={() => {
                                       handleCheck(artwork._id!)
                                   }} />
                        </span>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{findValue(artwork, "Tytuł")}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">{findValue(artwork, "Artyści")}</p>
                        <p className=" text-gray-500 dark:text-gray-300">{findValue(artwork, "Rok")}</p>
                    </div>
                </div>
            </div>
        ))

        return <>
            <Navbar />

            {/* {showFileDropzone && <FileDropzone onClose={() => setShowFileDropzone(false)} />}
            {showExportOptions && <ExportOptions onClose={() => setShowExportOptions(false)} />} */}
            {/*{showCreateArtwork && <CreateArtwork onClose={() => setShowCreateArtwork(false)} />}*/}
            {showDeleteRecordsWarning &&
                <WarningPopup onClose={() => setShowDeleteRecordsWarning(false)}
                              deleteSelected={deleteSelected}
                              warningMessage={"Czy na pewno chcesz usunąć zaznaczone rekordy?"} />}

            {showDeleteCollectionWarning &&
                <WarningPopup onClose={() => setShowDeleteCollectionWarning(false)}
                              deleteSelected={deleteCollection}
                              warningMessage={"Czy na pewno chcesz usunąć zaznaczoną kolekcję?"} />}
            <div className="flex flex-col w-full items-center bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
                <div className="flex flex-col max-w-screen-xl w-full lg:px-6">
                    <Navigation />

                    <div className="flex flex-row mb-4 mt-2">
                        <div className="flex flex-col w-full">
                            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-1">
                                {collectionData?.name}
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300">
                                {collectionData?.description}
                            </p>
                        </div>

                        {/* <div className="flex items-center">
                            <button className="text-lg mr-2 h-fit font-semibold ml-4"
                                    onClick={() => setShowEditCollection(true)}>
                                Edytuj
                            </button>
                        </div>

                        <div className="flex items-center">
                            <button
                                className="text-lg font-semibold h-fit border-red-700 text-red-700 bg-red-50 hover:bg-white">
                                <span className="flex-row flex items-center"
                                      onClick={() => setShowDeleteCollectionWarning(true)}>
                                    <p>Usuń</p>
                                </span>
                            </button>
                        </div> */}

                    </div>

                    {collection && <SearchComponent collectionName={collection} />}

                    <div className="flex w-full md:w-auto">
                        <div className="flex flex-1 space-x-2">
                            {jwtToken && <button className="flex items-center justify-center dark:text-white
                            hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2
                            dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                                 type="button"
                                                 onClick={() => navigate(`/collections/${collection}/create-artwork`)}>
                                    <span className="mr-2 text-white dark:text-gray-400">
                                        <PlusIcon />
                                    </span>
                                Nowy rekord
                            </button>}
                            {!jwtToken && <button disabled={true} title={"Aby dodać rekord musisz się zalogować."} className="flex items-center justify-center dark:text-white
                            hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2
                            dark:focus:ring-primary-800 font-semibold text-white hover:bg-gray-600 bg-gray-600 border-gray-800"
                                                  type="button"
                                                  onClick={() => navigate(`/collections/${collection}/create-artwork`)}>
                                    <span className="mr-2 text-white dark:text-gray-400">
                                        <PlusIcon />
                                    </span>
                                Nowy rekord
                            </button>}
                            <button className="flex items-center justify-center dark:text-white
                                            hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium px-4 py-2
                                            dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                    type="button"
                                    onClick={async () => {
                                        setShowExportOptions(showExportOptions => !showExportOptions)
                                    }}
                            >
                                <span className="text-white dark:text-gray-400">
                                    <FileExportIcon />
                                </span>
                                Eksportuj plik
                            </button>
                            {jwtToken && <button className="flex items-center justify-center dark:text-white
                                        hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2
                                        dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                                 type="button"
                                                 onClick={() => setShowFileDropzone(showFileDropzone => !showFileDropzone)}
                            >
                                <span className="text-white dark:text-gray-400">
                                    <FileImportIcon />
                                </span>
                                Importuj plik
                            </button>}
                            {!jwtToken && <button disabled={true} title={"Aby zaimportować plik musisz się zalogować."} className="flex items-center justify-center dark:text-white
                                        hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2
                                        dark:focus:ring-primary-800 font-semibold text-white bg-gray-600 hover:bg-gray-600 border-gray-800"
                                                  type="button"
                                                  onClick={() => setShowFileDropzone(showFileDropzone => !showFileDropzone)}
                            >
                                <span className="text-white dark:text-gray-400">
                                    <FileImportIcon />
                                </span>
                                Importuj plik
                            </button>}

                            <button className="flex items-center justify-center dark:text-white
                                        hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2
                                        dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                    type="button"
                                    onClick={selectAll}
                            >
                                Zaznacz wszystkie
                            </button>

                            <button className="flex items-center justify-center dark:text-white
                                        hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2
                                        dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                    type="button"
                                    onClick={deselectAll}
                            >
                                Odznacz wszystkie
                            </button>

                            {jwtToken && <button className="flex items-center justify-center dark:text-white
                                        hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2
                                        dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                                 type="button"
                                                 onClick={() => {
                                                     if (Object.keys(selectedArtworks).length !== 0)
                                                         setShowDeleteRecordsWarning(!showDeleteRecordsWarning)
                                                 }}
                            >
                                Usuń zaznaczone
                            </button>}
                            {!jwtToken && <button disabled={true} title={"Aby usuwać rekordy musisz się zalogować."} className="flex items-center justify-center dark:text-white
                                        hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2
                                        dark:focus:ring-primary-800 font-semibold text-white bg-gray-600 hover:bg-gray-600 border-gray-800"
                                                  type="button"
                                                  onClick={() => {
                                                      if (Object.keys(selectedArtworks).length !== 0)
                                                          setShowDeleteRecordsWarning(!showDeleteRecordsWarning)
                                                  }}
                            >
                                Usuń zaznaczone
                            </button>}
                        </div>

                        <span className="">
                                <SortOptions
                                    options={sortOptions}
                                    onSelect={(value) => setSortOrder(value)}
                                />
                            </span>
                    </div>
                    {showFileDropzone && <FileDropzone onClose={() => setShowFileDropzone(false)} inCollectionPage={false}/>}
                    {showExportOptions && <ExportOptions selectedArtworks={selectedArtworks} onClose={() => setShowExportOptions(false)} />}
                </div>
            </div>

            <div className="flex flex-row">
                <div
                    className="flex mx-auto flex-1 justify-end w-full">
                    {/* <FilterDropdown /> */}
                </div>
                <div className="w-full flex-2 lg:px-6 max-w-screen-xl">
                    {allArtworks}
                </div>
                <div className="mx-auto w-full flex-1">
                </div>
            </div>
            <div className="flex justify-center mb-2">
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(artworkData.total / pageSize)}
                    setCurrentPage={(page) => setCurrentPage(page)}
                />
            </div>
        </>
    }
}
export default ArtworksList