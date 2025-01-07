import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
import LoadingPage from "../LoadingPage"
import { MemoryRouter, Routes, Route } from "react-router-dom";

const renderComponent = () => {
    return render(
        <MemoryRouter initialEntries={[`/`]}>
            <Routes>
                <Route path="/" element={<LoadingPage/>}/>
            </Routes>  
        </MemoryRouter>
    );
};

describe("Loading page tests", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    it("should render loading page", () => {           
        const {container} = renderComponent()
        
        expect(container).toMatchSnapshot()
    })
})