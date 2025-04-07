import { useState } from "react"
import { ReactComponent as DragAndDrop } from "../assets/icons/dragAndDrop.svg"
import { ReactComponent as Close } from "../assets/icons/close.svg"
import * as XLSX from 'xlsx';
import { importData, importDataAsCollection } from "../api/dataImport"
import { useUser } from "../providers/UserProvider";
import { useMutation, useQueryClient } from "react-query";
import { Collection } from "../@types/Collection"

type Props = {
    onClose: () => void,
    collectionData?: Collection
}

const ImportOptions = ({ onClose, collectionData }: Props) => {
    const [showDropzoneForm, setShowDropzoneForm] = useState(true)
    const [showCollectionForm, setShowCollectionForm] = useState(false)
    const [filename, setFilename] = useState("")
    const [dataToSend, setDataToSend] = useState<Array<any>>([])
    const [collectionName, setCollectionName] = useState("")
    const [description, setDescription] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    const { jwtToken } = useUser();
    const queryClient = useQueryClient()

    const handleGoBack = () => {
        setShowDropzoneForm(true)
        setShowCollectionForm(false)
    }

    const handleGoForward = () => {
        setShowDropzoneForm(false)
        setShowCollectionForm(true)
    }

    const handleFileUpload = (event: any) => {
        const file = event.target.files[0]
        if(!file) return

        const reader = new FileReader();
        reader.onload = (evt: any) => {
            const bString = evt.target.result;
            const workbook = XLSX.read(bString, {type:'binary'});

            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];

            const parsedData = XLSX.utils.sheet_to_json(worksheet, {header:1, defval: "", raw: false});
            console.log(parsedData)
            setDataToSend(parsedData)
        };
        reader.readAsArrayBuffer(file)
        
        setFilename(file.name)
        setErrorMessage("")
    }

    const handleNameChange = (event: any) => {
        setCollectionName(event.target.value)
    }

    const handleDescriptionChange = (event: any) => {
        setDescription(event.target.value)
    }

    const handleSubmit = (event: any) => {
        event.preventDefault()
        importDataMutation.mutate()
    }

    const handleCollectionSubmit = (event: any) => {
        event.preventDefault()
        importCollectionMutation.mutate()
    }

    const importDataMutation = useMutation(() => importData(dataToSend, jwtToken, collectionData?.name), {
        onSuccess: () => {
            queryClient.invalidateQueries("artwork")
            onClose()
        },
        onError: (error: any) => {
            setErrorMessage(error.response.data.cause)
        }
    })

    const importCollectionMutation = useMutation(() => importDataAsCollection(dataToSend, collectionName, description, jwtToken), {
        onSuccess: () => {
            queryClient.invalidateQueries("collection")
            onClose()
        },
        onError: (error: any) => {
            setErrorMessage(error.response.data.cause)
        }
    })

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
                            Ustawienia importu metadanych z pliku .xlsx
                        </h3>
                        <button
                            aria-label="exit"
                            type="button"
                            className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 text-sm
                                    dark:hover:bg-gray-600 dark:hover:text-white p-2 rounded-lg"
                            onClick={onClose}
                        >
                            <Close />
                        </button>

                    </div>
                    {showDropzoneForm && <div className="w-full h-full flex flex-col items-start justify-center">
                        <label
                            aria-label="upload"
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
                                <p className="text-xs text-gray-500 dark:text-gray-400">Plik XLSX</p>
                            </div>
                            <input
                                id="dropzone-file"
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                        <div className="w-full flex flex-col">
                            <div className="flex p-4 text-base flex-col">
                                <p className="break-words"><span className="font-medium">Plik do przesłania:</span> {filename ? filename : "-"}</p>
                                <p className="break-words text-red-500">{errorMessage}</p>
                            </div>
                            <form onSubmit={handleSubmit} className="flex flex-col items-end p-4">
                                <div>
                                    <button
                                        className={`flex dark:text-white
                                            hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 px-4 py-2
                                            dark:focus:ring-primary-800 font-semibold text-white ${filename ?
                                                "bg-gray-800 hover:bg-gray-700 border-gray-800" : "bg-gray-600 hover:bg-gray-600 border-gray-800"}`}
                                        type={!collectionData ? "button" : "submit"}
                                        value={!collectionData ? "Dalej" : "Importuj metadane"}
                                        disabled={!filename ? true : false}
                                        onClick={!collectionData ? handleGoForward : undefined}
                                    >{!collectionData ? "Dalej" : "Importuj metadane"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div> }
                    {showCollectionForm && <div>
                        <form onSubmit={handleCollectionSubmit} className="relative bg-white rounded-lg shadow-md dark:bg-gray-800 border
                            dark:border-gray-600">
                            <div className="px-4 pb-4">
                                <label htmlFor="name"
                                       className="text-sm font-bold text-gray-700 dark:text-white dark:border-gray-600
                                       block my-2">
                                    Nazwa kolekcji
                                </label>
                                <textarea
                                    aria-label="name"
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
                                    aria-label="description"
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value = {description}
                                    onChange={handleDescriptionChange}
                                    className="w-full resize-y min-h-[12rem] px-4 py-2 border rounded-lg
                                    focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                                />
                                <p className="break-words text-red-500">{errorMessage}</p>
                            </div>
                            <div className="flex justify-end px-4 pb-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 color-button"
                                    onClick={handleGoBack}
                                >
                                    Wstecz
                                </button>
                                <button
                                    type="submit"
                                    className={`ml-2 px-4 py-2 color-button ${collectionName && description ? "" : "bg-blue-400"}`}
                                    disabled = {collectionName && description ? false : true}
                                >
                                    Importuj metadane
                                </button>
                            </div>
                        </form>
                    </div> }
                </div>
            </div>
        </div>
    </div>
}

export default ImportOptions
