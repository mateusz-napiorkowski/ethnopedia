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
    const { artworkId } = useParams<string>()
    const navigate = useNavigate()
    const [showMore, setShowMore] = useState(false)
    const [showDeleteArtworkWarning, setShowDeleteArtworkWarning] = useState(false)

    const { data: fetchedData } = useQuery({
        queryKey: ["artwork", artworkId],
        queryFn: () => getArtwork(artworkId as string),
        enabled: !!artworkId,
    })

    const findCategoryValue = (artwork: any, categoryName: string) => {
        const foundCategory = artwork.categories.find((category: any) => category.name === categoryName);
        return foundCategory ? foundCategory.value : "";
    }

    const deleteArtworksMutation = useMutation(() => deleteArtworks([artworkId as string], jwtToken as string), {
        onSuccess: () => {
            queryClient.invalidateQueries("artwork")
            navigate(`/collections/${artworkData.collectionName}/artworks/`)
        }
    })

    if (!fetchedData)
        return (
            <div data-testid="loading-page-container">
                <LoadingPage />
            </div>
        )

    const artworkData = fetchedData.artwork
    return (
        <>
            <div data-testid="loaded-artwork-page-container">
                <Navbar />
                {showDeleteArtworkWarning &&
                    <WarningPopup 
                        onClose={() => setShowDeleteArtworkWarning(!showDeleteArtworkWarning)}
                        deleteSelected={() => deleteArtworksMutation.mutate()}
                        warningMessage={"Czy na pewno chcesz usunąć rekord?"}
                    />
                }
                <section className="p-2 sm:p-4">
                    <div className="mx-auto max-w-screen-xl lg:px-6">
                        <Navigation artworkTitle={findCategoryValue(artworkData, "Tytuł")}/>
                        <ArtworkDetails
                            Tytuł={findCategoryValue(artworkData, "Tytuł")}
                            Artyści={findCategoryValue(artworkData, "Artyści")}
                            Rok={findCategoryValue(artworkData, "Rok")}
                            collectionName={artworkData.collectionName}
                            detailsToShow={showMore ? artworkData : {}}
                            handleEditClick={() => navigate(`edit-artwork`, {state:{categories: fetchedData.artwork.categories}})}
                            setShowDeleteArtworkWarning={setShowDeleteArtworkWarning}
                        />
                        <button type="button" onClick={() => setShowMore(!showMore)}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-400 font-semibold border-none">
                            {showMore ? "Pokaż mniej" : "Pokaż więcej"}
                        </button>
                    </div>
                </section>
            </div>
        </>
    )
}
export default ArtworkPage