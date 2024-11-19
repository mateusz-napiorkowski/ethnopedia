import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import SearchComponent from "../SearchComponent"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";

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
                        <Route path="/collections/:collection/artworks" element={<SearchComponent id={collection} />}/>
                    </Routes>  
                </MemoryRouter>
            </QueryClientProvider>
        );
};

const fetchedCategories = {
    categories: [
        "Tytuł"
    ]
}

describe("SearchComponent tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
    });

    test("component renders correctly", async () => {        
        const {getByTestId, queryByTestId} = renderPage(queryClient)
        
        expect(getByTestId("searchComponent")).toBeInTheDocument()
        expect(getByTestId("loading-advanced-search-container")).toBeInTheDocument()
        expect(queryByTestId("quickSearchComponent")).not.toBeInTheDocument()
    })

    test("component rerenders correctly when categoriesData is fetched from API", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, queryByTestId} = renderPage(queryClient)

        await waitFor(() => expect(getByTestId("advancedSearchComponent")).toBeInTheDocument())
        expect(queryByTestId("loading-advanced-search-container")).not.toBeInTheDocument()
        expect(queryByTestId("quickSearchComponent")).not.toBeInTheDocument()
    })

    test("quicksearch menu shows up when quicksearch button is clicked", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, queryByTestId, getByText} = renderPage(queryClient)

        await waitFor(() => getByTestId("advancedSearchComponent"))
        await user.click(getByText(/szybkie wyszukiwanie/i))

        expect(getByTestId("quickSearchComponent")).toBeInTheDocument()
        expect(queryByTestId("advancedSearchComponent")).not.toBeInTheDocument()
    })

    test("advancedsearch menu shows up when quicksearch button is clicked", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, queryByTestId, getByText} = renderPage(queryClient)

        await waitFor(() => getByTestId("advancedSearchComponent"))
        await user.click(getByText(/szybkie wyszukiwanie/i))
        await user.click(getByText(/zaawansowane wyszukiwanie/i))

        expect(getByTestId("advancedSearchComponent")).toBeInTheDocument()
        expect(queryByTestId("quickSearchComponent")).not.toBeInTheDocument()
    })
})