import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
import Home from "../Home"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const renderComponent = () => {
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[`/`]}>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                </Routes>  
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe("Home tests", () => {
    beforeEach(() => {
        queryClient.clear();
        jest.clearAllMocks()
    });

    it("should render home page (navbar and collections page in loading state)", () => {           
        const {container} = renderComponent()
        
        expect(container).toMatchSnapshot()
    })
})