import { ChangeEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from 'xlsx';
import Navbar from "../../components/navbar/Navbar"
import Navigation from "../../components/Navigation";
import { ReactComponent as DragAndDrop } from "../../assets/icons/dragAndDrop.svg"
import { ReactComponent as ExcelIcon } from "../../assets/icons/excel.svg"
import { ReactComponent as CSVIcon } from "../../assets/icons/csv.svg"
import { ReactComponent as Close } from "../../assets/icons/close.svg";
import { ReactComponent as UnknownFile } from "../../assets/icons/unknown-file.svg";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { importData } from "../../api/dataImport";
import { useUser } from "../../providers/UserProvider";
import { getAllCategories } from "../../api/categories";

const ImportToExistingCollectionPage = () => {
    const params = useParams()
    const collectionId = params.collection
    const nbsp = "\u00A0"
    const [fileLoaded, setFileLoaded] = useState(false)
    const [fileName, setFileName] = useState<string>("")
    const [fileData, setFileData]: any = useState(false)
    const [excelCollectionCategoryPairs, setExcelCollectionCategoryPairs]: any = useState([])
    const [fileNotLoadedError, setFileNotLoadedError] = useState(nbsp)
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

    const removeEmptyColumns = (data: string[][]): string[][] => {
        if (data.length === 0) return data;

        const maxColumns = Math.max(...data.map(row => row.length));

        const columnsToKeep = Array.from({ length: maxColumns }, (_, i) =>
            data.some(row => row[i] !== undefined && row[i] !== "")
        );

        return data.map(row =>
            row.filter((_, i) => columnsToKeep[i])
        );
    };

    const handleFileUpload = (event: any) => {
        const file = event.target.files?.[0]
        if(!file) return

        const reader = new FileReader();
        reader.onload = (evt: any) => {
            const bString = evt.target.result;
            const workbook = XLSX.read(bString, {type:'binary'});

            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];

            const parsedData: Array<Array<string>> = removeEmptyColumns(
                XLSX.utils.sheet_to_json(worksheet, {header:1, defval: "", raw: false})
            );

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
        event.target.value = "";
    }

    const handleFileRemove = (event: any) => {
        event.preventDefault()
        setFileLoaded(false)
        setFileName("")
        setFileData(false)
        setExcelCollectionCategoryPairs([])
    };

    const handleOptionChange = ((event: ChangeEvent<HTMLSelectElement>) => {
        const fileCategory = event.target.id.replace(/-collection-equivalent$/, "");
        const collectionCategory = event.target.value
        setExcelCollectionCategoryPairs((prevPairs: Array<Array<string>>) =>
            prevPairs.map(([prevFileCategory, prevCollectionCategory]) =>
                prevFileCategory === fileCategory ? [prevFileCategory, collectionCategory] : [prevFileCategory, prevCollectionCategory]
            )
        );
    })

    const showServerError = ((error: any) => {
        if(error.error == 'Incorrect request body provided')
            setServerError("Import kolekcji nie powiódł się z powodu nieprawidłowej treści żądania. Upewnij się, że plik arkusza kalkulacyjnego zawiera przynajmniej jeden rekord oprócz nagłówka.")
        else if(error.error == "Invalid data in the spreadsheet file")
            setServerError("Nieprawidłowe dane w pliku arkusza kalkulacyjnego. Upewnij się, że kategorie zostały poprawnie wczytane, i że powyższy formularz został wypełniony prawidłowo.")
        else if(error.error == `Collection not found`)
            setServerError("Nie znaleziono kolekcji, do której dane miały zostać wprowadzone.")
        else
            setServerError("Błąd serwera. Import kolekcji nie powiódł się.")
    })
    
    const handleCollectionSubmit = (event: any) => {
        event.preventDefault()
        setFileNotLoadedError(fileLoaded ? nbsp : "Nie wczytano pliku")
        const newHeader = excelCollectionCategoryPairs.map((pair: String[]) => pair[1])
        dataToSend = [newHeader, ...fileData.slice(1)]
        importDataMutation.mutate()
    }

    const importDataMutation = useMutation(() => importData(dataToSend, jwtToken, collectionId!), {
        onSuccess: () => {
            queryClient.invalidateQueries("collection")
            navigate(`/collections/${collectionId}/artworks`)
        },
        onError: (error: any) => {
            showServerError(error.response.data)
        }
    })

    const FileExtensionIcon: React.FC<{name: string;}> = ({name}) => {
        if((/\.(csv|tsv|txt)$/i.test(name)))
            return (<CSVIcon className="w-12 h-12"/>)
        else if((/\.(xlsx|xls|xlsm|xlsb|ods|xltx|xltm)$/i.test(name)))
            return (<ExcelIcon className="w-12 h-12"/>)
        else
            return (<UnknownFile className="w-12 h-12"/>)
    }

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
                                Wgraj plik arkusza kalkulacyjnego/CSV
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
                                    ? <div className="flex flex-row items-center justify-between w-full">
                                        <div className="flex flex-row items-center justify-center gap-4">
                                            <FileExtensionIcon name={fileName} />
                                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                                {fileName}
                                            </p>          
                                        </div>
                                        <button
                                            aria-label="remove-file-to-load"
                                            type="button"
                                            className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 text-sm
                                                    dark:hover:bg-gray-600 dark:hover:text-white p-2 rounded-lg cursor-pointer"
                                            onClick={handleFileRemove}
                                        >
                                            <Close />
                                        </button>
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
                                    accept=".xlsx,.xls,.xlsm,.xlsb,.ods,.csv,.tsv,.txt,.xltx,.xltm"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                            <p
                                className={`block text-sm ${fileNotLoadedError != nbsp ? "text-red-500 font-normal": "font-semibold text-gray-700 dark:text-white"} my-2`}
                            >
                                {fileLoaded && (/\.(csv|tsv|txt|xlsx|xls|xlsm|xlsb|ods|xltx|xltm)$/i.test(fileName)) && (
                                    <span>
                                        Liczba rekordów: <span className="font-normal">{fileData.length - 1}</span>
                                    </span>
                                )}
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
                                        .filter((pair: string) => pair[0] !== "_id" && pair[0] !== "nazwy plików")
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
                            <div 
                                aria-label="server-error"
                                className="text-red-500 text-sm"
                            >
                                {serverError}
                            </div>
                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-4 py-2 mr-2"
                                >
                                    Anuluj
                                </button>
                                <button
                                    aria-label="import-data"
                                    type="submit"
                                    disabled={!fileLoaded ? true : false }
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