import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import CollectionsPage from "../CollectionsPage";
import { getAllCollections } from "../../../api/collections";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { useUser } from "../../../providers/UserProvider";

jest.mock("../../../api/collections", () => ({
    getAllCollections: jest.fn(),
    useBatchDeleteCollectionMutation: jest.fn(() => ({
        mutate: jest.fn(),
    })),
}));

jest.mock("../../../providers/UserProvider", () => ({
    useUser: jest.fn(),
}));

const mockCollections = {
    collections: [
        { id: "1", name: "Kolekcja A", description: "Opis A", artworksCount: 1 },
        { id: "2", name: "Kolekcja B", description: "Opis B", artworksCount: 3 },
        { id: "3", name: "Kolekcja C", description: "Opis C", artworksCount: 5 },
    ],
    total: 3,
};

describe("CollectionsPage", () => {
    beforeEach(() => {
        (useUser as jest.Mock).mockReturnValue({ firstName: "Jan", jwtToken: "test-token" });
        (getAllCollections as jest.Mock).mockResolvedValue(mockCollections);
    });

    it("renders the correct user greeting and static header", async () => {
        const queryClient = new QueryClient();

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CollectionsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Sprawdzamy, czy nagłówki z powitaniem i tekstem "Twoje kolekcje" są renderowane
        expect(await screen.findByText("Witaj Jan!")).toBeInTheDocument();
        expect(screen.getByText("Twoje kolekcje:")).toBeInTheDocument();
    });

    it("displays the list of collections correctly", async () => {
        const queryClient = new QueryClient();

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CollectionsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Czekamy na załadowanie wszystkich kolekcji
        const collectionItems = await screen.findAllByRole('heading', {
            name: /Kolekcja/i
        });
        expect(collectionItems.length).toBe(3);

        // Sprawdzamy każdą kolekcję
        expect(screen.getByText("Kolekcja A")).toBeInTheDocument();
        expect(screen.getByText("Kolekcja B")).toBeInTheDocument();
        expect(screen.getByText("Kolekcja C")).toBeInTheDocument();
    });

    it("displays the correct number of artworks for each collection", async () => {
        const queryClient = new QueryClient();

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CollectionsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Poczekaj na załadowanie elementów
        await waitFor(() => {
            const elements = screen.getAllByText(/rekord/);
            expect(elements.length).toBe(3);
        });

        // Sprawdź każdy z elementów po załadowaniu
        const elements = screen.getAllByText(/rekord/);

        // Zaktualizowane asercje z usunięciem spacji
        expect(elements[0]).toHaveTextContent("1rekord");
        expect(elements[1]).toHaveTextContent("3rekordy");
        expect(elements[2]).toHaveTextContent("5rekordów");
    });

    it("sorts the collections correctly by A-Z and Z-A", async () => {
        const queryClient = new QueryClient();

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CollectionsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Sprawdzamy, czy początkowa kolejność kolekcji to A-Z
        let collectionItems = await screen.findAllByRole('heading', {
            name: /Kolekcja/i
        });

        // Sprawdzamy, czy kolekcje są posortowane A-Z
        expect(collectionItems[0]).toHaveTextContent("Kolekcja A");
        expect(collectionItems[1]).toHaveTextContent("Kolekcja B");
        expect(collectionItems[2]).toHaveTextContent("Kolekcja C");

        // Zmieniamy kolejność na Z-A
        const sortDropdown = screen.getByRole("combobox");
        fireEvent.change(sortDropdown, { target: { value: "Z-A" } });

        // Sprawdzamy, czy kolekcje są posortowane Z-A
        collectionItems = await screen.findAllByRole('heading', {
            name: /Kolekcja/i
        });

        expect(collectionItems[0]).toHaveTextContent("Kolekcja C");
        expect(collectionItems[1]).toHaveTextContent("Kolekcja B");
        expect(collectionItems[2]).toHaveTextContent("Kolekcja A");
    });

    it("checks and unchecks collections correctly", async () => {
        const queryClient = new QueryClient();

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CollectionsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Poczekaj na załadowanie kolekcji, żeby upewnić się, że checkboxes są dostępne
        await waitFor(() => screen.findAllByRole('checkbox'));

        // Sprawdzamy początkowy stan zaznaczenia (wszystkie odznaczone)
        let checkboxes = screen.getAllByRole('checkbox');
        checkboxes.forEach(checkbox => {
            expect(checkbox).not.toBeChecked();
        });

        // Zaznaczamy wszystkie kolekcje
        const selectAllButton = screen.getByText("Zaznacz wszystkie");
        fireEvent.click(selectAllButton);

        // Sprawdzamy, czy wszystkie kolekcje zostały zaznaczone
        checkboxes = screen.getAllByRole('checkbox');
        checkboxes.forEach(checkbox => {
            expect(checkbox).toBeChecked();
        });

        // Odznaczamy wszystkie kolekcje
        const unselectAllButton = screen.getByText("Odznacz wszystkie");
        fireEvent.click(unselectAllButton);

        // Sprawdzamy, czy wszystkie kolekcje zostały odznaczone
        checkboxes = screen.getAllByRole('checkbox');
        checkboxes.forEach(checkbox => {
            expect(checkbox).not.toBeChecked();
        });
    });

    it("opens the 'Nowa kolekcja' modal on button click", async () => {
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CollectionsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Klikamy przycisk 'Nowa kolekcja'
        const newCollectionButton = await screen.findByRole("button", { name: /Nowa kolekcja/i });
        fireEvent.click(newCollectionButton);

        // Sprawdzamy, czy modal został otwarty
        expect(await screen.findByText("Dodaj nową kolekcję")).toBeInTheDocument();
    });


    it("opens the 'Usuń zaznaczone' warning popup when button is clicked", async () => {
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CollectionsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Zaznaczamy kolekcje
        const checkboxes = await screen.findAllByRole("checkbox");
        fireEvent.click(checkboxes[0]); // Zaznaczamy pierwszą kolekcję

        // Klikamy przycisk "Usuń zaznaczone"
        const deleteButton = screen.getByText("Usuń zaznaczone");
        fireEvent.click(deleteButton);

        // Sprawdzamy, czy popup został otwarty
        expect(await screen.findByText("Czy na pewno chcesz usunąć zaznaczone kolekcje?")).toBeInTheDocument();
    });


    it("changes the collection sort order when the dropdown is changed", async () => {
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CollectionsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Sprawdzamy początkową kolejność kolekcji
        let collectionItems = await screen.findAllByRole('heading', { name: /Kolekcja/i });
        expect(collectionItems[0]).toHaveTextContent("Kolekcja A");

        // Zmieniamy kolejność na Z-A
        const sortDropdown = screen.getByRole("combobox");
        fireEvent.change(sortDropdown, { target: { value: "Z-A" } });

        // Sprawdzamy nową kolejność kolekcji
        collectionItems = await screen.findAllByRole('heading', { name: /Kolekcja/i });
        expect(collectionItems[0]).toHaveTextContent("Kolekcja C");
    });

    it("displays an error message when no collections are selected for export", async () => {
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CollectionsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Czekamy na pojawienie się przycisku eksportu
        const exportButton = await screen.findByRole("button", { name: /Eksportuj kolekcję/i });
        fireEvent.click(exportButton);

        // Sprawdzamy, czy pojawił się komunikat o błędzie
        expect(await screen.findByText("Najpierw należy zaznaczyć kolekcję do wyeksportowania.")).toBeInTheDocument();
    });

    it("disables the import button when the user is not logged in", async () => {
        (useUser as jest.Mock).mockReturnValue({ firstName: "Jan", jwtToken: null }); // Mocking no jwtToken

        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CollectionsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Sprawdzamy, czy przycisk "Importuj kolekcję" jest wyłączony
        const importButton = await screen.findByText("Importuj kolekcję");
        expect(importButton).toBeDisabled();
    });

    it("shows an error message when no collection is selected for export", async () => {
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <CollectionsPage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        // Klikamy przycisk eksportu bez zaznaczenia kolekcji
        const exportButton = await screen.findByText("Eksportuj kolekcję");
        fireEvent.click(exportButton);

        // Sprawdzamy, czy wyświetla się komunikat o błędzie
        expect(await screen.findByText("Najpierw należy zaznaczyć kolekcję do wyeksportowania.")).toBeInTheDocument();
    });

    // it("paginates through collections correctly", async () => {
    //     const mockCollectionsPage1 = {
    //         collections: [
    //             { id: "1", name: "Kolekcja A", description: "Opis A", artworksCount: 1 },
    //             { id: "2", name: "Kolekcja B", description: "Opis B", artworksCount: 3 },
    //         ],
    //         total: 5,
    //     };
    //
    //     const mockCollectionsPage2 = {
    //         collections: [
    //             { id: "3", name: "Kolekcja C", description: "Opis C", artworksCount: 5 },
    //             { id: "4", name: "Kolekcja D", description: "Opis D", artworksCount: 2 },
    //         ],
    //         total: 5,
    //     };
    //
    //     (getAllCollections as jest.Mock)
    //         .mockResolvedValueOnce(mockCollectionsPage1)
    //         .mockResolvedValueOnce(mockCollectionsPage2);
    //
    //     const queryClient = new QueryClient();
    //
    //     render(
    //         <QueryClientProvider client={queryClient}>
    //             <MemoryRouter>
    //                 <CollectionsPage />
    //             </MemoryRouter>
    //         </QueryClientProvider>
    //     );
    //
    //     // Check the first page
    //     let collectionItems = await screen.findAllByRole("heading", { name: /Kolekcja/i });
    //     expect(collectionItems.length).toBe(2); // Page 1 should show 2 collections
    //     expect(screen.getByText("Kolekcja A")).toBeInTheDocument();
    //     expect(screen.getByText("Kolekcja B")).toBeInTheDocument();
    //
    //     // Click next page button
    //     const nextPageButton = screen.getByText("Next");
    //     fireEvent.click(nextPageButton);
    //
    //     // Wait for new collections
    //     collectionItems = await screen.findAllByRole("heading", { name: /Kolekcja/i });
    //     expect(collectionItems.length).toBe(2); // Page 2 should show 2 collections
    //     expect(await screen.findByText("Kolekcja C")).toBeInTheDocument();
    //     expect(await screen.findByText("Kolekcja D")).toBeInTheDocument();
    //
    //     // Click previous page button
    //     const prevPageButton = screen.getByText("Previous");
    //     fireEvent.click(prevPageButton);
    //
    //     // Wait for the first page collections to load again
    //     collectionItems = await screen.findAllByRole("heading", { name: /Kolekcja/i });
    //     expect(collectionItems.length).toBe(2); // Back to page 1
    //     expect(screen.getByText("Kolekcja A")).toBeInTheDocument();
    //     expect(screen.getByText("Kolekcja B")).toBeInTheDocument();
    // });
});
