import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
import QuickSearch from "../QuickSearch"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate,
}));

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
                        <Route
                            path="/collections/:collection/artworks"
                            element={<QuickSearch collectionIds={collectionId} mode="local" />}
                        />
                    </Routes>  
                </MemoryRouter>
            </QueryClientProvider>
        );
};

describe("QuickSearch tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
    });

    it("should render quicksearch component", () => {           
        const {getByTestId} = renderPage(queryClient)

        expect(getByTestId("quickSearchComponent")).toBeInTheDocument()
    })

    it("should add query string parameter 'searchtext' with value from input field to the URL when search button is clicked", async () => {        
        const {getByRole} = renderPage(queryClient)

        const inputField = getByRole("textbox")
        await user.type(inputField, "ExampleTextValue")
        await user.click(getByRole("button"))

        expect(mockUseNavigate).toHaveBeenCalledWith(`/collections/${exampleCollectionId}/artworks?searchText=ExampleTextValue`)
    })

    it("should render element with error message when user typed in rule value with forbidden characters", async () => {        
        const {getByRole, getByText} = renderPage(queryClient)

        const inputField = getByRole("textbox")
        await user.type(inputField, "<")
        await user.click(getByRole("button"))

        expect(getByText(/wartość zawiera niedozwolone znaki, np. <, >, lub inne specjalne znaki./i)).toBeInTheDocument()
    })
})