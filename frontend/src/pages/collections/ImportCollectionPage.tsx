import { Formik, Form, Field, ErrorMessage } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import Navbar from "src/components/navbar/Navbar";
import Navigation from "src/components/Navigation";
import { ReactComponent as DragAndDrop } from "../../assets/icons/dragAndDrop.svg"
import { ReactComponent as ExcelIcon } from "../../assets/icons/excel.svg"
import { useMutation, useQueryClient } from "react-query";
import { importDataAsCollection } from "../../api/dataImport";
import { useUser } from "src/providers/UserProvider";

const ImportCollectionPage = () => {
    const navigate = useNavigate();
    const [fileName, setFileName]: any = useState(false)
    const [fileData, setFileData]: any = useState(false)
    // const [fileHeader, setFileHeader]: any = useState([])
    const [pairs, setPairs]: any = useState([])
    const [collectionName, setCollectionName] = useState("")
    const [collectionDescription, setCollectionDescription] = useState("")
    const [fileLoaded, setFileLoaded] = useState(false)
    const [categoryErrors, setCategoryErrors]= useState<Array<string>>([])
    const queryClient = useQueryClient()
    const { jwtToken } = useUser();
    console.log(categoryErrors)
    useEffect(() => {

    }, []);

    interface FormValues {
        name: string;
        description: string;
        fileData: any;
    }
    
    interface FormErrors {
        name?: string;
        description?: string;
        fileData?: string;
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
    
                const parsedData: Array<Array<string>> = XLSX.utils.sheet_to_json(worksheet, {header:1, defval: "", raw: false});
    
                setFileLoaded(true)
                setFileName(file.name)
                setFileData(parsedData)
                // setFileHeader(parsedData[0])
                setPairs(parsedData[0].map((header: string) => {
                    const parts = header.split(".");
                    const last = parts[parts.length - 1];
                    const parent = parts.length > 1 ? parts[parts.length - 2] : "-";
                    return [last, parent];
                }))
            };
            reader.readAsArrayBuffer(file)
        }

    const handleOptionChange = ((event: any) => {
        const child = event.target.id.replace(/-parent$/, "");
        const parent = event.target.value
        setPairs((prevPairs: Array<Array<string>>) =>
            prevPairs.map(([prevChild, prevParent]) =>
                prevChild === child ? [prevChild, parent] : [prevChild, prevParent]
            )
        );
    })

    const handleSetFileHeader = (event: any) => {
        const parentMap = Object.fromEntries(pairs);

        const fullPaths: Array<string> = [];
        const errors = [];

        for (const [child] of pairs) {
            let path = child;
            let currentParent = parentMap[child];
            const visited = new Set([child]);

            while (currentParent && currentParent !== "-") {
                if (visited.has(currentParent)) {
                    errors.push(`Wykryto cykliczną referencję: ${[...visited, currentParent].join(" -> ")}`);
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

        if (errors.length > 0) {
            setCategoryErrors(errors)
        } else {
            console.log(collectionName)
            // setFileHeader(fullPaths)
            setFileData((prev: Array<Array<string>>) => {
                const newData = [...prev]
                newData[0] = fullPaths
                return newData
            });
            importCollectionMutation.mutate()
            console.log("before:", fileData)
            console.log("Result:", fullPaths);
        }
        
    }

    const importCollectionMutation = useMutation(() => importDataAsCollection(fileData, collectionName, collectionDescription, jwtToken), {
            onSuccess: () => {
                queryClient.invalidateQueries("collection")
                navigate("/")
            },
            onError: (error: any) => {
                console.log(error)
                setCategoryErrors([error.response.data.error])
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
                        <Formik
                            initialValues={{
                                name: collectionName,
                                description: collectionDescription,
                                fileData: fileData,
                            }}
                            validate={(values: FormValues): FormErrors => {
                                const errors: FormErrors = {};

                                if (!values.name) {
                                    errors.name = "Nazwa jest wymagana";
                                }

                                if (!values.description) {
                                    errors.description = "Opis jest wymagany";
                                }

                                if (!values.fileData) {
                                    errors.fileData = "Wymagane są prawidłowe dane z pliku";
                                }

                                return errors;
                            }}
                            onSubmit={async (values, { setSubmitting, setErrors, setStatus, setFieldTouched }) => {
                                const { name, description, fileData } = values;
                                console.log(name, description, fileData)

                                try {
                                
                                    navigate("/")
                                } catch (error: any) {
                                
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {({ isSubmitting, setFieldValue, status, errors, touched }) => (
                                <Form>
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
                                    Kliknij, aby przesłać plik lub przeciągnij go i upuść
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
                                        className="block text-sm font-semibold text-gray-700 dark:text-white my-2"  
                                    >
                                        {fileLoaded ? (
                                            <span>
                                                Liczba rekordów: <span className="font-normal">{fileData.length - 1}</span>
                                            </span>
                                            ) : (
                                            "\u00A0"
                                        )}
                                    </p>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-bold text-gray-700 dark:text-white my-2"
                                    >
                                        Nazwa
                                    </label>
                                    <Field
                                        id="name"
                                        name="name"
                                        aria-label="name"
                                        type="text"
                                        className={`w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none ${
                                            touched.name && errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    <ErrorMessage
                                        name="name"
                                        component="div"
                                        className="text-red-500 text-sm"
                                    />

                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-bold text-gray-700 dark:text-white my-2"
                                    >
                                        Opis
                                    </label>
                                    <Field
                                        as="textarea"
                                        id="description"
                                        name="description"
                                        aria-label="description"
                                        rows={4}
                                        className={`w-full resize-y mb-8 px-4 py-2 border rounded-lg focus:outline-none dark:border-gray-600 dark:bg-gray-800 ${
                                            touched.description && errors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    <ErrorMessage
                                        name="description"
                                        component="div"
                                        className="text-red-500 text-sm"
                                    />

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
                                            {pairs.map((pair: any) => {
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
                                                            onChange={handleOptionChange}   
                                                        >
                                                            <option
                                                                selected={categoryParentShortName == "-" ? true : false}
                                                                value="-" 
                                                            >
                                                                -
                                                            </option>
                                                            {pairs.map((a: any) => {
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
                                        {categoryErrors.map((error: string) => {
                                            return <p>{error}</p>
                                        })}
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
                                            disabled={!fileLoaded}
                                            className="px-4 py-2 color-button"
                                            // onClick={handleSetFileHeader}
                                        >
                                            Importuj kolekcję
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImportCollectionPage