import { useState } from "react"
import { ReactComponent as Close } from "../assets/icons/close.svg"
import { useParams } from "react-router-dom"
import { getXlsxWithArtworksData } from "../api/dataExport"
import { useQuery } from "react-query"
import { getAllCategories } from "../api/categories"

type Props = {
    onClose: () => void,
    keys: Array<string>
    selectedArtworks: { [key: string]: boolean }
}

const ExportOptions = (props: Props) => {
    const { collection } = useParams()
    const [selectedKeys, setSelectedKeys] = useState<any>([]);
    const [exportSelectedRecords, setExportSelectedRecords] = useState<boolean>(false)
    const [filename, setFilename] = useState(`${collection}.xlsx`);

    const { data: categoriesData } = useQuery({
        queryKey: ["allCategories"],
        queryFn: () => getAllCategories(collection as string),
        enabled: !!collection,
    })

    const handleCheckboxChange = (event: any) => {
        const key = event.target.value
        if(event.target.checked){
            setSelectedKeys([...selectedKeys,key])
        } else {
            setSelectedKeys(selectedKeys.filter((id: any) => id !== key))
        }
    }

    const handleExportSelectedRecordsChange = (event: any) => {
        const chosen = event.target.value
        if(chosen === "onlyChecked") {
            setExportSelectedRecords(true)
        } else {
            setExportSelectedRecords(false)
        }
    }

    // without this function excel columns are generated in the same order in which the checkboxes were checked
    const sortKeysInRightOrder = (allKeys: Array<string>) => {
        let keysInRightOrder: Array<string> = []
        allKeys.forEach((key) => {
            if(selectedKeys.includes(key)) {
                keysInRightOrder.push(key)
            }
        })
        return keysInRightOrder
    }

    function AllKeysWithCheckboxes(data: any) {
        const keys = data.keys.categories;
        const listItems = keys.map((key: string) =>
            <span>
                <input type="checkbox" id={key} name={key} value={key} onChange={event => handleCheckboxChange(event)} checked={selectedKeys.includes(key)}></input>
                <label> {key}</label>
            </span>
        );
        return (
          <>{listItems}</>
        );
      }

    return <div
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
                        <button type="button"
                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg
                                text-sm w-4 h-4 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600
                                dark:hover:text-white"
                                data-modal-hide="default-modal"
                        onClick={props.onClose}>
                            <Close />
                        </button>
                    </div>
                    <div>          
                        <p className="flex py-2 px-4 text-base font-medium">Kolumny do wyeksportowania:</p>     
                        <div className="flex flex-col items-start px-4 h-64 overflow-y-auto">   
                            <AllKeysWithCheckboxes keys={categoriesData}/>                                    
                        </div>
                        <div className="flex flex-row space-x-2 items-start px-4 py-4">
                            <input className="flex items-center justify-end dark:text-white text-xs
                                        hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium px-4 py-2
                                        dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                        type="button"
                                        id="checkAllKeys"
                                        name="checkAllKeys"
                                        value="Zaznacz wszystkie"
                                        onClick={() => {
                                            setSelectedKeys(categoriesData.categories)
                                        }}
                                        ></input>
                            <input className="flex items-center justify-end dark:text-white text-xs
                                        hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium px-4 py-2
                                        dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                        type="button"
                                        id="uncheckAllKeys"
                                        name="uncheckAllKeys"
                                        value="Odznacz wszystkie"
                                        onClick={() => {
                                            setSelectedKeys([])
                                        }}
                                        ></input>
                        </div>
                        <div className="flex flex-row space-x-2 text-sm px-4">
                                <span className="py-1">
                                    <input type="checkbox" id="onlyChecked" name="onlyChecked" value="onlyChecked" onChange={event => handleExportSelectedRecordsChange(event)} checked={exportSelectedRecords}></input>
                                    <label> Eksportuj metadane zaznaczonych utworów</label>
                                </span>
                                <span className="py-1">
                                    <input type="checkbox" id="exportAll" name="exportAll" value="exportAll" onChange={event => handleExportSelectedRecordsChange(event)} checked={!exportSelectedRecords}></input>
                                    <label> Eksportuj metadane wszystkich utworów</label>
                                </span>  
                        </div>
                        <div className="flex flex-row space-x-2 text-sm px-4 py-2">
                            <label className="px-1 py-1">Nazwa pliku:</label>
                            <input className="px-1 py-1" value={filename} onChange={e => setFilename(e.target.value)}></input>
                        </div>
                        <div className="flex justify-end px-4 py-4">  
                            <input className="flex items-center justify-end dark:text-white
                                        hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium px-4 py-2
                                        dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                        type="submit" value="Eksportuj metadane" onClick={() => {getXlsxWithArtworksData(collection as string, sortKeysInRightOrder(categoriesData.categories), props.selectedArtworks, exportSelectedRecords, filename)}}
                                        ></input>
                        </div>
                    </div>                   
                </div>
            </div>
        </div>
    </div>
}

export default ExportOptions
