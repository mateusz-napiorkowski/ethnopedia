import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import ImportToExistingCollectionPage from "../ImportToExistingCollectionPage"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";
import * as XLSX from 'xlsx';
import { UserContext } from '../../../providers/UserProvider';
import { loggedInUserContextProps, jwtToken, fileData, newFileData, fileDataWithIdsAndFilenames, collectionData2 as collectionData} from './utils/consts';

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate
}));

const mockGetAllCategories = jest.fn()
jest.mock('../../../api/categories', () => ({
    getAllCategories: (collectionIds: string[]) => mockGetAllCategories(collectionIds),
}))

const mockImportData = jest.fn()
jest.mock('../../../api/dataImport', () => ({
    importData: (
        importData: string[][],
        jwtToken: string,
        collectionId: string
    ) => mockImportData(importData, jwtToken, collectionId),
}))

const queryClient = new QueryClient();
const user = userEvent.setup()

const createXlsxFile = (xlsxData: Array<Array<string>>, fileName: string) => {
    const worksheet = XLSX.utils.aoa_to_sheet(xlsxData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const file = new File([blob], fileName, { type: blob.type });
    return file
}

const renderComponent = (
    collectionId = collectionData._id,
    userContextProps: any = loggedInUserContextProps
) => { 
    return render(
        <UserContext.Provider value={ userContextProps }>
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[`/collections/${collectionId}/import-data/`]}>
                    <Routes>
                        <Route path="/collections/:collection/import-data" element={<ImportToExistingCollectionPage />}/>
                    </Routes>  
                </MemoryRouter>
            </QueryClientProvider>
        </UserContext.Provider>
    );
};

describe("ImportToExistingCollectionPage tests", () => {
    beforeEach(() => {
        queryClient.clear();
        jest.clearAllMocks()
    });

    it("should render initial state", () => {           
        const {container, getByLabelText} = renderComponent()

        expect(container).toMatchSnapshot()
        expect(getByLabelText("import-data")).toBeDisabled()
    })

    it("should navigate to previous page after cancel button is clicked", async () => {           
        const {getByText} = renderComponent()
        const cancelButton = getByText(/anuluj/i)

        await user.click(cancelButton)

        expect(mockUseNavigate).toHaveBeenCalledWith(-1)
    })

    it("should load file data after file is loaded and render categories configuration menu with correct initial category structure", async () => {           
        mockGetAllCategories.mockReturnValue({categories: ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists']})
        const {getByLabelText, getByText, container} = renderComponent()
        const uploadField = getByLabelText("upload")
        const file = createXlsxFile(fileData, "example.xlsx")

        await user.upload(uploadField, file)
        await waitFor(() =>
            expect(getByText("example.xlsx")).toBeInTheDocument()
        );
        
        expect(container).toMatchSnapshot()
    })

    it("should unload file data after remove file to upload button is clicked and hide categories configuration menu", async () => {           
        mockGetAllCategories.mockReturnValue({categories: ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists']})
        const {getByLabelText, getByText, container} = renderComponent()
        const uploadField = getByLabelText("upload")
        const file = createXlsxFile(fileData, "example.xlsx")
         
        await user.upload(uploadField, file)
        await waitFor(() =>
            expect(getByText("example.xlsx")).toBeInTheDocument()
        );
        await user.click(getByLabelText("remove-file-to-load"))
        
        expect(container).toMatchSnapshot()
    })

    it("should reload file data after file is loaded then removed and loaded again", async () => {           
        mockGetAllCategories.mockReturnValue({categories: ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists']})
        const {getByLabelText, getByText, container} = renderComponent()
        const uploadField = getByLabelText("upload")
        const file = createXlsxFile(fileData, "example.xlsx")

        await user.upload(uploadField, file)
        await waitFor(() =>
            expect(getByText("example.xlsx")).toBeInTheDocument()
        );
        await user.click(getByLabelText("remove-file-to-load"))
        await user.upload(uploadField, file)
        await waitFor(() =>
            expect(getByText("example.xlsx")).toBeInTheDocument()
        );

        expect(container).toMatchSnapshot()
    })

    it("should load file data of new file after some file is loaded then removed and then the new file is loaded", async () => {           
        mockGetAllCategories.mockReturnValue({categories: ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists']})
        const {getByLabelText, getByText, container} = renderComponent()
        const uploadField = getByLabelText("upload")
        const file = createXlsxFile(fileData, "example.xlsx")
        const newFile = createXlsxFile(newFileData, "new_example.xlsx")

        await user.upload(uploadField, file)
        await waitFor(() =>
            expect(getByText("example.xlsx")).toBeInTheDocument()
        );
        await user.click(getByLabelText("remove-file-to-load"))
        await user.upload(uploadField, newFile)
        await waitFor(() =>
            expect(getByText("new_example.xlsx")).toBeInTheDocument()
        );
        
        expect(container).toMatchSnapshot()
    })

    it("should call importData with correct parameters and go to collection page after import data button is clicked and data import is successful", async () => {           
        mockGetAllCategories.mockReturnValue({categories: ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists']})
        const {getByLabelText, getByText} = renderComponent()
        const uploadField = getByLabelText("upload")
        const file = createXlsxFile(fileData, "example.xlsx")

        await user.upload(uploadField, file)
        await waitFor(() =>
            expect(getByText("example.xlsx")).toBeInTheDocument()
        );
        await user.click(getByLabelText("import-data"))
        expect(mockImportData).toHaveBeenCalledWith(fileData, jwtToken, collectionData._id)
        expect(mockUseNavigate).toHaveBeenCalledWith(`/collections/${collectionData._id}/artworks`)
    })

    it("should render categories configuration menu with correct initial category structure and call importData with correct parameters when id and filename columns are included in spreadsheet file ", async () => {           
        mockGetAllCategories.mockReturnValue({categories: ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists']})
        const {getByLabelText, getByText, container} = renderComponent()
        const uploadField = getByLabelText("upload")
        const file = createXlsxFile(fileDataWithIdsAndFilenames, "example.xlsx")

        await user.upload(uploadField, file)
        await waitFor(() =>
            expect(getByText("example.xlsx")).toBeInTheDocument()
        );

        expect(container).toMatchSnapshot()

        await user.click(getByLabelText("import-data")
    )
        expect(mockImportData).toHaveBeenCalledWith(fileDataWithIdsAndFilenames, jwtToken, collectionData._id)
        
    })

    it("should throw invalid data in the spreadsheet file error when categories configuration menu is set incorrectly when import data button is clicked", async () => {           
        mockGetAllCategories.mockReturnValue({categories: ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists']})
        mockImportData.mockImplementation(() => {
            throw {response: {data: {error: "Invalid data in the spreadsheet file"}}};
        });
        const {getByLabelText, getByText, container} = renderComponent()
        const uploadField = getByLabelText("upload")
        const file = createXlsxFile(fileData, "example.xlsx")

        await user.upload(uploadField, file)
        await waitFor(() =>
            expect(getByText("example.xlsx")).toBeInTheDocument()
        );
        const titleSelect = getByLabelText(`Title-collection-equivalent-select`)

        await user.selectOptions(titleSelect, "Artists")

        expect(titleSelect).toHaveValue("Artists")
        await user.click(getByLabelText("import-data"))
        expect(mockImportData).toHaveBeenCalledWith([
            ["Artists", "Title.Subtitle", "Title.Subtitle.Subsubtitle", "Artists"],
            ["title 1", "subtitle 1", "subsubtitle 1", "artist 1"]
        ], jwtToken, collectionData._id)
        
        expect(getByLabelText("server-error")).toMatchSnapshot()
    })

    it.each([
        {axiosError: {response: {data: {error: "Incorrect request body provided"}}}},
        {axiosError: {response: {data: {error: "Collection not found"}}}},
        {axiosError: {response: {data: {error: "Database unavailable"}}}}
    ])("should show appropriate error message when importData rejects with error - $axiosError.response.data.error",
		async ({axiosError}) => {
            mockGetAllCategories.mockReturnValue({categories: ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists']})
            mockImportData.mockImplementation(() => {
                throw axiosError;
            });
            const {getByLabelText, getByText} = renderComponent()
            const uploadField = getByLabelText("upload")
            const file = createXlsxFile(fileData, "example.xlsx")

            await user.upload(uploadField, file)
            await waitFor(() =>
                expect(getByText("example.xlsx")).toBeInTheDocument()
            );
            await user.click(getByLabelText("import-data"))
            
            expect(getByLabelText("server-error")).toMatchSnapshot()	
		}
	)
})