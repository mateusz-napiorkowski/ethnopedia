import CustomTextField from "../../components/CustomTextField"
import LoadingPage from "../LoadingPage"
import Navbar from "../../components/navbar/Navbar"
import Navigation from "../../components/Navigation"
import { useEffect, useState } from "react"
import WarningPopup from "../collections/WarningPopup"
import { deleteArtwork, getArtwork } from "../../api/artworks"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useNavigate, useParams } from "react-router-dom"
import { useUser } from "../../providers/UserProvider"
import ArtworkDetails from "./ArtworkDetails"

const ArtworkPage = () => {
    const { artworkId } = useParams<string>()
    const [showMore, setShowMore] = useState(false)
    const [showDeleteArtworkWarning, setShowDeleteArtworkWarning] = useState(false)
    const { jwtToken } = useUser()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [textFields, setTextFields] = useState<any>([])
    const [showStructure, ] = useState<boolean>(false)

    const [activeTab, ] = useState("ArtworkDetails")

    const { data: fetchedData } = useQuery({
        queryKey: ["artwork", artworkId],
        queryFn: () => getArtwork(artworkId as string),
        enabled: !!artworkId,
    })

    useEffect(() => {
        if (fetchedData !== undefined) {
            setTextFields(fetchedData.artwork)
        }
    }, [fetchedData])

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

    const handleTextFieldChange = (fieldName: string, event: string) => {
        setTextFields({
            ...textFields,
            [fieldName]: event,
        })
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

        const artworksEdit = Object.entries(textFields).map(([columnName, value]: [string, any], index: number) => {
            return columnName !== "_id" && <div className="py-2" key={`${columnName}-${index}`}>
                <CustomTextField
                    columnName={columnName}
                    value={textFields[columnName]}
                    onInputChange={(event) => handleTextFieldChange(columnName, event)}
                />
            </div>
        })

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
                            {activeTab === "ArtworkDetails" && (
                                <ArtworkDetails
                                    Tytuł={findValue(artworkData, "Tytuł")}
                                    Artyści={findValue(artworkData, "Artyści")}
                                    Rok={findValue(artworkData, "Rok")}
                                    collectionName={artworkData.collectionName}
                                    detailsToShow={detailsToShow}
                                    showStructure={showStructure}
                                    handleEditClick={handleEditClick}
                                    setShowDeleteArtworkWarning={setShowDeleteArtworkWarning}
                                />
                            )}
                            {activeTab === "Structure" && showStructure && artworksEdit}

                            {!showStructure &&
                                <button type="button" onClick={() => setShowMore(!showMore)}
                                        className="mt-4 px-4 py-2 bg-blue-500 text-white hover:bg-blue-400 font-semibold border-none">
                                    {showMore ? "Pokaż mniej" : "Pokaż więcej"}
                                </button>
                            }
                        </div>
                    </section>
                </div>
            </>
        )

    }
}
export default ArtworkPage