import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import Navbar from "../../components/navbar/Navbar"
import Navigation from "../../components/Navigation";
import { ReactComponent as DragAndDrop } from "../../assets/icons/dragAndDrop.svg"
import { ReactComponent as ExcelIcon } from "../../assets/icons/excel.svg"
import { useMutation, useQueryClient } from "react-query";
import { importDataAsCollection } from "../../api/dataImport";
import { useUser } from "../../providers/UserProvider";

const ImportCollectionPage = () => {
    const nbsp = "\u00A0"
    const [fileLoaded, setFileLoaded] = useState(false)
    const [fileName, setFileName]: any = useState(false)
    const [fileData, setFileData]: any = useState(false)
    const [collectionName, setCollectionName] = useState("")
    const [collectionDescription, setCollectionDescription] = useState("")
    const [childParentPairs, setChildParentPairs]: any = useState([])
    const [fileNotLoadedError, setFileNotLoadedError] = useState(nbsp)
    const [collectionNameError, setCollectionNameError] = useState(nbsp)
    const [collectionDescriptionError, setCollectionDescriptionError] = useState(nbsp)
    const [circularReferences, setCircularReferences]= useState<Array<string>>([])
    const [serverError, setServerError] = useState(nbsp)
    
    const navigate = useNavigate();
    const queryClient = useQueryClient()
    const { jwtToken } = useUser();

    useEffect(() => {
        handleFileDataHeaderUpdate()
    }, [childParentPairs]);

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
            setChildParentPairs(parsedData[0].map((header: string) => {
                const parts = header.split(".");
                const last = parts[parts.length - 1];
                const parent = parts.length > 1 ? parts[parts.length - 2] : "-";
                return [last, parent];
            }))
            setFileNotLoadedError(nbsp)
        };
        reader.readAsArrayBuffer(file)
    }

    const handleOptionChange = ((event: ChangeEvent<HTMLSelectElement>) => {
        const child = event.target.id.replace(/-parent$/, "");
        const parent = event.target.value
        setChildParentPairs((prevPairs: Array<Array<string>>) =>
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

    const handleCollectionNameChange = ((event: ChangeEvent<HTMLTextAreaElement>) => {
        setCollectionName(event.target.value)
    })

    const handleCollectionDescriptionChange = ((event: ChangeEvent<HTMLTextAreaElement>) => {
        setCollectionDescription(event.target.value)
    })

    const handleFileDataHeaderUpdate = () => {
        if(childParentPairs.length === 0)
            return

        const parentMap = Object.fromEntries(childParentPairs);

        const fullPaths: Array<string> = [];
        const circularRefs = [];

        for (const [child] of childParentPairs) {
            let path = child;
            let currentParent = parentMap[child];
            const visited = new Set([child]);

            while (currentParent && currentParent !== "-") {
                if (visited.has(currentParent)) {
                    circularRefs.push(`${[...visited, currentParent].join(" -> ")}`);
                    path = null;
                    break;
                }
                visited.add(currentParent);
                path = currentParent + "." + path;
                currentParent = parentMap[currentParent];
            }

            if (path) {
                fullPaths.push(path);
            }
        }

        if (circularRefs.length > 0) {
            setCircularReferences(circularRefs)
        } else {
            setFileData((prev: Array<Array<string>>) => {
                const newData = [...prev]
                newData[0] = fullPaths
                return newData
            });
        }
    }
    
    const handleCollectionSubmit = (event: any) => {
        event.preventDefault()
        setCollectionNameError(collectionName ? nbsp : "Nazwa kolekcji jest wymagana")
        setCollectionDescriptionError(collectionDescription ? nbsp : "Opis kolekcji jest wymagany")
        setFileNotLoadedError(fileLoaded ? nbsp : "Nie wczytano pliku")
        importCollectionMutation.mutate()
    }

    const importCollectionMutation = useMutation(() => importDataAsCollection(fileData, collectionName, collectionDescription, jwtToken), {
            onSuccess: () => {
                queryClient.invalidateQueries("collection")
                navigate("/")
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
                                Importuj kolekcję
                            </h3>
                        </div>
                        <form onSubmit={handleCollectionSubmit}>
                            <label
                                htmlFor="dropzone-file"
                                className="block text-sm font-bold text-gray-700 dark:text-white my-2"
                            >
                                Plik
                            </label>
                            <label
                        aria-label="upload"
                        htmlFor="dropzone-file"
                        className="flex flex-col items-start justify-start p-2 border-2 border-gray-200
                                    border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-600
                                    dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600
                                    dark:hover:border-gray-500 dark:hover:bg-gray-700">
                    {fileLoaded ? <div className="flex flex-row items-center justify-center gap-4">
                        <ExcelIcon className="w-12 h-12"/>
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            {fileName}
                        </p>
                    </div> : <div className="flex flex-row items-center justify-center gap-4">
                        <DragAndDrop className="w-12 h-12 text-gray-500 dark:text-gray-400"/>
                        <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            Kliknij, aby przesłać plik
                        </p>
                    </div>}
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
                                {fileLoaded ? (
                                    <span>
                                        Liczba rekordów: <span className="font-normal">{fileData.length - 1}</span>
                                    </span>
                                    ) : (
                                    fileNotLoadedError
                                )}
                            </p>
                            <label
                                htmlFor="name"
                                className="block text-sm font-bold text-gray-700 dark:text-white my-2"
                            >
                                Nazwa
                            </label>
                            <textarea
                                aria-label="name"
                                id="name"
                                name="name"
                                value = {collectionName}
                                onChange={handleCollectionNameChange}
                                className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none"
                            />
                            <div className="text-red-500 text-sm">
                                {collectionNameError}
                            </div>

                            <label
                                htmlFor="description"
                                className="block text-sm font-bold text-gray-700 dark:text-white my-2"
                            >
                                Opis
                            </label>
                            <textarea
                                aria-label="description"
                                id="description"
                                name="description"
                                value = {collectionDescription}
                                onChange={handleCollectionDescriptionChange}
                                className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none"
                            />
                            <div className="text-red-500 text-sm mb-2">
                                {collectionDescriptionError}
                            </div>

                            <hr />
                            {fileLoaded && ( <>
                                <p className="text-sm font-bold text-gray-700 dark:text-white my-2">Wczytane kategorie</p>
                                <p className="text-sm font-normal text-gray-700 dark:text-white my-2">Sprawdz, czy kategorie zostały poprawnie wczytane. Zaznacz, które kategorie są główne, a które są podkategoriami.</p>
                                <div className="flex flex-col items-center justify-center mt-4 mb-4 p-4 border-2 border-gray-200
                                    border-solid rounded-lg bg-gray-50 dark:hover:bg-gray-600
                                    dark:bg-gray-800 dark:border-gray-600
                                    dark:hover:border-gray-500">
                                    <div className="flex flex-row w-full items-start justify-start">
                                        <span className="block w-1/2 text-sm font-semibold text-gray-700 dark:text-white my-2">Kategoria:</span>
                                        <span className="block w-1/2 text-sm font-semibold text-gray-700 dark:text-white my-2">Kategoria nadrzędna:</span>
                                    </div>
                                    {childParentPairs.map((pair: any) => {
                                        const categoryShortName = pair[0]
                                        const categoryParentShortName = pair[1]
                                        return (
                                            <div className="flex flex-row w-full items-start justify-start">
                                                <label
                                                    htmlFor={`${pair[0]}-parent`}
                                                    className="block w-1/2 text-sm font-semibold text-gray-700 dark:text-white my-2"
                                                >
                                                    {pair[0]}
                                                </label>
                                                <select 
                                                    className="block w-1/2 text-sm font-semibold text-gray-700 dark:text-white my-2"
                                                    id={`${pair[0]}-parent`}
                                                    aria-label={`${pair[0]}-parent-select`}
                                                    onChange={handleOptionChange}   
                                                >
                                                    <option
                                                        selected={categoryParentShortName == "-" ? true : false}
                                                        value="-" 
                                                    >
                                                        -
                                                    </option>
                                                    {childParentPairs.map((a: any) => {
                                                        const optionValue = a[0]
                                                        if(optionValue != categoryShortName) {
                                                            return (<option
                                                                selected={optionValue == categoryParentShortName ? true : false}
                                                                value={optionValue}
                                                                >
                                                                    {optionValue}
                                                                </option>)
                                                        }
                                                    })}                                                            
                                                </select>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>)}
                            <div className="text-red-500 text-sm">
                                {circularReferences.length !== 0 ? "Wykryto cykliczne referencje:" : nbsp}
                            </div>
                            <div className={`text-red-500 text-sm h-15 ${circularReferences ? "overflow-y-scroll" : ""}`}>
                                {circularReferences.map((reference: string) => {
                                    return <p>{reference}</p>
                                })}
                            </div>
                            <div className="text-red-500 text-sm">
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
                                    type="submit"
                                    disabled={!fileLoaded || circularReferences.length != 0 ? true : false }
                                    className="px-4 py-2 color-button"
                                >
                                    Importuj kolekcję
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImportCollectionPage