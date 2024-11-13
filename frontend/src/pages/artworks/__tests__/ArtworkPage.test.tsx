import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import ArtworkPage from "../ArtworkPage"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { UserContext } from '../../../providers/UserProvider';

const mockGetArtwork = jest.fn()
const mockDeleteArtwork = jest.fn()
jest.mock('../../../api/artworks', () => ({
    getArtwork: () => mockGetArtwork(),
    deleteArtwork: () => mockDeleteArtwork()
}))

const queryClient = new QueryClient();
const user = userEvent.setup()

const renderPage = (
    queryClient: QueryClient, 
    userContextProps: any = {
        isUserLoggedIn: false,
        firstName: "",
        userId: "",
        jwtToken: undefined,
        setUserData: jest.fn()
    },
    collection: string = "example collection",
    artworkId: string = "670c2aecc29b79e5aaef1b9b"
    ) => {
        return render(
            <UserContext.Provider value={ userContextProps }>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={[`/collections/${collection}/artworks/${artworkId}`]}>
                        <Routes>
                            <Route path="/collections/:collection/artworks/:artworkId" element={<ArtworkPage />}/>
                        </Routes>  
                    </MemoryRouter>
                </QueryClientProvider>    
            </UserContext.Provider>
        );
};

const loggedInUserContextProps = {
    isUserLoggedIn: true,
    firstName: "123",
    userId: "123",
    jwtToken: "123",
    setUserData: jest.fn()
};

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

describe("ArtworkPage tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
    });

    test("component renders correctly", async () => {        
        const {getByTestId, queryByTestId} = renderPage(queryClient)
        
        expect(getByTestId('loading-page-container')).toMatchSnapshot()
        expect(queryByTestId("loaded-artwork-page-container")).not.toBeInTheDocument()
    })

    test("component rerenders correctly when data is fetched from API", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, queryByTestId} = renderPage(queryClient)

        await waitFor(() => expect(getByTestId('loaded-artwork-page-container')).toMatchSnapshot())
        expect(queryByTestId("loading-page-container")).not.toBeInTheDocument()
    })

    test("edit disabled", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, getByRole, findByText} = renderPage(queryClient)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        expect(getByRole("button", {
            name: /edytuj/i
        })).toBeDisabled();
    })

    test("edit button navigation works correctly ???????", async () => {
        mockGetArtwork.mockReturnValue(artworkData)

        const {getByTestId, getByRole, getByText} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        await user.click(getByRole("button", {
            name: /edytuj/i
        }))

        // await expect(getByTestId('loaded-artwork-page-container')).toMatchSnapshot()
        // await expect(screen.findByText(/edytuj rekord/i)).toBeInTheDocument()
    })

    test("del disabled", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, getByRole, findByText} = renderPage(queryClient)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        expect(getByRole("button", {
            name: /usuń/i
        })).toBeDisabled();
    })

    test("component renders delete warning popup correctly", async () => {
        mockGetArtwork.mockReturnValue(artworkData)

        const {getByTestId, getByRole, getByText} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        await user.click(getByRole("button", {
            name: /usuń/i
        }))

        await expect(getByTestId('loaded-artwork-page-container')).toMatchSnapshot()
        await expect(getByText(/czy na pewno chcesz usunąć rekord?/i)).toBeInTheDocument()
    })

    test("delete warning popup exiting test 1", async () => {
        mockGetArtwork.mockReturnValue(artworkData)

        const {getByTestId, getByRole, queryByText} = renderPage(queryClient, loggedInUserContextProps)

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
        mockGetArtwork.mockReturnValue(artworkData)

        const {getByTestId, getByRole, queryByText} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        await user.click(getByRole("button", {
            name: /usuń/i
        }))

        await user.click(getByTestId("exitButton"))

        await expect(queryByText(/czy na pewno chcesz usunąć rekord?/i)).not.toBeInTheDocument()
    })

    test("delete warning popup confirm test 1", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        mockDeleteArtwork.mockImplementation(() => {})

        const {getByTestId, getByRole, getAllByRole, queryByText, findByText} = renderPage(queryClient, loggedInUserContextProps)

        await waitFor(() => getByTestId('loaded-artwork-page-container'))
        await user.click(getByRole("button", {
            name: /usuń/i
        }))
        await user.click(getByTestId("deleteConfirmButton"))
        // await expect(findByText(/czy na pewno chcesz usunąć rekord?/i)).not.toBeInTheDocument()
    })

    test("show more test", async () => {
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, getByRole, findByRole} = renderPage(queryClient)

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
        mockGetArtwork.mockReturnValue(artworkData)
        const {getByTestId, getByRole, findByRole} = renderPage(queryClient)

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