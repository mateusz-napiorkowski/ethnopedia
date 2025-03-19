import { useState, ChangeEvent } from "react"
import { ReactComponent as Close } from "../assets/icons/close.svg"
import { useLocation, useParams } from "react-router-dom"
import { getXlsxWithArtworksData } from "../api/dataExport"
import { useQuery } from "react-query"
import { getAllCategories } from "../api/categories"
import LoadingPage from "../pages/LoadingPage"

type Props = {
    onClose: () => void,
    selectedArtworks: { [key: string]: boolean }
}

enum ExportExtent {
    all = "all",
    selected = "selected",
    searchResult = "searchResult"
}

const ExportOptions = ({onClose, selectedArtworks}: Props) => {
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const { collection } = useParams()
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [exportExtent, setExportExtent] = useState<ExportExtent>(ExportExtent.all)
    const [filename, setFilename] = useState(`${collection}.xlsx`);

    const { data: categoriesData } = useQuery({
        queryKey: ["allCategories"],
        queryFn: () => getAllCategories(collection as string),
        enabled: !!collection,
    })

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        setSelectedKeys((prevSelected) => {
            const updatedKeys = checked 
                ? [...prevSelected, value] 
                : prevSelected.filter((key) => key !== value);
            
            return categoriesData.categories.filter((key: string) => updatedKeys.includes(key));
        });
    }

    const handleExportExtentRadioInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        if((event.target.value) === "onlyChecked") {
            setExportExtent(ExportExtent.selected)
        } else if ((event.target.value) === "onlySearchResult") {
            setExportExtent(ExportExtent.searchResult)
        } else {
            setExportExtent(ExportExtent.all)
        }
    }

    const handleSelectAll = () => setSelectedKeys(categoriesData.categories);
    const handleDeselectAll = () => setSelectedKeys([]);

    const handleFilenameChange = (event: ChangeEvent<HTMLInputElement>) => setFilename(event.target.value);

    if(!categoriesData)
        return (
            <div data-testid="loading-page-container">
                <LoadingPage/>
            </div>
        )

    return (
        <div data-testid="export-options-container"
            id="default-modal"
            aria-hidden="true"
            className="fixed top-0 left-0 flex items-center justify-center w-full h-full z-50 "
        >
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center ">
                <div className="fixed inset-0 bg-black opacity-50" />
                <div className="relative w-full max-w-2xl max-h-full ">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-800 border dark:border-gray-600">
                        <div className="flex items-start justify-between p-4 rounded-t">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Ustawienia eksportu metadanych do pliku .xlsx
                            </h3>
                            <button
                                type="button"
                                aria-label="exit"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg
                                text-sm w-4 h-4 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600
                                dark:hover:text-white"
                                data-modal-hide="default-modal"
                                onClick={onClose}
                            >
                                <Close />
                            </button>
                        </div>
                        <div>          
                            <p className="flex py-2 px-4 text-base font-medium">Kolumny do wyeksportowania:</p>     
                            <ul className="flex flex-col items-start px-4 h-64 overflow-y-auto">   
                                {categoriesData.categories.map((key: string) =>
                                    <li key={key}>
                                        <input
                                            type="checkbox"
                                            id={key}
                                            name={key}
                                            value={key}
                                            onChange={event => handleCheckboxChange(event)}
                                            checked={selectedKeys.includes(key)}
                                        />
                                        <label>{key}</label>
                                    </li>
                                )}                 
                            </ul>
                            <div className="flex flex-row space-x-2 items-start px-4 py-4">
                                <button 
                                    className="flex items-center justify-end dark:text-white text-xs
                                    hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium px-4 py-2
                                    dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                    type="button"
                                    onClick={handleSelectAll}
                                >
                                    Zaznacz wszystkie
                                </button>
                                <button
                                    className="flex items-center justify-end dark:text-white text-xs
                                    hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium px-4 py-2
                                    dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                    type="button"
                                    onClick={handleDeselectAll}
                                >
                                    Odznacz wszystkie
                                </button>
                            </div>
                            <div className="flex flex-row space-x-2 text-sm px-4">
                                    <span className="py-1">
                                        <input
                                            type="radio"
                                            id="onlyChecked"
                                            name="onlyChecked"
                                            value="onlyChecked"
                                            onChange={handleExportExtentRadioInputChange}
                                            checked={exportExtent === ExportExtent.selected}/>
                                        <label> Eksportuj metadane zaznaczonych utworów</label>
                                    </span>
                                    <span className="py-1">
                                        <input
                                            type="radio"
                                            id="onlySearchResult"
                                            name="onlySearchResult"
                                            value="onlySearchResult"
                                            onChange={handleExportExtentRadioInputChange}
                                            checked={exportExtent === ExportExtent.searchResult}/>
                                        <label> Eksportuj wyniki wyszukiwania</label>
                                    </span>
                                    <span className="py-1">
                                        <input 
                                            type="radio"
                                            id="exportAll"
                                            name="exportAll"
                                            value="exportAll"
                                            onChange={handleExportExtentRadioInputChange}
                                            checked={exportExtent === ExportExtent.all}/>
                                        <label> Eksportuj metadane wszystkich utworów</label>
                                    </span>
                            </div>
                            <div className="flex flex-row space-x-2 text-sm px-4 py-2">
                                <label className="px-1 py-1">
                                    Nazwa pliku:
                                </label>
                                <input
                                    className="px-1 py-1"
                                    value={filename}
                                    onChange={handleFilenameChange}/>
                            </div>
                            <div className="flex justify-end px-4 py-4">  
                                <button
                                    className="flex items-center justify-end dark:text-white
                                    hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium px-4 py-2
                                    dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                    type="submit"
                                    onClick={() => getXlsxWithArtworksData(
                                        collection as string, 
                                        selectedKeys,
                                        exportExtent,
                                        selectedArtworks,
                                        searchParams,      
                                        filename)}
                                >
                                    Eksportuj metadane
                                </button>
                            </div>
                        </div>                   
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ExportOptions
