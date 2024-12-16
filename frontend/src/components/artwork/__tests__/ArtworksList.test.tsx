import '@testing-library/jest-dom';
import { getByText, render, waitFor } from '@testing-library/react'
import ArtworksList from "../ArtworksList"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { UserContext } from '../../../providers/UserProvider';

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate,
}));

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

const exampleArtworkId = "6752ddca46e3ca48231024dc"
const artworksData = {
    "artworks": [
        {
            "_id": exampleArtworkId,
            "categories": [
                {
                    "name": "Tytuł",
                    "values": [
                        "Jakym jechoł koło dworu"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Artyści",
                    "values": [
                        "Józefa Piaskowska"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "values": [
                        "1960"
                    ],
                    "subcategories": []
                },
            ],
            "collectionName": collection,
            "__v": 0,
            "createdAt": "2024-12-06T11:19:38.327Z",
            "updatedAt": "2024-12-06T11:19:38.327Z"
        },
        {
            "_id": "6752ddca46e3ca48231024aa",
            "categories": [
                {
                    "name": "Tytuł",
                    "values": [
                        "Ojcze, ojcze, kup mi kónia"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Artyści",
                    "values": [
                        "Magdalena Figlak"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "values": [
                        "1949"
                    ],
                    "subcategories": []
                },
            ],
            "collectionName": collection,
            "__v": 0,
            "createdAt": "2024-12-06T11:19:38.327Z",
            "updatedAt": "2024-12-06T11:19:38.327Z"
        },
        {
            "_id": "6752ddca46e3ca48231024bb",
            "categories": [
                {
                    "name": "Tytuł",
                    "values": [
                        "Piękna jagoda"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Artyści",
                    "values": [
                        "Zespół Mazowsze"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "values": [
                        "2005"
                    ],
                    "subcategories": []
                },
            ],
            "collectionName": collection,
            "__v": 0,
            "createdAt": "2024-12-06T11:19:38.327Z",
            "updatedAt": "2024-12-06T11:19:38.327Z"
        },
    ],
    "total": 3,
    "currentPage": 1,
    "pageSize": 10
}

const collectionData = {
    "_id": "675ddf8c1e6d01766fbc5b2e",
    "name": collection,
    "description": "example collection description",
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

    it("should show correct collection name and description", async () => {
        mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByTestId} = renderPage(queryClient)

        await waitFor(() => expect(getByTestId('collection-name-and-description-container')).toMatchSnapshot())
    })

    it("should render list of artworks correctly", async () => {
        mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByTestId} = renderPage(queryClient)

        await waitFor(() => expect(getByTestId('artworks-listed')).toMatchSnapshot())
    })

    it("should call useNavigate with url to appropriate artwork page when entry from artworks list is clicked", async () => {
        mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByTestId} = renderPage(queryClient)

        await waitFor(() => getByTestId('artworks-listed'))

        await user.click(getByTestId(exampleArtworkId))
        
        expect(mockUseNavigate).toHaveBeenCalledWith(`/collections/${collection}/artworks/${exampleArtworkId}`)
    })

    it("should have add record, import file, and delete selected buttons disabled when user is not logged in", async () => {
        mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByRole, getByTestId} = renderPage(queryClient)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        const addNewRecordButton = getByRole("button", {name: /nowy rekord/i})
        const importFileButton = getByRole("button", {name: /importuj plik/i})
        const deleteSelectedButton = getByRole("button", {name: /usuń zaznaczone/i})

        expect(addNewRecordButton).toBeDisabled()
        expect(importFileButton).toBeDisabled()
        expect(deleteSelectedButton).toBeDisabled()
    })

    it("should have add record, import file, and delete selected buttons enabled when user is logged in", async () => {
        mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByRole, getByTestId} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        const addNewRecordButton = getByRole("button", {name: /nowy rekord/i})
        const importFileButton = getByRole("button", {name: /importuj plik/i})
        const deleteSelectedButton = getByRole("button", {name: /usuń zaznaczone/i})

        expect(addNewRecordButton).not.toBeDisabled()
        expect(importFileButton).not.toBeDisabled()
        expect(deleteSelectedButton).not.toBeDisabled()
    })

    it("should call useNavigate with proper url parameter when enabled add record button is clicked", async () => {
        mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByRole, getByTestId} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        const addNewRecordButton = getByRole("button", {name: /nowy rekord/i})
        await user.click(addNewRecordButton)

        expect(mockUseNavigate).toHaveBeenCalledWith("/collections/example collection/create-artwork")
    })

    it("should open upload file window when enabled import file button is clicked", async () => {
        mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByRole, getByTestId, getByText} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        const importFileButton = getByRole("button", {name: /importuj plik/i})
        await user.click(importFileButton)

        expect(getByText(/prześlij plik/i)).toBeInTheDocument()
    })

    it("should not open delete selected warning popup when enabled delete selected button is clicked and no records are selected", async () => {
        mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByRole, getByTestId, queryByText} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        const deleteSelectedButton = getByRole("button", {name: /usuń zaznaczone/i})
        await user.click(deleteSelectedButton)

        expect(queryByText(/czy na pewno chcesz usunąć zaznaczone rekordy?/i)).not.toBeInTheDocument()
    })
})