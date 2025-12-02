import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import CreateArtworkPage from "../CreateArtworkPage"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { UserContext } from '../../../providers/UserProvider';
import {jwtToken, collectionData, artworkIds} from './utils/consts'

const mockGetArtwork = jest.fn();
const mockGetArtworksForPage = jest.fn()
const mockCreateArtwork = jest.fn();
const mockEditArtwork = jest.fn();

jest.mock('../../../api/artworks', () => ({
  __esModule: true,
  getArtwork: () => mockGetArtwork(),
  getArtworksForPage: () => mockGetArtworksForPage(),
  createArtwork: (collectionId: string, payload: any, filesToUpload: File[], jwtToken: string) => mockCreateArtwork(collectionId, payload, filesToUpload, jwtToken),
  editArtwork: () => mockEditArtwork()
}));

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate,
}));

const mockGetAllCategories = jest.fn()
jest.mock('../../../api/categories', () => ({
    getAllCategories: () => mockGetAllCategories(),
}))

const mockGetCollection = jest.fn()
jest.mock('../../../api/collections', () => ({
    getCollection: () => mockGetCollection
}))

const queryClient = new QueryClient();
const user = userEvent.setup()

const UserContextProps = {
    isUserLoggedIn: true,
    firstName: "123",
    userId: "66b6506fbb64df165e8a9ce6",
    jwtToken: jwtToken,
    setUserData: jest.fn(),
    username: "123"
}

const renderPage = (edit = false) => {
        return render(
            <UserContext.Provider value={ UserContextProps }>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={[
                        edit ? 
                            `/collections/${collectionData._id}/artworks/${artworkIds[0]}/edit-artwork`
                            : `/collections/${collectionData._id}/create-artwork/`
                        ]}>
                        <Routes>
                            <Route path={
                                edit ?
                                    "/collections/:collectionId/artworks/:artworkId/edit-artwork"
                                    : "/collections/:collectionId/create-artwork/"
                            } element={<CreateArtworkPage/>}/>
                        </Routes>  
                    </MemoryRouter>
                </QueryClientProvider>
            </UserContext.Provider>
            
        );
};

describe("CreateArtworkPage tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
    });

    it("should render loading state", () => {
        const {getByTestId, queryByTestId} = renderPage()

        expect(getByTestId('loading-page-container')).toBeInTheDocument()
        expect(queryByTestId('create-artwork-page-container')).not.toBeInTheDocument()
    })

    it("should render component after data is fetched from API and render category tree correctly", async () => {
        mockGetCollection.mockReturnValue(collectionData)
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Tytuł.Podtytuł", "Artyści", "Rok"]})
        mockGetArtworksForPage.mockReturnValue({artworks: [], total: 0, currentPage: 1, pageSize: 1000})
        const {getByTestId, queryByTestId} = renderPage()
        await waitFor(() => getByTestId('create-artwork-page-container'))

        expect(getByTestId('create-artwork-page-container')).toBeInTheDocument()
        expect(queryByTestId('loading-page-container')).not.toBeInTheDocument()
        expect(getByTestId("category-tree")).toMatchSnapshot()
    })

    it("should show error message when trying to create artwork with none of the category input fields filled in", async () => {
        mockGetCollection.mockReturnValue(collectionData)
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Tytuł.Podtytuł", "Artyści", "Rok"]})
        mockGetArtworksForPage.mockReturnValue({artworks: [], total: 0, currentPage: 1, pageSize: 1000})
        const {getByTestId, getByText} = renderPage()
        await waitFor(() => getByTestId('create-artwork-page-container'))
        const createArtworkButton = getByText(/utwórz/i)

        await user.click(createArtworkButton)
        expect(getByText(/przynajmniej jedno pole musi być wypełnione./i)).toBeInTheDocument()
    })

    it("should call createArtwork when create artwork is clicked and data provided in the form is correct", async () => {
        mockGetCollection.mockReturnValue(collectionData)
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Tytuł.Podtytuł", "Artyści", "Rok"]})
        mockGetArtworksForPage.mockReturnValue({artworks: [], total: 0, currentPage: 1, pageSize: 1000})
        mockCreateArtwork.mockReturnValue({
            "artwork": {
                "collectionName": collectionData.name,
                "categories": [
                    {
                        "name": "Tytuł",
                        "value": "an artwork title",
                        "subcategories": [
                            {
                                "name": "Podtytuł",
                                "value": "",
                                "subcategories": []
                            }
                        ]
                    },
                    {
                        "name": "Artyści",
                        "value": "",
                        "subcategories": []
                    },
                    {
                        "name": "Rok",
                        "value": "",
                        "subcategories": []
                    }
                ],
                "_id": "68fd30ad0db5373b10dd000d",
                "files": [],
                "createdAt": "2025-10-25T20:18:53.913Z",
                "updatedAt": "2025-10-25T20:18:53.913Z",
                "__v": 0
            },
            "uploadedFilesCount": 0,
            "failedUploadsCount": 0,
            "failedUploadsCauses": []
        })
        const {getByTestId, getByText, getByLabelText} = renderPage()
        await waitFor(() => getByTestId('create-artwork-page-container'))
        const createArtworkButton = getByText(/utwórz/i)
        const titleInputField = getByLabelText("Tytuł-input")

        await user.type(titleInputField, "an artwork title")
        await user.click(createArtworkButton)

        expect(mockCreateArtwork).toHaveBeenCalledWith(
            collectionData._id,
            [
                {
                    "name": "Tytuł",
                    "value": "an artwork title",
                    "subcategories": [
                        {
                            "name": "Podtytuł",
                            "value": "",
                            "subcategories": []
                        }
                    ]
                },
                {
                    "name": "Artyści",
                    "value": "",
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "value": "",
                    "subcategories": []
                }
            ],
            [],
            UserContextProps.jwtToken
        )
        expect(mockUseNavigate).toHaveBeenCalledWith(-1)
    })

    it("should call useNavigate(-1) when cancel button is clicked", async () => {
        mockGetCollection.mockReturnValue(collectionData)
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Tytuł.Podtytuł", "Artyści", "Rok"]})
        mockGetArtworksForPage.mockReturnValue({artworks: [], total: 0, currentPage: 1, pageSize: 1000})
        const {getByTestId, getByText} = renderPage()
        await waitFor(() => getByTestId('create-artwork-page-container'))
        const cancelButton = getByText(/anuluj/i)

        await user.click(cancelButton)
        expect(mockUseNavigate).toHaveBeenCalledWith(-1)
    })
})