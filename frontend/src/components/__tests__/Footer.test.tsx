import '@testing-library/jest-dom';
import { render, } from '@testing-library/react'
import Footer from "../Footer"
import { MemoryRouter, Routes, Route } from "react-router-dom";


const renderComponent = () => {
    return render(
            <MemoryRouter initialEntries={[`/`]}>
                <Routes>
                    <Route path="/" element={<Footer/>}/>
                </Routes>  
            </MemoryRouter>
        
    );
};

describe("Footer tests", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    it("should render footer component", () => {
        const {container} = renderComponent()
        expect(container).toMatchSnapshot()
    })
})