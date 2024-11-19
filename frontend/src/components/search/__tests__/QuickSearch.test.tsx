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

const renderPage = (
    queryClient: QueryClient,
    collection = "example collection" 
    ) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[`/collections/${collection}/artworks`]}>
                    <Routes>
                        <Route path="/collections/:collection/artworks" element={<QuickSearch collectionName={collection} />}/>
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

    test("component renders correctly", async () => {        
        const {getByTestId} = renderPage(queryClient)

        expect(getByTestId("quickSearchComponent")).toBeInTheDocument()
    })

    test("user adds query string parameter 'searchtext' with value from input field to the URL when search button is clicked", async () => {        
        const {getByRole} = renderPage(queryClient)

        const inputField = getByRole("textbox")
        await user.type(inputField, "example search Text")
        await user.click(getByRole("button"))
        
        expect(mockUseNavigate).toHaveBeenCalledWith("?searchText=example search Text")
    })
})