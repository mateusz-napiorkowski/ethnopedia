import { useMutation, useQuery, useQueryClient } from "react-query"
import { getArtworksForCollectionPage, deleteArtworks } from "../../api/artworks"
import { getCollection } from "../../api/collections"
import LoadingPage from "../../pages/LoadingPage"
import { useEffect, useMemo, useState} from "react"
import Navbar from "../navbar/Navbar"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import SearchComponent from "../search/SearchComponent"
import ImportOptions from "../ImportOptions"
import ExportOptions from "../ExportOptions"
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg"
import { ReactComponent as FileImportIcon } from "../../assets/icons/fileImport.svg"
import { ReactComponent as FileExportIcon } from "../../assets/icons/fileExport.svg"
import WarningPopup from "../../pages/collections/WarningPopup"
import SortOptions from "../SortOptions"
import Navigation from "../Navigation"
import Pagination from "../Pagination"
import { useUser } from "../../providers/UserProvider"
import { getAllCategories } from "../../api/categories"

const ArtworksList = ({pageSize = 10}) => {
    const [selectedArtworks, setSelectedArtworks] = useState<{ [key: string]: boolean }>({})
    const [showImportOptions, setShowImportOptions] = useState<boolean>(false)
    const [showExportOptions, setShowExportOptions] = useState<boolean>(false)
    const [showDeleteRecordsWarning, setShowDeleteRecordsWarning] = useState(false)
    const [sortOrder, setSortOrder] = useState<string>("Tytuł-asc")
    const { jwtToken } = useUser();
    const location = useLocation()
    useEffect(() => {

    }, [location]);

    const queryParameters = new URLSearchParams(window.location.search)
    const searchText = queryParameters.get("searchText")
    const [currentPage, setCurrentPage] = useState(1)

    const { collection } = useParams()
    const queryClient = useQueryClient()

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

    const { data: artworkData} = useQuery({
        queryKey: ["artwork", currentPage, searchText, queryParameters, location, sortOrder],
        queryFn: () => getArtworksForCollectionPage(collection as string, currentPage, pageSize, sortOrder, searchText, Object.fromEntries(queryParameters.entries())),
        enabled: !!collection,
    })

    const { data: collectionData } = useQuery({
        queryKey: [`${collection}`],
        enabled: !!collection,
        queryFn: () => getCollection(collection as string),
    })

    const { data: categoriesData } = useQuery({
        queryKey: ["allCategories"],
        queryFn: () => getAllCategories(collection as string),
        enabled: !!collection,
    })

    const sortOptions = categoriesData?.categories?.flatMap((category: string) => [
        { value: `${category}-asc`, label: `${category} rosnąco` },
        { value: `${category}-desc`, label: `${category} malejąco` },
    ])

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
        setSelectedArtworks((prev) => (
            { ...prev, [id]: !prev[id] }
        ))
    }

    const deselectAll = () => {
        setSelectedArtworks({})
    }

    const deleteArtworksMutation = useMutation(() => deleteArtworks(Object.keys(selectedArtworks).filter(id => selectedArtworks[id]), jwtToken as string), {
        onSuccess: () => {
            queryClient.invalidateQueries("artwork")
            setShowDeleteRecordsWarning(!showDeleteRecordsWarning)
            deselectAll()
        }
    })

    const navigate = useNavigate()

    if (!artworkData || !sortedArtworks || !collectionData) {
        return <div data-testid="loading-page-container">
                <LoadingPage />
            </div>
    } else {
        const allArtworks = sortedArtworks.map((artwork: any) => (
            <div className="px-4 max-w-screen-xl py-4 bg-white dark:bg-gray-800 shadow-md w-full rounded-lg mb-4
                border border-gray-300 dark:border-gray-600 cursor-pointer"
                 key={artwork._id}
                 data-testid={artwork._id}
                 onClick={() => navigate(`/collections/${collection}/artworks/${artwork._id}`)}>

                <div className="flex flex-row">
                        <span className="mr-4 flex items-center">
                            <input 
                                type="checkbox"
                                data-testid={`${artwork._id}-checkbox`}
                                checked={selectedArtworks[artwork._id!] || false}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => {
                                    handleCheck(artwork._id!)
                                }}
                            />
                        </span>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{findValue(artwork, "Tytuł")}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-1">{findValue(artwork, "Artyści")}</p>
                        <p className=" text-gray-500 dark:text-gray-300">{findValue(artwork, "Rok")}</p>
                    </div>
                </div>
            </div>
        ))

        return <><div data-testid="loaded-artwork-page-container">
            <Navbar />
            {showDeleteRecordsWarning &&
                <WarningPopup onClose={() => setShowDeleteRecordsWarning(false)}
                              deleteSelected={() => deleteArtworksMutation.mutate()}
                              warningMessage={"Czy na pewno chcesz usunąć zaznaczone rekordy?"} />}
            <div className="flex flex-col w-full items-center bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
                <div className="flex flex-col max-w-screen-xl w-full lg:px-6">
                    <Navigation />

                    <div data-testid="collection-name-and-description-container" className="flex flex-row mb-4 mt-2">
                        <div className="flex flex-col w-full">
                            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-1">
                                {collectionData?.name}
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300">
                                {collectionData?.description}
                            </p>
                        </div>
                    </div>

                    {collection && <SearchComponent collectionName={collection} />}
                    <div className="flex w-full md:w-auto">
                        <div className="flex flex-1 space-x-2">
                            <button
                                disabled={jwtToken ? false : true} 
                                className={`flex items-center justify-center dark:text-white
                                        hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2
                                        dark:focus:ring-primary-800 font-semibold text-white ${jwtToken ?
                                            "bg-gray-800 hover:bg-gray-700 border-gray-800" : "bg-gray-600 hover:bg-gray-600 border-gray-800"}`}
                                type="button"
                                onClick={() => navigate(`/collections/${collection}/create-artwork`)}
                            >
                                <span className="mr-2 text-white dark:text-gray-400">
                                    <PlusIcon />
                                </span>
                                Nowy rekord
                            </button>
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
                            <button
                                disabled={jwtToken ? false : true} 
                                className={`flex items-center justify-center dark:text-white
                                        hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2
                                        dark:focus:ring-primary-800 font-semibold text-white ${jwtToken ?
                                            "bg-gray-800 hover:bg-gray-700 border-gray-800" : "bg-gray-600 hover:bg-gray-600 border-gray-800"}`}                                type="button"
                                onClick={() => setShowImportOptions(showImportOptions => !showImportOptions)}
                            >
                                <span className="text-white dark:text-gray-400">
                                    <FileImportIcon />
                                </span>
                                Importuj plik
                            </button>
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
                            <button
                                disabled={jwtToken && !Object.values(selectedArtworks).every(value => value === false) ? false : true}
                                className={`flex items-center justify-center dark:text-white
                                        hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2
                                        dark:focus:ring-primary-800 font-semibold text-white ${jwtToken && !Object.values(selectedArtworks).every(value => value === false) ?
                                            "bg-gray-800 hover:bg-gray-700 border-gray-800" : "bg-gray-600 hover:bg-gray-600 border-gray-800"}`}               
                                type="button"
                                onClick={() => { setShowDeleteRecordsWarning(!showDeleteRecordsWarning)}}
                            >
                                Usuń zaznaczone
                            </button>
                        </div>
                    </div>
                    <div className="flex w-full md:w-auto pt-4 flex-col items-end">
                        {sortOptions && <SortOptions
                            options={sortOptions}
                            onSelect={(value) => setSortOrder(value)}
                            sortOrder={sortOrder}
                            setCurrentPage={setCurrentPage}
                        />}
                    </div>
                    {showImportOptions && <ImportOptions onClose={() => setShowImportOptions(false)} collectionData={collectionData}/>}
                    {showExportOptions && <ExportOptions selectedArtworks={selectedArtworks} onClose={() => setShowExportOptions(false)} />}
                </div>
            </div>

            <div className="flex flex-row">
                <div
                    className="flex mx-auto flex-1 justify-end w-full">
                </div>
                <div data-testid="artworks-listed" className="w-full flex-2 lg:px-6 max-w-screen-xl">
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
        </div></>
    }
}
export default ArtworksList