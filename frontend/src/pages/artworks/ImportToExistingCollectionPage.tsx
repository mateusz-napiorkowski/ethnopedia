import { ChangeEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from 'xlsx';
import Navbar from "../../components/navbar/Navbar"
import Navigation from "../../components/Navigation";
import { ReactComponent as DragAndDrop } from "../../assets/icons/dragAndDrop.svg"
import { ReactComponent as ExcelIcon } from "../../assets/icons/excel.svg"
import { useMutation, useQuery, useQueryClient } from "react-query";
import { importData } from "../../api/dataImport";
import { useUser } from "../../providers/UserProvider";
import { getAllCategories } from "../../api/categories";

const ImportToExistingCollectionPage = () => {
    const params = useParams()
    const collectionId = params.collection
    const nbsp = "\u00A0"
    const [fileLoaded, setFileLoaded] = useState(false)
    const [fileName, setFileName]: any = useState(false)
    const [fileData, setFileData]: any = useState(false)
    const [excelCollectionCategoryPairs, setExcelCollectionCategoryPairs]: any = useState([])
    const [fileNotLoadedError, setFileNotLoadedError] = useState(nbsp)
    const [circularReferences, setCircularReferences]= useState<Array<string>>([])
    const [serverError, setServerError] = useState(nbsp)
    let dataToSend: string[][] = []
    
    const navigate = useNavigate();
    const queryClient = useQueryClient()
    const { jwtToken } = useUser();
    
    const { data: categoriesData } = useQuery({
        queryKey: ["allCategories"],
        queryFn: () => getAllCategories([collectionId!]),
        enabled: !!collectionId,
    })

    const handleFileUpload = (event: any) => {
        const file = event.target.files[0]
        if(!file) return

        const reader = new FileReader();
        reader.onload = (evt: any) => {
            const bString = evt.target.result;
            const workbook = XLSX.read(bString, {type:'binary'});

            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];

            const parsedData: Array<Array<string>> = XLSX.utils.sheet_to_json(worksheet, {header:1, defval: "", raw: false});

            setFileLoaded(true)
            setFileName(file.name)
            setFileData(parsedData)
            setExcelCollectionCategoryPairs(parsedData[0]
                .map((headerCategory: string) => {
                    if(headerCategory === "_id")
                        return [headerCategory, "_id"]
                    if(headerCategory === "nazwy plików")
                        return [headerCategory, "nazwy plików"]
                    const matchedCollectionCategory = categoriesData.categories.find((collectionCategory: string) => collectionCategory.toLowerCase() === headerCategory.toLowerCase())
                    return [headerCategory, matchedCollectionCategory]
                })
            )
            setFileNotLoadedError(nbsp)
        };
        reader.readAsArrayBuffer(file)
    }

    const handleOptionChange = ((event: ChangeEvent<HTMLSelectElement>) => {
        const child = event.target.id.replace(/-collection-equivalent$/, "");
        const parent = event.target.value
        setExcelCollectionCategoryPairs((prevPairs: Array<Array<string>>) =>
            prevPairs.map(([prevChild, prevParent]) =>
                prevChild === child ? [prevChild, parent] : [prevChild, prevParent]
            )
        );
    })

    const showServerError = ((error: any) => {
        if(error.error == 'Incorrect request body provided')
            setServerError("Nieprawidłowe dane w treści żądania")
        else if(error.error == "Invalid data in the spreadsheet file" || error.error == "Invalid categories data")
            setServerError(error.cause)
        else
            setServerError("Import kolekcji nie powiódł się")
    })
    
    const handleCollectionSubmit = (event: any) => {
        event.preventDefault()
        setFileNotLoadedError(fileLoaded ? nbsp : "Nie wczytano pliku")
        const newHeader = excelCollectionCategoryPairs.map((pair: String[]) => pair[1])
        dataToSend = [newHeader, ...fileData.slice(1)]
        importDataMutation.mutate()
    }
    const importDataMutation = useMutation(() => importData(dataToSend, jwtToken, collectionId), {
            onSuccess: () => {
                queryClient.invalidateQueries("collection")
                navigate(`/collections/${collectionId}/artworks`)
            },
            onError: (error: any) => {
                showServerError(error.response.data)
            }
    })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Navbar />
            <div className="container mx-auto px-24 sm:px-32 md:px-40 lg:px-48 mt-4 max-w-screen-lg">
                <Navigation />
                <div className="mt-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-600 p-8">
                        <div className="flex items-start rounded-t border-b pb-2">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Importuj dane do kolekcji
                            </h3>
                        </div>
                        <form onSubmit={handleCollectionSubmit}>
                            <label
                                htmlFor="dropzone-file"
                                className="block text-sm font-bold text-gray-700 dark:text-white my-2"
                            >
                                Plik arkusza kalkulacyjnego/Plik CSV
                            </label>
                            <label
                                aria-label="upload"
                                htmlFor="dropzone-file"
                                className="flex flex-col items-start justify-start p-2 border-2 border-gray-200
                                            border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-600
                                            dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600
                                            dark:hover:border-gray-500 dark:hover:bg-gray-700"
                            >
                                {fileLoaded 
                                    ? <div className="flex flex-row items-center justify-center gap-4">
                                        <ExcelIcon className="w-12 h-12"/>
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                            {fileName}
                                        </p>
                                    </div>
                                    : <div className="flex flex-row items-center justify-center gap-4">
                                        <DragAndDrop className="w-12 h-12 text-gray-500 dark:text-gray-400"/>
                                        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                            Kliknij, aby przesłać plik
                                        </p>
                                    </div>
                                }
                                <input
                                    id="dropzone-file"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                            <p
                                className={`block text-sm ${fileNotLoadedError != nbsp ? "text-red-500 font-normal": "font-semibold text-gray-700 dark:text-white"} my-2`}
                            >
                            </p>

                            <hr />
                            {fileLoaded && ( <>
                                <p className="text-sm font-normal text-gray-700 dark:text-white my-2">W arkuszu wykryto kategorie widoczne w lewej kolumnie poniżej. Upewnij się czy odpowiadają one odpowiednim kategoriom kolekcji, do której dane mają zostać zaimportowane. Jeśli nie, to wprowadź poniżej odpowienie poprawki.</p>
                                <div className="flex flex-col items-center justify-center mt-4 mb-4 p-4 border-2 border-gray-200
                                    border-solid rounded-lg bg-gray-50 dark:hover:bg-gray-600
                                    dark:bg-gray-800 dark:border-gray-600
                                    dark:hover:border-gray-500">
                                    <div className="flex flex-row w-full items-start justify-start">
                                        <span className="block w-1/2 text-sm font-semibold text-gray-700 dark:text-white my-2">Kategorie wgranego pliku:</span>
                                        <span className="block w-1/2 text-sm font-semibold text-gray-700 dark:text-white my-2">Kategorie w kolekcji:</span>
                                    </div>
                                    {excelCollectionCategoryPairs
                                        .filter((pair: string) => pair[0] !== "_id" && pair[0] !== "nazwy_plików")
                                        .map((pair: any) => {
                                            const headerCategoryName = pair[0]
                                            const collectionCategoryName = pair[1]
                                            return (
                                                <div className="flex flex-row w-full items-start justify-start">
                                                    <label
                                                        htmlFor={`${headerCategoryName}-collection-equivalent`}
                                                        className="block w-1/2 text-sm font-semibold text-gray-700 dark:text-white my-2"
                                                    >
                                                        {headerCategoryName}
                                                    </label>
                                                    <select 
                                                        className="block w-1/2 text-sm font-semibold text-gray-700 dark:text-white my-2"
                                                        id={`${headerCategoryName}-collection-equivalent`}
                                                        aria-label={`${headerCategoryName}-collection-equivalent-select`}
                                                        onChange={handleOptionChange}   
                                                    >
                                                        {categoriesData.categories.map((optionValue: any) => {
                                                            return (<option
                                                                selected={optionValue == collectionCategoryName ? true : false}
                                                                value={optionValue}
                                                                >
                                                                    {optionValue}
                                                                </option>)
                                                        })}                                                            
                                                    </select>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </>)}
                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-4 py-2 mr-2"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    disabled={!fileLoaded || circularReferences.length != 0 ? true : false }
                                    className="px-4 py-2 color-button"
                                >
                                    Importuj dane
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImportToExistingCollectionPage