import '@testing-library/jest-dom';
import { render, waitFor, screen } from '@testing-library/react'
import ArtworkPage from "../ArtworkPage"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const artworkData = {
    "artwork": {
        "_id": "670c2aecc29b79e5aaef1b9b",
        "createdAt": "2024-11-05T20:14:22.883Z",
        "updatedAt": "2024-11-05T20:14:22.883Z",
        "__v": 0,
        "categories": [
            {
                "name": "Tytuł",
                "values": [
                    "testowy"
                ],
                "subcategories": []
            },
            {
                "name": "Artyści",
                "values": [
                    "testowi"
                ],
                "subcategories": []
            },
            {
                "name": "Rok",
                "values": [
                    "966"
                ],
                "subcategories": []
            }
        ],
        "collectionName": "example collection"
    }
}

jest.mock('../../../api/artworks');

const mockGetArtwork = jest.fn()
jest.mock('../../../api/artworks', () => ({
    getArtwork: () => mockGetArtwork()
}))

const queryClient = new QueryClient();

describe("ArtworkPage tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
    });

    test("component renders correctly", async () => {
        const artworkId = "670c2aecc29b79e5aaef1b9b"
        const collection = "example collection"
        const {getByTestId, queryByTestId} = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[`/collections/${collection}/artworks/${artworkId}`]}>
                    <Routes>
                        <Route path="/collections/:collection/artworks/:artworkId" element={<ArtworkPage />}/>
                    </Routes>  
                </MemoryRouter>
            </QueryClientProvider>
        )
        expect(getByTestId('loading-page-container')).toMatchSnapshot()
        expect(queryByTestId("loaded-artwork-page-container")).not.toBeInTheDocument()
    })

    test("component rerenders correctly when data is fetched from API", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const artworkId = "670c2aecc29b79e5aaef1b9b"
        const collection = "example collection"
        const {getByTestId, queryByTestId} = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[`/collections/${collection}/artworks/${artworkId}`]}>
                    <Routes>
                        <Route path="/collections/:collection/artworks/:artworkId" element={<ArtworkPage />}/>
                    </Routes>  
                </MemoryRouter>
            </QueryClientProvider>
        )

        await waitFor(() => expect(getByTestId('loaded-artwork-page-container')).toMatchSnapshot())
        expect(queryByTestId("loading-page-container")).not.toBeInTheDocument()
    })
})