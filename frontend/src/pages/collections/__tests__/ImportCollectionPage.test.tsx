import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
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
    ) => mockImportDataAsCollection(importData, collectionName, description, jwtToken)
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
        const {container} = renderComponent()
        expect(container).toMatchSnapshot()
    })

    it("should navigate to previous page after cancel button is clicked", async () => {           
        const {getByText} = renderComponent()
        const cancelButton = getByText(/anuluj/i)

        await user.click(cancelButton)

        expect(mockUseNavigate).toHaveBeenCalledWith(-1)
    })

    it("should update upload component and show loaded categories configuration menu with correct initial category structure after file is loaded", async () => {           
        const {getByRole, getByText, getByLabelText, container} = renderComponent()
        const uploadField = getByLabelText("upload")
        const file = createXlsxFile(fileData, "example.xlsx")      

        await user.upload(uploadField, file)

        const importCollectionButton = getByRole("button", {name: /importuj kolekcję/i})

        await user.click(importCollectionButton)
        expect(container).toMatchSnapshot()
    })

    it("should have import collection button disabled if file was not loaded", async () => {           
        const {getByRole, getByLabelText, queryByText} = renderComponent()
        const importCollectionButton = getByRole("button", {name: /importuj kolekcję/i})
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
        const importCollectionButton = getByRole("button", {name: /importuj kolekcję/i})
        
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
        const importCollectionButton = getByRole("button", {name: /importuj kolekcję/i})

        await user.upload(uploadField, file)
        await user.type(nameInputField, exampleCollectionData.name)
        await user.click(importCollectionButton)

        expect(getByText(/opis kolekcji jest wymagany/i)).toBeInTheDocument()
        expect(queryByText(/nie wczytano pliku/i)).not.toBeInTheDocument()
        expect(queryByText(/nazwa kolekcji jest wymagana/i)).not.toBeInTheDocument()
    })

    it("should call importDataAsCollection with correct arguments when import collection button is clicked", async () => {           
        const {getByRole, getByText, queryByText, getByLabelText} = renderComponent()
        const file = createXlsxFile(fileData, "example.xlsx")      
        const uploadField = getByLabelText("upload")
        const nameInputField = getByLabelText("name")
        const descriptionInputField = getByLabelText("description")
        const importCollectionButton = getByRole("button", {name: /importuj kolekcję/i})

        await user.upload(uploadField, file)
        await user.type(nameInputField, exampleCollectionData.name)
        await user.type(descriptionInputField, exampleCollectionData.description)
        await user.click(importCollectionButton)

        expect(mockImportDataAsCollection).toHaveBeenCalledWith(
            fileData,
            exampleCollectionData.name,
            exampleCollectionData.description,
            jwtToken
        )
    })

    it("should change select option when another option is selected by user and call importDataAsCollection with correct arguments when import collection button is clicked", async () => {           
        const {getByRole, getByText, queryByText, getByLabelText} = renderComponent()
        const file = createXlsxFile(fileData, "example.xlsx")      
        const uploadField = getByLabelText("upload")
        const importCollectionButton = getByRole("button", {name: /importuj kolekcję/i})
        const fileDataModified = JSON.parse(JSON.stringify(fileData))
        fileDataModified[0][3] = "Title.Subtitle.Subsubtitle.Artists"

        await user.upload(uploadField, file)

        const artistsParentSelect = getByLabelText("Artists-parent-select")
        expect(artistsParentSelect).toHaveValue("-")
        await user.selectOptions(artistsParentSelect, "Subsubtitle")
        expect(artistsParentSelect).toHaveValue("Subsubtitle")
        await user.click(importCollectionButton)
        
        expect(mockImportDataAsCollection).toHaveBeenCalledWith(fileDataModified, "", "", jwtToken)
    })

    it("should show circular references error when options selected by users create it", async () => {           
        const {getByRole, getByText, queryByText, getByLabelText} = renderComponent()
        const file = createXlsxFile(fileData, "example.xlsx")      
        const uploadField = getByLabelText("upload")
        const importCollectionButton = getByRole("button", {name: /importuj kolekcję/i})
        const fileDataModified = JSON.parse(JSON.stringify(fileData))
        fileDataModified[0][3] = "Title.Subtitle.Subsubtitle.Artists"

        await user.upload(uploadField, file)

        const subsubtitleParentSelect = getByLabelText("Title-parent-select")

        await user.selectOptions(subsubtitleParentSelect, "Subsubtitle")

        expect(subsubtitleParentSelect).toHaveValue("Subsubtitle")
        expect(getByText(/wykryto cykliczne referencje/i)).toBeInTheDocument()
        expect(importCollectionButton).toBeDisabled()
    })

})