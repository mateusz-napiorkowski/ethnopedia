import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdvancedSearch from "../AdvancedSearch";

// przykładowe ID kolekcji
const exampleCollectionId = "12345";

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

const renderPage = (
    queryClient: QueryClient,
    collectionId: string = exampleCollectionId
) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[`/collections/${collectionId}/artworks`]}>
                <Routes>
                    <Route
                        path="/collections/:collectionId/artworks"
                        element={
                            <AdvancedSearch
                                collectionIds={collectionId}
                                mode="local"
                            />
                        }
                    />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe("AdvancedSearch", () => {
    it("renders without crashing", async () => {
        const queryClient = createTestQueryClient();
        renderPage(queryClient);

        // sprawdzamy czy komponent się montuje
        await waitFor(() => {
            expect(screen.getByText(/search/i)).toBeInTheDocument();
        });
    });

    it("renders with given collectionId", async () => {
        const queryClient = createTestQueryClient();
        renderPage(queryClient, "custom-collection-id");

        await waitFor(() => {
            expect(screen.getByText(/search/i)).toBeInTheDocument();
        });
    });
});
