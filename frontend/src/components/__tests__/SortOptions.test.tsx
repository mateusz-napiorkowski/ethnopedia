import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
import SortOptions from "../SortOptions"
import userEvent from "@testing-library/user-event";
import { useState } from 'react';

const mockSelectCurrentPage = jest.fn()

const user = userEvent.setup()

const renderComponent = () => {
    return render(<SortOptionsWrapper/>)
}

const SortOptionsWrapper = () => {
    const [sortCategory, setSortCategory] = useState("Tytuł")
    const [sortDirection, setSortDirection] = useState("asc")
    return (
        <SortOptions 
            options={[
                {value: "Tytuł", label: "Tytuł"},
                {value: "Tytuł.Podtytuł", label: "Tytuł.Podtytuł"},
                {value: "Data nagrania", label: "Data nagrania"}
            ]}
            sortCategory={sortCategory}
            sortDirection={sortDirection}
            onSelectCategory={setSortCategory}
            onSelectDirection={setSortDirection}
            setCurrentPage={mockSelectCurrentPage}
        />)
};

describe("Sort options tests", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    it("should render initial state", () => {           
        const {container} = renderComponent()
        
        expect(container).toMatchSnapshot()
    })

    it("should open dropdown menu when it is clicked", async () => {           
        const {container, getByLabelText} = renderComponent()
        const categoriesDropdownMenu = getByLabelText("sortby-category-dropdown")

        await user.click(categoriesDropdownMenu)

        expect(container).toMatchSnapshot()
    })

    it("should change selected category when option from dropdown menu when clicked, should call selectCurrentPage(1)", async () => {           
        const {container, getByLabelText} = renderComponent()
        const categoriesDropdownMenu = getByLabelText("sortby-category-dropdown")

        await user.click(categoriesDropdownMenu)

        const optionToSelect = getByLabelText("Data nagrania")

        await user.click(optionToSelect)

        expect(container).toMatchSnapshot()
        expect(mockSelectCurrentPage).toHaveBeenCalledWith(1)
    })

    it("should rotate sorting direction button after sorting direction button is clicked and change its title to 'Sortuj rosnąco', should call selectCurrentPage(1)", async () => {          
        const {container, getByLabelText} = renderComponent()
        const sortingDirectionButton = getByLabelText("toggle-sort-direction")

        await user.click(sortingDirectionButton)
        
        expect(container).toMatchSnapshot()
        expect(mockSelectCurrentPage).toHaveBeenCalledWith(1)
    })

    it("should rotate sorting direction button after sorting direction button is clicked and change its title to 'Sortuj malejąco', should call selectCurrentPage(1)", async () => {          
        const {container, getByLabelText} = renderComponent()
        const sortingDirectionButton = getByLabelText("toggle-sort-direction")

        await user.click(sortingDirectionButton)
        
        jest.clearAllMocks()
        
        await user.click(sortingDirectionButton)

        expect(container).toMatchSnapshot()
        expect(mockSelectCurrentPage).toHaveBeenCalledWith(1)
    })
})