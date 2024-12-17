import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import ArtworksList from "../ArtworksList"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { UserContext } from '../../../providers/UserProvider';
import {collection, exampleArtworkId, artworksData, artworksDataSecondPage, collectionData, loggedInUserContextProps, jwtToken} from './utils/ArtworksListUtils'

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate,
}));

const mockGetArtworksForCollectionPage = jest.fn()
const mockDeleteArtworks = jest.fn()
jest.mock('../../../api/artworks', () => ({
    getArtworksForCollectionPage: () => mockGetArtworksForCollectionPage,
    deleteArtworks: (artworkId: string, jwtToken: string) => mockDeleteArtworks(artworkId, jwtToken)
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
    pageSize = 3
    ) => {
        return render(
            <UserContext.Provider value={ userContextProps }>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={[`/collections/${collection}/artworks/`]}>
                        <Routes>
                            <Route path="/collections/:collection/artworks/" element={<ArtworksList pageSize={pageSize}/>}/>
                        </Routes>  
                    </MemoryRouter>
                </QueryClientProvider>    
            </UserContext.Provider>
        );
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

    it("should render artworks list component after data is fetched from API, collection name and description should be displayed", async () => {
        mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByTestId, queryByTestId} = renderPage(queryClient)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))

        expect(queryByTestId("loading-page-container")).not.toBeInTheDocument()
        expect(getByTestId("loaded-artwork-page-container")).toBeInTheDocument()

        await waitFor(() => expect(getByTestId('collection-name-and-description-container')).toMatchSnapshot())
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
 
    it("should navigate to add record page when enabled add record button is clicked", async () => {
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

    it("should open export options window when export file button is clicked", async () => {
        mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł"]})
        const {getByRole, getByTestId, getByText, container} = renderPage(queryClient, loggedInUserContextProps)
        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        const exportFileButton = getByRole("button", {name: /eksportuj plik/i})
        
        await user.click(exportFileButton)
        await waitFor(() => getByTestId("export-options-container"))
        
        expect(getByText(/ustawienia eksportu metadanych do pliku .xlsx/i)).toBeInTheDocument()
    })

    it("should navigate to appropriate artwork page when entry from artworks list is clicked", async () => {
        mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByTestId} = renderPage(queryClient)

        await waitFor(() => getByTestId('artworks-listed'))

        await user.click(getByTestId(exampleArtworkId))
        
        expect(mockUseNavigate).toHaveBeenCalledWith(`/collections/${collection}/artworks/${exampleArtworkId}`)
    })

    //TODO test disabled button when no artworks are selected
    // it("should not open delete selected warning popup when enabled delete selected button is clicked and no records are selected", async () => {
    //     mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
    //     mockGetCollection.mockReturnValue(collectionData)
    //     const {getByRole, getByTestId, queryByText} = renderPage(queryClient, loggedInUserContextProps)

    //     await waitFor(() => getByTestId('loaded-artwork-page-container'))
    //     const deleteSelectedButton = getByRole("button", {name: /usuń zaznaczone/i})
    //     await user.click(deleteSelectedButton)

    //     expect(queryByText(/czy na pewno chcesz usunąć zaznaczone rekordy?/i)).not.toBeInTheDocument()
    // })

    //TODO page change tests
    // it("should refetch artworks list when artwork page is changed", async () => {
    //     mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
    //     mockGetCollection.mockReturnValue(collectionData)
    //     const {getByTestId} = renderPage(queryClient)

    //     await waitFor(() => getByTestId('loaded-artwork-page-container'))

    //     await waitFor(() => expect(getByTestId('artworks-listed')).toMatchSnapshot("page 1"))
    //     mockGetArtworksForCollectionPage.mockReturnValueOnce(artworksDataSecondPage)
    //     await user.click(getByTestId("page-2"))
    //     await waitFor(() => expect(getByTestId('artworks-listed')).toMatchSnapshot("page 2"))
    // })

    // TODO deleting of checked artworks tests
    // it("should ???", async () => {
    //     mockGetArtworksForCollectionPage.mockReturnValue(artworksData)
    //     mockGetCollection.mockReturnValue(collectionData)
    //     const {getByTestId, getByRole, getByLabelText, queryByText} = renderPage(queryClient, loggedInUserContextProps)

    //     await waitFor(() => getByTestId('artworks-listed'))

    //     await user.click(getByTestId(`${exampleArtworkId}-checkbox`))
        
    //     expect(getByTestId(`${exampleArtworkId}-checkbox`)).toBeChecked()

    //     const deleteSelectedButton = getByRole("button", {name: /usuń zaznaczone/i})
    //     await user.click(deleteSelectedButton)

    //     expect(queryByText("Czy na pewno chcesz usunąć zaznaczone rekordy?")).toBeInTheDocument()

    //     await user.click(getByLabelText("confirm"))

    //     await waitFor(() => expect(mockDeleteArtworks).toHaveBeenCalledWith([exampleArtworkId], jwtToken))
    //     expect(queryByText("Czy na pewno chcesz usunąć zaznaczone rekordy?")).not.toBeInTheDocument()
    // })
})