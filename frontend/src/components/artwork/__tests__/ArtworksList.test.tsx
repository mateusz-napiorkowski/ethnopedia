import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import ArtworksList from "../ArtworksList"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { UserContext } from '../../../providers/UserProvider';

const mockGetArtworksForCollectionPage = jest.fn()
const mockDeleteArtworks = jest.fn()
jest.mock('../../../api/artworks', () => ({
    getArtworksForCollectionPage: () => mockGetArtworksForCollectionPage,
    deleteArtworks: () => mockDeleteArtworks
}))

const mockGetCollection = jest.fn()
jest.mock('../../../api/collections', () => ({
    getCollection: () => mockGetCollection
}))

const mockGetAllCategories = jest.fn()
jest.mock('../../../api/categories', () => ({
    getAllCategories: () => mockGetAllCategories
}))

const queryClient = new QueryClient();
const user = userEvent.setup()

const collection = "example collection"
const renderPage = (
    queryClient: QueryClient, 
    userContextProps: any = {
        isUserLoggedIn: false,
        firstName: "",
        userId: "",
        jwtToken: undefined,
        setUserData: jest.fn()
    },
    collection: string = "example collection",
    ) => {
        return render(
            <UserContext.Provider value={ userContextProps }>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={[`/collections/${collection}/artworks/`]}>
                        <Routes>
                            <Route path="/collections/:collection/artworks/" element={<ArtworksList />}/>
                        </Routes>  
                    </MemoryRouter>
                </QueryClientProvider>    
            </UserContext.Provider>
        );
};

const artworksData = {
    "artworks": [],
    "total": 0,
    "currentPage": 1,
    "pageSize": 10
}

const collectionData = {
    "_id": "675ddf8c1e6d01766fbc5b2e",
    "name": collection,
    "description": "qweqew",
    "__v": 0
}

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

describe("ArtworksList tests", () => {
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
        mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByTestId, queryByTestId} = renderPage(queryClient)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))

        expect(queryByTestId("loading-page-container")).not.toBeInTheDocument()
        expect(getByTestId("loaded-artwork-page-container")).toBeInTheDocument()
    })
})