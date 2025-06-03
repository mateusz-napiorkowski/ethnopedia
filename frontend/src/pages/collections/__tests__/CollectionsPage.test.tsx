import { render, waitFor } from "@testing-library/react"
import CollectionsPage from "../CollectionsPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { UserContext } from "../../../providers/UserProvider";
import userEvent from "@testing-library/user-event";

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate
}));

const mockGetAllCollections = jest.fn()
const mockDeleteCollections = jest.fn()
jest.mock("../../../api/collections", () => ({
    getAllCollections: () => mockGetAllCollections,
    deleteCollections: (collectionIds: string[], jwtToken: string) => mockDeleteCollections(collectionIds, jwtToken),
}));

const mockGetXlsxWithCollectionData = jest.fn()
jest.mock("../../../api/dataExport", () => ({
    getXlsxWithCollectionData: (collectionId: string) => mockGetXlsxWithCollectionData(collectionId),
}));

const queryClient = new QueryClient();
const user = userEvent.setup()

const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"

const firstName = "Jan"

const loggedInUserContextProps = {
    isUserLoggedIn: true,
    firstName: firstName,
    userId: "66b6506fbb64df165e8a9ce6",
    jwtToken: jwtToken,
    setUserData: jest.fn()
}

const renderPage = (userContextProps: any, path = "/") => {
    return render(
        <UserContext.Provider value={ userContextProps }>
            <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path={path} element={<CollectionsPage/>}/>
                </Routes>  
            </MemoryRouter>
        </QueryClientProvider>
        </UserContext.Provider>  
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

describe("CollectionsPage tests", () => {
    beforeEach(() => {
        queryClient.clear();
        jest.clearAllMocks()
    });

    it("renders loading state", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)

        const {container} = renderPage(loggedInUserContextProps)

        expect(container).toMatchSnapshot()
    });

    it("renders the page with correct user greeting and static header after collection data is fetched from API, list of collections is displayed correctly", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)
        const {getByText, getAllByText} = renderPage(loggedInUserContextProps)
        await waitFor(() => getByText(`Witaj ${firstName}!`))

        const artworkCountElements = getAllByText(/rekord/)

        expect(getByText(`Witaj ${firstName}!`)).toBeInTheDocument();
        expect(getByText("Twoje kolekcje:")).toBeInTheDocument();
        for(const collectionData of mockCollections.collections) {
            expect(getByText(collectionData.name)).toBeInTheDocument();
            expect(getByText(collectionData.description)).toBeInTheDocument();         
        }

        expect(artworkCountElements[0]).toHaveTextContent(/1\s*rekord/);
        expect(artworkCountElements[1]).toHaveTextContent(/3\s*rekordy/);
        expect(artworkCountElements[2]).toHaveTextContent(/5\s*rekordów/);
    });

    

    it("checks and unchecks collections correctly", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)
        const {getByText, getAllByRole} = renderPage(loggedInUserContextProps)
        await waitFor(() => getByText(`Witaj ${firstName}!`))

        const checkboxes = getAllByRole('checkbox');
        checkboxes.forEach(checkbox => {
            expect(checkbox).not.toBeChecked();
        });

        const selectAllButton = getByText("Zaznacz wszystkie");
        await user.click(selectAllButton);

        checkboxes.forEach(checkbox => {
            expect(checkbox).toBeChecked();
        });

        const unselectAllButton = getByText("Odznacz wszystkie");
        await user.click(unselectAllButton);

        checkboxes.forEach(checkbox => {
            expect(checkbox).not.toBeChecked();
        });
    });

    it("should have delete seleted button disabled if no collections are checked", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)
        const {getByText} = renderPage(loggedInUserContextProps)
        await waitFor(() => getByText(`Witaj ${firstName}!`))

        const deleteSelectedButton = getByText(/usuń zaznaczone/i);
        expect(deleteSelectedButton).toBeDisabled()
    });

    it("should open warning popup when enabled delete selected button is clicked, should call deleteArtworks with correct arguments when confirm delete button is clicked", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)
        const {getByText, getAllByRole} = renderPage(loggedInUserContextProps)
        await waitFor(() => getByText(`Witaj ${firstName}!`))
        const deleteButton = getByText(/usuń zaznaczone/i);
        const checkboxes = getAllByRole("checkbox")

        await user.click(checkboxes[0])
        await user.click(checkboxes[1])
        await user.click(checkboxes[1])
        await user.click(deleteButton);

        expect(await getByText(/czy na pewno chcesz usunąć zaznaczone kolekcje?/i)).toBeInTheDocument();

        await user.click(getByText(/^usuń$/i))
        expect(mockDeleteCollections).toHaveBeenCalledWith([mockCollections.collections[0].id], jwtToken)
    });

    it("should close warning popup when 'X' button is clicked", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)
        const {getByText, queryByText, getByLabelText, getAllByRole} = renderPage(loggedInUserContextProps)
        await waitFor(() => getByText(`Witaj ${firstName}!`))
        const deleteButton = getByText(/usuń zaznaczone/i);
        const checkboxes = getAllByRole("checkbox")

        await user.click(checkboxes[0])
        await user.click(checkboxes[1])
        await user.click(checkboxes[1])
        await user.click(deleteButton);

        expect(await getByText(/czy na pewno chcesz usunąć zaznaczone kolekcje?/i)).toBeInTheDocument();

        await user.click(getByLabelText("exit"))
        expect(await queryByText(/czy na pewno chcesz usunąć zaznaczone kolekcje?/i)).not.toBeInTheDocument();
    });

    it("should navigate to create collection page after new collection button is clicked", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)
        const {getByText, getByRole} = renderPage(loggedInUserContextProps)
        await waitFor(() => getByText(`Witaj ${firstName}!`))
        const newCollectionButton = getByRole("button", { name: /nowa kolekcja/i });

        await user.click(newCollectionButton);

        expect(mockUseNavigate).toHaveBeenCalledWith("/create-collection")
    });

    it("should open import collection modal after import collection button is clicked, should close it after 'X' button is clicked", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)
        const {getByText, getByRole, getByLabelText, queryByText} = renderPage(loggedInUserContextProps)
        await waitFor(() => getByText(`Witaj ${firstName}!`))
        const importCollectionButton = getByRole("button", { name: /importuj kolekcję/i });

        await user.click(importCollectionButton);

        expect(await getByText(/ustawienia importu metadanych z pliku .xlsx/i)).toBeInTheDocument();

        await user.click(getByLabelText("exit"))
        expect(await queryByText(/ustawienia importu metadanych z pliku .xlsx/i)).not.toBeInTheDocument();
    });

    it("should show error message when export collections button is clicked and no collections are selected", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)
        const {getByText, getByRole} = renderPage(loggedInUserContextProps)
        await waitFor(() => getByText(`Witaj ${firstName}!`))
        const exportCollectionsButton = getByRole("button", { name: /eksportuj kolekcje/i });

        await user.click(exportCollectionsButton);

        expect(await getByText(/najpierw należy zaznaczyć kolekcję do wyeksportowania./i)).toBeInTheDocument();
    });

    it("should call getXlsxWithCollectionData with correct parameters when export collections button is clicked and collections are selected", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)
        const {getByText, getByRole, getAllByRole, queryByText} = renderPage(loggedInUserContextProps)
        await waitFor(() => getByText(`Witaj ${firstName}!`))
        const exportCollectionsButton = getByRole("button", { name: /eksportuj kolekcje/i });

        const checkboxes = getAllByRole("checkbox")
        await user.click(checkboxes[0])
        await user.click(checkboxes[1])
        await user.click(checkboxes[1])
        await user.click(checkboxes[2])
        await user.click(exportCollectionsButton);

        expect(await queryByText(/najpierw należy zaznaczyć kolekcję do wyeksportowania./i)).not.toBeInTheDocument();
        expect(mockGetXlsxWithCollectionData).toHaveBeenNthCalledWith(1, mockCollections.collections[0].id)
        expect(mockGetXlsxWithCollectionData).toHaveBeenNthCalledWith(2, mockCollections.collections[2].id)
    });

    it("should navigate to appropriate collection page after collection entry from collection list is clicked", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)
        const {getByText, getByLabelText} = renderPage(loggedInUserContextProps)
        await waitFor(() => getByText(`Witaj ${firstName}!`))
        const collectionListEntry = getByLabelText(mockCollections.collections[1].id)

        await user.click(collectionListEntry)
        expect(mockUseNavigate).toHaveBeenCalledWith(
          `/collections/${mockCollections.collections[1].id}/artworks`,
          {"state": {"collectionId": mockCollections.collections[1].id}}
        )
    });

    it("should uncheck all collections after collections page is changed", async () => {
        mockGetAllCollections.mockReturnValue(mockCollections)
        const {getByText, getByTestId, getAllByRole, container} = renderPage(loggedInUserContextProps)
        await waitFor(() => getByText(`Witaj ${firstName}!`))
        const pageButton = getByTestId("page-1")
        const checkboxes = getAllByRole("checkbox")
        const deleteSelectedButton = getByText(/usuń zaznaczone/i);

        await user.click(checkboxes[0])
        await user.click(checkboxes[1])
        await user.click(pageButton)
        
        checkboxes.forEach(checkbox => {
            expect(checkbox).not.toBeChecked();
        });
        expect(deleteSelectedButton).toBeDisabled()
    });

    // it("changes the collection sort order when the dropdown is changed", async () => {
    //     const queryClient = new QueryClient();
    //     render(
    //         <QueryClientProvider client={queryClient}>
    //             <MemoryRouter>
    //                 <CollectionsPage />
    //             </MemoryRouter>
    //         </QueryClientProvider>
    //     );

    //     // Sprawdzamy początkową kolejność kolekcji
    //     let collectionItems = await screen.findAllByRole('heading', { name: /Kolekcja/i });
    //     expect(collectionItems[0]).toHaveTextContent("Kolekcja A");

    //     // Zmieniamy kolejność na Z-A
    //     const sortDropdown = screen.getByRole("combobox");
    //     fireEvent.change(sortDropdown, { target: { value: "Z-A" } });

    //     // Sprawdzamy nową kolejność kolekcji
    //     collectionItems = await screen.findAllByRole('heading', { name: /Kolekcja/i });
    //     expect(collectionItems[0]).toHaveTextContent("Kolekcja C");
    // });

    // it("sorts the collections correctly by A-Z and Z-A", async () => {
    //     const queryClient = new QueryClient();

    //     render(
    //         <QueryClientProvider client={queryClient}>
    //             <MemoryRouter>
    //                 <CollectionsPage />
    //             </MemoryRouter>
    //         </QueryClientProvider>
    //     );

    //     // Sprawdzamy, czy początkowa kolejność kolekcji to A-Z
    //     let collectionItems = await screen.findAllByRole('heading', {
    //         name: /Kolekcja/i
    //     });

    //     // Sprawdzamy, czy kolekcje są posortowane A-Z
    //     expect(collectionItems[0]).toHaveTextContent("Kolekcja A");
    //     expect(collectionItems[1]).toHaveTextContent("Kolekcja B");
    //     expect(collectionItems[2]).toHaveTextContent("Kolekcja C");

    //     // Zmieniamy kolejność na Z-A
    //     const sortDropdown = screen.getByRole("combobox");
    //     fireEvent.change(sortDropdown, { target: { value: "Z-A" } });

    //     // Sprawdzamy, czy kolekcje są posortowane Z-A
    //     collectionItems = await screen.findAllByRole('heading', {
    //         name: /Kolekcja/i
    //     });

    //     expect(collectionItems[0]).toHaveTextContent("Kolekcja C");
    //     expect(collectionItems[1]).toHaveTextContent("Kolekcja B");
    //     expect(collectionItems[2]).toHaveTextContent("Kolekcja A");
    // });
});
