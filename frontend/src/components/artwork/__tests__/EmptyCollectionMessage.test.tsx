import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
import EmptyCollectionMessage from "../EmptyCollectionMessage"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate,
}));
const mockSetShowImportOptions = jest.fn()

const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"
const collectionId = "6819ce5713049d642d1e72c9"

const user = userEvent.setup()


const renderComponent = (jwtToken: string | undefined = undefined) => {
    return render(
        <MemoryRouter initialEntries={[`/collections/${collectionId}/artworks`]}>
            <Routes>
                <Route path="/collections/:collectionId/artworks" element={<EmptyCollectionMessage setShowImportOptions={mockSetShowImportOptions} jwtToken={jwtToken}/>}/>
            </Routes>  
        </MemoryRouter>
    );
};

describe("EmptyCollectionMessage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    it("should render EmptyCollectionMessage component with message for not logged in user", () => {
        const {container} = renderComponent()
        expect(container).toMatchSnapshot()
    })

    it("should call useNavigate(/login) after login button is clicked", async () => {
        const {getByText} = renderComponent()
        const loginButton = getByText(/zaloguj się/i)

        await user.click(loginButton)

        expect(mockUseNavigate).toHaveBeenCalledWith("/login")
    })

    it("should render EmptyCollectionMessage component with message for logged in user", () => {
        const {container} = renderComponent(jwtToken)
        expect(container).toMatchSnapshot()
    })

    it("should call useNavigate(/collections/:collectionId/create-artwork) after add new record button is clicked", async () => {
        const {getByText} = renderComponent(jwtToken)
        const addNewRecordButton = getByText(/dodawaj nowe rekordy/i)

        await user.click(addNewRecordButton)

        expect(mockUseNavigate).toHaveBeenCalledWith(`/collections/${collectionId}/create-artwork`)
    })

    it("should call useNavigate(/collections/:collectionId/import-data) after import button button is clicked", async () => {
        const {getByText} = renderComponent(jwtToken)
        const importRecordsButton = getByText(/zaimportuj/i)

        await user.click(importRecordsButton)

        expect(mockUseNavigate).toHaveBeenCalledWith(`/collections/${collectionId}/import-data`)
    })
})