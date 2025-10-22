import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import ArtworkPage from "../ArtworkPage"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { UserContext } from '../../../providers/UserProvider';

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate,
}));

const mockGetArtwork = jest.fn()
const mockDeleteArtworks = jest.fn()
jest.mock('../../../api/artworks', () => ({
    getArtwork: () => mockGetArtwork(),
    deleteArtworks: (artworkId: string, jwtToken: string) => mockDeleteArtworks(artworkId, jwtToken)
}))

const queryClient = new QueryClient();
const user = userEvent.setup()

const exampleCollectionId = "66f2194a6123d7f50558cd8f"
const artworkId = "670c2aecc29b79e5aaef1b9b"
const renderPage = (
    queryClient: QueryClient, 
    userContextProps: any = {
        isUserLoggedIn: false,
        firstName: "",
        userId: "",
        jwtToken: undefined,
        setUserData: jest.fn()
    },
    collectionId: string = exampleCollectionId,
    artworkId: string = "670c2aecc29b79e5aaef1b9b"
    ) => {
        return render(
            <UserContext.Provider value={ userContextProps }>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={[`/collections/${collectionId}/artworks/${artworkId}`]}>
                        <Routes>
                            <Route path="/collections/:collectionId/artworks/:artworkId" element={<ArtworkPage />}/>
                        </Routes>  
                    </MemoryRouter>
                </QueryClientProvider>    
            </UserContext.Provider>
        );
};

const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"

const loggedInUserContextProps = {
    isUserLoggedIn: true,
    firstName: "123",
    userId: "66b6506fbb64df165e8a9ce6",
    jwtToken: jwtToken,
    setUserData: jest.fn()
};

const artworkData = {
    "artwork": {
        "_id": "670c2aecc29b79e5aaef1b9b",
        "createdAt": "2024-11-05T20:14:22.883Z",
        "updatedAt": "2024-11-05T20:14:22.883Z",
        "__v": 0,
        "categories": [
            {
                "name": "Tytuł",
                "value": 
                    "testowy"
                ,
                "subcategories": [
                    {
                        "name": "Podtytuł",
                        "value": 
                            "testowy podtytuł"
                        ,
                        "subcategories": []
                    }
                ]
            },
            {
                "name": "Artyści",
                "value": 
                    "testowi"
                ,
                "subcategories": []
            },
            {
                "name": "Rok",
                "value": 
                    "966"
                ,
                "subcategories": [
                    {
                        "name": "Miesiąc",
                        "value": 
                            "Wrzesień"
                        ,
                        "subcategories": [
                            {
                                "name": "Dzień",
                                "value": 
                                    "13"
                                ,
                                "subcategories": []
                            }
                        ]
                    },
                    {
                        "name": "Pora roku",
                        "value": 
                            "lato"
                        ,
                        "subcategories": []
                    }
                ]
            }
        ],
        "collectionName": "example collection",
        files: []
    }
}

const artworkDataWithoutCategories = {
    "artwork": {
        "_id": "670c2aecc29b79e5aaef1b9b",
        "createdAt": "2024-11-05T20:14:22.883Z",
        "updatedAt": "2024-11-05T20:14:22.883Z",
        "__v": 0,
        "categories": [
        ],
        "collectionName": "example collection",
        files: []
    }
}

describe("ArtworkPage tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
    });

    it("should render loading state", () => {           
        const {queryByTestId} = renderPage(queryClient)
        
        expect(queryByTestId("loading-page-container")).toBeInTheDocument()
        expect(queryByTestId("loaded-artwork-page-container")).not.toBeInTheDocument()
    })

    it("should render artwork page component correctly after data is fetched from API", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, queryByTestId} = renderPage(queryClient)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))

        expect(queryByTestId("loading-page-container")).not.toBeInTheDocument()
        expect(getByTestId("main-categories-container")).toMatchSnapshot()
    })

    it("should render disabled edit button when user is not logged in", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, getByRole} = renderPage(queryClient)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))

        expect(getByRole("button", {
            name: /edytuj/i
        })).toBeDisabled();
    })

    it("should navigate to edit artwork page after enabled edit button is clicked", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, getByRole } = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        await user.click(getByRole("button", {
            name: /edytuj/i
        }))

        expect(mockUseNavigate).toHaveBeenCalledWith(
            `/collections/${exampleCollectionId}/artworks/${artworkId}/edit-artwork`, 
            {state: {categories: artworkData.artwork.categories}}
        )
    })

    it("should render disabled delete button when user is not logged in", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, getByRole} = renderPage(queryClient)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))

        expect(getByRole("button", {
            name: /usuń/i
        })).toBeDisabled();
    })

    it("should render delete warning popup after enabled delete button is clicked", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, getByRole, getByText} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        await user.click(getByRole("button", {
            name: /usuń/i
        }))

        await expect(getByText(/czy na pewno chcesz usunąć rekord?/i)).toBeInTheDocument()
    })

    it("should not render delete warning popup after user clicks cancel button", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, getByRole, queryByText} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        await user.click(getByRole("button", {
            name: /usuń/i
        }))
        await user.click(getByRole("button", {
            name: /anuluj/i
        }))

        await expect(queryByText(/czy na pewno chcesz usunąć rekord?/i)).not.toBeInTheDocument()
    })

    it("should not render delete warning popup after user clicks exit button", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, getByLabelText, getByRole, queryByText} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        await user.click(getByRole("button", {
            name: /usuń/i
        }))
        await user.click(getByLabelText("exit"))

        await expect(queryByText(/czy na pewno chcesz usunąć rekord?/i)).not.toBeInTheDocument()
    })

    it("should call deleteArtworks with correct arguments and navigate to collection page" +
        " after delete button in delete warning popup is clicked", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        mockDeleteArtworks.mockImplementation(() => ({acknowledged: true, deletedCount: 1}))
        const {getByTestId, getByRole, getByLabelText } = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        await user.click(getByRole("button", {
            name: /usuń/i
        }))
        user.click(getByLabelText("confirm"))

        await waitFor(() => expect(mockDeleteArtworks).toHaveBeenCalledWith([artworkId], jwtToken))
        expect(mockUseNavigate).toHaveBeenCalledWith(`/collections/${exampleCollectionId}/artworks/`)      
    })

    it("should call use navigate(-1) when go back to collection button is clicked", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, getByRole} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        await user.click(getByRole("button", {
            name: /powrót do kolekcji/i
        }))

        expect(mockUseNavigate).toHaveBeenCalledWith(-1)
    })

    it("should render category tree correctly after subcategories are shown by clicking expand button", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, getByRole} = renderPage(queryClient)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        
        await user.click(getByRole("button", {
            name: /rok-fold\/expand-button/i
        }))
        
        await user.click(getByRole("button", {
            name: /miesiąc-fold\/expand-button/i
        }))

        await user.click(getByRole("button", {
            name: /tytuł-fold\/expand-button/i
        }))

        expect(getByTestId("category-tree")).toMatchSnapshot()
    })

    it("should render category tree correctly after subcategories are hidden by clicking fold buttons", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, getByRole} = renderPage(queryClient)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        
        await user.click(getByRole("button", {
            name: /rok-fold\/expand-button/i
        }))
        
        await user.click(getByRole("button", {
            name: /miesiąc-fold\/expand-button/i
        }))

        await user.click(getByRole("button", {
            name: /tytuł-fold\/expand-button/i
        }))

        await user.click(getByRole("button", {
            name: /rok-fold\/expand-button/i
        }))

        await user.click(getByRole("button", {
            name: /tytuł-fold\/expand-button/i
        }))

        expect(getByTestId("category-tree")).toMatchSnapshot()
    })
})