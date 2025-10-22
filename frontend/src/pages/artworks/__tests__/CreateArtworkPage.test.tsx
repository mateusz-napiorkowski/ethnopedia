import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import CreateArtworkPage from "../CreateArtworkPage"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { UserContext } from '../../../providers/UserProvider';
import {jwtToken, collectionData, artworkIds} from './utils/consts'

const mockGetArtwork = jest.fn();
const mockCreateArtwork = jest.fn();
const mockEditArtwork = jest.fn();

jest.mock('../../../api/artworks', () => ({
  __esModule: true,
  getArtwork: () => mockGetArtwork(),
  createArtwork: (payload: any, jwtToken: string) => mockCreateArtwork(payload, jwtToken),
  editArtwork: () => mockEditArtwork(),
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
    setUserData: jest.fn()
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
        const {getByTestId, queryByTestId} = renderPage()
        await waitFor(() => getByTestId('create-artwork-page-container'))

        expect(getByTestId('create-artwork-page-container')).toBeInTheDocument()
        expect(queryByTestId('loading-page-container')).not.toBeInTheDocument()
        expect(getByTestId("category-tree")).toMatchSnapshot()
    })

    it("should show error message when trying to create artwork with none of the category input fields filled in", async () => {
        mockGetCollection.mockReturnValue(collectionData)
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Tytuł.Podtytuł", "Artyści", "Rok"]})
        const {getByTestId, getByText} = renderPage()
        await waitFor(() => getByTestId('create-artwork-page-container'))
        const createArtworkButton = getByText(/utwórz/i)

        await user.click(createArtworkButton)
        expect(getByText(/przynajmniej jedno pole musi być wypełnione./i)).toBeInTheDocument()
    })

    it("should call createArtwork when create artwork is clicked and data provided in the form is correct", async () => {
        mockGetCollection.mockReturnValue(collectionData)
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Tytuł.Podtytuł", "Artyści", "Rok"]})
        const {getByTestId, getByText, getByLabelText} = renderPage()
        await waitFor(() => getByTestId('create-artwork-page-container'))
        const createArtworkButton = getByText(/utwórz/i)
        const titleInputField = getByLabelText("Tytuł-input")

        await user.type(titleInputField, "an artwork title")
        await user.click(createArtworkButton)

        expect(mockCreateArtwork).toHaveBeenCalledWith(
            {
                "categories": [
                    {
                        "name": "Tytuł",
                        "subcategories": [
                            {"name": "Podtytuł", "subcategories": [], "value": ""}
                        ],
                        "value": "an artwork title"
                    },
                    {
                        "name": "Artyści",
                        "subcategories": [],
                        "value": ""
                    },
                    {
                        "name": "Rok",
                        "subcategories": [],
                        "value": ""
                    }
                ],
                "collectionName": "example collection"
            },
            UserContextProps.jwtToken
        )
        expect(mockUseNavigate).toHaveBeenCalledWith(-1)
    })

    it("should call useNavigate(-1) when cancel button is clicked", async () => {
        mockGetCollection.mockReturnValue(collectionData)
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Tytuł.Podtytuł", "Artyści", "Rok"]})
        const {getByTestId, getByText} = renderPage()
        await waitFor(() => getByTestId('create-artwork-page-container'))
        const cancelButton = getByText(/anuluj/i)

        await user.click(cancelButton)
        expect(mockUseNavigate).toHaveBeenCalledWith(-1)
    })
})