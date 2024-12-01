import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import Pagination from "../Pagination"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const user = userEvent.setup()

const mockSetCurrentPage = jest.fn()

const renderComponent = ( currentPage: number, totalPages: number ) => {
    return render(
        <MemoryRouter initialEntries={[`/`]}>
            <Routes>
                <Route path="/" element={<Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={mockSetCurrentPage}/>}/>
            </Routes>  
        </MemoryRouter>
    );
};

describe("Pagination tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        [1, 1], [1, 4], [1, 5], [1, 6], [1, 7], [1, 10],
        [5,5], [6,6], [4,7],
        [5, 10], [6, 10], [7, 10], [10, 10]
      ])('component renders correctly for page %i of %i', (currentPage, totalPages,) => {
        const { container } = renderComponent(currentPage, totalPages)
        expect(container).toMatchSnapshot()
    });

    test.each([
        {currentPage: 1, buttonTestId: "page-6", pageToGoTo: 6},
        {currentPage: 1, buttonTestId: "page-last", pageToGoTo: 10},
        {currentPage: 5, buttonTestId: "page-first", pageToGoTo: 1},
        {currentPage: 5, buttonTestId: "page-4", pageToGoTo: 4},
        {currentPage: 5, buttonTestId: "page-last", pageToGoTo: 10},
        {currentPage: 10, buttonTestId: "page-first", pageToGoTo: 1},
        {currentPage: 10, buttonTestId: "page-8", pageToGoTo: 8}
      ])('page $pageToGoTo button works correctly when user is on page $currentPage of 10', async ({currentPage, buttonTestId, pageToGoTo}) => {
        const { getByTestId } = renderComponent(currentPage, 10)
        const nthPageButton = getByTestId(buttonTestId)
        
        await user.click(nthPageButton)
        
        expect(mockSetCurrentPage).toHaveBeenCalledWith(pageToGoTo)
    })

    test("Next page button works correctly when there is a next page", async () => {     
        const { getByText } = renderComponent(2, 10)
        const nextPageButton = getByText("Następna strona")
        
        await user.click(nextPageButton)
        
        expect(mockSetCurrentPage).toHaveBeenCalledWith(3)
    })

    test("Next page button works correctly when there is no next page", async () => {
        const { getByText } = renderComponent(10, 10)
        const nextPageButton = getByText("Następna strona")
        
        await user.click(nextPageButton)
        
        expect(mockSetCurrentPage).not.toHaveBeenCalled()
    })

    test("Previous page button works correctly when there is a previous page", async () => {        
        const { getByText } = renderComponent(2, 10)
        const nextPageButton = getByText("Poprzednia strona")
        
        await user.click(nextPageButton)
        
        expect(mockSetCurrentPage).toHaveBeenCalledWith(1)
    })

    test("Previous page button works correctly when there is no previous page", async () => {   
        const { getByText } = renderComponent(1, 10)
        const nextPageButton = getByText("Poprzednia strona")
        
        await user.click(nextPageButton)
        
        expect(mockSetCurrentPage).not.toHaveBeenCalled()
    })

    test("input element works correctly and user goes to inputed page when button is clicked", async () => {   
        const { getByRole } = renderComponent(1, 10)
        const inputPageElement = getByRole("spinbutton")
        const goToPageButton = getByRole("button", {
            name: /przejdź/i
        })

        await userEvent.clear(inputPageElement)
        await user.type(inputPageElement, "5")
        await user.click(goToPageButton)

        expect(inputPageElement).toHaveValue(5)
        expect(mockSetCurrentPage).toHaveBeenCalledWith(5)
    })

    test("button is disabled when inputed page is out of pages range", async () => {   
        const { getByRole } = renderComponent(1, 10)
        const inputPageElement = getByRole("spinbutton")
        const goToPageButton = getByRole("button", {
            name: /przejdź/i
        })

        await userEvent.clear(inputPageElement)
        await user.type(inputPageElement, "0")

        expect(goToPageButton).toBeDisabled()

        await userEvent.clear(inputPageElement)
        await user.type(inputPageElement, "5")

        expect(goToPageButton).not.toBeDisabled()

        await userEvent.clear(inputPageElement)
        await user.type(inputPageElement, "11")
        
        expect(goToPageButton).toBeDisabled()
    })
})