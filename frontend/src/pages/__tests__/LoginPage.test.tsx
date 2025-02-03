import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { useLoginMutation } from "../../api/auth";
import LoginPage from "../../pages/LoginPage";

// Mockowanie useLoginMutation
jest.mock("../../api/auth", () => ({
    useLoginMutation: jest.fn(),
}));

const mockLoginMutation = jest.fn();

beforeEach(() => {
    (useLoginMutation as jest.Mock).mockReturnValue({
        mutate: mockLoginMutation,
    });
});

const renderWithProviders = (component: React.ReactNode) => {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>{component}</BrowserRouter>
        </QueryClientProvider>
    );
};

describe("LoginPage", () => {
    test("renders the login form correctly", () => {
        renderWithProviders(<LoginPage />);
        expect(screen.getByLabelText(/Nazwa użytkownika/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Hasło/i)).toBeInTheDocument();
        expect(screen.getByTestId("login-button")).toBeInTheDocument();
        expect(screen.getByText(/Zaloguj się/i, { selector: "h1" })).toBeInTheDocument();
    });


    test("shows validation errors when inputs are empty", async () => {
        renderWithProviders(<LoginPage />);
        const loginButton = screen.getByTestId("login-button");
        fireEvent.click(loginButton);

        expect(await screen.findByText(/Nazwa użytkownika jest wymagana/i)).toBeInTheDocument();
        expect(await screen.findByText(/Hasło jest wymagane/i)).toBeInTheDocument();
    });

    test("calls login mutation on valid form submission", async () => {
        renderWithProviders(<LoginPage />);
        const usernameInput = screen.getByLabelText(/Nazwa użytkownika/i);
        const passwordInput = screen.getByLabelText(/Hasło/i);
        const loginButton = screen.getByTestId("login-button");

        fireEvent.change(usernameInput, { target: { value: "testuser" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(loginButton);

        await waitFor(() =>
            expect(mockLoginMutation).toHaveBeenCalledWith(
                { username: "testuser", password: "password123" },
                expect.any(Object)
            )
        );
    });

    test("shows error toast on login failure", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {}); // Wyciszenie console.error

        mockLoginMutation.mockImplementation((_, { onError }) => {
            onError(new Error("Invalid username or password"));
        });

        renderWithProviders(<LoginPage />);
        const usernameInput = screen.getByLabelText(/Nazwa użytkownika/i);
        const passwordInput = screen.getByLabelText(/Hasło/i);
        const loginButton = screen.getByTestId("login-button");

        fireEvent.change(usernameInput, { target: { value: "testuser" } });
        fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
        fireEvent.click(loginButton);

        expect(await screen.findByText(/Nieprawidłowa nazwa użytkownika lub hasło./i)).toBeInTheDocument();

        consoleErrorSpy.mockRestore(); // Przywrócenie oryginalnego console.error
    });

});
