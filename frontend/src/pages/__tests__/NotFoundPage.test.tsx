import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
import NotFoundPage from "../NotFoundPage"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom') as any,
    useNavigate: () => mockUseNavigate,
}));

const user = userEvent.setup()

const renderComponent = () => {
    return render(
        <MemoryRouter initialEntries={[`/`]}>
            <Routes>
                <Route path="/" element={<NotFoundPage/>}/>
            </Routes>  
        </MemoryRouter>
    );
};

describe("NotFoundPage tests", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    it("should render not found page", () => {           
        const {container} = renderComponent()
        
        expect(container).toMatchSnapshot()
    })

    it("should call useNavigate with path to home page when go back to home page button is clicked", async () => {           
        const {getByText} = renderComponent()
        const goToHomePageButton = getByText(/powrót na stronę główną/i)

        await user.click(goToHomePageButton)

        expect(mockUseNavigate).toHaveBeenCalledWith("/")
    })
})