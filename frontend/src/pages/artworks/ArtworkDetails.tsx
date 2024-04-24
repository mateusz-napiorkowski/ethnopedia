import React from "react"
import { v4 as uuidv4 } from "uuid"
import { ReactComponent as EditIcon } from "../../assets/icons/edit.svg"
import { ReactComponent as TrashBinIcon } from "../../assets/icons/trashBin.svg"
import { useUser } from "../../providers/UserProvider"

interface ArtworkDetailsProps {
    Tytuł: string;
    Artyści: string;
    Rok: string;
    collectionName: string;
    detailsToShow: { [key: string]: any };
    showStructure: boolean;
    handleEditClick: () => void;
    setShowDeleteArtworkWarning: (value: boolean) => void;
}

interface SublistProps {
    subcategories: any;
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
    
    const { jwtToken } = useUser();
    const Sublist: React.FC<SublistProps> = ({subcategories}) => {
        if(subcategories !== undefined) {
            return <ul className="px-4 list-disc">
            {subcategories.map((category: any) => {
            return <li>{category.name}: {category.values.join(", ")}
                <Sublist subcategories={category.subcategories}/>
            </li>
            })}
        </ul>
        } else return <></> 
    }

    return (
        <div className="flex flex-row">
            <div className="mt-2 flex-2">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{Tytuł}</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mt-1">Artyści: {Artyści}</p>
                <p className="text-lg text-gray-500 dark:text-gray-300 mt-1">Rok: {Rok}</p>
                <p className="text-lg text-gray-500 dark:text-gray-300 mt-1">Kolekcja: {collectionName}</p>
                {detailsToShow.categories && 
                    <ul className="px-4 list-disc">
                        {detailsToShow.categories.map((category: any) => {
                            return <li>{category.name}: {category.values.join(", ")}
                                <Sublist subcategories={category.subcategories}/>
                            </li>
                        })}
                    </ul>
                }

            </div>

            {!showStructure && (
                <div className="flex-1 mt-4 flex justify-end text-gray-700">
                    {jwtToken &&<button className="text-lg font-semibold h-fit mr-4" onClick={handleEditClick}>
                        <span className="flex-row flex items-center">
                            <EditIcon />
                            <p className="ml-2">Edytuj</p>
                        </span>
                    </button>}
                    {!jwtToken &&<button disabled={true} title={"Aby edytować rekord musisz się zalogować."} className="text-lg font-semibold h-fit mr-4 bg-gray-100 hover:bg-gray-100" onClick={handleEditClick}>
                        <span className="flex-row flex items-center">
                            <EditIcon />
                            <p className="ml-2">Edytuj</p>
                        </span>
                    </button>}

                    {jwtToken && <button
                        className="text-lg font-semibold h-fit border-red-700 text-red-700 bg-red-50 hover:bg-white"
                        onClick={() => setShowDeleteArtworkWarning(true)}>
                        <span className="flex-row flex items-center">
                            <TrashBinIcon />
                            <p className="ml-2">Usuń</p>
                        </span>
                    </button>}
                    {!jwtToken && <button
                        disabled={true} title={"Aby usunąć rekord musisz się zalogować."} className="text-lg font-semibold h-fit border-red-700 text-red-700 bg-red-50 hover:bg-red-50"
                        onClick={() => setShowDeleteArtworkWarning(true)}>
                        <span className="flex-row flex items-center">
                            <TrashBinIcon />
                            <p className="ml-2">Usuń</p>
                        </span>
                    </button>}
                </div>
            )}
        </div>
    )
}
export default ArtworkDetails
