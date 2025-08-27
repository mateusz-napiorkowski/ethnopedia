import LoadingPage from "../LoadingPage"
import Navbar from "../../components/navbar/Navbar"
import Navigation from "../../components/Navigation"
import { useState } from "react"
import WarningPopup from "../WarningPopup"
import { deleteArtworks, getArtwork } from "../../api/artworks"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useNavigate, useParams } from "react-router-dom"
import { useUser } from "../../providers/UserProvider"
import ArtworkDetails from "../../components/artwork/ArtworkDetails"

const ArtworkPage = () => {
    const { jwtToken } = useUser()
    const queryClient = useQueryClient()
    const { collectionId: paramCollectionId, artworkId } = useParams<string>()
    const navigate = useNavigate()
    const [showDeleteArtworkWarning, setShowDeleteArtworkWarning] = useState(false)

    const { data: fetchedData } = useQuery({
        queryKey: ["artwork", artworkId],
        queryFn: () => getArtwork(artworkId as string),
        enabled: !!artworkId,
    })


    const collectionId = paramCollectionId || fetchedData?.artwork?.collectionId

    const deleteArtworksMutation = useMutation(
        () => deleteArtworks([artworkId as string], jwtToken as string),
        {
            onSuccess: () => {
                queryClient.invalidateQueries("artwork")
                if (collectionId) {
                    navigate(`/collections/${collectionId}/artworks/`)
                } else {
                    navigate(`/global-search`)
                }
            }
        }
    )

    if (!fetchedData)
        return <LoadingPage />


    const artworkData = fetchedData.artwork

    return (
        <div>
            <Navbar />
            {showDeleteArtworkWarning &&
                <WarningPopup
                    onClose={() => setShowDeleteArtworkWarning(false)}
                    deleteSelected={() => deleteArtworksMutation.mutate()}
                    warningMessage={"Czy na pewno chcesz usunąć rekord?"}
                />
            }
            <section className="p-2 sm:p-4">
                <div className="max-w-3xl mx-auto lg:px-6">
                    <Navigation />
                    <ArtworkDetails
                        collectionName={artworkData.collectionName}
                        detailsToShow={artworkData}
                        handleEditClick={() => {
                            navigate(
                                `/collections/${collectionId}/artworks/${artworkId}/edit-artwork`,
                                { state: { categories: artworkData.categories } }
                            )
                        }}
                        setShowDeleteArtworkWarning={setShowDeleteArtworkWarning}
                    />
                </div>
            </section>
        </div>
    )
}

export default ArtworkPage