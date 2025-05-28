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
    getXlsxWithArtworksData: (collection: string,
        keys: Array<string>,
        exportExtent: string,
        selectedArtworks: Array<any>,
        searchParams: URLSearchParams,
        filename: string) => mockGetXlsxWithArtworksData(collection, keys, exportExtent, selectedArtworks, searchParams, filename)
}))

const mockOnClose = jest.fn()

const queryClient = new QueryClient();
const user = userEvent.setup()

const exampleCollectionId = "67f84d80d2ac8e9a1e67cca4"
const renderComponent = (collectionId = exampleCollectionId, selectedArtworks = {}) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[`/collections/${collectionId}/artworks/`]}>
                <Routes>
                    <Route path="/collections/:collectionId/artworks/" element={<ExportOptions onClose={mockOnClose} selectedArtworks={selectedArtworks} initialFilename='example-collection.xlsx' collectionIds={[collectionId]}/>}/>
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

    it("should call onClose when exit button is clicked", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł"]})        
        const { getByTestId, getByLabelText } = renderComponent()
        await waitFor(() => getByTestId("export-options-container"))

        await user.click(getByLabelText("exit"))
        expect(mockOnClose).toHaveBeenCalled()
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
        const { getByTestId, getByDisplayValue, getByText } = renderComponent()
        await waitFor(() => getByTestId("export-options-container"))  

        for(const value of clickSequence) {
            const elementToClick = (value === "Zaznacz wszystkie" || value === "Odznacz wszystkie")
                ? getByText(value) : getByDisplayValue(value)
            await user.click(elementToClick)
        }

        expectedChecked.forEach(value => {
            expect(getByDisplayValue(value)).toBeChecked();
        });
        expectedUnchecked.forEach(value => {
            expect(getByDisplayValue(value)).not.toBeChecked();
        });
    })

    it("should have initial state where 'export selected' and 'export search results' checkboxes are unchecked and 'export all' checkbox is checked", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Region", "Artyści", "Rok"]})        
        const { getByTestId, getByDisplayValue } = renderComponent()
        await waitFor(() => getByTestId("export-options-container"))
        const exportSelectedCheckbox = getByDisplayValue("onlyChecked")
        const exportSearchResultCheckbox = getByDisplayValue("onlySearchResult")
        const exportAllCheckbox = getByDisplayValue("exportAll")
        
        expect(exportAllCheckbox).toBeChecked()
        expect(exportSearchResultCheckbox).not.toBeChecked()
        expect(exportSelectedCheckbox).not.toBeChecked()
    })

    it(`should have only 'export selected' option checked after 'export selected' is clicked`, async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Region", "Artyści", "Rok"]})        
        const { getByTestId, getByDisplayValue } = renderComponent()
        await waitFor(() => getByTestId("export-options-container"))
        const exportSelectedCheckbox = getByDisplayValue("onlyChecked")
        const exportSearchResultCheckbox = getByDisplayValue("onlySearchResult")
        const exportAllCheckbox = getByDisplayValue("exportAll")
        
        await user.click(exportSelectedCheckbox)

        expect(exportAllCheckbox).not.toBeChecked()
        expect(exportSearchResultCheckbox).not.toBeChecked()
        expect(exportSelectedCheckbox).toBeChecked()
    })

    it("should have only 'export search results' option checked after 'export search results' is clicked", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Region", "Artyści", "Rok"]})        
        const { getByTestId, getByDisplayValue } = renderComponent()
        await waitFor(() => getByTestId("export-options-container"))
        const exportSelectedCheckbox = getByDisplayValue("onlyChecked")
        const exportSearchResultCheckbox = getByDisplayValue("onlySearchResult")
        const exportAllCheckbox = getByDisplayValue("exportAll")
        
        await user.click(exportSearchResultCheckbox)

        expect(exportSearchResultCheckbox).toBeChecked()
        expect(exportSelectedCheckbox).not.toBeChecked()
        expect(exportAllCheckbox).not.toBeChecked()
    })

    it("should have only 'export all' option checked after 'export all' is clicked", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Region", "Artyści", "Rok"]})        
        const { getByTestId, getByDisplayValue } = renderComponent()
        await waitFor(() => getByTestId("export-options-container"))
        const exportSelectedCheckbox = getByDisplayValue("onlyChecked")
        const exportSearchResultCheckbox = getByDisplayValue("onlySearchResult")
        const exportAllCheckbox = getByDisplayValue("exportAll")
        
        await user.click(exportSearchResultCheckbox)
        await user.click(exportAllCheckbox)

        expect(exportAllCheckbox).toBeChecked()
        expect(exportSelectedCheckbox).not.toBeChecked()
        expect(exportSearchResultCheckbox).not.toBeChecked()
    })

    it("should not change state after already checked checkbox is clicked", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Region", "Artyści", "Rok"]})        
        const { getByTestId, getByDisplayValue } = renderComponent()
        await waitFor(() => getByTestId("export-options-container"))
        const exportSelectedCheckbox = getByDisplayValue("onlyChecked")
        const exportSearchResultCheckbox = getByDisplayValue("onlySearchResult")
        const exportAllCheckbox = getByDisplayValue("exportAll")
        
        await user.click(exportAllCheckbox)

        expect(exportAllCheckbox).toBeChecked()
        expect(exportSearchResultCheckbox).not.toBeChecked()
        expect(exportSelectedCheckbox).not.toBeChecked()

        await user.click(exportSelectedCheckbox)
        await user.click(exportSelectedCheckbox)

        expect(exportAllCheckbox).not.toBeChecked()
        expect(exportSearchResultCheckbox).not.toBeChecked()
        expect(exportSelectedCheckbox).toBeChecked()

        await user.click(exportSearchResultCheckbox)
        await user.click(exportSearchResultCheckbox)

        expect(exportAllCheckbox).not.toBeChecked()
        expect(exportSelectedCheckbox).not.toBeChecked()
        expect(exportSearchResultCheckbox).toBeChecked()
    })

    it("should change filename input value when user types in another filename", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Region", "Artyści", "Rok"]})        
        const { getByTestId, getByDisplayValue } = renderComponent()
        await waitFor(() => getByTestId("export-options-container"))
        
        const filenameInput = getByDisplayValue("example-collection.xlsx")
        await user.clear(filenameInput)
        await user.type(filenameInput, "another-collection-name.xlsx")
        
        expect(filenameInput).toHaveValue("another-collection-name.xlsx")
    })

    it("should call getXlsxWithArtworksData function with correct parameters after export metadata button is clicked and 'export all' checkbox is checked", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Region", "Artyści", "Rok"]})        
        const { getByTestId, getByDisplayValue, getByText } = renderComponent()
        await waitFor(() => getByTestId("export-options-container"))

        await user.click(getByDisplayValue("Artyści"))
        await user.click(getByDisplayValue("Region"))

        const filenameInput = getByDisplayValue("example-collection.xlsx")
        
        await user.clear(filenameInput)
        await user.type(filenameInput, "another-collection-name.xlsx")
        await user.click(getByText("Eksportuj metadane"))
        expect(mockGetXlsxWithArtworksData).toHaveBeenCalledWith([exampleCollectionId], ["Region", "Artyści"], "all", {}, new URLSearchParams, "another-collection-name.xlsx")
    })

    it("should call getXlsxWithArtworksData function with correct parameters after export metadata button is clicked and 'export selected' checkbox is checked", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Region", "Artyści", "Rok"]})        
        const { getByTestId, getByDisplayValue, getByText } = renderComponent(exampleCollectionId, {'674386b32a2908778c0ad471': true, '674386b32a2908778c0ad470': true})
        await waitFor(() => getByTestId("export-options-container"))

        await user.click(getByDisplayValue("Artyści"))
        await user.click(getByDisplayValue("Region"))

        const exportSelectedCheckbox = getByDisplayValue("onlyChecked")
        await user.click(exportSelectedCheckbox)
        await user.click(getByText("Eksportuj metadane"))
        expect(mockGetXlsxWithArtworksData).toHaveBeenCalledWith([exampleCollectionId], ["Region", "Artyści"], "selected", {'674386b32a2908778c0ad471': true, '674386b32a2908778c0ad470': true}, new URLSearchParams, "example-collection.xlsx")
    })

    it("should call getXlsxWithArtworksData function with correct parameters after export metadata button is clicked and 'export search results' checkbox is checked", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Region", "Artyści", "Rok"]})
        const { getByTestId, getByDisplayValue, getByText } = renderComponent()
        await waitFor(() => getByTestId("export-options-container"))

        await user.click(getByDisplayValue("Artyści"))
        await user.click(getByDisplayValue("Region"))

        const filenameInput = getByDisplayValue("example-collection.xlsx")
        
        await user.clear(filenameInput)
        await user.type(filenameInput, "another-collection-name.xlsx")
        const exportSelectedCheckbox = getByDisplayValue("onlySearchResult")
        await user.click(exportSelectedCheckbox)
        await user.click(getByText("Eksportuj metadane"))
        expect(mockGetXlsxWithArtworksData).toHaveBeenCalledWith([exampleCollectionId], ["Region", "Artyści"], "searchResult", {}, expect.any(URLSearchParams), "another-collection-name.xlsx")
    })
})