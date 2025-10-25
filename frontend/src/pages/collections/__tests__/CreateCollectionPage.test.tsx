import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
import CreateCollectionPage from "../CreateCollectionPage"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { UserContext } from '../../../providers/UserProvider';

const queryClient = new QueryClient();
const user = userEvent.setup()

const mockUseNavigate = jest.fn();
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate,
  useLocation: () => mockUseLocation(),
}));

const mockCreateCollection = jest.fn();
const mockUpdateCollection = jest.fn()
jest.mock('../../../api/collections', () => ({
   createCollection: (name: string, description: string, categories: any, jwtToken: string) => mockCreateCollection(name, description, categories, jwtToken),
   updateCollection: (collectionId: string, name: string, description: string, updatedCategories: any, jwtToken: string) => mockUpdateCollection(collectionId, name, description, updatedCategories, jwtToken)

}));

const renderPage = (
    queryClient: QueryClient, 
    userContextProps: any = {
        isUserLoggedIn: false,
        firstName: "",
        userId: "",
        jwtToken: jwtToken,
        setUserData: jest.fn()
    },
    ) => {
        return render(
            <UserContext.Provider value={ userContextProps }>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={[`/create-collection`]}>
                        <Routes>
                            <Route path="/create-collection" element={<CreateCollectionPage />}/>
                        </Routes>  
                    </MemoryRouter>
                </QueryClientProvider>    
            </UserContext.Provider>
        );
};

const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"
const editModeUseLocationReturnValue =  {
    state: {
        "collectionId": "67f84d80d2ac8e9a1e67cca4",
        "mode": "edit",
        "name": "collection name",
        "description": "collection description",
        "categories": [
            {
                "name": "Tytuł",
                "subcategories": []
            },
            {
                "name": "Region",
                "subcategories": [
                    {
                        "name": "Podregion",
                        "subcategories": [
                            {
                                "name": "Miasto",
                                "subcategories": []
                            }
                        ]
                    }
                ]
            },
            {
                "name": "rok wydania",
                "subcategories": []
            }
        ]
    }
}

describe("CreateCollectionPage tests", () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseLocation.mockReturnValue({state: null})
        queryClient.clear();
    });

    it("should render loading state", () => {   
        const {container} = renderPage(queryClient)
        
        expect(container).toMatchSnapshot()
    })

    it("should call useNavigate(-1) when cancel button is clicked", async () => {           
        const {getByText} = renderPage(queryClient)
        const cancelButton = getByText(/anuluj/i)

        await user.click(cancelButton)

        expect(mockUseNavigate).toHaveBeenCalledWith(-1)
    })

    it("should show appropriate error message when create button is clicked and collection name is not typed in", async () => {           
        const {queryByText, getByText, getByLabelText} = renderPage(queryClient)
        const descriptionInputField = getByLabelText("description")
        const createButton = getByText(/utwórz/i)

        await user.type(descriptionInputField, "collection description")
        await user.click(createButton)   

        expect(getByText(/nazwa jest wymagana/i)).toBeInTheDocument()
        expect(queryByText(/opis jest wymagany/i)).not.toBeInTheDocument()
    })

    it("should show appropriate error message when create button is clicked and collection description is not typed in", async () => {           
        const {queryByText, getByText, getByLabelText} = renderPage(queryClient)
        const nameInputField = getByLabelText("name")
        const createButton = getByText(/utwórz/i)

        await user.type(nameInputField, "collection name")
        await user.click(createButton)

        expect(getByText(/opis jest wymagany/i)).toBeInTheDocument()
        expect(queryByText(/nazwa jest wymagana/i)).not.toBeInTheDocument()
    })

    it.each([
        {
            case: "collection with provided name already exists", 
            axiosError: {response: {data: {error: "Collection with provided name already exists"}}},
            errorMessage: /kolekcja o podanej nazwie już istnieje/i
        },
        {
            case: "categories are not specified", 
            axiosError: {response: {data: {error: "Incorrect request body provided"}}},
            errorMessage: /Nazwa kategorii jest wymagana/i
        },
        {
            case: "server throws another other error",
            axiosError: {response: {data: {error: "Internal server error"}}},
            errorMessage: /błąd serwera/i
        },
        {
            case: "server throws error with incorrect format",
            axiosError: {message: "Error message"},
            errorMessage: /nieoczekiwany błąd/i
        }
    ])('should show appropriate error message when $case', async ({axiosError, errorMessage}) => {
        const {getByText, getByLabelText} = renderPage(queryClient)
        mockCreateCollection.mockImplementation(() => {
            throw axiosError;
        });
        const nameInputField = getByLabelText("name")
        const descriptionInputField = getByLabelText("description")
        const createButton = getByText(/utwórz/i)

        await user.type(nameInputField, "collection name")
        await user.type(descriptionInputField, "collection description")
        await user.click(createButton)

        // expect(mockCreateCollection).toHaveBeenCalled()
        expect(getByText(errorMessage)).toBeInTheDocument()
    })

    it("should call createCollection and useNavigate(-1) when create collection button is clicked and there are no errors", async () => {           
        const {getByText, getByLabelText, getByPlaceholderText} = renderPage(queryClient)
        mockCreateCollection.mockImplementation(() => {})
        const nameInputField = getByLabelText("name")
        const createButton = getByText(/utwórz/i)
        const descriptionInputField = getByLabelText("description")
        const firstCategoryInputField = getByPlaceholderText(/nazwa kategorii/i)

        await user.type(nameInputField, "collection name")
        await user.type(descriptionInputField, "collection description")
        await user.type(firstCategoryInputField, "Title")
        await user.click(createButton)

        expect(mockCreateCollection).toHaveBeenCalledWith(
            "collection name", 
            "collection description", 
            [{"name": "Title", "subcategories": []}], 
            jwtToken)
        expect(mockUseNavigate).toHaveBeenCalledWith("/")
    })

    it("should show appropriate message when category name contains a '.' symbol", async () => {           
        const {getByText, getByLabelText, getByPlaceholderText} = renderPage(queryClient)
        mockCreateCollection.mockImplementation(() => {})
        const nameInputField = getByLabelText("name")
        const createButton = getByText(/utwórz/i)
        const descriptionInputField = getByLabelText("description")
        const firstCategoryInputField = getByPlaceholderText(/nazwa kategorii/i)

        await user.type(nameInputField, "collection name")
        await user.type(descriptionInputField, "collection description")
        await user.type(firstCategoryInputField, "Ti.tle")
        await user.click(createButton)

        expect(getByText(/nazwa kategorii nie może zawierać kropki/i)).toBeInTheDocument()
    })

    it("should fill initial category scructure correctly when in edit mode and call updateCollection with correct arguments when save button is clicked", async () => {
        mockUseLocation.mockReturnValueOnce(editModeUseLocationReturnValue)
        const {container, getByText} = renderPage(queryClient)
        const saveButton = getByText(/zapisz zmiany/i)
        
        expect(container).toMatchSnapshot()
        
        await user.click(saveButton)
        expect(mockUpdateCollection).toHaveBeenCalledWith(
            editModeUseLocationReturnValue.state.collectionId,
            editModeUseLocationReturnValue.state.name,
            editModeUseLocationReturnValue.state.description,
            editModeUseLocationReturnValue.state.categories,
            jwtToken
        )
    })
})