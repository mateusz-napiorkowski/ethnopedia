import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
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

const renderPage = (
    queryClient: QueryClient,
    collection = "example collection" 
    ) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[`/collections/${collection}/artworks`]}>
                    <Routes>
                        <Route path="/collections/:collection/artworks" element={<AdvancedSearch collectionName={collection} />}/>
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

    test("component renders correctly", async () => {        
        const {getByTestId, queryByTestId} = renderPage(queryClient)

        expect(getByTestId("loading-advanced-search-container")).toBeInTheDocument()
        expect(queryByTestId("advancedSearchComponent")).not.toBeInTheDocument()
    })

    test("component rerenders correctly when categoriesData is fetched from API", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, queryByTestId} = renderPage(queryClient)

        await waitFor(() => expect(getByTestId("advancedSearchComponent")).toBeInTheDocument())
        expect(queryByTestId("loading-advanced-search-container")).not.toBeInTheDocument()
    })

    test("rule adding works correctly", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, getByRole} = renderPage(queryClient)
        await waitFor(() => getByTestId("advancedSearchComponent"))
        const selectField = getByRole("combobox")
        const inputField = getByRole("textbox")
        const addRuleButton = getByRole("button", {
            name: /dodaj regułę/i
        })

        await user.selectOptions(selectField, "Tytuł")
        await user.type(inputField, "Przykładowy tytuł")
        await user.click(addRuleButton)

        await user.selectOptions(selectField, "Rok")
        await user.click(addRuleButton)

        await user.selectOptions(selectField, "Tytuł.Podtytuł")
        await user.type(inputField, "Przykładowy podtytuł")
        await user.click(addRuleButton)

        expect(getByTestId("rules-container")).toMatchSnapshot()
    })

    test("select and input elements clear out when rule is added", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, getByRole, getByText} = renderPage(queryClient)
        await waitFor(() => getByTestId("advancedSearchComponent"))
        const selectField = getByRole("combobox")
        const selectOption = (getByText("Wybierz kategorię") as HTMLOptionElement)
        const inputField = getByRole("textbox")
        const addRuleButton = getByRole("button", {
            name: /dodaj regułę/i
        })

        await user.selectOptions(selectField, "Tytuł")
        await user.type(inputField, "Przykładowy tytuł")
        await user.click(addRuleButton)

        expect(selectOption.selected).toBe(true)
        expect(inputField).toHaveValue("")
    })

    test("rule deleting works correctly", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, getByRole} = renderPage(queryClient)
        await waitFor(() => getByTestId("advancedSearchComponent"))
        const selectField = getByRole("combobox")
        const inputField = getByRole("textbox")
        const addRuleButton = getByRole("button", {
            name: /dodaj regułę/i
        })

        await user.selectOptions(selectField, "Tytuł")
        await user.type(inputField, "Przykładowy tytuł")
        await user.click(addRuleButton)

        await user.selectOptions(selectField, "Rok")
        await user.type(inputField, "1410")
        await user.click(addRuleButton)

        await user.click(getByTestId("delete-Tytuł"))

        await user.selectOptions(selectField, "Artyści")
        await user.type(inputField, "Jan Nowak")
        await user.click(addRuleButton)

        await user.selectOptions(selectField, "Tytuł.Podtytuł")
        await user.type(inputField, "Przykładowy podtytuł")
        await user.click(addRuleButton)

        await user.click(getByTestId("delete-Tytuł.Podtytuł"))

        expect(getByTestId("rules-container")).toMatchSnapshot()
    })

    test("error message shows up when user tries to add rule with category name already present in another rule", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, getByRole, getByText} = renderPage(queryClient)
        await waitFor(() => getByTestId("advancedSearchComponent"))
        const selectField = getByRole("combobox")
        const inputField = getByRole("textbox")
        const addRuleButton = getByRole("button", {
            name: /dodaj regułę/i
        })

        await user.selectOptions(selectField, "Tytuł")
        await user.type(inputField, "Przykładowy tytuł")
        await user.click(addRuleButton)

        await user.selectOptions(selectField, "Tytuł")
        await user.type(inputField, "Przykładowy tytuł 2")
        await user.click(addRuleButton)

        expect(getByText(/reguła z tą nazwą kategorii już istnieje./i)).toMatchSnapshot()
    })

    test("error message disappears when user selects another option from select element", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, getByRole, queryByText} = renderPage(queryClient)
        await waitFor(() => getByTestId("advancedSearchComponent"))
        const selectField = getByRole("combobox")
        const inputField = getByRole("textbox")
        const addRuleButton = getByRole("button", {
            name: /dodaj regułę/i
        })

        await user.selectOptions(selectField, "Tytuł")
        await user.type(inputField, "Przykładowy tytuł")
        await user.click(addRuleButton)

        await user.selectOptions(selectField, "Tytuł")
        await user.type(inputField, "Przykładowy tytuł 2")
        await user.click(addRuleButton)

        await user.selectOptions(selectField, "Rok")

        expect(queryByText(/reguła z tą nazwą kategorii już istnieje./i)).not.toBeInTheDocument()
    })

    test("user adds appropriate query string parameters to the url when search button is clicked", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, getByRole, queryByText} = renderPage(queryClient)
        await waitFor(() => getByTestId("advancedSearchComponent"))
        const selectField = getByRole("combobox")
        const inputField = getByRole("textbox")
        const addRuleButton = getByRole("button", {
            name: /dodaj regułę/i
        })
        const searchButton = getByRole("button", {
            name: /wyszukaj/i
        })

        await user.selectOptions(selectField, "Tytuł")
        await user.type(inputField, "tytuł")
        await user.click(addRuleButton)
        
        await user.selectOptions(selectField, "Tytuł.Podtytuł")
        await user.type(inputField, "podtytuł")
        await user.click(addRuleButton)

        await user.click(searchButton)

        expect(mockUseNavigate.mock.calls[0][0])
        .toMatchInlineSnapshot(`"/collections/example collection/artworks?Tytuł=tytuł&Tytuł.Podtytuł=podtytuł"`)
    })
})