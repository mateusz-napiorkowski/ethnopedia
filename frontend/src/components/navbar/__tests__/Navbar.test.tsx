import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import Navbar from "../Navbar"
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { UserContext } from '../../../providers/UserProvider';

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockUseNavigate,
}));

const mockDeleteAccount = jest.fn()
jest.mock('../../../api/auth', () => ({
    deleteAccount: (userId: string, jwtToken: string) => mockDeleteAccount(userId, jwtToken)
}))

const queryClient = new QueryClient();
const user = userEvent.setup()

const mockSetUserData = jest.fn()
const renderPage = (
    queryClient: QueryClient, 
    userContextProps: any = {
        isUserLoggedIn: false,
        firstName: "",
        userId: "",
        jwtToken: undefined,
        setUserData: mockSetUserData
    },
    path: string = "/"
    ) => {
        return render(
            <UserContext.Provider value={ userContextProps }>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={[path]}>
                        <Routes>
                            <Route path={path} element={<Navbar />}/>
                        </Routes>  
                    </MemoryRouter>
                </QueryClientProvider>    
            </UserContext.Provider>
        );
};

const userId = "66b6506fbb64df165e8a9ce6"
const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"
const firstName = "example username"

const loggedInUserContextProps = {
    isUserLoggedIn: true,
    firstName: firstName,
    userId: userId,
    jwtToken: jwtToken,
    setUserData: mockSetUserData
};

const deleteAccountResponseData = {
    "_id": userId,
    "username": firstName,
    "password": "$2b$10$Py1CrQUrxEz/sOou9b6HVOtCVH.NsFQIALY.zk73P.ri8IQU9Cjiu",
    "firstName": firstName,
    "accountCreationDate": "2024-11-25T18:57:33.729Z",
    "__v": 0
}

describe("Navbar tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
    });

    it("should render login and register buttons when user is not logged in", () => {           
        const { getByRole } = renderPage(queryClient)
        const loginButton = getByRole("button", {
            name: /zaloguj się/i
        })
        const registerButton = getByRole("button", {
            name: /zarejestruj się/i
        })

        expect(loginButton).toBeInTheDocument()
        expect(registerButton).toBeInTheDocument()
    })

    it("should not render login and register buttons when user is logged in, username should be displayed", () => {           
        const { queryByRole, queryByText } = renderPage(queryClient, loggedInUserContextProps)
        const loginButton = queryByRole("button", {
            name: /zaloguj się/i
        })
        const registerButton = queryByRole("button", {
            name: /zarejestruj się/i
        })
        const usernameElement = queryByText(firstName)

        expect(loginButton).not.toBeInTheDocument()
        expect(registerButton).not.toBeInTheDocument()
        expect(usernameElement).toBeInTheDocument()
    })

    it("should call useNavigate('/login') after login button is clicked", async () => {           
        const { getByRole } = renderPage(queryClient)
        const loginButton = getByRole("button", {
            name: /zaloguj się/i
        })

        await user.click(loginButton)

        expect(mockUseNavigate).toHaveBeenCalledWith("/login")
    })

    it("should call useNavigate('/register') after login button is clicked", async () => {           
        const { getByRole } = renderPage(queryClient)
        const registerButton = getByRole("button", {
            name: /zarejestruj się/i
        })

        await user.click(registerButton)

        expect(mockUseNavigate).toHaveBeenCalledWith("/register")
    })

    it("should show dropdown menu after user icon button is clicked", async () => {           
        const { getByTestId, getByLabelText } = renderPage(queryClient, loggedInUserContextProps)
        const userIconButton = getByLabelText("show-dropdown")

        await user.click(userIconButton)
        
        expect(getByTestId("dropdownMenu")).toBeInTheDocument()
    })

    it("should hide dropdown menu after user icon button is clicked", async () => {           
        const { getByLabelText, queryByTestId } = renderPage(queryClient, loggedInUserContextProps)
        const userIconButton = getByLabelText("show-dropdown")

        await user.click(userIconButton)
        await user.click(userIconButton)
        
        expect(queryByTestId("dropdownMenu")).not.toBeInTheDocument()
    })

    it.each([
        {path: "/" ,
            navigateCalled: false,
            testnameAppendage: ""},
        {path: "/collections/example-collection/create-artwork",
            navigateCalled: true,
            testnameAppendage: ", useNavigate(-1) should be called"},
        {path: "/collections/example-collection/artworks/674386b32a2908778c0ad471/edit-artwork",
            navigateCalled: true,
            testnameAppendage: ", useNavigate(-1) should be called"},
      ])(`should logout user after logout button is clicked when on page with path: $path$testnameAppendage`, async ({path, navigateCalled}) => {
        const { getByLabelText, getByText, getByRole } = renderPage(queryClient, loggedInUserContextProps, path)
        const userIconButton = getByLabelText("show-dropdown")
        await user.click(userIconButton)
        const logoutButton = getByText("Wyloguj się")

        await user.click(logoutButton)

        expect(mockSetUserData).toHaveBeenCalledWith(false, "", "", "")

        if(navigateCalled)
            expect(mockUseNavigate).toHaveBeenCalledWith(-1)
        else
            expect(mockUseNavigate).not.toHaveBeenCalled()
    })

    it("should show delete account warning popup after delete user button from dropdown menu is clicked", async () => {           
        const { getByLabelText, getByText } = renderPage(queryClient, loggedInUserContextProps)
        const userIconButton = getByLabelText("show-dropdown")
        await user.click(userIconButton)
        const deleteAccountButton = getByText("Usuń konto")

        await user.click(deleteAccountButton)

        expect(getByText(/czy na pewno chcesz usunąć konto?/i)).toBeInTheDocument()
    })

    it("should delete account after delete user confirm button in warning popup menu is clicked", async () => {
        mockDeleteAccount.mockReturnValue(deleteAccountResponseData)          
        const { getByText, getByLabelText } = renderPage(queryClient, loggedInUserContextProps)
        const userIconButton = getByLabelText("show-dropdown")
        await user.click(userIconButton)
        const deleteAccountButton = getByText("Usuń konto")

        await user.click(deleteAccountButton)
 
        await user.click(getByLabelText("confirm"))

        await waitFor(() => expect(mockDeleteAccount).toHaveBeenCalledWith(userId, jwtToken))
    })

    it("should hide warning popup menu when exit button is clicked", async () => {
        mockDeleteAccount.mockReturnValue(deleteAccountResponseData)          
        const { queryByText, getByText, getByLabelText } = renderPage(queryClient, loggedInUserContextProps)
        const userIconButton = getByLabelText("show-dropdown")
        await user.click(userIconButton)
        const deleteAccountButton = getByText("Usuń konto")

        await user.click(deleteAccountButton)
 
        await user.click(getByLabelText("exit"))

        expect(queryByText(/czy na pewno chcesz usunąć konto?/i)).not.toBeInTheDocument()
    })

    it("should hide warning popup menu when cancel button is clicked", async () => {
        mockDeleteAccount.mockReturnValue(deleteAccountResponseData)          
        const { queryByText, getByText, getByLabelText } = renderPage(queryClient, loggedInUserContextProps)
        const userIconButton = getByLabelText("show-dropdown")
        await user.click(userIconButton)
        const deleteAccountButton = getByText("Usuń konto")

        await user.click(deleteAccountButton)
 
        await user.click(getByText(/anuluj/i))

        expect(queryByText(/czy na pewno chcesz usunąć konto?/i)).not.toBeInTheDocument()
    })
})