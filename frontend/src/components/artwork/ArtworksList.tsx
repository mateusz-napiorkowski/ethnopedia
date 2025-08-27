import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyCollectionMessage from '../../components/artwork/EmptyCollectionMessage';
import NoSearchResultMessage from '../../components/artwork/NoSearchResultMessage';
import LoadingPage from '../../pages/LoadingPage';

interface Artwork {
    _id: string;
    collectionId: string;
    categories: any[];
}

interface ArtworksListProps {
    artworksData: {
        artworks: Artwork[];
    } | undefined;
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
    const { collectionId } = useParams();

    if (isLoading || isFetching || !artworksData) {
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

    return (
        <>
            {artworks.map((artwork) => (
                <div
                    key={artwork._id}
                    className="px-4 max-w-screen-xl py-4 bg-white dark:bg-gray-800 shadow-md w-full rounded-lg mb-4 border border-gray-300 dark:border-gray-600 cursor-pointer"
                    data-testid={artwork._id}
                    onClick={() => {
                        // Use collectionId from URL params if available, otherwise fall back to artwork.collectionId
                        const targetCollectionId = collectionId || artwork.collectionId;
                        navigate(`/collections/${targetCollectionId}/artworks/${artwork._id}`);
                    }}

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
                        <div className="flex-1 min-w-0">
                            {selectedDisplayCategories.map((cat) => {
                                const label = cat.includes('.') ? cat.split('.').pop() : cat;
                                return (
                                    <div
                                        key={cat}
                                        className="text-lg text-gray-800 dark:text-white w-full break-words"
                                        title={findValue(artwork, cat)} // pokaże pełną wartość po najechaniu
                                    >
                                        <span className="text-gray-400">{label}: </span>
                                        <span>{findValue(artwork, cat)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            ))}
        </>
    );
};

export default ArtworksList;