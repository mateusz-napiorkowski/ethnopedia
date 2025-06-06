import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyCollectionMessage from '../../components/artwork/EmptyCollectionMessage';
import NoSearchResultMessage from '../../components/artwork/NoSearchResultMessage';
import LoadingPage from '../../pages/LoadingPage';

interface Artwork {
    _id: string;
    collectionId: string;
    categories: any[];
    createdAt: any,
    updatedAt: any
}

interface ArtworksListProps {
    artworksData: {
        artworks: Artwork[];
    } | undefined;
    collectionId: string;
    isLoading: boolean;
    isFetching: boolean;
    hasSearchParams: boolean;
    selectedDisplayCategories: string[];
    selectedArtworks: Record<string, boolean>;
    onToggleSelect: (id: string) => void;
    findValue: (artwork: Artwork, path: string) => string;
    jwtToken?: string;
}

const ArtworksList: React.FC<ArtworksListProps> = ({
                                                       artworksData,
                                                       collectionId,
                                                       isLoading,
                                                       isFetching,
                                                       hasSearchParams,
                                                       selectedDisplayCategories,
                                                       selectedArtworks,
                                                       onToggleSelect,
                                                       findValue,
                                                       jwtToken,
                                                   }) => {
    const navigate = useNavigate();

    if (isLoading || !artworksData) {
        return <LoadingPage />;
    }

    const { artworks } = artworksData;
    if (artworks.length === 0) {
        return hasSearchParams ? (
            <NoSearchResultMessage />
        ) : (
            <EmptyCollectionMessage setShowImportOptions={() => {}} jwtToken={jwtToken} />
        );
    }

    const formatDate = (date: any) => {
        const newDate = new Date(date).toLocaleDateString(
            "pl-pl",
            { year: "numeric", month: "numeric", day: "numeric" , hour: "numeric", minute: "numeric", second: "numeric"}
        )
        return newDate.toString()
    }

    const specialLabels: Record<string, string> = {
        createdAt: "Data utworzenia Rekordu",
        updatedAt: "Data ostatniej modyfikacji",
    };

    return (
        <>
            {artworks.map((artwork) => (
                <div
                    key={artwork._id}
                    className="px-4 max-w-screen-xl py-4 bg-white dark:bg-gray-800 shadow-md w-full rounded-lg mb-4 border border-gray-300 dark:border-gray-600 cursor-pointer"
                    data-testid={artwork._id}
                    onClick={() => navigate(`/collections/${collectionId}/artworks/${artwork._id}`)}
                >
                    <div className="flex flex-row">
            <span className="mr-4 flex items-center">
              <input
                  type="checkbox"
                  data-testid={`${artwork._id}-checkbox`}
                  checked={selectedArtworks[artwork._id]}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => onToggleSelect(artwork._id)}
              />
            </span>
                        <div>
                            {selectedDisplayCategories.length > 0
                                ? selectedDisplayCategories.map((cat) => {
                                    const label = cat.includes(".")
                                        ? cat.split(".").pop()!
                                        : specialLabels[cat] ?? cat;
                                    const isSpecialLabel = label == specialLabels["createdAt"] || label == specialLabels["updatedAt"]
                                    let value: string;
                                    if (label === specialLabels["createdAt"])
                                        value = formatDate(artwork.createdAt);
                                    else if (label === specialLabels["updatedAt"])
                                        value = formatDate(artwork.updatedAt);
                                    else
                                        value = findValue(artwork, cat);

                                    return (
                                        <div key={cat} className={ `text-${isSpecialLabel ? "sm" : "lg"} text-gray-800 dark:text-white`}>
                                            <span className="text-gray-400 inline">{label}: </span>
                                            {value}
                                        </div>
                                    );
                                })
                                : (
                                    <>
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                            {findValue(artwork, 'Tytuł')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-1">
                                            {findValue(artwork, 'Artyści')}
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-300">
                                            {findValue(artwork, 'Rok')}
                                        </p>
                                    </>
                                )}
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default ArtworksList;
