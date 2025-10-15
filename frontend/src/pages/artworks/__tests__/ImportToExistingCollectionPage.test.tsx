import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
import ImportToExistingCollectionPage from "../ImportToExistingCollectionPage"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";
// import { Collection } from "../../@types/Collection"
// import { UserContext } from '../../providers/UserProvider';

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

const exampleCollectionData = {
    _id: '662e928b11674920c8cc0aaa',
    name: 'example collection',
    description: 'example collection description'
}
const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"

const exampleCollectionId = "67f84d80d2ac8e9a1e67cca4"
const renderComponent = (collectionId = exampleCollectionId) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[`/collections/${collectionId}/import-data/`]}>
                <Routes>
                    <Route path="/collections/:collection/import-data" element={<ImportToExistingCollectionPage />}/>
                </Routes>  
            </MemoryRouter>
        </QueryClientProvider>
        
    );
};

describe("ImportToExistingCollectionPage tests", () => {
    beforeEach(() => {
        queryClient.clear();
        jest.clearAllMocks()
    });

    it("should render initial state", () => {           
        const {container} = renderComponent()

        expect(container).toMatchSnapshot()
    })

    // it("should render menu for importing data to existing collection, import metadata button should be disabled", () => {           
    //     const {getByText} = renderComponent("/collections/example collection/artworks", exampleCollectionData)
    //     const importMetadataButton = getByText(/importuj metadane/i)

    //     expect(getByText(/kliknij, aby przesłać/i)).toBeInTheDocument()
    //     expect(importMetadataButton).toBeDisabled()
    // })

    // it("should call onClose when exit button is clicked", async () => {           
    //     const { getByLabelText } = renderComponent("/collections/example collection/artworks", exampleCollectionData)
    //     const exitButton = getByLabelText("exit")

    //     await user.click(exitButton)

    //     expect(mockOnClose).toHaveBeenCalled()
    // })

    // it("should upload file, file name should be shown and next button should be enabled", async () => {           
    //     const {getByText, getByLabelText} = renderComponent()
    //     const nextButton = getByText(/dalej/i)
    //     const file = new File(['example'], 'example.xlsx', {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
    //     const input = getByLabelText("upload")

    //     await user.upload(input, file)

    //     expect(getByText("example.xlsx")).toBeInTheDocument()
    //     expect(nextButton).toBeEnabled()
    // })

    // it("should go to collection details menu", async () => {           
    //     const {getByText, getByLabelText} = renderComponent()
    //     const nextButton = getByText("Dalej")
        
    //     const file = new File(['example'], 'example.xlsx', {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
    //     const input = getByLabelText("upload")

    //     await user.upload(input, file)
    //     await user.click(nextButton)

    //     expect(getByText(/nazwa kolekcji/i)).toBeInTheDocument()
    //     expect(getByText(/opis kolekcji/i)).toBeInTheDocument()        
    // })

    // it.each([
    //     {
    //         case: "disabled when nothing was typed in",
    //         actions: [],
    //         enabled: false
    //     },
    //     {
    //         case: "disabled when only collection name is typed in",
    //         actions: [
    //             {
    //                 textAreaLabelText: "name",
    //                 textToTypeIn: "example collection name"
    //             }
    //         ],
    //         enabled: false
    //     },
    //     {
    //         case: "disabled when only collection description is typed in",
    //         actions: [
    //             {
    //                 textAreaLabelText: "description",
    //                 textToTypeIn: "example description name"
    //             }
    //         ],
    //         enabled: false
    //     },
    //     {
    //         case: "enabled when both collection name and description are typed in",
    //         actions: [
    //             {
    //                 textAreaLabelText: "name",
    //                 textToTypeIn: "example collection name"
    //             },
    //             {
    //                 textAreaLabelText: "description",
    //                 textToTypeIn: "example description name"
    //             }
    //         ],
    //         enabled: true
    //     },
    // ])('should have import metadata button $case in collection details menu', async ({actions, enabled}) => {
    //     const {getByText, getByLabelText} = renderComponent()
    //     const nextButton = getByText(/dalej/i)
    //     const file = new File(['example'], 'example.xlsx', {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
    //     const input = getByLabelText("upload")
    //     await user.upload(input, file)
    //     await user.click(nextButton)
    //     const importMetadataButton = getByText(/importuj metadane/i)

    //     for(const {textAreaLabelText, textToTypeIn} of actions) {
    //         const textArea = getByLabelText(textAreaLabelText)
    //         if(textToTypeIn) {
    //             await user.type(textArea, textToTypeIn)
    //         } else {
    //             await user.clear(textArea)
    //         }
    //     }
        
    //     if(enabled) {
    //         expect(importMetadataButton).toBeEnabled()
    //     } else {
    //         expect(importMetadataButton).toBeDisabled()
    //     }
    // })

    // it("should go to back to file upload menu when back button is clicked, switching between upload/collection menus should not reset their state", async () => {           
    //     const {getByText, getByLabelText, queryByText} = renderComponent()
    //     const nextButton = getByText(/dalej/i)
    //     const file = new File(['example'], 'example.xlsx', {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
    //     const input = getByLabelText("upload")

    //     await user.upload(input, file)
    //     await user.click(nextButton)
    //     const backButton = getByText(/wstecz/i)
    //     const importMetadataButton = getByText(/importuj metadane/i)
    //     const nameTextArea = getByLabelText("name")
    //     const descriptionTextArea = getByLabelText("description")

    //     await user.type(nameTextArea, "example collection")
    //     await user.type(descriptionTextArea, "example collection description")

    //     await user.click(backButton)
    //     expect(queryByText("example.xlsx")).toBeInTheDocument()
    //     expect(queryByText("example collection")).not.toBeInTheDocument()
    //     expect(queryByText("example collection description")).not.toBeInTheDocument()

    //     await user.click(getByText("Dalej"))
    //     expect(queryByText("example.xlsx")).not.toBeInTheDocument()
    //     expect(queryByText("example collection")).toBeInTheDocument()
    //     expect(queryByText("example collection description")).toBeInTheDocument()

    //     expect(importMetadataButton).toBeEnabled()
    // })

    // it("should call mockImportData with correct args after file is uploaded and then import metadata button is clicked", async () => {
    //     const fileBits = ['example']
    //     const {getByText, getByLabelText, queryByText} = renderComponent("/collections/example collection/artworks", exampleCollectionData)
    //     const file = new File(fileBits, 'example.xlsx', {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
    //     const input = getByLabelText("upload")
    //     const importMetadataButton = getByText(/importuj metadane/i)

    //     await user.upload(input, file)
    //     await user.click(importMetadataButton)

    //     expect(mockImportData).toHaveBeenCalledWith([fileBits], jwtToken, exampleCollectionData._id)
    // })

    // it("should call mockImportDataAsCollection with correct parameters after file, name, and description are provided by user and import metadata button is clicked", async () => {
    //     const {getByText, getByLabelText, queryByText, container} = renderComponent()
    //     const nextButton = getByText(/dalej/i)
    //     const fileBits = ['example']
    //     const file = new File(fileBits, 'example.xlsx', {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
    //     const input = getByLabelText("upload")

    //     await user.upload(input, file)
    //     await user.click(nextButton)

    //     const importMetadataButton = getByText(/importuj metadane/i)
    //     const nameTextArea = getByLabelText("name")
    //     const descriptionTextArea = getByLabelText("description")

    //     await user.type(nameTextArea, "example collection")
    //     await user.type(descriptionTextArea, "example collection description")
    //     await user.click(importMetadataButton)

    //     expect(mockImportDataAsCollection).toHaveBeenCalledWith([fileBits], "example collection", "example collection description", jwtToken)
    // })
})