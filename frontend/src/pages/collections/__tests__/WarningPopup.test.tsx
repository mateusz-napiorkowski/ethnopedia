import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
import WarningPopup from "../WarningPopup"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import userEvent from "@testing-library/user-event";

const queryClient = new QueryClient();
const user = userEvent.setup()

const mockOnClose = jest.fn()
const mockDeleteSelected = jest.fn()

const renderComponent = () => {
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[`/`]}>
                <Routes>
                    <Route
                        path="/"
                        element={<WarningPopup
                            onClose={mockOnClose}
                            deleteSelected={mockDeleteSelected}
                            warningMessage='Czy na pewno chcesz usunąć zaznaczone rekordy?'
                        />}
                    />
                </Routes>  
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe("WarningPopup tests", () => {
    beforeEach(() => {
        queryClient.clear();
        jest.clearAllMocks()
    });

    it("should render warning popup", () => {           
        const {container} = renderComponent()
        
        expect(container).toMatchSnapshot()
    })

    it("should call deleteSelected after delete button is clicked", async () => {           
        const {getByText} = renderComponent()
        
        await user.click(getByText(/usuń/i))
        expect(mockDeleteSelected).toHaveBeenCalled()
    })

    it("should call onClose after exit button is clicked", async () => {           
        const {getByLabelText} = renderComponent()
        
        await user.click(getByLabelText("exit"))
        expect(mockOnClose).toHaveBeenCalled()
    })

    it("should call onClose after cancel button is clicked", async () => {           
        const {getByText} = renderComponent()
        
        await user.click(getByText(/anuluj/i))
        expect(mockOnClose).toHaveBeenCalled()
    })
})