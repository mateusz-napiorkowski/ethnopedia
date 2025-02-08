import { useState } from "react"
import { ReactComponent as DragAndDrop } from "../assets/icons/dragAndDrop.svg"
import { ReactComponent as Close } from "../assets/icons/close.svg"
import * as XLSX from 'xlsx';
import { importData } from "../api/dataImport"
import { createCollection } from "../api/collections";
import { useUser } from "../providers/UserProvider";

type Props = {
    inCollectionPage: boolean
    onClose: () => void
}

const FileDropzone = ({ onClose, inCollectionPage }: Props) => {
    const [headerText, setHeaderText] = useState("Prześlij plik")
    const [filename, setFilename] = useState("")
    const [showDropzone, setShowDropzone] = useState(true)
    const [showImportOptions, setShowImportOptions] = useState(false)
    const [dataToSend, setDataToSend] = useState<any>()
    const [collectionName, setCollectionName] = useState("")
    const [description, setDescription] = useState("")
    const { jwtToken } = useUser();

    const handleSubmit = (event: any) => {
        importData(dataToSend, jwtToken, window.location.href.split("/")[window.location.href.split("/").findIndex((element) => element === "collections") + 1])
    }

    const handleNameChange = (event: any) => {
        setCollectionName(event.target.value)
    }

    const handleDescriptionChange = (event: any) => {
        setDescription(event.target.value)
    }

    const handleCollectionSubmit = (event: any) => {
        createCollection(collectionName, description, [], jwtToken) //TODO uwaga jeszcze nie zrobione - wstawia pustą strukturę
        importData(dataToSend, jwtToken, collectionName)
    }

    const handleFileUpload = (event: any) => {
        const file = event.target.files[0]
        var name = file.name;
        const reader = new FileReader();
        reader.onload = (evt: any) => {
            const bString = evt.target.result;
            const workbook = XLSX.read(bString, {type:'binary'});

            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];

            const parsedData = XLSX.utils.sheet_to_json(worksheet, {header:1, defval: ""});
            setDataToSend(parsedData)
        };
        reader.readAsBinaryString(file);

        if (file) {
            setHeaderText("Ustawienia importu metadanych z pliku .xlsx")
            setShowDropzone(false)
            setShowImportOptions(true)
            setFilename(name)
        }
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
                            {headerText}
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 text-sm
                                    dark:hover:bg-gray-600 dark:hover:text-white p-2 rounded-lg"
                            onClick={onClose}
                        >
                            <Close />
                        </button>

                    </div>
                    {showDropzone && <div className="w-full h-full flex items-center justify-center">
                        <label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300
                                        border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-600
                                        dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600
                                        dark:hover:border-gray-500 dark:hover:bg-gray-700">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <DragAndDrop />
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">Kliknij, aby przesłać</span> lub przeciągnij i upuść
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Pliki XLSX, XLS lub CSV</p>
                            </div>
                            <input
                                id="dropzone-file"
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div> }
                    { !inCollectionPage && showImportOptions && <div>
                        <form onSubmit={handleSubmit}>
                            <div className="flex py-2 px-4 text-base">
                                <p><span className="font-medium">Plik:</span> {filename}</p>
                            </div>
                            <div className="flex justify-end px-4 py-4">
                                    <input className="flex items-center justify-end dark:text-white
                                        hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium px-4 py-2
                                        dark:focus:ring-primary-800 font-semibold text-white bg-gray-800 hover:bg-gray-700 border-gray-800"
                                        type="submit" value="Importuj metadane" onClick={() => {}}
                                    ></input>
                            </div>
                        </form>
                    </div> }
                    { inCollectionPage && showImportOptions && <div>
                        <form onSubmit={handleCollectionSubmit} className="relative bg-white rounded-lg shadow-md dark:bg-gray-800 border
                            dark:border-gray-600">
                            <div className="px-4 pb-4">
                                <label htmlFor="name"
                                       className="text-sm font-bold text-gray-700 dark:text-white dark:border-gray-600
                                       block my-2">
                                    Nazwa kolekcji
                                </label>
                                <textarea
                                    id="name"
                                    name="name"
                                    value = {collectionName}
                                    onChange={handleNameChange}
                                    className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none"
                                />

                                <label htmlFor="description"
                                       className="text-sm font-bold text-gray-700 dark:text-white dark:border-gray-600
                                       block my-2">
                                    Opis kolekcji
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value = {description}
                                    onChange={handleDescriptionChange}
                                    className="w-full resize-y min-h-[12rem] px-4 py-2 border rounded-lg
                                    focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                />
                            </div>
                            <div className="flex justify-end px-4 pb-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 color-button"
                                    onClick={onClose}
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    className="ml-2 px-4 py-2 color-button"
                                >
                                    Utwórz
                                </button>
                            </div>
                        </form>
                    </div> }
                </div>
            </div>
        </div>
    </div>
}

export default FileDropzone
