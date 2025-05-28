import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
import NoSearchResultMessage from "../NoSearchResultMessage"
import { MemoryRouter, Routes, Route } from "react-router-dom";

const renderComponent = () => {
    return render(
        <MemoryRouter initialEntries={[`/`]}>
            <Routes>
                <Route path="/" element={<NoSearchResultMessage/>}/>
            </Routes>  
        </MemoryRouter>
    );
};

describe("NoSearchResultMessage tests", () => {
    it("should render NoSearchResultMessage component", () => {
        const {container} = renderComponent()
        expect(container).toMatchSnapshot()
    })
})