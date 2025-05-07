import '@testing-library/jest-dom';
import { getByLabelText, getByText, render, waitFor } from '@testing-library/react'
import AdvancedSearch from "../AdvancedSearch"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate,
}));

const mockGetAllCategories = jest.fn()
jest.mock('../../../api/categories', () => ({
    getAllCategories: () => mockGetAllCategories(),
}))

const queryClient = new QueryClient()
const user = userEvent.setup()

const exampleCollectionId = "67f84d80d2ac8e9a1e67cca4"
const renderPage = (
    queryClient: QueryClient,
    collectionId = exampleCollectionId
    ) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[`/collections/${collectionId}/artworks`]}>
                    <Routes>
                        <Route path="/collections/:collectionId/artworks" element={<AdvancedSearch collectionId={collectionId} />}/>
                    </Routes>  
                </MemoryRouter>
            </QueryClientProvider>
        );
};

const fetchedCategories = {
    categories: [
        "Tytuł",
        "Tytuł.Podtytuł",
        "Artyści",
        "Rok"
    ]
}

describe("AdvancedSearch tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
    });

    it("should render loading state", () => {        
        const {getByTestId, queryByTestId} = renderPage(queryClient)

        expect(getByTestId("loading-advanced-search-container")).toBeInTheDocument()
        expect(queryByTestId("advancedSearchComponent")).not.toBeInTheDocument()
    })

    it("should render advanced search component after categoriesData is fetched from API", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, queryByTestId} = renderPage(queryClient)

        await waitFor(() => expect(getByTestId("advancedSearchComponent")).toBeInTheDocument())
        expect(queryByTestId("loading-advanced-search-container")).not.toBeInTheDocument()
    })

    it("should add and render search rules correctly", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, getByRole, getByLabelText} = renderPage(queryClient)
        await waitFor(() => getByTestId("advancedSearchComponent"))
        const dropdownMenu = getByTestId("dropdown-menu")
        const inputField = getByRole("textbox")
        const addRuleButton = getByRole("button", {
            name: /dodaj regułę/i
        })

        await user.click(dropdownMenu)
        await user.click(getByLabelText("Tytuł"))
        await user.type(inputField, "Przykładowy tytuł")
        await user.click(addRuleButton)

        await user.click(dropdownMenu)
        await user.click(getByLabelText("Rok"))
        await user.click(addRuleButton)

        await user.click(dropdownMenu)
        await user.click(getByLabelText("Tytuł.Podtytuł"))
        await user.type(inputField, "Przykładowy podtytuł")
        await user.click(addRuleButton)

        expect(getByTestId("rules-container")).toMatchSnapshot()
    })

    it("should clear out dropdown menu and input elements after new rule is added", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, getByRole, getByLabelText, getByText} = renderPage(queryClient)
        await waitFor(() => getByTestId("advancedSearchComponent"))
        const dropdownMenu = getByTestId("dropdown-menu")
        const inputField = getByRole("textbox")
        const addRuleButton = getByRole("button", {
            name: /dodaj regułę/i
        })

        await user.click(dropdownMenu)
        await user.click(getByLabelText("Tytuł"))
        await user.type(inputField, "Przykładowy tytuł")
        await user.click(addRuleButton)

        expect(getByText("Wybierz kategorię")).toBeInTheDocument()
        expect(inputField).toHaveValue("")
    })

    it("should delete appropriate search rules and render search rules correctly", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, getByRole, getByLabelText} = renderPage(queryClient)
        await waitFor(() => getByTestId("advancedSearchComponent"))
        const dropdownMenu = getByTestId("dropdown-menu")
        const inputField = getByRole("textbox")
        const addRuleButton = getByRole("button", {
            name: /dodaj regułę/i
        })

        await user.click(dropdownMenu)
        await user.click(getByLabelText("Tytuł"))
        await user.type(inputField, "Przykładowy tytuł")
        await user.click(addRuleButton)

        await user.click(dropdownMenu)
        await user.click(getByLabelText("Rok"))
        await user.type(inputField, "1410")
        await user.click(addRuleButton)

        await user.click(getByLabelText("delete Tytuł"))

        await user.click(dropdownMenu)
        await user.click(getByLabelText("Artyści"))
        await user.type(inputField, "Jan Nowak")
        await user.click(addRuleButton)

        await user.click(dropdownMenu)
        await user.click(getByLabelText("Tytuł.Podtytuł"))
        await user.type(inputField, "Przykładowy podtytuł")
        await user.click(addRuleButton)

        await user.click(getByLabelText("delete Tytuł.Podtytuł"))

        expect(getByTestId("rules-container")).toMatchSnapshot()
    })

    it("should render element with error message when user tries to add rule with category name already present in another rule", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, getByRole, getByText, getByLabelText} = renderPage(queryClient)
        await waitFor(() => getByTestId("advancedSearchComponent"))
        const dropdownMenu = getByTestId("dropdown-menu")
        const inputField = getByRole("textbox")
        const addRuleButton = getByRole("button", {
            name: /dodaj regułę/i
        })

        await user.click(dropdownMenu)
        await user.click(getByLabelText("Tytuł"))
        await user.type(inputField, "Przykładowy tytuł")
        await user.click(addRuleButton)

        await user.click(dropdownMenu)
        await user.click(getByLabelText("Tytuł"))
        await user.type(inputField, "Przykładowy tytuł 2")
        await user.click(addRuleButton)

        expect(getByText(/reguła dla tej kategorii została już dodana. Wybierz inną kategorię./i)).toBeInTheDocument()
    })

    it("should render element with error message when user tries to add rule without choosing category name", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, getByRole, getByText} = renderPage(queryClient)
        await waitFor(() => getByTestId("advancedSearchComponent"))
        const inputField = getByRole("textbox")
        const addRuleButton = getByRole("button", {
            name: /dodaj regułę/i
        })

        await user.type(inputField, "Przykładowy tytuł")
        await user.click(addRuleButton)

        expect(getByText(/wybierz kategorię przed dodaniem reguły./i)).toBeInTheDocument()
    })

    it("should render element with error message when user typed in rule value with forbidden characters", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, getByRole, getByText, getByLabelText} = renderPage(queryClient)
        await waitFor(() => getByTestId("advancedSearchComponent"))
        const dropdownMenu = getByTestId("dropdown-menu")
        const inputField = getByRole("textbox")
        const addRuleButton = getByRole("button", {
            name: /dodaj regułę/i
        })

        await user.click(dropdownMenu)
        await user.click(getByLabelText("Tytuł"))
        await user.type(inputField, "Przykładowy tytuł<")
        await user.click(addRuleButton)

        expect(getByText(/wartość zawiera niedozwolone znaki, np. <, >, lub inne specjalne znaki. Proszę usuń je i spróbuj ponownie./i)).toBeInTheDocument()
    })

    it("should navigate to the same page with correctly altered query string and component state after search button is clicked", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, getByRole, getByLabelText } = renderPage(queryClient)
        await waitFor(() => getByTestId("advancedSearchComponent"))
        const dropdownMenu = getByTestId("dropdown-menu")
        const inputField = getByRole("textbox")
        const addRuleButton = getByRole("button", {
            name: /dodaj regułę/i
        })
        const searchButton = getByRole("button", {
            name: /wyszukaj/i
        })

        await user.click(dropdownMenu)
        await user.click(getByLabelText("Tytuł"))
        await user.type(inputField, "tytuł")
        await user.click(addRuleButton)
        
        await user.click(dropdownMenu)
        await user.click(getByLabelText("Tytuł.Podtytuł"))
        await user.type(inputField, "podtytuł")
        await user.click(addRuleButton)

        await user.click(searchButton)

        expect(mockUseNavigate).toHaveBeenCalledWith(
            `/collections/${exampleCollectionId}/artworks?Tytuł=tytuł&Tytuł.Podtytuł=podtytuł`,
            {"state":
                {"rules": [
                    {"field": "Tytuł", "id": expect.any(String), "value": "tytuł"},
                    {"field": "Tytuł.Podtytuł", "id": expect.any(String), "value": "podtytuł"}
                ]}
            }
        )
    })
})