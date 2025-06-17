import React, { useState } from "react";
import { ReactComponent as Expand } from "../../assets/icons/plus.svg";
import { ReactComponent as Fold } from "../../assets/icons/minus.svg";
import { ReactComponent as EditIcon } from "../../assets/icons/edit.svg";
import { ReactComponent as TrashBinIcon } from "../../assets/icons/trashBin.svg";
import { ReactComponent as MusicNoteIcon } from "../../assets/icons/music-note.svg"
import { ReactComponent as UnknownFileIcon } from "../../assets/icons/unknown-file.svg"
import { useUser } from "../../providers/UserProvider";
import {useNavigate} from "react-router-dom";
import { API_URL } from "../../config"
import { downloadMidiOrMeiFile } from "../../api/download";

interface Category {
    name: string;
    value?: string;
    subcategories?: Category[];
}

interface ArtworkDetailsProps {
    collectionName: string;
    detailsToShow: { _id: any, categories: Category[]; createdAt: string, updatedAt: string, fileName: string, filePath: string};
    handleEditClick: () => void;
    setShowDeleteArtworkWarning: (value: boolean) => void;
}

const ArtworkDetails: React.FC<ArtworkDetailsProps> = ({
                                                           collectionName,
                                                           detailsToShow,
                                                           handleEditClick,
                                                           setShowDeleteArtworkWarning,
                                                       }) => {
    const { jwtToken } = useUser();
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
    const navigate = useNavigate();

    const toggle = (key: string) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const renderTree = (categories: Category[], level = 0) => (
        <ul>
            {categories.map((category) => (
                <li
                    key={category.name}
                    style={{ marginLeft: level > 0 ? `16px` : '0' }}
                    className="mb-2 bg-gray-50 dark:bg-gray-700"
                >
                    <div className="flex justify-between items-center p-2">
                      <span>
                          {category.name}: {category.value}
                      </span>
                        {category.subcategories && category.subcategories.length > 0 && (
                            <button
                                onClick={() => toggle(category.name)}
                                className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                aria-label={`${category.name}-fold/expand-button`}
                            >
                                {expanded[category.name] ? (
                                    <Fold className="w-4 h-4" />
                                ) : (
                                    <Expand className="w-4 h-4" />
                                )}
                            </button>
                        )}
                    </div>
                    {expanded[category.name] && category.subcategories && (
                        <div>
                            {renderTree(category.subcategories, level + 1)}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );

    const createdAtDate = new Date(detailsToShow.createdAt).toLocaleDateString(
        "pl-pl",
        { year: "numeric", month: "numeric", day: "numeric" , hour: "numeric", minute: "numeric", second: "numeric"}
    )
    const updatedAtDate = new Date(detailsToShow.updatedAt).toLocaleDateString(
        "pl-pl",
        { year: "numeric", month: "numeric", day: "numeric" , hour: "numeric", minute: "numeric", second: "numeric"}
    )

    return (
        <div className="max-w-3xl mx-auto mt-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow" data-testid="main-categories-container">
            {/* Nagłówek */}
            <div className="mb-4 border-b pb-2">
                <p className="text-lg text-gray-500 dark:text-gray-300">
                    Kolekcja: {collectionName}
                </p>
            </div>
            {/* Drzewo kategorii */}
            <div data-testid="category-tree">{detailsToShow.categories && renderTree(detailsToShow.categories)}</div>
            <div className="mb-4 mt-4">
                <label
                    htmlFor="dropzone-file"
                    className="block text-sm font-bold text-gray-700 dark:text-white my-2"
                >
                    Plik MIDI/MEI
                </label>
                <div
                    role="button"
                    aria-label="download-file"
                    onClick={() => {if(detailsToShow.fileName) downloadMidiOrMeiFile(detailsToShow.fileName, detailsToShow._id)}}
                    className={`flex flex-col items-start justify-start p-2 border-2 border-gray-200
                            border-solid rounded-lg ${detailsToShow.fileName ? "cursor-pointer" : "cursor-default"} bg-gray-50 
                            dark:bg-gray-800 dark:border-gray-600
                            ${detailsToShow.fileName ? "hover:bg-gray-100 dark:hover:border-gray-500 dark:hover:bg-gray-700" : ""}`}
                >
                <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex flex-row items-center justify-center gap-4">
                        {detailsToShow.fileName &&
                            <>{/\.(mei|mid|midi)$/i.test(detailsToShow.fileName)
                            ? <MusicNoteIcon className="w-12 h-12" />
                            : <UnknownFileIcon className="w-12 h-12" />}</>
                            
                        } 
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            {detailsToShow.fileName ? detailsToShow.fileName : "Brak wgranego pliku"}
                        </p>
                    </div>
                </div>
            </div>
            </div>
            <div className="mb-4 border-t pb-2 pt-2">
                <p className="text-sm text-gray-500 dark:text-gray-300">
                    Data utworzenia rekordu: {createdAtDate.toString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                    Data ostatniej modyfikacji: {updatedAtDate.toString()}
                </p>
            </div>
            
            {/* Przyciski akcji */}
            <div className="mt-10 flex justify-end space-x-4">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-blue-600 hover:underline rounded"
                >
                    ← Powrót do kolekcji
                </button>
                <button
                    disabled={!jwtToken}
                    onClick={handleEditClick}
                    className={`flex items-center px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors ${
                        !jwtToken ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    <EditIcon className="w-5 h-5"/>
                    <span className="ml-2">Edytuj</span>
                </button>
                <button
                    disabled={!jwtToken}
                    onClick={() => setShowDeleteArtworkWarning(true)}
                    className={`flex items-center px-4 py-2 rounded border border-red-700 text-red-700 bg-red-50 hover:bg-red-100 transition-colors ${
                        !jwtToken ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    <TrashBinIcon className="w-5 h-5"/>
                    <span className="ml-2">Usuń</span>
                </button>
            </div>
        </div>
    );
};

export default ArtworkDetails;
