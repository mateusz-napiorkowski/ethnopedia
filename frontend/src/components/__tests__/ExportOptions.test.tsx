import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import ExportOptions from "../ExportOptions"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";

const mockGetAllCategories = jest.fn()
jest.mock('../../api/categories', () => ({
    getAllCategories: () => mockGetAllCategories()
}))

const mockGetXlsxWithArtworksData = jest.fn()
jest.mock('../../api/dataExport', () => ({
    getXlsxWithArtworksData: (collection: string, keys: any, selectedArtworks: any, exportSelectedRecords: boolean, filename: string) => mockGetXlsxWithArtworksData(collection, keys, selectedArtworks, exportSelectedRecords, filename)
}))

const queryClient = new QueryClient();
const user = userEvent.setup()

const renderComponent = (collection = "example-collection") => {
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[`/collections/${collection}/artworks/`]}>
                <Routes>
                    <Route path="/collections/:collection/artworks/" element={<ExportOptions onClose={function (): void {
                        throw new Error('Function not implemented.');
                    } } selectedArtworks={{}}/>}/>
                </Routes>  
            </MemoryRouter>
        </QueryClientProvider>
        
    );
};

describe("Export options tests", () => {
    beforeEach(() => {
        queryClient.clear();
        jest.clearAllMocks()
    });

    it("should render loading state", () => {           
        const {queryByTestId} = renderComponent()
        
        expect(queryByTestId("loading-page-container")).toBeInTheDocument()
        expect(queryByTestId("export-options-container")).not.toBeInTheDocument()
    })

    it("should render component after data is fetched from API", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł"]})        
        const { getByTestId, queryByTestId, } = renderComponent()
        await waitFor(() => getByTestId("export-options-container"))

        expect(queryByTestId("loading-page-container")).not.toBeInTheDocument()
        expect(queryByTestId("export-options-container")).toBeInTheDocument()
    })

    it.each([
        {categories: ["Tytuł", "Region", "Artyści", "Rok"], clickSequence: [],
            expectedChecked: []},
        {categories: ["Tytuł", "Region", "Artyści", "Rok"], clickSequence: ["Region", "Region", "Region", "Region", "Region"],
            expectedChecked: ["Region"]},
        {categories: ["Tytuł", "Region", "Artyści", "Rok"], clickSequence: ["Region", "Artyści", "Tytuł", "Rok"],
            expectedChecked: ["Tytuł", "Region", "Artyści", "Rok"]},
        {categories: ["Tytuł", "Region", "Artyści", "Rok"], clickSequence: ["Artyści", "Tytuł", "Rok", "Artyści", "Rok"],
                expectedChecked: ["Tytuł"]},
        {categories: ["Tytuł", "Region", "Artyści", "Rok"], clickSequence: ["Zaznacz wszystkie"],
            expectedChecked: ["Tytuł", "Region", "Artyści", "Rok"]},
        {categories: ["Tytuł", "Region", "Artyści", "Rok"], clickSequence: ["Region", "Region", "Tytuł", "Odznacz wszystkie"],
            expectedChecked: []}
      ])('should have correct states of checkboxes for checkboxes/buttons clicked in sequence: $clickSequence', async ({categories, clickSequence, expectedChecked}) => {
        const expectedUnchecked = categories.filter(category => !expectedChecked.includes(category))
        mockGetAllCategories.mockReturnValue({categories: categories})
        const { getByTestId, getByDisplayValue } = renderComponent()
        await waitFor(() => getByTestId("export-options-container"))  

        for(const value of clickSequence) {
            await user.click(getByDisplayValue(value))
        }

        expectedChecked.forEach(value => {
            expect(getByDisplayValue(value)).toBeChecked();
        });
        expectedUnchecked.forEach(value => {
            expect(getByDisplayValue(value)).not.toBeChecked();
        });
    })

    it("should have export selected/all checkboxes checked correctly", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Region", "Artyści", "Rok"]})        
        const { getByTestId, getByDisplayValue } = renderComponent()
        await waitFor(() => getByTestId("export-options-container"))
        const exportSelectedCheckbox = getByDisplayValue("onlyChecked")
        const exportAllCheckbox = getByDisplayValue("exportAll")
        
        expect(exportAllCheckbox).toBeChecked()
        expect(exportSelectedCheckbox).not.toBeChecked()

        await user.click(exportSelectedCheckbox)

        expect(exportAllCheckbox).not.toBeChecked()
        expect(exportSelectedCheckbox).toBeChecked()

        await user.click(exportSelectedCheckbox)

        expect(exportAllCheckbox).not.toBeChecked()
        expect(exportSelectedCheckbox).toBeChecked()

        await user.click(exportAllCheckbox)

        expect(exportAllCheckbox).toBeChecked()
        expect(exportSelectedCheckbox).not.toBeChecked()

        await user.click(exportAllCheckbox)

        expect(exportAllCheckbox).toBeChecked()
        expect(exportSelectedCheckbox).not.toBeChecked()
    })

    it("should pass correct params to export function", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Region", "Artyści", "Rok"]})        
        const { getByTestId, queryByTestId, getByDisplayValue } = renderComponent()
        await waitFor(() => getByTestId("export-options-container"))

        await user.click(getByDisplayValue("Artyści"))
        await user.click(getByDisplayValue("Region"))

        const filenameInput = getByDisplayValue("example-collection.xlsx")

        const exportSelectedCheckbox = getByDisplayValue("onlyChecked")
        const exportAllCheckbox = getByDisplayValue("exportAll")
        
        await user.clear(filenameInput)
        await user.type(filenameInput, "another-collection-name.xlsx")
        await user.click(getByDisplayValue("Eksportuj metadane"))
        expect(mockGetXlsxWithArtworksData).toHaveBeenCalledWith("example-collection", ["Region", "Artyści"], {}, false, "another-collection-name.xlsx")
    })
})