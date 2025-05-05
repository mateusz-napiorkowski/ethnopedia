import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import Home from "../Home"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { UserContext } from '../../providers/UserProvider';

const mockGetAllCollections = jest.fn().mockResolvedValue({
    collections: [],
    total: 0,
    currentPage: 1,
    pageSize: 10,
  });
const mockMutate = jest.fn()
jest.mock('../../api/collections', () => ({
    getAllCollections: () => mockGetAllCollections(),
    useBatchDeleteCollectionMutation: jest.fn(() => ({
        mutate: mockMutate,
    })),
}))

const queryClient = new QueryClient();

const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"

const LoggedInUserProps: any = {
        isUserLoggedIn: true,
        firstName: "testowy",
        userId: "66b6506fbb64df165e8a9ce6",
        jwtToken: jwtToken,
        setUserData: jest.fn()
    }

const renderComponent = (userContextProps: any = {}) => {
    return render(
        <UserContext.Provider value={ userContextProps }>
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[`/`]}>
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                    </Routes>  
                </MemoryRouter>
            </QueryClientProvider>
        </UserContext.Provider>
        
    );
};

describe("Home tests", () => {
    beforeEach(() => {
        queryClient.clear();
        jest.clearAllMocks()
    });

    it("should render landing page for a non-logged-in user", async () => {       
        const {getByText} = renderComponent()
        expect(getByText("Zarządzaj metadanymi tekstowymi i transkrypcją utworów muzycznych")).toBeInTheDocument()
    })

    it("should render landing page for a logged-in user", async () => { 
        const {getByTestId, getByText} = renderComponent(LoggedInUserProps)
        await waitFor(() => getByTestId("collections-page-container"))
        expect(getByText(/witaj testowy!/i)).toBeInTheDocument()
    })
})