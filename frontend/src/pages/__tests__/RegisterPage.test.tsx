import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
import RegisterPage from "../RegisterPage"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from 'react-query';

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom') as any,
    useNavigate: () => mockUseNavigate,
}));

const queryClient = new QueryClient();
const user = userEvent.setup()

const renderComponent = () => {
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[`/`]}>
                <Routes>
                    <Route path="/" element={<RegisterPage/>}/>
                </Routes>  
            </MemoryRouter>
        </QueryClientProvider>       
    );
};

describe("RegisterPage tests", () => {
    beforeEach(() => {
        queryClient.clear();
        jest.clearAllMocks()
    });

    it("should render register page", () => {           
        const {container} = renderComponent()
        
        expect(container).toMatchSnapshot()
    })

    it("should call useNavigate with path to login page when log in button is clicked", async () => {           
        const {getByText} = renderComponent()
        const goToLoginPageButton = getByText(/zaloguj się/i)

        await user.click(goToLoginPageButton)

        expect(mockUseNavigate).toHaveBeenCalledWith("/login")
    })

    it.each([
        {
            testName: "should show correct error message when first name was not typed in",
            fieldLabels: ["Nazwa użytkownika", "Hasło", "Powtórz hasło"],
            valuesToTypeIn: ["example username", "examplePassword", "examplePassword"],
            errorMessages: ["Imię jest wymagane", "Nazwa użytkownika jest wymagana", "Hasło jest wymagane",
                "Hasła muszą być takie same", "Powtórz swoje hasło"],
            showErrorMessages: [true, false, false, false, false]
        },
        {
            testName: "should show correct error message when username was not typed in",
            fieldLabels: ["Imię", "Hasło", "Powtórz hasło"],
            valuesToTypeIn: ["example firstName", "examplePassword", "examplePassword"],
            errorMessages: ["Imię jest wymagane", "Nazwa użytkownika jest wymagana", "Hasło jest wymagane",
                "Hasła muszą być takie same", "Powtórz swoje hasło"],
            showErrorMessages: [false, true, false, false, false]
        },
        {
            testName: "should show correct error messages when password was not typed in",
            fieldLabels: ["Imię", "Nazwa użytkownika", "Powtórz hasło"],
            valuesToTypeIn: ["example firstName", "example username", "examplePassword"],
            errorMessages: ["Imię jest wymagane", "Nazwa użytkownika jest wymagana", "Hasło jest wymagane",
                "Hasła muszą być takie same", "Powtórz swoje hasło"],
            showErrorMessages: [false, false, true, true, false]
        },
        {
            testName: "should show correct error messages when repeated password was not typed in",
            fieldLabels: ["Imię", "Nazwa użytkownika", "Hasło"],
            valuesToTypeIn: ["example firstName", "example username", "examplePassword"],
            errorMessages: ["Imię jest wymagane", "Nazwa użytkownika jest wymagana", "Hasło jest wymagane",
                "Hasła muszą być takie same", "Powtórz swoje hasło"],
            showErrorMessages: [false, false, false, false, true]
        },
        {
            testName: "should show correct error message when password and repeated password don't match",
            fieldLabels: ["Imię", "Nazwa użytkownika", "Hasło", "Powtórz hasło"],
            valuesToTypeIn: ["example firstName", "example username", "examplePassword", "otherPassword"],
            errorMessages: ["Imię jest wymagane", "Nazwa użytkownika jest wymagana", "Hasło jest wymagane",
                "Hasła muszą być takie same", "Powtórz swoje hasło"],
            showErrorMessages: [false, false, false, true, false]
        },
        {
            testName: "should show correct error messages when no input fields were filled in",
            fieldLabels: [],
            valuesToTypeIn: [],
            errorMessages: ["Imię jest wymagane", "Nazwa użytkownika jest wymagana", "Hasło jest wymagane",
                "Hasła muszą być takie same", "Powtórz swoje hasło"],
            showErrorMessages: [true, true, true, false, true]
        },
      ])('$testName', async ({fieldLabels, valuesToTypeIn, errorMessages, showErrorMessages}) => {
        const {getByLabelText, getByRole, queryByText } = renderComponent()

        for (const [fieldIndex, fieldLabel] of fieldLabels.entries()) {
            const fieldElement = getByLabelText(fieldLabel);
            await user.type(fieldElement, valuesToTypeIn[fieldIndex]);
        }

        const registerButton = getByRole("button", {name: /zarejestruj się/i})
        await user.click(registerButton)

        errorMessages.forEach(async (message, index) => {
            if(showErrorMessages[index]) {
                expect(queryByText(message)).toBeInTheDocument()
            } else {
                expect(queryByText(message)).not.toBeInTheDocument()
            }
        });
    })
})