import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
import DisplayCategoriesSelect from "../DisplayCategoriesSelect"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { useState } from 'react';

const user = userEvent.setup()

const exampleCollectionId = "67f84d80d2ac8e9a1e67cca4"
const renderComponent = (collectionId = exampleCollectionId) => {
    const Wrapper = () => {
        const [selectedDisplayCategories, setSelectedDisplayCategories] = useState(["Tytuł", "Tytuł.Podtytuł", "Artyści"])
        
        const categoryOptions = [
            {
                "value": "Tytuł",
                "label": "Tytuł"
            },
            {
                "value": "Tytuł.Podtytuł",
                "label": "Tytuł.Podtytuł"
            },
            {
                "value": "Artyści",
                "label": "Artyści"
            },
            {
                "value": "Rok",
                "label": "Rok"
            }
        ]

        const customOptions = [
            {
                "value": "select_all",
                "label": "Zaznacz wszystkie"
            },
            {
                "value": "deselect_all",
                "label": "Odznacz wszystkie"
            },
            {
                "value": "Tytuł",
                "label": "Tytuł"
            },
            {
                "value": "Tytuł.Podtytuł",
                "label": "Tytuł.Podtytuł"
            },
            {
                "value": "Artyści",
                "label": "Artyści"
            },
            {
                "value": "Rok",
                "label": "Rok"
            }
        ]

        type Option = {
            value: string;
            label: string;
        };

        const formatOptionLabel = (option: Option, { context }: { context: string }) => {
            if (context === "menu") {
                if (option.value === "select_all" || option.value === "deselect_all") {
                    return (
                        <div
                            className="text-gray-500 dark:text-gray-300 underline"
                        >
                            {option.label}
                        </div>
                    );
                }
            }
            return option.label;
        }

        return (<DisplayCategoriesSelect
            selectedDisplayCategories={selectedDisplayCategories}
            setSelectedDisplayCategories={setSelectedDisplayCategories}
            categoryOptions={categoryOptions}
            customOptions={customOptions}
            formatOptionLabel={formatOptionLabel}
        />

        )
    }
    
    return render(
        <MemoryRouter initialEntries={[`/collections/${collectionId}/artworks/`]}>
            <Routes>
                <Route path="/collections/:collectionId/artworks/" element={<Wrapper/>}/>
            </Routes>  
        </MemoryRouter>
    );
};

describe("DisplayCategoriesSelect tests", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    it("should render initial state", async () => {           
        const { container } = renderComponent()
        
        expect(container).toMatchSnapshot()
    })

    it("should expand select menu when component is clicked", async () => {           
        const {container, getByLabelText} = renderComponent()

        await user.click(getByLabelText("open/close-display-categories-select"))

        expect(container).toMatchSnapshot()
    })

    it("should hide select menu when user clicks outside of component", async () => {           
        const {container, getByLabelText} = renderComponent()

        await user.click(getByLabelText("open/close-display-categories-select"))
        await user.click(document.body)

        expect(container).toMatchSnapshot()
    })

    it("should uncheck all categories except first when deselect all button is clicked", async () => {           
        const {container, getByLabelText, getByText} = renderComponent()
        await user.click(getByLabelText("open/close-display-categories-select"))
        const deselectAllButton = getByText(/odznacz wszystkie/i)

        await user.click(deselectAllButton)
        await user.click(getByLabelText("open/close-display-categories-select"))

        expect(container).toMatchSnapshot()
    })

    it("should check all categories when select all button is clicked", async () => {           
        const {container, getByLabelText, getByText} = renderComponent()
        await user.click(getByLabelText("open/close-display-categories-select"))
        const selectAllButton = getByText(/zaznacz wszystkie/i)

        await user.click(selectAllButton)
        await user.click(getByLabelText("open/close-display-categories-select"))

        expect(container).toMatchSnapshot()
    })

    it("should check/uncheck categories when appropriate options are clicked", async () => {           
        const {getByLabelText} = renderComponent()
        await user.click(getByLabelText("open/close-display-categories-select"))
        const titleOption = getByLabelText("Tytuł-check/uncheck")
        const subtitleOption = getByLabelText("Tytuł.Podtytuł-check/uncheck")
        const artistsOption = getByLabelText("Artyści-check/uncheck")
        const yearOption = getByLabelText("Rok-check/uncheck")

        await user.click(yearOption)
        await user.click(titleOption)
        await user.click(titleOption)
        await user.click(subtitleOption)
        await user.click(yearOption)
        await user.click(subtitleOption)
        await user.click(yearOption)
        await user.click(yearOption)
        await user.click(artistsOption)

        expect(titleOption).toBeChecked()
        expect(subtitleOption).toBeChecked()
        expect(artistsOption).not.toBeChecked()
        expect(yearOption).not.toBeChecked()
    })
})