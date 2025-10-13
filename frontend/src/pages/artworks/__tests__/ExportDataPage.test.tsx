import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import ExportDataPage from "../ExportDataPage"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";

const mockUseNavigate = jest.fn();
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate,
  useLocation: () => mockUseLocation(),
}));

const mockGetAllCategories = jest.fn()
jest.mock('../../../api/categories', () => ({
    getAllCategories: () => mockGetAllCategories()
}))

const mockGetXlsxWithArtworksData = jest.fn()
const mockGetArtworksFilesArchive = jest.fn()
jest.mock('../../../api/dataExport', () => ({
    getXlsxWithArtworksData: (
        collectionIds: string[],
        keysToInclude: string[],
        exportExtent: string,
        selectedArtworksIds: { [key: string]: boolean },
        searchParams: URLSearchParams,
        filename: string,
        includeIds: boolean,
        includeFilenames: boolean,
        exportAsCSV: boolean
    ) => mockGetXlsxWithArtworksData(
        collectionIds,
        keysToInclude,
        exportExtent,
        selectedArtworksIds,
        searchParams,
        filename,
        includeIds,
        includeFilenames,
        exportAsCSV
    ),
    getArtworksFilesArchive: (
        collectionIds: string[],
        exportExtent: string,
        selectedArtworksIds: { [key: string]: boolean },
        searchParams: URLSearchParams,
        archiveFilename: string
    ) => mockGetArtworksFilesArchive(
        collectionIds, 
        exportExtent,
        selectedArtworksIds,
        searchParams,      
        archiveFilename
    )
}))

const queryClient = new QueryClient();
const user = userEvent.setup()

const exampleCollectionId = "67f84d80d2ac8e9a1e67cca4"
const renderComponent = (collectionId = exampleCollectionId) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[`/collections/${collectionId}/export-data/`]}>
                <Routes>
                    <Route path="/collections/:collection/export-data/" element={<ExportDataPage />}/>
                </Routes>  
            </MemoryRouter>
        </QueryClientProvider>
        
    );
};

describe("ExportDataPage tests", () => {
    beforeEach(() => {
        queryClient.clear();
        jest.clearAllMocks()
        mockUseLocation.mockReturnValue({state: null})
    });

    it("should render loading state", () => {           
        const {queryByTestId} = renderComponent()
        
        expect(queryByTestId("loading-page-container")).toBeInTheDocument()
        expect(queryByTestId("export-data-page-container")).not.toBeInTheDocument()
    })

    it("should render component after data is fetched from API", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł"]})        
        const { getByTestId, queryByTestId, } = renderComponent()
        await waitFor(() => getByTestId("export-data-page-container"))

        expect(queryByTestId("loading-page-container")).not.toBeInTheDocument()
        expect(queryByTestId("export-data-page-container")).toBeInTheDocument()
    })

    it("should go back to collection page when go back to collection page button is clicked", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł"]})        
        const { getByTestId, getByLabelText } = renderComponent()
        await waitFor(() => getByTestId("export-data-page-container"))

        await user.click(getByLabelText("go-back-to-collection-page"))
        expect(mockUseNavigate).toHaveBeenCalledWith(-1)
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
        await waitFor(() => getByTestId("export-data-page-container"))  

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

    it.each([
        {
            clickSequence: ["check-all-categories", "export-data"],
            expectedChecked: ["export-all", "include-ids-column", "include-filenames-column"],
            exportExtent: "all",
            selectedArtworks: {},
            searchParams: "",
            filename: "collection",
            includeIds: true,
            includeFilenames: true,
            exportAsCSV: false
        },
        {
            clickSequence: ["export-selected", "check-all-categories", "export-data"],
            expectedChecked: ["export-selected", "include-ids-column", "include-filenames-column"],
            exportExtent: "selected",
            selectedArtworks: {
                "68ed00876d7fcdb224dab0e7": true,
                "12ab00876d7fcdb224dab0d5": true,
            },
            searchParams: "",
            filename: "collection",
            includeIds: true,
            includeFilenames: true,
            exportAsCSV: false
        },
        {
            clickSequence: ["export-search-results", "check-all-categories", "export-data"],
            expectedChecked: ["export-search-results", "include-ids-column", "include-filenames-column"],
            exportExtent: "searchResult",
            selectedArtworks: {},
            searchParams: "Tytuł=Przykładowy&Region=Kaszuby",
            filename: "collection",
            includeIds: true,
            includeFilenames: true,
            exportAsCSV: false
        },
        {
            clickSequence: ["check-all-categories", "include-ids-column", "export-data"],
            expectedChecked: ["export-all", "include-filenames-column"],
            exportExtent: "all",
            selectedArtworks: {},
            searchParams: "",
            filename: "collection",
            includeIds: false,
            includeFilenames: true,
            exportAsCSV: false
        },
        {
            clickSequence: ["check-all-categories", "include-filenames-column", "export-data"],
            expectedChecked: ["export-all", "include-ids-column"],
            exportExtent: "all",
            selectedArtworks: {},
            searchParams: "",
            filename: "collection",
            includeIds: true,
            includeFilenames: false,
            exportAsCSV: false
        },
        {
            clickSequence: ["check-all-categories", "select-export-as-csv", "export-data"],
            expectedChecked: ["export-all", "include-ids-column", "include-filenames-column"],
            exportExtent: "all",
            selectedArtworks: {},
            searchParams: "",
            filename: "collection",
            includeIds: true,
            includeFilenames: true,
            exportAsCSV: true
        },
        {
            clickSequence: [
                "check-all-categories", 
                "export-search-results", 
                "include-filenames-column", 
                "include-ids-column",
                "select-export-as-csv",
                "include-filenames-column",
                "include-ids-column", 
                "include-filenames-column",
                "select-export-as-spreadsheet",
                "include-ids-column",
                "export-all",
                "include-ids-column",
                 "export-data"
            ],
            expectedChecked: ["export-all", "include-ids-column"],
            exportExtent: "all",
            selectedArtworks: {
                "68ed00876d7fcdb224dab0e7": true,
                "12ab00876d7fcdb224dab0d5": true,
            },
            searchParams: "",
            filename: undefined,
            includeIds: true,
            includeFilenames: false,
            exportAsCSV: false
        },
      ])('should have correct options selected and call getXlsxWithArtworksData function with correct parameters for checkboxes/buttons clicked in sequence: $clickSequence', async ({clickSequence, expectedChecked, exportExtent, selectedArtworks, searchParams, filename, includeIds, includeFilenames, exportAsCSV}) => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł", "Region", "Artyści", "Rok"]})
        mockUseLocation.mockReturnValue({state: {selectedArtworks: selectedArtworks, searchParams: searchParams, initialFilename: filename}})
        const { getByTestId, getByLabelText } = renderComponent()
        await waitFor(() => getByTestId("export-data-page-container"))
        const filenameInput = getByLabelText("spreadsheet/CSV-filename-input")

        for(const value of clickSequence) {
            await user.click(getByLabelText(value))
        }

        if(filename) {
            await user.clear(filenameInput)
            await user.type(filenameInput, filename)
        }

        for(const value of expectedChecked) {
            expect(getByLabelText(value)).toBeChecked()
        }

        expect(filenameInput).toHaveValue(filename ? filename : "metadane")

        expect(mockGetXlsxWithArtworksData).toHaveBeenCalledWith(
            [exampleCollectionId],
            ["Tytuł", "Region", "Artyści", "Rok"],
            exportExtent,
            selectedArtworks,
            expect.any(URLSearchParams),
            mockUseLocation().state.initialFilename ? filename : "metadane",
            includeIds,
            includeFilenames,
            exportAsCSV
        )

        const urlSearchParamsStringified = mockGetXlsxWithArtworksData.mock.calls[0][4].toString();
        expect(decodeURI(urlSearchParamsStringified)).toBe(searchParams);
    })

    it("should type in new archive filename and call getArtworksFilesArchive with correct parameters when export button is clicked, should preserve state of export to spreadsheet/CSV menu when going back to it", async () => {
        mockGetAllCategories.mockReturnValue({categories: ["Tytuł"]})
        mockUseLocation.mockReturnValue({
            state: {
                selectedArtworks: {
                    "68ed00876d7fcdb224dab0e7": true,
                    "12ab00876d7fcdb224dab0d5": true,
                },
                searchParams: "",
                initialArchiveFilename: "initial archive filename"
            }
        })      
        const { getByTestId, getByLabelText } = renderComponent()
        await waitFor(() => getByTestId("export-data-page-container"))

        //changing the state of export to spreadsheet/CSV menu
        await user.click(getByLabelText("export-selected"))
        await user.clear(getByLabelText("spreadsheet/CSV-filename-input"))
        await user.type(getByLabelText("spreadsheet/CSV-filename-input"), "another-filename")
        await user.click(getByLabelText("check-all-categories"))
        await user.click(getByLabelText("include-ids-column"))
        await user.click(getByLabelText("include-filenames-column"))

        //testing export archive menu
        await user.click(getByLabelText("go-to-export-archive-menu"))

        const archiveFilenameInput = getByLabelText("archive-filename-input")

        expect(archiveFilenameInput).toHaveValue("initial archive filename")
        
        await user.clear(archiveFilenameInput)
        await user.type(archiveFilenameInput, "another-archive-filename")

        expect(archiveFilenameInput).toHaveValue("another-archive-filename")

        await user.click(getByLabelText("export-data"))

        expect(mockGetArtworksFilesArchive).toHaveBeenCalledWith(
            [exampleCollectionId],
            "selected",
            {
                "68ed00876d7fcdb224dab0e7": true,
                "12ab00876d7fcdb224dab0d5": true,
            },
            expect.any(URLSearchParams),
            "another-archive-filename"
        )

        //checking if state of export to spreadsheet/CSV menu is preserved
        await user.click(getByLabelText("go-to-export-spreadsheet/CSV-menu"))

        expect(getByLabelText("export-selected")).toBeChecked()
        expect(getByLabelText("spreadsheet/CSV-filename-input")).toHaveValue("another-filename")
        expect(getByLabelText("Tytuł-checkbox")).toBeChecked()
        expect(getByLabelText("include-ids-column")).not.toBeChecked()
        expect(getByLabelText("include-filenames-column")).not.toBeChecked()
    })
})