import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
import SortOptions from "../SortOptions"
import userEvent from "@testing-library/user-event";

const mockOnSelect = jest.fn()

const user = userEvent.setup()

const renderComponent = () => {
    return render(
        <SortOptions 
            options={[
                {value: "name-asc", label: "Nazwa rosnąco"},
                {value: "name-desc", label: "Nazwa malejąco"}
            ]}
            onSelect={mockOnSelect}
        />
    );
};

describe("Sort options tests", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    it("should render component correctly", () => {           
        const {container} = renderComponent()
        
        expect(container).toMatchSnapshot()
    })

    it("should call onSelect and change selected option in select menu after user chooses an option from select menu", async () => {           
        const { getByRole } = renderComponent()
        const selectElement = getByRole("combobox")
        const nameAscOption = getByRole("option", {
            name: /nazwa malejąco/i
        })
        const nameDescOption = getByRole("option", {
            name: /nazwa rosnąco/i
        })

        await user.selectOptions(selectElement, "name-desc")

        expect(mockOnSelect).toHaveBeenCalled()
        expect((nameAscOption as HTMLOptionElement).selected).toBe(true)
        expect((nameDescOption as HTMLOptionElement).selected).toBe(false)  
    })
})