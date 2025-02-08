// TODO CreateCollectionPage.test
//
// import { render, screen, fireEvent} from "@testing-library/react";
// import CreateCollectionModal from "../collections/CreateCollectionModal";
// import { useUser } from "../../providers/UserProvider";
// import { createCollection } from "../../api/collections";
// import userEvent from "@testing-library/user-event";
//
// jest.mock("../../providers/UserProvider", () => ({
//     useUser: jest.fn(),
// }));
//
// jest.mock("../../api/collections", () => ({
//     createCollection: jest.fn(),
// }));
//
// describe("CreateCollectionModal", () => {
//     const mockOnClose = jest.fn();
//     const mockStateChanger = jest.fn();
//
//     beforeEach(() => {
//         (useUser as jest.Mock).mockReturnValue({ jwtToken: "mock-jwt-token" });
//         jest.clearAllMocks();
//     });
//
//     test("renders the modal correctly", () => {
//         render(<CreateCollectionModal stateChanger={mockStateChanger} onClose={mockOnClose} />);
//
//         expect(screen.getByText("Dodaj nową kolekcję")).toBeInTheDocument();
//         expect(screen.getByLabelText("Nazwa")).toBeInTheDocument();
//         expect(screen.getByLabelText("Opis")).toBeInTheDocument();
//         expect(screen.getByText("Anuluj")).toBeInTheDocument();
//         expect(screen.getByText("Utwórz")).toBeInTheDocument();
//     });
//
//     test("closes the modal when Anuluj is clicked", () => {
//         render(<CreateCollectionModal stateChanger={mockStateChanger} onClose={mockOnClose} />);
//
//         const cancelButton = screen.getByText("Anuluj");
//         fireEvent.click(cancelButton);
//
//         expect(mockOnClose).toHaveBeenCalledTimes(1);
//     });
//
//     test("shows an error message when createCollection fails", async () => {
//         (createCollection as jest.Mock).mockRejectedValue(new Error("Collection already exists"));
//
//         render(<CreateCollectionModal stateChanger={mockStateChanger} onClose={mockOnClose} />);
//
//         const nameInput = screen.getByLabelText("Nazwa");
//         const descriptionInput = screen.getByLabelText("Opis");
//         const submitButton = screen.getByText("Utwórz");
//
//         userEvent.type(nameInput, "Existing Collection");
//         userEvent.type(descriptionInput, "Some description");
//         fireEvent.click(submitButton);
//
//         // Weryfikacja, że komunikat błędu jest obecny
//         const errorMessage = await screen.findByText("Kolekcja o podanej nazwie już istnieje.");
//         expect(errorMessage).toBeInTheDocument();
//     });
//
//     test("disables the submit button while submitting", async () => {
//         (createCollection as jest.Mock).mockResolvedValue({});
//
//         render(<CreateCollectionModal stateChanger={mockStateChanger} onClose={mockOnClose} />);
//
//         const nameInput = screen.getByLabelText("Nazwa");
//         const descriptionInput = screen.getByLabelText("Opis");
//         const submitButton = screen.getByText("Utwórz");
//
//         userEvent.type(nameInput, "New Collection");
//         userEvent.type(descriptionInput, "Description for new collection");
//         fireEvent.click(submitButton);
//
//         expect(submitButton).not.toBeDisabled();
//     });
//
//     test("calls stateChanger and onClose when collection is created successfully", async () => {
//         (createCollection as jest.Mock).mockResolvedValue({}); // Symulacja sukcesu
//
//         render(<CreateCollectionModal stateChanger={mockStateChanger} onClose={mockOnClose} />);
//
//         const nameInput = screen.getByLabelText("Nazwa");
//         const descriptionInput = screen.getByLabelText("Opis");
//         const submitButton = screen.getByText("Utwórz");
//
//         // Wprowadzanie danych
//         await userEvent.type(nameInput, "New Collection");
//         await userEvent.type(descriptionInput, "Description for new collection");
//
//         // Kliknięcie przycisku
//         await fireEvent.click(submitButton);
//
//         // Oczekujemy, że createCollection zostanie wywołane z odpowiednimi argumentami
//         expect(createCollection).toHaveBeenCalledWith(
//             "New Collection",
//             "Description for new collection",
//             "mock-jwt-token"
//         );
//
//         // Sprawdzenie, czy stateChanger zostało wywołane
//         expect(mockStateChanger).toHaveBeenCalledWith("New Collection");
//
//         // Sprawdzenie, czy onClose zostało wywołane
//         expect(mockOnClose).toHaveBeenCalled();
//     });
//
// });
