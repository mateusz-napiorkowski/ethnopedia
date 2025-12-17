import React, { createContext, useContext, useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"

export interface JWT {
    exp: number;
    username: string;
    firstName: string;
    userId: string;
}

interface UserContextProps {
    isUserLoggedIn: boolean;
    firstName: string;
    userId: string;
    jwtToken: string;
    username: string;
    setUserData: (isLoggedIn: boolean, name: string, jwtToken: string, userId: string, username: string) => void;
}

export const UserContext = createContext<UserContextProps>({
    isUserLoggedIn: false,
    firstName: "",
    userId: "",
    jwtToken: "",
    username: "",
    setUserData: () => {
    },
})

export const useUser = () => useContext(UserContext)

interface UserProviderProps {
    children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
    const [firstName, setFirstName] = useState("")
    const [userId, setUserId] = useState("")
    const [username, setUsername] = useState("")
    const [jwtToken, setJwtToken] = useState("")

    const setUserData = (isLoggedIn: boolean, name: string, jwtToken: string, userId: string, username: string) => {
        setIsUserLoggedIn(isLoggedIn)
        setFirstName(name)
        setUserId(userId)
        setJwtToken(jwtToken)
        setUsername(username)
    }

    useEffect(() => {
        const token = localStorage.getItem("token")

        if (token) {
            try {
                const decodedToken = jwtDecode<JWT>(token)
                const currentTime = Date.now() / 1000
                if (decodedToken.exp > currentTime) {
                    setUserData(true, decodedToken.firstName, token, decodedToken.userId, decodedToken.username)
                } else {
                    localStorage.removeItem("token")
                    setUserData(false, "", "", "", "")
                }
            } catch (error) {
                console.error("Invalid token:", error)
                localStorage.removeItem("token")
                setUserData(false, "", "", "", "")
            }
        }
    }, [])

    return (
        <UserContext.Provider value={{ isUserLoggedIn, firstName, userId, jwtToken, username, setUserData }}>
            {children}
        </UserContext.Provider>
    )
}
