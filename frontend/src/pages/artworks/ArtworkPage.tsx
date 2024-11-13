import LoadingPage from "../LoadingPage"
import Navbar from "../../components/navbar/Navbar"
import Navigation from "../../components/Navigation"
import { useState } from "react"
import WarningPopup from "../collections/WarningPopup"
import { deleteArtwork, getArtwork } from "../../api/artworks"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useNavigate, useParams } from "react-router-dom"
import { useUser } from "../../providers/UserProvider"
import ArtworkDetails from "./ArtworkDetails"

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

    const findValue = (artwork: any, categoryName: string) => {
        let val = ""
        artwork.categories.forEach((category: any) => {
            if(category.name === categoryName) {
                val = category.values.toString()
                return
            }
        });
        return val
    }

    const deleleArtwork = useMutation(() => deleteArtwork(artworkId as string, jwtToken as string), {
        onSuccess: () => {
            queryClient.invalidateQueries("artwork")
            navigate(-1)
        },
    })

    const handleArtworkDeletion = () => {
        // if (!jwtToken || !artworkId) {
        //     return
        // }

        deleleArtwork.mutate()
    }

    const handleEditClick = () => {
        navigate(`edit-artwork`, {state:{categories: fetchedData.artwork.categories}})
    }

    if (!fetchedData) {
        return (
            <div data-testid="loading-page-container">
                <LoadingPage />
            </div>)
    } else {
        const artworkData = fetchedData.artwork
        const detailsToShow = showMore ? artworkData : {}

        return (
            <>
                <div data-testid="loaded-artwork-page-container">
                    <Navbar />
                    {showDeleteArtworkWarning &&
                        <WarningPopup onClose={() => setShowDeleteArtworkWarning(!showDeleteArtworkWarning)}
                                    deleteSelected={handleArtworkDeletion}
                                    warningMessage={"Czy na pewno chcesz usunąć rekord?"} />}
                    <section className="p-2 sm:p-4">
                        <div className="mx-auto max-w-screen-xl lg:px-6">
                            <Navigation />
                                <ArtworkDetails
                                    Tytuł={findValue(artworkData, "Tytuł")}
                                    Artyści={findValue(artworkData, "Artyści")}
                                    Rok={findValue(artworkData, "Rok")}
                                    collectionName={artworkData.collectionName}
                                    detailsToShow={detailsToShow}
                                    handleEditClick={handleEditClick}
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
}
export default ArtworkPage