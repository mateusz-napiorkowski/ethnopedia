import { render, renderHook, screen } from "@testing-library/react"
import { UserProvider, useUser } from "./UserProvider";
import { jwtDecode } from "jwt-decode";
import { act } from "react-dom/test-utils";
import { useEffect } from "react"

jest.mock("jwt-decode");

describe("UserProvider", () => {
    beforeEach(() => {
        const mockDecodedToken = {
            exp: Math.floor(Date.now() / 1000) + 3600, // Token ważny przez godzinę
            username: "testuser",
            firstName: "Test",
            userId: "123",
        };
        // Mockowanie localStorage.getItem
        localStorage.setItem("token", "valid-token");

        (jwtDecode as jest.Mock).mockReturnValue(mockDecodedToken);
    });

    afterEach(() => {
        localStorage.removeItem("token");
    });

    test("should initialize user state with valid token from localStorage", () => {
        render(
            <UserProvider>
                <MockUserComponent />
            </UserProvider>
        );

        expect(screen.getByText("Test")).toBeInTheDocument();
    });

    test("should remove user data when the token is invalid or expired", () => {
        // Symulacja tokenu wygasłego
        const expiredToken = {
            exp: Math.floor(Date.now() / 1000) - 3600, // Token wygasły
            username: "expireduser",
            firstName: "Expired",
            userId: "999",
        };
        localStorage.setItem("token", "expired-token");
        (jwtDecode as jest.Mock).mockReturnValue(expiredToken);

        render(
            <UserProvider>
                <MockUserComponent />
            </UserProvider>
        );

        expect(screen.queryByText("Expired")).not.toBeInTheDocument();
    });

    test("should set user data on login", () => {
        render(
            <UserProvider>
                <MockSetUserComponent />
            </UserProvider>
        );

        // Sprawdzamy, czy tekst "John" jest wyświetlany po ustawieniu stanu
        expect(screen.getByText("John")).toBeInTheDocument();
    });



    test("should clear user data on logout", () => {
        localStorage.setItem("token", "valid-token");

        render(
            <UserProvider>
                <MockLogoutComponent />
            </UserProvider>
        );

        // Symulacja wylogowania
        localStorage.removeItem("token");

        expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });


    test("should have default user state when no token is present in localStorage", () => {
        localStorage.removeItem("token");

        render(
            <UserProvider>
                <MockUserComponent />
            </UserProvider>
        );

        expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });


    test("should set user data correctly with setUserData function", () => {
        const { result } = renderHook(() => useUser(), {
            wrapper: UserProvider,
        });

        act(() => {
            result.current.setUserData(true, "Alice", "new-jwt-token", "456", "Alice");
        });

        expect(result.current.firstName).toBe("Alice");
        expect(result.current.jwtToken).toBe("new-jwt-token");
    });

});

const MockUserComponent = () => {
    const { firstName } = useUser();
    return <div>{firstName}</div>;
};

const MockSetUserComponent = () => {
    const { firstName, setUserData } = useUser();

    useEffect(() => {
        // Symulacja logowania i ustawienia danych użytkownika
        setUserData(true, "John", "jwt-token", "12345", "John");
    }, [setUserData]);

    return <div>{firstName}</div>;
};


const MockLogoutComponent = () => {
    const { setUserData } = useUser();
    useEffect(() => {
        // Symulacja wylogowania poprzez usunięcie tokenu z localStorage
        localStorage.removeItem("token");
        setUserData(false, "", "", "", "");
    }, [setUserData]);

    return <div>Logged out</div>;
};