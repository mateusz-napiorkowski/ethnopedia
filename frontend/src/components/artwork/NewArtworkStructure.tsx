import React, { useEffect, useRef, useState } from "react"
import { ReactComponent as PlusIcon } from "../../assets/icons/plus.svg"
import CategorySelector from "./recordBuilder/CategorySelector"
import SubcategoryList from "./recordBuilder/SubcategoryList"
import useSelectedDetails from "./recordBuilder/useSelectedDetails"

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
    setSelectedDetails: React.Dispatch<React.SetStateAction<{ [key: string]: SelectedDetail }>>;
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
                                    setSelectedDetails={setSelectedDetails}
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
                                                                               identifier,
                                                                           }) => {
    const {
        selectedDetails,
        setSelectedDetails,
        updateSelectedDetails,
        addSelectedDetail,
        removeSelectedDetail,
    } = useSelectedDetails()
    const addSubcategory = (identifier: string) => {
        setSelectedDetails(prevDetails => ({
            ...prevDetails,
            [identifier]: {
                ...prevDetails[identifier],
                subcategories: [...prevDetails[identifier]?.subcategories || []],
            },
        }))
    }

    const handleCategoryChange = (newCategoryName: string) => {
        const categoryData = jsonData.find((item) => item.name === newCategoryName)?.locationDetails
        const newSubcategories = categoryData?.map(subcat => ({
            name: subcat.name,
            values: subcat.values || [],
            isSelectable: subcat.isSelectable,
        })) || []

        updateSelectedDetails(identifier, {
            ...selectedDetails[identifier],
            category: newCategoryName,
            subcategories: newSubcategories,
        })
    }

    // const handleSubcategoryChange = (itemIndex: string, subcatIndex: number, newName: string) => {
    //     setSelectedDetails(prevDetails => ({
    //         ...prevDetails,
    //         [itemIndex]: {
    //             ...prevDetails[itemIndex],
    //             subcategories: prevDetails[itemIndex].subcategories.map((subcat, index) =>
    //                 index === subcatIndex ? { ...subcat, name: newName } : subcat,
    //             ),
    //         },
    //     }))
    // }

    const handleSubcategoryChange = (identifier: string, subcatIndex: number, newName: string) => {
        const updatedSubcategories = selectedDetails[identifier].subcategories.map((subcat, index) =>
            index === subcatIndex ? { ...subcat, name: newName } : subcat,
        );

        updateSelectedDetails(identifier, { subcategories: updatedSubcategories });
    };


    const [editingState, setEditingState] = useState<EditingState>({
        isEditing: false,
        editingIndex: null,
        editValue: "",
    })

    const inputRef = useRef<HTMLTextAreaElement>(null)

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditingState({
            ...editingState,
            editValue: event.target.value,
        })
    }

    const handleDoubleClick = (index: number, name: string) => {
        setEditingState({
            isEditing: true,
            editingIndex: index,
            editValue: name,
        })
    }
    // const handleCategoryChange = (identifier: string, newCategoryName: string) => {
    //     setSelectedDetails(prevDetails => {
    //         const categoryData = jsonData[0].locationDetails.find(detail => detail.name === newCategoryName)
    //
    //         const newSubcategories = categoryData?.subcategories?.map(subcat => ({
    //             name: subcat.name,
    //             values: subcat.values || [],
    //             category: newCategoryName,
    //             isSelectable: subcat.isSelectable,
    //         })) || []
    //
    //         const updatedDetails = {
    //             ...prevDetails,
    //             [identifier]: {
    //                 category: newCategoryName,
    //                 subcategories: newSubcategories || [],
    //                 values: categoryData?.values || [],
    //                 collection: jsonData[0].name,
    //             },
    //         }
    //
    //         return updatedDetails
    //     })
    // }
    //
    // const handleDetailChange = (itemIndex: string, detailIndex: any) => {
    //     setSelectedDetails(prevDetails => ({
    //         ...prevDetails,
    //         [itemIndex]: {
    //             ...prevDetails[itemIndex],
    //             values: detailIndex,
    //             subcategories: prevDetails[itemIndex]?.subcategories || [],
    //         },
    //     }))
    // }
    //
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
    //
    // const handleSubcategoryChange = (itemIndex: string, subcatIndex: number, newName: string) => {
    //     setSelectedDetails(prevDetails => ({
    //         ...prevDetails,
    //         [itemIndex]: {
    //             ...prevDetails[itemIndex],
    //             subcategories: prevDetails[itemIndex].subcategories.map((subcat, index) =>
    //                 index === subcatIndex ? { ...subcat, name: newName } : subcat,
    //             ),
    //         },
    //     }))
    // }


    // const [editingState, setEditingState] = useState<EditingState>({
    //     isEditing: false,
    //     editingIndex: null,
    //     editValue: "",
    // })
    //
    // const inputRef = useRef<HTMLTextAreaElement>(null)
    //
    // const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    //     const value = e.target.value
    //     setEditingState(prevState => ({ ...prevState, editValue: value }))
    //     resizeTextarea(e.target)
    // }
    //
    const resizeTextarea = (textarea: HTMLTextAreaElement) => {
        textarea.style.height = "auto"
        textarea.style.height = `${textarea.scrollHeight}px`
    }

    // const handleDoubleClick = (index: number | null, name: string) => {
    //     setEditingState({
    //         isEditing: true,
    //         editingIndex: index,
    //         editValue: name,
    //     })
    // }

    useEffect(() => {
        if (editingState.isEditing && inputRef.current) {
            resizeTextarea(inputRef.current)
        }
    }, [editingState.isEditing, editingState.editValue])

    const handleBlur = () => {
        if (editingState.isEditing && editingState.editingIndex !== null) {
            handleSubcategoryChange(identifier, editingState.editingIndex, editingState.editValue)
        }
        setEditingState({
            isEditing: false,
            editingIndex: null,
            editValue: "",
        })
    }

    return (
        <div>
            <CategorySelector
                identifier={identifier}
                selectedCategory={selectedDetail.category}
                handleCategoryChange={handleCategoryChange}
                addSubcategory={addSubcategory}
                locationDetails={jsonData[0].locationDetails}
            />

            <div className="ml-16">
                <SubcategoryList
                    identifier={identifier}
                    subcategories={selectedDetail.subcategories}
                    editingState={editingState}
                    handleDoubleClick={handleDoubleClick}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    deleteSubcategory={deleteSubcategory}
                    inputRef={inputRef}
                    handleSubcategoryChange={handleSubcategoryChange} />
            </div>

            <div className="flex flex-row ml-16 w-full">
                <div className="flex flex-col w-full">
                    {selectedDetail.values?.length !== 0 && <div className="flex flex-row">
                        <span className="flex w-0.5 bg-gray-300 h-full"></span>
                        <hr className="border-t-2 border-gray-300 dark:border-gray-700 w-8 self-center -ml-0.5" />

                        <select className="border border-gray-300 rounded-md py-2 px-4 shadow-md my-2">
                            {selectedDetail.values?.map((value, valueIndex) => (
                                <option key={valueIndex} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>}

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

const AddNewSubcategory = () => {
    return <div className="flex flex-row items-center">
        <span className="bg-gray-300 h-1/2 flex self-start w-0.5"></span>

        <hr className="border-t-2 border-gray-300 dark:border-gray-700 w-8 self-center" />

        <div className="flex items-center flex-row ">
            <input type="text" className="border border-gray-300 rounded-md px-2 py-1"
                   placeholder="Dodaj nazwę">
            </input>
        </div>
        <div className="flex items-center flex-row pt-4 h-12">

        </div>
    </div>
}

export default NewArtworkStructure
