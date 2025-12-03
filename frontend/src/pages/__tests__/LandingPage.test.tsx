import { render, waitFor } from "@testing-library/react"
import LandingPage from "../LandingPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate
}));

const mockGetAllCollections = jest.fn()
jest.mock("../../api/collections", () => ({
    getAllCollections: () => mockGetAllCollections
}));

const queryClient = new QueryClient();
const user = userEvent.setup()

const renderPage = (path = "/") => {
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path={path} element={<LandingPage/>}/>
                </Routes>  
            </MemoryRouter>
        </QueryClientProvider>
    );
}

const mockCollections = {
    collections: [
        { id: "1", name: "Kolekcja A", description: "Opis A", artworksCount: 1 },
        { id: "2", name: "Kolekcja B", description: "Opis B", artworksCount: 3 },
        { id: "3", name: "Kolekcja C", description: "Opis C", artworksCount: 5 },
    ],
    total: 3,
};

describe("LandingPage tests", () => {
    beforeEach(() => {
        queryClient.clear();
        jest.clearAllMocks()
    });

    it("renders loading state", async () => {
        const {container} = renderPage()
        expect(container).toMatchSnapshot()
    });
 
    it("renders page when collection data is fetched from API", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)

        const {container, getByText} = renderPage()
        await waitFor(() => getByText(/przeglądaj istniejące kolekcje:/i))

        expect(container).toMatchSnapshot()
    });

    it("should navigate to appropriate collection page after collection entry from collection list is clicked", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)
        const {getByText, getByLabelText} = renderPage()
        await waitFor(() => getByText(/przeglądaj istniejące kolekcje:/i))
        const collectionListEntry = getByLabelText(mockCollections.collections[1].id)

        await user.click(collectionListEntry)
        expect(mockUseNavigate).toHaveBeenCalledWith(
            `/collections/${mockCollections.collections[1].id}/artworks`,
            {"state": {"collectionId": mockCollections.collections[1].id}}
        )
    });

    it("should navigate to login page after login button is clicked", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)
        const {getByText, getByLabelText} = renderPage()
        await waitFor(() => getByText(/przeglądaj istniejące kolekcje:/i))
        const loginButton = getByLabelText('landing-page-login')

        await user.click(loginButton)

        expect(mockUseNavigate).toHaveBeenCalledWith('/login')
    });

    it("should scroll down to collections list after browse without logging in button is clicked", async () => {
        const original = window.HTMLElement.prototype.scrollIntoView;
        const mockScrollIntoView = window.HTMLElement.prototype.scrollIntoView = jest.fn();
        mockGetAllCollections.mockReturnValue(mockCollections)
        const {getByText, getByLabelText} = renderPage()
        await waitFor(() => getByText(/przeglądaj istniejące kolekcje:/i))
        const browseWithoutLoggingInButton = getByLabelText('browse-without-logging-in')

        await user.click(browseWithoutLoggingInButton)
        
        expect(mockScrollIntoView).toHaveBeenCalled()
        window.HTMLElement.prototype.scrollIntoView = original;
    });
})