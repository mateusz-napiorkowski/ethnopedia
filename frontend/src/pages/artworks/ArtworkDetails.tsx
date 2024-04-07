import React from "react"
import { v4 as uuidv4 } from "uuid"
import { ReactComponent as EditIcon } from "../../assets/icons/edit.svg"
import { ReactComponent as TrashBinIcon } from "../../assets/icons/trashBin.svg"

interface ArtworkDetailsProps {
    Tytuł: string;
    Artyści: string;
    Rok: string;
    collectionName: string;
    detailsToShow: { [key: string]: string };
    showStructure: boolean;
    handleEditClick: () => void;
    setShowDeleteArtworkWarning: (value: boolean) => void;
}

const ArtworkDetails: React.FC<ArtworkDetailsProps> = ({
                                                           Tytuł,
                                                           Artyści,
                                                           Rok,
                                                           collectionName,
                                                           detailsToShow,
                                                           showStructure,
                                                           handleEditClick,
                                                           setShowDeleteArtworkWarning,
                                                       }) => {
    return (
        <div className="flex flex-row">
            <div className="mt-2 flex-2">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{Tytuł}</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mt-1">Artyści: {Artyści}</p>
                <p className="text-lg text-gray-500 dark:text-gray-300 mt-1">Rok: {Rok}</p>
                <p className="text-lg text-gray-500 dark:text-gray-300 mt-1">Kolekcja: {collectionName}</p>
                
                {/* {Object.entries(detailsToShow).filter(([key]) => !["__v", "userId", "_id"].includes(key)).map(([columnName, value]) => {
                    let displayValue
                    let displayName = columnName

                    if (columnName === "createdAt") {
                        displayName = "Data dodania"
                        displayValue = new Date(value).toLocaleString("pl-PL", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
                    } else if (columnName === "updatedAt") {
                        displayName = "Data edycji"
                        displayValue = new Date(value).toLocaleString("pl-PL", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
                    } else {
                        displayValue = value
                    }

                    return <div key={uuidv4()}
                                className="flex py-2 font-medium w-128">
                            <span className="mr-2 flex-1">
                                {displayName}:
                            </span>
                        <div className="flex flex-1 items-end">
                            {displayValue}
                        </div>
                    </div>
                })} */}
            </div>

            {!showStructure && (
                <div className="flex-1 mt-4 flex justify-end text-gray-700">
                    <button className="text-lg font-semibold h-fit mr-4" onClick={handleEditClick}>
                        <span className="flex-row flex items-center">
                            <EditIcon />
                            <p className="ml-2">Edytuj</p>
                        </span>
                    </button>

                    <button
                        className="text-lg font-semibold h-fit border-red-700 text-red-700 bg-red-50 hover:bg-white"
                        onClick={() => setShowDeleteArtworkWarning(true)}>
                        <span className="flex-row flex items-center">
                            <TrashBinIcon />
                            <p className="ml-2">Usuń</p>
                        </span>
                    </button>
                </div>
            )}
        </div>
    )
}
export default ArtworkDetails
