import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import ArtworkPage from "../ArtworkPage"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { UserContext } from '../../../providers/UserProvider';

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

    test("component renders delete warning popup correctly", async () => {
        const user = userEvent.setup()
        mockGetArtwork.mockReturnValue(artworkData)
        const artworkId = "670c2aecc29b79e5aaef1b9b"
        const collection = "example collection"
        
        const UserContextProps = {
            isUserLoggedIn: true,
            firstName: "123",
            userId: "123",
            jwtToken: "123",
            setUserData: jest.fn()
        };

        const {getByTestId, getByRole, getByText} = render(
            <UserContext.Provider value={ UserContextProps }>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={[`/collections/${collection}/artworks/${artworkId}`]}>
                        <Routes>
                            <Route path="/collections/:collection/artworks/:artworkId" element={<ArtworkPage />}/>
                        </Routes>  
                    </MemoryRouter>
                </QueryClientProvider>    
            </UserContext.Provider>
            
        )

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        await user.click(getByRole("button", {
            name: /usuń/i
        }))

        await expect(getByTestId('loaded-artwork-page-container')).toMatchSnapshot()
        await expect(getByText(/czy na pewno chcesz usunąć rekord?/i)).toBeInTheDocument()
    })

    test("delete warning popup exiting test 1", async () => {
        const user = userEvent.setup()
        mockGetArtwork.mockReturnValue(artworkData)
        const artworkId = "670c2aecc29b79e5aaef1b9b"
        const collection = "example collection"
        
        const UserContextProps = {
            isUserLoggedIn: true,
            firstName: "123",
            userId: "123",
            jwtToken: "123",
            setUserData: jest.fn()
        };

        const {getByTestId, getByRole, queryByText} = render(
            <UserContext.Provider value={ UserContextProps }>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={[`/collections/${collection}/artworks/${artworkId}`]}>
                        <Routes>
                            <Route path="/collections/:collection/artworks/:artworkId" element={<ArtworkPage />}/>
                        </Routes>  
                    </MemoryRouter>
                </QueryClientProvider>    
            </UserContext.Provider>
            
        )

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        await user.click(getByRole("button", {
            name: /usuń/i
        }))

        await user.click(getByRole("button", {
            name: /anuluj/i
        }))

        await expect(queryByText(/czy na pewno chcesz usunąć rekord?/i)).not.toBeInTheDocument()
    })

    test("delete warning popup exiting test 2", async () => {
        const user = userEvent.setup()
        mockGetArtwork.mockReturnValue(artworkData)
        const artworkId = "670c2aecc29b79e5aaef1b9b"
        const collection = "example collection"
        
        const UserContextProps = {
            isUserLoggedIn: true,
            firstName: "123",
            userId: "123",
            jwtToken: "123",
            setUserData: jest.fn()
        };

        const {getByTestId, getByRole, queryByText} = render(
            <UserContext.Provider value={ UserContextProps }>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={[`/collections/${collection}/artworks/${artworkId}`]}>
                        <Routes>
                            <Route path="/collections/:collection/artworks/:artworkId" element={<ArtworkPage />}/>
                        </Routes>  
                    </MemoryRouter>
                </QueryClientProvider>    
            </UserContext.Provider>
            
        )

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        await user.click(getByRole("button", {
            name: /usuń/i
        }))

        await user.click(getByTestId("exitButton"))

        await expect(queryByText(/czy na pewno chcesz usunąć rekord?/i)).not.toBeInTheDocument()
    })

    test("show more test", async () => {
        const user = userEvent.setup()
        mockGetArtwork.mockReturnValue(artworkData)
        const artworkId = "670c2aecc29b79e5aaef1b9b"
        const collection = "example collection"
        const {getByTestId, getByRole, findByRole} = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[`/collections/${collection}/artworks/${artworkId}`]}>
                    <Routes>
                        <Route path="/collections/:collection/artworks/:artworkId" element={<ArtworkPage />}/>
                    </Routes>  
                </MemoryRouter>
            </QueryClientProvider>
        )

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        await user.click(getByRole("button", {
            name: /pokaż więcej/i
        }))
        await expect(getByTestId('loaded-artwork-page-container')).toMatchSnapshot()
        await expect(getByRole("button", {
            name: /pokaż mniej/i
        })).toBeInTheDocument()
    })

    test("show less test", async () => {
        const user = userEvent.setup()
        mockGetArtwork.mockReturnValue(artworkData)
        const artworkId = "670c2aecc29b79e5aaef1b9b"
        const collection = "example collection"
        const {getByTestId, getByRole, findByRole} = render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[`/collections/${collection}/artworks/${artworkId}`]}>
                    <Routes>
                        <Route path="/collections/:collection/artworks/:artworkId" element={<ArtworkPage />}/>
                    </Routes>  
                </MemoryRouter>
            </QueryClientProvider>
        )

        await waitFor(() => getByTestId('loaded-artwork-page-container'))

        await user.click(getByRole("button", {
            name: /pokaż więcej/i
        }))
        await user.click(getByRole("button", {
            name: /pokaż mniej/i
        }))

        await expect(getByRole("button", {
            name: /pokaż więcej/i
        })).toBeInTheDocument()
    })
})