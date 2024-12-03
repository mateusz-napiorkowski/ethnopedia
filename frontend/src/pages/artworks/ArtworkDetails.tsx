import React from "react"
import { ReactComponent as EditIcon } from "../../assets/icons/edit.svg"
import { ReactComponent as TrashBinIcon } from "../../assets/icons/trashBin.svg"
import { useUser } from "../../providers/UserProvider"

interface ArtworkDetailsProps {
    Tytuł: string;
    Artyści: string;
    Rok: string;
    collectionName: string;
    detailsToShow: { [key: string]: any };
    handleEditClick: () => void;
    setShowDeleteArtworkWarning: (value: boolean) => void;
}

interface SublistProps {
    subcategories: any;
    depth: number;
}

const ArtworkDetails: React.FC<ArtworkDetailsProps> = ({
                                                           Tytuł,
                                                           Artyści,
                                                           Rok,
                                                           collectionName,
                                                           detailsToShow,
                                                           handleEditClick,
                                                           setShowDeleteArtworkWarning,
                                                       }) => {
    
    const { jwtToken } = useUser();
    const bulletClassnames = ["px-4 list-[circle]", "px-4 list-[square]", "px-4 list-[disc]"]

    const Sublist: React.FC<SublistProps> = ({subcategories, depth}) => {
        return <ul className={bulletClassnames[depth % 3]}>
            {subcategories.map((category: any) => {
                return <li>{category.name}: {category.values.join(", ")}
                    { category.subcategories.length > 0 && <Sublist subcategories={category.subcategories} depth={depth+1}/> }          
                </li>
            })}
        </ul>
    } 

    return (
        <div className="flex flex-row">
            <div className="mt-2 flex-2 " data-testid="main-categories-container">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{Tytuł}</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mt-1">Artyści: {Artyści}</p>
                <p className="text-lg text-gray-500 dark:text-gray-300 mt-1">Rok: {Rok}</p>
                <p className="text-lg text-gray-500 dark:text-gray-300 mt-1">Kolekcja: {collectionName}</p>
                {detailsToShow.categories && 
                    <ul data-testid="details-list" className={bulletClassnames[0]}>
                        {detailsToShow.categories.map((category: any) => {
                            return <li>{category.name}: {category.values.join(", ")}
                                <Sublist subcategories={category.subcategories} depth={1}/>
                            </li>
                        })}
                    </ul>
                }
            </div>

            <div className="flex-1 mt-4 flex justify-end text-gray-700">
                <button
                    disabled={jwtToken ? false : true} 
                    className={jwtToken ? 
                        "text-lg font-semibold h-fit mr-4" : 
                        "text-lg font-semibold h-fit mr-4 bg-gray-100 hover:bg-gray-100"
                    }
                    onClick={handleEditClick}
                >
                    <span className="flex-row flex items-center">
                        <EditIcon />
                        <p className="ml-2">Edytuj</p>
                    </span>
                </button>
                <button
                    disabled={jwtToken ? false : true}
                    className={jwtToken ?
                        "text-lg font-semibold h-fit border-red-700 text-red-700 bg-red-50 hover:bg-white" : 
                        "text-lg font-semibold h-fit border-red-700 text-red-700 bg-red-50 hover:bg-red-50"
                    }
                    onClick={() => setShowDeleteArtworkWarning(true)}
                >
                    <span className="flex-row flex items-center">
                        <TrashBinIcon />
                        <p className="ml-2">Usuń</p>
                    </span>
                </button>
            </div>
        </div>
    )
}
export default ArtworkDetails
