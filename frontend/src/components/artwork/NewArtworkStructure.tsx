import React, { useEffect, useRef, useState } from "react"
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg"
import { ReactComponent as MinusIcon } from "../../assets/icons/minus.svg"

type Subcategory = {
    name: string
    values?: string[]
    subcategories?: Subcategory[]
    isSelectable?: boolean
}

interface SelectedDetail {
    category: any;
    subcategories: Subcategory[];
    collection: string
    values?: string[]
}

interface LocationDetail {
    name: string
    values?: string[]
    subcategories?: Subcategory[]
    isSelectable: boolean
}

interface CollectionItem {
    _id: any
    collectionId: any
    category: string
    name: string
    locationDetails: LocationDetail[]
}

interface CategoryAndValueSelectorProps {
    selectedDetail: SelectedDetail;
    handleCategoryChange: (itemIndex: string, newCategoryName: string) => void;
    handleDetailChange: (itemIndex: string, detailIndex: any) => void;
    handleSubcategoryChange: (itemIndex: string, subcatIndex: number, newSubcatName: string) => void;
    handleAddSubcategory: (itemIndex: string) => void;
    addSubcategory: (identifier: string) => void;
    deleteSubcategory: (identifier: string, subcatIndex: number) => void;
    subcategories: Subcategory[];
    category: any;
    identifier: string;
}

const jsonData: CollectionItem[] = [
    {
        "_id": "65ce9ec43171573092ad7e2e",
        "collectionId": "65ce9ec33171573092ad7df7",
        "category": "Region",
        "name": "Wielkopolska",
        "locationDetails": [
            {
                "name": "Podregion",
                "values": [
                    "Wielkopolska Północno-Zachodnia",
                    "Wielkopolska Północno-Wschodnia",
                    "Wielkopolska Południowo-Zachodnia",
                    "Wielkopolska Południowo-Wschodnia",
                ],
                "isSelectable": true,
            },
            {
                "name": "Region etnograficzny",
                "values": [
                    "Szamotulskie",
                    "Ziemia Lubuska",
                    "Kaliskie",
                ],
                "isSelectable": true,
            },
            {
                "name": "Powiat",
                "values": [
                    "Gniezno",
                    "Poznań",
                    "Września",
                    "Środa",
                ],
                "isSelectable": true,
            },
            {
                "name": "Miejscowość",
                "values": [
                    "Leszno",
                    "Kalisz",
                    "Konin",
                    "Piła",
                    "Ostrów Wielkopolski",
                ],
                "isSelectable": true,
            },
            {
                "name": "Sygnatura nagrania",
                "subcategories": [
                    {
                        "name": "Pozycja",
                        "values": [],
                    },
                ],
                "isSelectable": false,
            },
            {
                "name": "Incipit",
                "subcategories": [
                    {
                        "name": "Język incipitu",
                        "values": [
                            "angielski",
                            "niemiecki",
                        ],
                        "isSelectable": true,
                    },
                ],
                "isSelectable": true,
            },
            {
                "name": "Nazwisko wykonawcy",
                "subcategories": [
                    {
                        "name": "Wykonawca",
                        "values": [
                            "sadjkasdkjsda",
                            "sadjkasdkjsda",
                            "sadjkasdkjsda",
                        ],
                    },
                ],
                "isSelectable": false,
            },
            {
                "name": "Numer wątku muzycznego",
                "subcategories": [],
                "isSelectable": false,
            },
            {
                "name": "Numer w publikacji",
                "subcategories": [],
                "isSelectable": false,
            },
            {
                "name": "Sposób wykonania",
                "subcategories": [
                    {
                        "name": "Barwa głosu",
                        "values": [],
                        "isSelectable": false,
                    },
                    {
                        "name": "Tempo wykonania",
                        "values": [],
                        "isSelectable": false,
                    },
                    {
                        "name": "Ornamentyka",
                        "values": [],
                        "isSelectable": false,
                    },
                ],
                "isSelectable": true,
            },
            {
                "name": "Funkcja utworu ogólnie",
                "subcategories": [
                    {
                        "name": "Szczegółowa funkcja",
                        "values": [],
                        "isSelectable": false,
                    },
                    {
                        "name": "Funkcja określona przez wykonawcę",
                        "values": [],
                        "isSelectable": false,
                    },
                ],
                "isSelectable": true,
            },
            {
                "name": "Numer wątku melodycznego",
                "subcategories": [],
                "isSelectable": false,
            },
            {
                "name": "Wykorzystanie w publikacji",
                "subcategories": [],
                "isSelectable": false,
            },
            {
                "name": "Klasyfikacja melodyczna",
                "subcategories": [
                    {
                        "name": "Rytmika",
                        "values": [],
                        "isSelectable": false,
                    },
                    {
                        "name": "Metrum",
                        "values": [],
                        "isSelectable": false,
                    },
                    {
                        "name": "Forma melodyczna",
                        "values": [],
                        "isSelectable": false,
                    },
                    {
                        "name": "Skala",
                        "values": [],
                        "isSelectable": false,
                    },
                    {
                        "name": "Ambitus",
                        "values": [],
                        "isSelectable": false,
                    },
                    {
                        "name": "Układ kadencji",
                        "values": [],
                        "isSelectable": false,
                    },
                ],
                "isSelectable": true,
            },
            {
                "name": "Struktura tekstu",
                "subcategories": [
                    {
                        "name": "Ilość wersów",
                        "values": [],
                        "isSelectable": false,
                    },
                    {
                        "name": "Układ sylab w wersie",
                        "values": [],
                        "isSelectable": false,
                    },
                ],
                "isSelectable": true,
            },
            {
                "name": "Uwagi",
                "subcategories": [
                    {
                        "name": "Stan techniczny nagrania",
                        "values": [],
                        "isSelectable": false,
                    },
                    {
                        "name": "Walory melodii",
                        "values": [],
                        "isSelectable": false,
                    },
                ],
                "isSelectable": false,
            },
            {
                "name": "Obecność w źródłach",
                "subcategories": [
                    {
                        "name": "Antologie",
                        "values": [],
                        "isSelectable": false,
                    },
                    {
                        "name": "Rękopisy",
                        "values": [],
                        "isSelectable": false,
                    },
                    {
                        "name": "Śpiewniki",
                        "values": [],
                        "isSelectable": false,
                    },
                ],
                "isSelectable": true,
            },
        ],
    },
]

interface NewArtworkStructureProps {
    selectedDetails: { [key: string]: SelectedDetail };
    setSelectedDetails: React.Dispatch<React.SetStateAction<{ [key: string]: SelectedDetail }>>;
}

const NewArtworkStructure: React.FC<NewArtworkStructureProps> = ({ selectedDetails, setSelectedDetails }) => {
    const addSubcategory = (identifier: string) => {
        setSelectedDetails(prevDetails => ({
            ...prevDetails,
            [identifier]: {
                ...prevDetails[identifier],
                subcategories: [...prevDetails[identifier]?.subcategories || []],
            },
        }))
    }

    const addCategory = () => {
        const newCategoryId = `${Date.now()}`

        setSelectedDetails(prevDetails => ({
            ...prevDetails,
            [newCategoryId]: {
                category: "",
                values: [],
                subcategories: [],
                collection: jsonData[0].name,
            },
        }))
    }

    const handleCategoryChange = (identifier: string, newCategoryName: string) => {
        setSelectedDetails(prevDetails => {
            const categoryData = jsonData[0].locationDetails.find(detail => detail.name === newCategoryName)

            const newSubcategories = categoryData?.subcategories?.map(subcat => ({
                name: subcat.name,
                values: subcat.values || [],
                category: newCategoryName,
                isSelectable: subcat.isSelectable,
            })) || []

            const updatedDetails = {
                ...prevDetails,
                [identifier]: {
                    category: newCategoryName,
                    subcategories: newSubcategories || [],
                    values: categoryData?.values || [],
                    collection: jsonData[0].name,
                },
            }

            return updatedDetails
        })
    }

    const handleDetailChange = (itemIndex: string, detailIndex: any) => {
        setSelectedDetails(prevDetails => ({
            ...prevDetails,
            [itemIndex]: {
                ...prevDetails[itemIndex],
                values: detailIndex,
                subcategories: prevDetails[itemIndex]?.subcategories || [],
            },
        }))
    }

    const handleAddSubcategory = (itemIndex: string) => {
        setSelectedDetails(prevDetails => ({
            ...prevDetails,
            [itemIndex]: {
                ...prevDetails[itemIndex],
                subcategories: [
                    ...prevDetails[itemIndex].subcategories,
                    {
                        name: "",
                        values: [],
                        isSelectable: true,
                    },
                ],
            },
        }))
    }

    const deleteSubcategory = (identifier: string, subcatIndex: number) => {
        setSelectedDetails(prevDetails => {
            const currentSubcategories = prevDetails[identifier].subcategories
            const updatedSubcategories = currentSubcategories.filter((_, index) => index !== subcatIndex)

            return {
                ...prevDetails,
                [identifier]: {
                    ...prevDetails[identifier],
                    subcategories: updatedSubcategories,
                },
            }
        })
    }

    const handleSubcategoryChange = (itemIndex: string, subcatIndex: number, newName: string) => {
        setSelectedDetails(prevDetails => ({
            ...prevDetails,
            [itemIndex]: {
                ...prevDetails[itemIndex],
                subcategories: prevDetails[itemIndex].subcategories.map((subcat, index) =>
                    index === subcatIndex ? { ...subcat, name: newName } : subcat,
                ),
            },
        }))
    }

    return (
        <div className="flex flex-col p-4 w-full">
            {jsonData[0].name}
            <div className="p-4">

                {Object.entries(selectedDetails) !== undefined && Object.entries(selectedDetails)
                    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                    .map(([key, selectedDetail]) => (

                        <div className="flex flex-row" key={key}>
                            <div className="ml-2 flex flex-row relative">
                                <span className="absolute bg-gray-300 h-full w-0.5"></span>

                                <CategoryAndValueSelector
                                    selectedDetail={selectedDetail}
                                    handleCategoryChange={handleCategoryChange}
                                    handleDetailChange={handleDetailChange}
                                    handleSubcategoryChange={handleSubcategoryChange}
                                    handleAddSubcategory={handleAddSubcategory}
                                    addSubcategory={addSubcategory}
                                    deleteSubcategory={deleteSubcategory}
                                    subcategories={selectedDetail.subcategories || []}
                                    category={selectedDetail.category || ""}
                                    identifier={key}
                                />
                            </div>
                        </div>
                    ))}

                <div className="ml-2 flex flex-row relative">
                    <span className="absolute bg-gray-300 h-1/2 w-0.5"></span>
                    <hr className="border-t-2 border-gray-300 dark:border-gray-700 w-8 self-center" />

                    <button
                        onClick={() => addCategory()}
                        className="p-2 border-gray-300 shadow-md"
                        type="button"
                    >
                        <PlusIcon />
                    </button>
                </div>
            </div>
        </div>
    )
}

interface EditingState {
    isEditing: boolean;
    editingIndex: number | null;
    editValue: string;
}

const CategoryAndValueSelector: React.FC<CategoryAndValueSelectorProps> = ({
                                                                               selectedDetail,
                                                                               handleCategoryChange,
                                                                               handleDetailChange,
                                                                               handleSubcategoryChange,
                                                                               handleAddSubcategory,
                                                                               addSubcategory,
                                                                               deleteSubcategory,
                                                                               subcategories,
                                                                               category,
                                                                               identifier,
                                                                           }) => {


    const [editingState, setEditingState] = useState<EditingState>({
        isEditing: false,
        editingIndex: null,
        editValue: "",
    })

    const inputRef = useRef<HTMLTextAreaElement>(null)


    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setEditingState(prevState => ({ ...prevState, editValue: value }));
        resizeTextarea(e.target);
    };

    const resizeTextarea = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    const handleDoubleClick = (index: number | null, name: string) => {
        setEditingState({
            isEditing: true,
            editingIndex: index,
            editValue: name,
        });
        // Since state updates are asynchronous, use useEffect to resize after the update
    };

    React.useEffect(() => {
        if (editingState.isEditing && inputRef.current) {
            resizeTextarea(inputRef.current);
        }
    }, [editingState.isEditing, editingState.editValue]);

    const handleBlur = () => {
        if (editingState.isEditing && editingState.editingIndex !== null) {
            handleSubcategoryChange(identifier, editingState.editingIndex, editingState.editValue);
        }
        setEditingState({
            isEditing: false,
            editingIndex: null,
            editValue: "",
        })
    }

    console.log(editingState)
    // useEffect(() => {
    //     const charsPerLine = 20; // Approximate chars per line, adjust based on your styling
    //     const newRows = Math.ceil(editingState.editValue.length / charsPerLine);
    //     // Ensure there is at least 1 row and optionally set a max
    //     const rowsToUpdate = Math.max(newRows, 1); // Set a minimum of 1 row
    //     if (inputRef.current) {
    //         inputRef.current.rows = rowsToUpdate;
    //     }
    // }, [editingState.editValue]);

    return (
        <div>
            <div key={identifier}>
                <label className="ml-16 mb-1">Kategoria:</label>

                <div className="relative flex flex-row">
                    <hr className="border-t-2 border-gray-300 dark:border-gray-700 w-16 self-center" />

                    <div className="flex flex-col">
                        <select
                            className="p-2 border rounded "
                            value={selectedDetail.category || ""}
                            onChange={(e) => handleCategoryChange(identifier, e.target.value)}
                        >
                            <option key={""} value={""} hidden>Wybierz kategorię</option>

                            {jsonData[0].locationDetails.map((item, index) => (
                                <option key={index} value={item.name}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center ml-2 h-full">
                        <button type="button"
                                className="p-2 border-gray-300 shadow-md mr-1"
                                onClick={() => addSubcategory(identifier)}>
                            <PlusIcon />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-row ml-16 w-full">
                <div className="flex flex-col w-full">
                    {selectedDetail?.subcategories.length !== 0 && selectedDetail?.subcategories?.map((subcatDetail, subcatIndex) => (
                        <div className="flex flex-row w-full">
                            <div className="w-full">
                                <div className="flex flex-row w-full">
                                    <div className="flex relative">
                                        <span className="justify-start absolute bg-gray-300 h-full w-0.5"></span>
                                    </div>

                                    <hr className="border-t-2 border-gray-300 dark:border-gray-700 w-8 self-center min-w-8" />

                                    {editingState.isEditing && editingState.editingIndex === subcatIndex ? (
                                        <div
                                            className="flex flex-row items-center w-fit border border-gray-300 rounded-md px-2 py-1 shadow-md mt-2">
                                            <textarea
                                                ref={inputRef}
                                                className="border-none h-fit w-96"
                                                value={editingState.editValue}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                autoFocus
                                            ></textarea>
                                        </div>
                                    ) : (
                                        <div onDoubleClick={() => handleDoubleClick(subcatIndex, subcatDetail.name)}
                                             className="flex flex-row items-center border border-gray-300 rounded-md px-2 py-1 shadow-md mt-2">
                                            <p className="w-full">{subcatDetail.name}</p>
                                        </div>
                                    )}
                                    <div className="items-center flex">
                                        <button type="button"
                                                className="p-2 border-gray-300 shadow-md ml-2 mt-1"
                                                onClick={() => deleteSubcategory(identifier, subcatIndex)}>
                                            <MinusIcon />
                                        </button>
                                    </div>
                                </div>

                                {subcatDetail.values?.length !== 0 &&
                                    <div className="flex flex-row">
                                        <div className="flex relative">
                                            <span className="justify-start bg-gray-300 h-full w-0.5"></span>
                                        </div>

                                        <select
                                            className="border border-gray-300 rounded-md px-2 py-1 mt-2 ml-8"
                                            onChange={e =>
                                                handleSubcategoryChange(identifier, subcatIndex, e.target.value)}>
                                            {subcatDetail.values?.map((value, index) => (
                                                <option key={index} value={value}>{value}</option>
                                            ))}
                                        </select>
                                    </div>
                                }
                            </div>

                        </div>
                    ))}

                    {selectedDetail.values?.length !== 0 && <div className="flex flex-row">
                        <span className="flex w-0.5 bg-gray-300 h-full"></span>
                        <hr className="border-t-2 border-gray-300 dark:border-gray-700 w-16 self-center -ml-0.5" />

                        <select className="border border-gray-300 rounded-md py-2 px-4 shadow-md my-2">
                            {selectedDetail.values?.map((value, valueIndex) => (
                                <option key={valueIndex} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                    }

                    <div className="flex flex-row items-center">
                        <span className="bg-gray-300 h-1/2 flex self-start w-0.5"></span>

                        <hr className="border-t-2 border-gray-300 dark:border-gray-700 w-8 self-center" />

                        <div className="flex items-center flex-row ">
                            <button
                                className="p-2 border-gray-300 shadow-md"
                                onClick={() => handleAddSubcategory(identifier)}
                                type="button">
                                <PlusIcon />
                            </button>
                        </div>
                        <div className="flex items-center flex-row pt-4 h-12">

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewArtworkStructure
