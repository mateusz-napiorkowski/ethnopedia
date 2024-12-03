import React from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";
import CollectionsPage from "../collections/CollectionsPage";

describe("CollectionsPage", () => {
    const renderComponent = () => {
        const queryClient = new QueryClient();
        return render(
            <BrowserRouter> {/* Wrap your component in BrowserRouter */}
                <QueryClientProvider client={queryClient}>
                    <CollectionsPage />
                </QueryClientProvider>
            </BrowserRouter>
        );
    };

    it("renders without crashing", () => {
        renderComponent();
        expect(true).toBe(true); // Placeholder assertion
    });

    // more tests here
});
