import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { UserContext } from '../../../providers/UserProvider';
import ImportCollectionPage from '../ImportCollectionPage';
import * as XLSX from 'xlsx';

const queryClient = new QueryClient();
const user = userEvent.setup()

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate
}));

const mockImportDataAsCollection = jest.fn()
jest.mock('../../../api/dataImport', () => ({
   importDataAsCollection: (
        importData: any,
        collectionName: string | undefined,
        description: string,
        jwtToken: string,
        archiveFile: File | undefined,
    ) => mockImportDataAsCollection(importData, collectionName, description, jwtToken, archiveFile)
}));

const exampleCollectionData = {
    _id: '662e928b11674920c8cc0aaa',
    name: 'example collection',
    description: 'example collection description'
}
const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"

const fileData = [
    ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists'],
    ['title 1', 'subtitle 1',
    'subsubtitle 1', "artist 1"],
]

const newFileData = [
    ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists'],
    ['new file title 1', 'new file subtitle 1', 'new file subsubtitle 1', "new file artist 1"],
]

const fileDataWithIdsAndFilenames = [
    ['_id', 'nazwy plików', 'Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists'],
    ['1234aaaa46e5db48231024ef', '0:filename.mid', 'title 1', 'subtitle 1', 'subsubtitle 1', "artist 1"],
]

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
        path = "/import-collection",
        userContextProps: any = {
            isUserLoggedIn: true,
            firstName: "123",
            userId: "66b6506fbb64df165e8a9ce6",
            jwtToken: jwtToken,
            setUserData: jest.fn()
        }
) => {
    return render(
        <UserContext.Provider value={ userContextProps }>
            <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path={path} element={<ImportCollectionPage/>}/>
                </Routes>  
            </MemoryRouter>
        </QueryClientProvider>
        </UserContext.Provider>  
    );
};

describe("ImportCollectionPage tests", () => {
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

    it("should update upload component and show loaded categories configuration menu with correct initial category structure after file is loaded", async () => {           
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

    it("should load zipfile", async () => {           
        const {getByLabelText, getByText, container} = renderComponent()
        const uploadField = getByLabelText("upload-zip") 
        const zipContent = new Blob(["fake zip data"], { type: "application/zip" });
        const zipFile = new File([zipContent], "archive.zip", { type: "application/zip" });    

        await user.upload(uploadField, zipFile)
        await waitFor(() =>
            expect(getByText("archive.zip")).toBeInTheDocument()
        );

        expect(container).toMatchSnapshot()
    })

    it("should unload zipfile after remove archive file to upload button is clicked", async () => {           
        const {getByLabelText, getByText, container} = renderComponent()
        const uploadField = getByLabelText("upload-zip") 
        const zipContent = new Blob(["fake zip data"], { type: "application/zip" });
        const zipFile = new File([zipContent], "archive.zip", { type: "application/zip" });    

        await user.upload(uploadField, zipFile)
        await waitFor(() =>
            expect(getByText("archive.zip")).toBeInTheDocument()
        );

        await user.click(getByLabelText("remove-archive-file-to-load"))
        
        expect(container).toMatchSnapshot()
    })

    it("should reload archive file data after archive file is loaded then removed and loaded again", async () => {
        const {getByLabelText, getByText, container} = renderComponent()
        const uploadField = getByLabelText("upload-zip") 
        const zipContent = new Blob(["fake zip data"], { type: "application/zip" });
        const zipFile = new File([zipContent], "archive.zip", { type: "application/zip" });    

        await user.upload(uploadField, zipFile)
        await waitFor(() =>
            expect(getByText("archive.zip")).toBeInTheDocument()
        );
        await user.click(getByLabelText("remove-archive-file-to-load"))
        await user.upload(uploadField, zipFile)
        await waitFor(() =>
            expect(getByText("archive.zip")).toBeInTheDocument()
        );

        expect(container).toMatchSnapshot()
    })

    it("should load archive file data of new archive file after some archive file is loaded then removed and then the new archive file is loaded", async () => {
        const {getByLabelText, getByText, container} = renderComponent()
        const uploadField = getByLabelText("upload-zip") 
        const zipContent = new Blob(["fake zip data"], { type: "application/zip" });
        const zipFile = new File([zipContent], "archive.zip", { type: "application/zip" });
        const newZipContent = new Blob(["new fake zip data"], { type: "application/zip" });
        const newZipFile = new File([zipContent], "new_archive.zip", { type: "application/zip" });

        await user.upload(uploadField, zipFile)
        await waitFor(() =>
            expect(getByText("archive.zip")).toBeInTheDocument()
        );
        await user.click(getByLabelText("remove-archive-file-to-load"))
        await user.upload(uploadField, newZipFile)
        await waitFor(() =>
            expect(getByText("new_archive.zip")).toBeInTheDocument()
        );
        
        expect(container).toMatchSnapshot()
    })

    it("should have import collection button disabled if file was not loaded", async () => {           
        const {getByLabelText, queryByText} = renderComponent()
        const importCollectionButton = getByLabelText("import-data")
        const collectionNameInputField = getByLabelText("name")
        const descriptionInputField = getByLabelText("description")

        await user.type(collectionNameInputField, exampleCollectionData.name)
        await user.type(descriptionInputField, exampleCollectionData.description)
        await user.click(importCollectionButton)
        expect(importCollectionButton).toBeDisabled()

        expect(queryByText(/nazwa kolekcji jest wymagana/i)).not.toBeInTheDocument()
        expect(queryByText(/opis kolekcji jest wymagany/i)).not.toBeInTheDocument()
    })

    it("should show collection name is required error if collection name was not provided before clicking import collection button", async () => {           
        const {getByRole, getByText, getByLabelText, queryByText} = renderComponent()
        const file = createXlsxFile(fileData, "example.xlsx")      
        const uploadField = getByLabelText("upload")
        const descriptionInputField = getByLabelText("description")
        const importCollectionButton = getByLabelText("import-data")
        
        await user.upload(uploadField, file)
        await user.type(descriptionInputField, exampleCollectionData.description)
        await user.click(importCollectionButton)

        expect(getByText(/nazwa kolekcji jest wymagana/i)).toBeInTheDocument()
        expect(queryByText(/nie wczytano pliku/i)).not.toBeInTheDocument()
        expect(queryByText(/opis kolekcji jest wymagany/i)).not.toBeInTheDocument()
    })

    it("should show collection description is required error if description was not provided before clicking import collection button", async () => {           
        const {getByRole, getByText, queryByText, getByLabelText} = renderComponent()
        const file = createXlsxFile(fileData, "example.xlsx")      
        const uploadField = getByLabelText("upload")
        const nameInputField = getByLabelText("name")
        const importCollectionButton = getByLabelText("import-data")

        await user.upload(uploadField, file)
        await user.type(nameInputField, exampleCollectionData.name)
        await user.click(importCollectionButton)

        expect(getByText(/opis kolekcji jest wymagany/i)).toBeInTheDocument()
        expect(queryByText(/nie wczytano pliku/i)).not.toBeInTheDocument()
        expect(queryByText(/nazwa kolekcji jest wymagana/i)).not.toBeInTheDocument()
    })

    it("should call importDataAsCollection with correct arguments when import collection button is clicked", async () => {           
        const {getByText, getByLabelText} = renderComponent()
        const file = createXlsxFile(fileData, "example.xlsx")      
        const uploadField = getByLabelText("upload")
        const zipUploadField = getByLabelText("upload-zip") 
        const zipContent = new Blob(["fake zip data"], { type: "application/zip" });
        const zipFile = new File([zipContent], "archive.zip", { type: "application/zip" });    
        const nameInputField = getByLabelText("name")
        const descriptionInputField = getByLabelText("description")
        const importCollectionButton = getByLabelText("import-data")

        await user.upload(uploadField, file)
        await waitFor(() =>
            expect(getByText("example.xlsx")).toBeInTheDocument()
        );
        await user.type(nameInputField, exampleCollectionData.name)
        await user.type(descriptionInputField, exampleCollectionData.description)
        await user.upload(zipUploadField, zipFile)
        await waitFor(() =>
            expect(getByText("archive.zip")).toBeInTheDocument()
        );
        await user.click(importCollectionButton)

        expect(mockImportDataAsCollection).toHaveBeenCalledWith(
            fileData,
            exampleCollectionData.name,
            exampleCollectionData.description,
            jwtToken,
            zipFile
        )
    })

    it("should call importData with correct parameters when id and filename columns are included in spreadsheet file", async () => {           
        const {getByLabelText, getByText, container} = renderComponent()
        const uploadField = getByLabelText("upload")
        const file = createXlsxFile(fileDataWithIdsAndFilenames, "example.xlsx")
        const nameInputField = getByLabelText("name")
        const descriptionInputField = getByLabelText("description")

        await user.upload(uploadField, file)
        await waitFor(() =>
            expect(getByText("example.xlsx")).toBeInTheDocument()
        );
        await user.type(nameInputField, exampleCollectionData.name)
        await user.type(descriptionInputField, exampleCollectionData.description)
        
        expect(container).toMatchSnapshot()

        await user.click(getByLabelText("import-data"))

        expect(mockImportDataAsCollection).toHaveBeenCalledWith(
            fileDataWithIdsAndFilenames,
            exampleCollectionData.name,
            exampleCollectionData.description,
            jwtToken,
            undefined
        )
    })

    it("should change select option when another option is selected by user and call importDataAsCollection with correct arguments when import collection button is clicked", async () => {           
        const {getByLabelText, getByText} = renderComponent()
        const file = createXlsxFile(fileData, "example.xlsx")      
        const uploadField = getByLabelText("upload")
        const importCollectionButton = getByLabelText("import-data")
        const fileDataModified = JSON.parse(JSON.stringify(fileData))
        fileDataModified[0][3] = "Title.Subtitle.Subsubtitle.Artists"

        await user.upload(uploadField, file)
        await waitFor(() =>
            expect(getByText("example.xlsx")).toBeInTheDocument()
        );

        const artistsParentSelect = getByLabelText("Artists-parent-select")
        expect(artistsParentSelect).toHaveValue("-")
        await user.selectOptions(artistsParentSelect, "Subsubtitle")
        expect(artistsParentSelect).toHaveValue("Subsubtitle")
        await user.click(importCollectionButton)
        
        expect(mockImportDataAsCollection).toHaveBeenCalledWith(fileDataModified, "", "", jwtToken, undefined)
    })

    it("should show circular references error when options selected by users cause them", async () => {           
        const {getByText, getByLabelText} = renderComponent()
        const file = createXlsxFile(fileData, "example.xlsx")      
        const uploadField = getByLabelText("upload")
        const importCollectionButton = getByLabelText("import-data")
        const fileDataModified = JSON.parse(JSON.stringify(fileData))
        fileDataModified[0][3] = "Title.Subtitle.Subsubtitle.Artists"

        await user.upload(uploadField, file)
        await waitFor(() =>
            expect(getByText("example.xlsx")).toBeInTheDocument()
        );

        const subsubtitleParentSelect = getByLabelText("Title-parent-select")

        await user.selectOptions(subsubtitleParentSelect, "Subsubtitle")

        expect(subsubtitleParentSelect).toHaveValue("Subsubtitle")
        expect(getByText(/wykryto cykliczne referencje/i)).toBeInTheDocument()
        expect(importCollectionButton).toBeDisabled()
    })

    it.each([
        {axiosError: {response: {data: {error: "Incorrect request body provided"}}}},
        {axiosError: {response: {data: {error: "Invalid data in the spreadsheet file", cause: "Error: Header has duplicate values"}}}},
        {axiosError: {response: {data: {error: "Invalid data in the spreadsheet file", cause: "Error: Row contains more columns than the header"}}}},
        {axiosError: {response: {data: {error: "Invalid data in the spreadsheet file", cause: "Error: Header has empty fields"}}}},
        {axiosError: {response: {data: {error: "Invalid data in the spreadsheet file", cause: "Error: No subcategory name after the dot symbol in header field: Title"}}}},
        {axiosError: {response: {data: {error: "Invalid data in the spreadsheet file", cause: "Error: Missing parent category: Title"}}}},
        {axiosError: {response: {data: {error: "Invalid categories data", cause: `Brakujące kategorie nadrzędne: Title`}}}},
        {axiosError: {response: {data: {error: "Database unavailable"}}}},
        
        
    ])(`should show appropriate error message when importData rejects with error cause - $axiosError.response.data.cause`,
        async ({axiosError}) => {
            mockImportDataAsCollection.mockImplementation(() => {
                throw axiosError;
            });
            const {getByLabelText, getByText} = renderComponent()
            const uploadField = getByLabelText("upload")
            const file = createXlsxFile(fileData, "example.xlsx")
            const nameInputField = getByLabelText("name")
            const descriptionInputField = getByLabelText("description")

            await user.upload(uploadField, file)
            await waitFor(() =>
                expect(getByText("example.xlsx")).toBeInTheDocument()
            );
            await user.type(nameInputField, exampleCollectionData.name)
            await user.type(descriptionInputField, exampleCollectionData.description)
            await user.click(getByLabelText("import-data"))
            
            expect(getByLabelText("server-error")).toMatchSnapshot()	
        }
    )
})