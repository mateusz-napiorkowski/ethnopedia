import '@testing-library/jest-dom';
import { render, waitForElementToBeRemoved } from '@testing-library/react'
import RegisterPage from "../RegisterPage"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from 'react-query';

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom') as any,
    useNavigate: () => mockUseNavigate,
}));

interface FormValues {
    username: string,
    firstName: string,
    password: string,
    secret: string
}

const mockRegisterUser = jest.fn()
jest.mock('../../api/auth', () => ({
    registerUser: ({ username, firstName, password, secret }: FormValues) => mockRegisterUser({ username, firstName, password, secret })
}))

const queryClient = new QueryClient();
const user = userEvent.setup()

const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"

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
        const registerButton = getByRole("button", {name: /zarejestruj/i})

        for (const [fieldIndex, fieldLabel] of fieldLabels.entries()) {
            const fieldElement = getByLabelText(fieldLabel);
            await user.type(fieldElement, valuesToTypeIn[fieldIndex]);
        }
        await user.click(registerButton)

        errorMessages.forEach(async (message, index) => {
            if(showErrorMessages[index]) {
                expect(queryByText(message)).toBeInTheDocument()
            } else {
                expect(queryByText(message)).not.toBeInTheDocument()
            }
        });
    })

    it("should show error toast when user already exists, registerUser should be called with correct arguments, toast should disappear after a few seconds", async () => {
        mockRegisterUser.mockImplementation(() => {throw Error("Mocked registerUser error")})          
        const { getByLabelText, getByRole, getByText, queryByText } = renderComponent()
        const firstNameField = getByLabelText("Imię");
        const usernameField = getByLabelText("Nazwa użytkownika");
        const passwordField = getByLabelText("Hasło");
        const confirmPasswordField = getByLabelText("Powtórz hasło");
        const secretField = getByLabelText("access_token_secret");
        const registerButton = getByRole("button", {name: /zarejestruj/i})

        await user.type(firstNameField, "Jacek");
        await user.type(usernameField, "ExistingUsername");
        await user.type(passwordField, "haslojacka");
        await user.type(confirmPasswordField, "haslojacka");
        await user.type(secretField, "123456789");
        await user.click(registerButton)

        expect(mockRegisterUser).toHaveBeenCalledWith({
            username: "ExistingUsername",
            firstName: "Jacek",
            password: "haslojacka",
            secret: "123456789"
        })
        expect(getByText("Użytkownik już istnieje.")).toBeInTheDocument()
        await waitForElementToBeRemoved(() => queryByText("Użytkownik już istnieje."), {timeout: 5000})
        expect(queryByText("Użytkownik już istnieje.")).not.toBeInTheDocument()
    })

    it("should hide error toast when user clicks the 'X' button on it", async () => {
        mockRegisterUser.mockImplementation(() => {throw Error("Mocked registerUser error")})          
        const { getByLabelText, getByRole, queryByText } = renderComponent()
        const firstNameField = getByLabelText("Imię");
        const usernameField = getByLabelText("Nazwa użytkownika");
        const passwordField = getByLabelText("Hasło");
        const confirmPasswordField = getByLabelText("Powtórz hasło");
        const registerButton = getByRole("button", {name: /zarejestruj/i})
        const secretField = getByLabelText("access_token_secret");

        await user.type(firstNameField, "Jacek");
        await user.type(usernameField, "ExistingUsername");
        await user.type(passwordField, "haslojacka");
        await user.type(confirmPasswordField, "haslojacka");
        await user.type(secretField, "123456789");
        await user.click(registerButton)
        await user.click(getByLabelText("Close"))

        expect(queryByText("Użytkownik już istnieje.")).not.toBeInTheDocument()
    })

    it("should call registerUser with correct arguments, useNavigate should be called with a path to home page", async () => {
        mockRegisterUser.mockReturnValue({data: {
            "token": jwtToken
        }})          
        const { getByLabelText, getByRole } = renderComponent()
        const firstNameField = getByLabelText("Imię");
        const usernameField = getByLabelText("Nazwa użytkownika");
        const passwordField = getByLabelText("Hasło");
        const confirmPasswordField = getByLabelText("Powtórz hasło");
        const registerButton = getByRole("button", {name: /zarejestruj/i})
        const secretField = getByLabelText("access_token_secret");

        await user.type(firstNameField, "Jacek");
        await user.type(usernameField, "jacek123");
        await user.type(passwordField, "haslojacka");
        await user.type(confirmPasswordField, "haslojacka");
        await user.type(secretField, "123456789");
        await user.click(registerButton)

        expect(mockRegisterUser).toHaveBeenCalledWith({
            username: "jacek123",
            firstName: "Jacek",
            password: "haslojacka",
            secret: "123456789"
        })
        expect(mockUseNavigate).toHaveBeenCalledWith("/")
    })
})