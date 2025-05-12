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

const exampleCollectionId = "67f84d80d2ac8e9a1e67cca4"
const renderPage = (
    queryClient: QueryClient,
    collectionId = exampleCollectionId
    ) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[`/collections/${exampleCollectionId}/artworks`]}>
                    <Routes>
                        <Route path="/collections/:collection/artworks" element={<SearchComponent collectionId={collectionId} />}/>
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

    it("should render initial state", () => {      
        const {getByTestId, queryByTestId} = renderPage(queryClient)
        
        expect(getByTestId("searchComponent")).toBeInTheDocument()
        expect(getByTestId("quickSearchComponent")).toBeInTheDocument()
        expect(queryByTestId("advancedSearchComponent")).not.toBeInTheDocument()
    })

    it("should render advanced search component after advanced search button is clicked", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, queryByTestId, getByText} = renderPage(queryClient)

        await user.click(getByText(/zaawansowane wyszukiwanie/i))

        expect(getByTestId("advancedSearchComponent")).toBeInTheDocument()
        expect(queryByTestId("quickSearchComponent")).not.toBeInTheDocument()
    })

    it("should render quick search component after quick search button is clicked", async () => {
        mockGetAllCategories.mockReturnValue(fetchedCategories)
        const {getByTestId, queryByTestId, getByText} = renderPage(queryClient)

        await user.click(getByText(/zaawansowane wyszukiwanie/i))
        await user.click(getByText(/szybkie wyszukiwanie/i))

        expect(getByTestId("quickSearchComponent")).toBeInTheDocument()
        expect(queryByTestId("advancedSearchComponent")).not.toBeInTheDocument()
    })
})