import { render, waitForElementToBeRemoved } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import LoginPage from "../../pages/LoginPage";
import userEvent from "@testing-library/user-event";
import { LoginValues } from "src/@types/Auth";

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom') as any,
    useNavigate: () => mockUseNavigate,
}));

const mockLoginUser = jest.fn()
jest.mock("../../api/auth", () => ({
    loginUser: ({username, password}: LoginValues) => mockLoginUser({username, password}),
}));

const queryClient = new QueryClient();
const user = userEvent.setup()

const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"

const renderPage = () => {    
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[`/login`]}>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                </Routes>  
            </MemoryRouter>
        </QueryClientProvider>       
    );
};

describe("LoginPage tests", () => {
    beforeEach(() => {
        queryClient.clear();
        jest.clearAllMocks()
    });

    it("should render initial state", () => {
        const {container} = renderPage();
        expect(container).toMatchSnapshot()
    });

    it("should show appropriate error when username input field is empty after login button is clicked", async () => {
        const {getByPlaceholderText, getByRole, getByText, queryByText} = renderPage();
        const passwordInputField = getByPlaceholderText(/••••••••/i)
        const loginButton = getByRole("button", {name: /zaloguj się/i})

        await user.type(passwordInputField, "password")
        await user.click(loginButton)

        expect(getByText(/nazwa użytkownika jest wymagana/i)).toBeInTheDocument()
        expect(queryByText(/hasło jest wymagane/i)).not.toBeInTheDocument()
    });

    it("should show appropriate error when password input field is empty after login button is clicked", async () => {
        const {getByPlaceholderText, getByRole, getByText, queryByText} = renderPage();
        const usernameInputField = getByPlaceholderText(/nazwa użytkownika/i)
        const loginButton = getByRole("button", {name: /zaloguj się/i})

        await user.type(usernameInputField, "username")
        await user.click(loginButton)

        expect(getByText(/hasło jest wymagane/i)).toBeInTheDocument()
        expect(queryByText(/nazwa użytkownika jest wymagana/i)).not.toBeInTheDocument()
    });

    it("should call loginUser with correct parameters when both input fields are filled in and login button is clicked", async () => {
        mockLoginUser.mockReturnValue({token: jwtToken})
        const {getByPlaceholderText, getByRole} = renderPage();
        const usernameInputField = getByPlaceholderText(/nazwa użytkownika/i)
        const passwordInputField = getByPlaceholderText(/••••••••/i)
        const loginButton = getByRole("button", {name: /zaloguj się/i})

        await user.type(usernameInputField, "username")
        await user.type(passwordInputField, "password")
        await user.click(loginButton)

        expect(mockLoginUser).toHaveBeenCalledWith({username: "username", password: "password"})
    });

    it("should show error toast when user with provided username and password doesn't exist, toast should disappear after a few seconds", async () => {
        mockLoginUser.mockImplementation(() => {throw Error("Mocked loginUser error")})          
        const { getByPlaceholderText, getByRole, getByText, queryByText } = renderPage()
        const usernameInputField = getByPlaceholderText(/nazwa użytkownika/i)
        const passwordInputField = getByPlaceholderText(/••••••••/i)
        const loginButton = getByRole("button", {name: /zaloguj się/i})

        await user.type(usernameInputField, "username")
        await user.type(passwordInputField, "password")
        await user.click(loginButton)

        expect(getByText(/nieprawidłowa nazwa użytkownika lub hasło./i)).toBeInTheDocument()
        await waitForElementToBeRemoved(() => queryByText(/nieprawidłowa nazwa użytkownika lub hasło./i), {timeout: 5000})
        expect(queryByText(/nieprawidłowa nazwa użytkownika lub hasło./i)).not.toBeInTheDocument()
    })

    it("should hide error toast when user clicks the 'X' button on it", async () => {
        mockLoginUser.mockImplementation(() => {throw Error("Mocked loginUser error")})          
        const { getByPlaceholderText, getByRole, getByLabelText, queryByText } = renderPage()
        const usernameInputField = getByPlaceholderText(/nazwa użytkownika/i)
        const passwordInputField = getByPlaceholderText(/••••••••/i)
        const loginButton = getByRole("button", {name: /zaloguj się/i})

        await user.type(usernameInputField, "username")
        await user.type(passwordInputField, "password")
        await user.click(loginButton)
        await user.click(getByLabelText("Close"))

        expect(queryByText(/nieprawidłowa nazwa użytkownika lub hasło./i)).not.toBeInTheDocument()
    })
});
