import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import ArtworksListPage from "../ArtworksListPage"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { UserContext } from '../../../providers/UserProvider';
import {jwtToken, loggedInUserContextProps, collectionData, artworkIds, artworkTitles, artworksData, artworksDataSecondPage} from './utils/consts'

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate,
}));

const mockGetArtworksForPage = jest.fn()
const mockDeleteArtworks = jest.fn()
jest.mock('../../../api/artworks', () => ({
    getArtworksForPage: () => mockGetArtworksForPage,
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
    collectionId: string = collectionData._id,
    pageSize = 3
    ) => {
        return render(
            <UserContext.Provider value={ userContextProps }>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={[`/collections/${collectionId}/artworks/`]}>
                        <Routes>
                            <Route path="/collections/:collectionId/artworks/" element={<ArtworksListPage pageSize={pageSize}/>}/>
                        </Routes>  
                    </MemoryRouter>
                </QueryClientProvider>    
            </UserContext.Provider>
        );
};

describe("ArtworksListPage tests", () => {
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
        mockGetArtworksForPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByTestId, queryByTestId} = renderPage(queryClient)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))

        expect(queryByTestId("loading-page-container")).not.toBeInTheDocument()
        expect(getByTestId("loaded-artwork-page-container")).toBeInTheDocument()

        await waitFor(() => expect(getByTestId('collection-name-and-description-container')).toMatchSnapshot())
    })

    it("should have edit collection, add record, import file, and delete selected buttons disabled when user is not logged in", async () => {
        mockGetArtworksForPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByRole, getByTestId} = renderPage(queryClient)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        const editCollectionButton = getByRole("button", {name: /edytuj/i})
        const addNewRecordButton = getByRole("button", {name: /nowy rekord/i})
        const importFileButton = getByRole("button", {name: /importuj dane/i})
        const deleteSelectedButton = getByRole("button", {name: /usuń zaznaczone/i})

        expect(editCollectionButton).toBeDisabled()
        expect(addNewRecordButton).toBeDisabled()
        expect(importFileButton).toBeDisabled()
        expect(deleteSelectedButton).toBeDisabled()
    })

    it("should have edit collection, add record and import file buttons enabled when user is logged in, delete selected button should stay disabled when no artworks are selected", async () => {
        mockGetArtworksForPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByRole, getByTestId} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        const editCollectionButton = getByRole("button", {name: /edytuj/i})
        const addNewRecordButton = getByRole("button", {name: /nowy rekord/i})
        const importFileButton = getByRole("button", {name: /importuj dane/i})
        const deleteSelectedButton = getByRole("button", {name: /usuń zaznaczone/i})

        expect(editCollectionButton).not.toBeDisabled()
        expect(addNewRecordButton).not.toBeDisabled()
        expect(importFileButton).not.toBeDisabled()
        expect(deleteSelectedButton).toBeDisabled()
    })
 
    it("should navigate to edit collection page when enabled edit collection button is clicked and pass state with current collection data", async () => {
        mockGetArtworksForPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByRole, getByTestId} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        const addNewRecordButton = getByRole("button", {name: /edytuj/i})
        await user.click(addNewRecordButton)

        expect(mockUseNavigate).toHaveBeenCalledWith(`/collections/${collectionData._id}/edit`,
            {"state":
                {
                    "categories": collectionData.categories,
                    "collectionId": collectionData._id,
                    "description": collectionData.description,
                    "mode": "edit",
                    "name": collectionData.name}
            }
        )
    })

    it("should navigate to add record page when enabled add record button is clicked", async () => {
        mockGetArtworksForPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByRole, getByTestId} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        const addNewRecordButton = getByRole("button", {name: /nowy rekord/i})
        await user.click(addNewRecordButton)

        expect(mockUseNavigate).toHaveBeenCalledWith(`/collections/${collectionData._id}/create-artwork`)
    })

    it("should navigate to import to existing collection page when enabled import data button is clicked", async () => {
        mockGetArtworksForPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByRole, getByTestId, getByText} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        const importFileButton = getByRole("button", {name: /importuj dane/i})
        await user.click(importFileButton)

        expect(mockUseNavigate).toHaveBeenCalledWith(`/collections/${collectionData._id}/import-data`)
    })

    it("should navigate to export data page and pass correct state when export file button is clicked", async () => {
        mockGetArtworksForPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByRole, getByTestId} = renderPage(queryClient, loggedInUserContextProps)
        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        
        const exportFileButton = getByRole("button", {name: /eksportuj dane/i})
        
        await user.click(exportFileButton)
        expect(mockUseNavigate).toHaveBeenCalledWith(
            `/collections/${collectionData._id}/export-data`,
            {
                state: {
                    "initialArchiveFilename": collectionData.name,
                    "initialFilename": collectionData.name,
                    "searchParams": "",
                    "selectedArtworks": {}
                }
            }
        )
       
    })

    it("should expand display categories select menu when it is clicked", async () => {
        mockGetArtworksForPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByRole, getByTestId, getByLabelText} = renderPage(queryClient, loggedInUserContextProps)
        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        
        const expandDisplayCategoriesSelectElement = getByLabelText("open/close-display-categories-select")

        await user.click(expandDisplayCategoriesSelectElement)
        expect(getByTestId("DisplayCategoriesSelectExpanded")).toBeInTheDocument()
    })

    it("should navigate to appropriate artwork page when entry from artworks list is clicked", async () => {
        mockGetArtworksForPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByTestId} = renderPage(queryClient)

        await waitFor(() => getByTestId('artworks-listed'))

        await user.click(getByTestId(artworkIds[0]))
        
        expect(mockUseNavigate).toHaveBeenCalledWith(`/collections/${collectionData._id}/artworks/${artworkIds[0]}`)
    })

    it("should have delete selected button enabled if any artworks are selected", async () => {
        mockGetArtworksForPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        const {getByRole, getByTestId} = renderPage(queryClient, loggedInUserContextProps)
        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        const deleteSelectedButton = getByRole("button", {name: /usuń zaznaczone/i})
        const exampleArtworkCheckbox = getByTestId(`${artworkIds[0]}-checkbox`)

        await user.click(exampleArtworkCheckbox)

        expect(deleteSelectedButton).not.toBeDisabled()
    })

    it("should refetch artworks list when artwork page is changed", async () => {
        mockGetArtworksForPage.mockReturnValue(artworksData)
        mockGetCollection.mockReturnValue(collectionData)
        mockGetAllCategories.mockReturnValueOnce({categories: ["Tytuł", "Tytuł.Podtytuł", "Artyści", "Rok"]})
        const {getByTestId} = renderPage(queryClient)
        await waitFor(() => getByTestId('loaded-artwork-page-container'))

        await waitFor(() => expect(getByTestId('artworks-listed')).toMatchSnapshot("page 1"))

        mockGetArtworksForPage.mockReturnValueOnce(artworksDataSecondPage)
        await user.click(getByTestId("page-2"))

        await waitFor(() => expect(getByTestId('artworks-listed')).toMatchSnapshot("page 2"))
    })

    it.each([
            {
                clickSequence: [],
                clickSequenceWithTitles: [],
                expectedChecked: []
            },
            {
                clickSequence: [artworkIds[1], artworkIds[2], artworkIds[0], artworkIds[2], artworkIds[1], artworkIds[2]],
                clickSequenceWithTitles: [artworkTitles[1], artworkTitles[2], artworkTitles[0], artworkTitles[2], artworkTitles[1], artworkTitles[2]],
                expectedChecked: [artworkIds[2], artworkIds[0]]
            },
            {
                clickSequence: [artworkIds[1], artworkIds[0], artworkIds[2], artworkIds[0], "Odznacz wszystkie"],
                clickSequenceWithTitles: [artworkTitles[1], artworkTitles[0], artworkTitles[2], artworkIds[0], "Odznacz wszystkie"],
                expectedChecked: []
            },
            {
                clickSequence: [artworkIds[1], "Zaznacz wszystkie"],
                clickSequenceWithTitles: [artworkTitles[1], "Zaznacz wszystkie"],
                expectedChecked: [artworkIds[0], artworkIds[1], artworkIds[2]]
            },
          ])('should have correct artworks checked and call deleteArtwork with correct args for checkboxes/buttons clicked in sequence: $clickSequenceWithTitles', async ({clickSequence, expectedChecked}) => {
            const expectedUnchecked = artworkIds.filter(category => !expectedChecked.includes(category))
            mockGetArtworksForPage.mockReturnValue(artworksData)
            mockGetCollection.mockReturnValue(collectionData)
            const {getByTestId, getByRole, getByLabelText, getByText} = renderPage(queryClient, loggedInUserContextProps)
            
            await waitFor(() => getByTestId('artworks-listed'))
            for(const value of clickSequence) {
                const elementToClick = (value === "Zaznacz wszystkie" || value === "Odznacz wszystkie")
                    ? getByText(value) : getByTestId(`${value}-checkbox`)
                await user.click(elementToClick)
            }
            
            expectedChecked.forEach(value => {
                expect(getByTestId(`${value}-checkbox`)).toBeChecked();
            })
            expectedUnchecked.forEach(value => {
                expect(getByTestId(`${value}-checkbox`)).not.toBeChecked();
            })

            const deleteSelectedButton = getByRole("button", {name: /usuń zaznaczone/i}) as HTMLInputElement
            if (!deleteSelectedButton.disabled) {
                await user.click(deleteSelectedButton)
                await user.click(getByLabelText("confirm"))
                await waitFor(() => expect(mockDeleteArtworks).toHaveBeenCalledWith(expectedChecked, jwtToken))
                expectedChecked.forEach(value => {
                    expect(getByTestId(`${value}-checkbox`)).not.toBeChecked();
                })
            }
        })
})