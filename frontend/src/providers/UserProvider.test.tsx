import { render, screen } from "@testing-library/react";
import { UserProvider, useUser } from "./UserProvider";

// Mockowanie jwtDecode
jest.mock("jwt-decode", () => ({
    jwtDecode: jest.fn(),
}));

// Mockowanie localStorage
beforeEach(() => {
    localStorage.clear();
});

const TestComponent = () => {
    const { firstName, userId } = useUser();
    return (
        <>
            <div>{firstName}</div>
            <div>{userId}</div>
        </>
    );
};

describe("UserProvider", () => {
    // test("initializes state based on the localStorage token", async () => {
    //     const mockToken = {
    //         exp: Math.floor(Date.now() / 1000) + 1000, // Token ważny przez jakiś czas
    //         username: "testuser",
    //         firstName: "Test",
    //         userId: "12345",
    //     };
    //
    //     localStorage.setItem("token", JSON.stringify(mockToken));
    //
    //     render(
    //         <UserProvider>
    //             <TestComponent />
    //         </UserProvider>
    //     );
    //
    //     // Używamy findByText, które jest asynchroniczne
    //     const firstNameElement = await screen.findByText("Test");
    //     expect(firstNameElement).toBeInTheDocument();
    //
    //     const userIdElement = await screen.findByText("12345");
    //     expect(userIdElement).toBeInTheDocument();
    // });

    test("removes user data if the token is expired", async () => {
        const expiredToken = {
            exp: Math.floor(Date.now() / 1000) - 1000, // Token już wygasł
            username: "testuser",
            firstName: "Test",
            userId: "12345",
        };

        localStorage.setItem("token", JSON.stringify(expiredToken));

        render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        // Używamy findByText do asercji, a potem sprawdzamy, że nie ma danych
        const firstNameElement = screen.queryByText("Test");
        expect(firstNameElement).not.toBeInTheDocument();

        const userIdElement = screen.queryByText("12345");
        expect(userIdElement).not.toBeInTheDocument();
    });

    test("removes user data if the token is invalid", async () => {
        localStorage.setItem("token", "invalid-token");

        render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        // Używamy findByText, aby sprawdzić, że dane nie są obecne
        const firstNameElement = screen.queryByText("Test");
        expect(firstNameElement).not.toBeInTheDocument();

        const userIdElement = screen.queryByText("12345");
        expect(userIdElement).not.toBeInTheDocument();
    });

    test("does not set user data if no token is in localStorage", async () => {
        localStorage.removeItem("token");

        render(
            <UserProvider>
                <TestComponent />
            </UserProvider>
        );

        // Sprawdzamy, że dane użytkownika nie są ustawione
        const firstNameElement = screen.queryByText("Test");
        expect(firstNameElement).not.toBeInTheDocument();

        const userIdElement = screen.queryByText("12345");
        expect(userIdElement).not.toBeInTheDocument();
    });

    // test("cleans up user data if token is removed from localStorage", async () => {
    //     const mockToken = {
    //         exp: Math.floor(Date.now() / 1000) + 1000, // Token ważny
    //         username: "testuser",
    //         firstName: "Test",
    //         userId: "12345",
    //     };
    //
    //     localStorage.setItem("token", JSON.stringify(mockToken));
    //
    //     render(
    //         <UserProvider>
    //             <TestComponent />
    //         </UserProvider>
    //     );
    //
    //     // Używamy findByText do sprawdzenia, że dane zostały załadowane
    //     const firstNameElement = await screen.findByText("Test");
    //     expect(firstNameElement).toBeInTheDocument();
    //
    //     const userIdElement = await screen.findByText("12345");
    //     expect(userIdElement).toBeInTheDocument();
    //
    //     // Usuwamy token
    //     localStorage.removeItem("token");
    //
    //     // Sprawdzamy, że dane zostały usunięte
    //     const firstNameElementAfterRemoval = screen.queryByText("Test");
    //     expect(firstNameElementAfterRemoval).not.toBeInTheDocument();
    //
    //     const userIdElementAfterRemoval = screen.queryByText("12345");
    //     expect(userIdElementAfterRemoval).not.toBeInTheDocument();
    // });
    //
    // test("updates user data with setUserData", async () => {
    //     render(
    //         <UserProvider>
    //             <TestComponent />
    //         </UserProvider>
    //     );
    //
    //     // Używamy useUser w komponencie
    //     const { setUserData } = useUser();
    //     setUserData(true, "New Name", "newToken", "67890");
    //
    //     // Używamy findByText do sprawdzenia, że dane zostały zaktualizowane
    //     const firstNameElement = await screen.findByText("New Name");
    //     expect(firstNameElement).toBeInTheDocument();
    //
    //     const userIdElement = await screen.findByText("67890");
    //     expect(userIdElement).toBeInTheDocument();
    // });
});
