import { useState } from "react"
import { useNavigate } from "react-router-dom"
import ToggleTheme from "./ToggleTheme"
import GlobalSearch from "./GlobalSearch"
import { ReactComponent as UserIcon } from "../../assets/icons/user-icon.svg"
import { deleteAccount } from "../../api/auth"
import { useMutation } from "react-query"
import { useUser } from "../../providers/UserProvider"
import WarningPopup from "../../pages/WarningPopup"

const Navbar = () => {
    const navigate = useNavigate()

    const { isUserLoggedIn, firstName, userId, jwtToken, setUserData} = useUser()
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [showDeleteAccountWarning, setShowDeleteAccountWarning] = useState(false)

    const handleLogout = () => {
        setIsDropdownOpen(false)
        setShowDeleteAccountWarning(false)
        localStorage.removeItem("token")
        setUserData(false, "", "", "", "")

        navigate("/")
    }

    const deleteAccountmutation = useMutation(() => deleteAccount(userId, jwtToken as string), {
        onSuccess: handleLogout
    })

    const handleAccountDeletion = () => {
        deleteAccountmutation.mutate()
    }

    interface DropDownMenuProps {
        firstName: string;
        onLogout: () => void;
        onDeleteAccount: () => void;
    }

    const DropdownMenu = ({ firstName, onLogout, onDeleteAccount }: DropDownMenuProps) => (
        <div
            data-testid="dropdownMenu"
            className="absolute max-w-screen-xl mt-48 w-48 ml-16 bg-white divide-y divide-gray-300 rounded-lg
                shadow dark:bg-gray-700 dark:divide-gray-600 border border-gray-300"
        >
            <div className="px-4 py-3">
                <span className="block text-sm dark:text-white">{firstName}</span>
            </div>
            <ul className="py-2">
                <li>
                    <div
                        onClick={() => navigate("/user-edit")}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100
                            dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white cursor-pointer"
                    >
                        Zmień dane użytkownika
                    </div>
                </li>
                {/* <li>
                    <div
                        onClick={onDeleteAccount}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100
                            dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white cursor-pointer"
                    >
                        Usuń konto
                    </div>
                </li> */}
                <li>
                    <div
                        onClick={onLogout}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100
                            dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white cursor-pointer"
                    >
                        Wyloguj się
                    </div>
                </li>
            </ul>
        </div>
    )

    return <nav className="bg-gray-800 border-gray-200 dark:bg-gray-200 w-full border-b dark:border-gray-600">
        {showDeleteAccountWarning && (
            <WarningPopup
                onClose={() => setShowDeleteAccountWarning(!showDeleteAccountWarning)}
                deleteSelected={handleAccountDeletion}
                warningMessage={"Czy na pewno chcesz usunąć konto?"}
            />
        )}
        <div className="max-w-screen-xl flex flex-wrap justify-between mx-auto p-1">
            <div className="flex items-center mt-1">
                <h1 className="logo text-gray-200 dark:text-gray-900 text-6xl ">ethnopedia</h1>
            </div>
            <div className="flex items-center md:order-2">
                <GlobalSearch/>

                <ToggleTheme/>

                {isUserLoggedIn ?
                    <>
                        <div aria-label="show-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="rounded-full bg-gray-300
                        p-3 cursor-pointer">
                            <UserIcon/>
                        </div>
                        <h2 className="font-semibold ml-2 text-lg dark:text-gray-800 text-white">{firstName}</h2>
                        {isDropdownOpen && <DropdownMenu
                            firstName={firstName}
                            onLogout={handleLogout}
                            onDeleteAccount={() => setShowDeleteAccountWarning(true)}
                        />}
                    </> :
                    <>
                        <button type="button"
                                className="mr-2 bg-blue-500 hover:bg-blue-400 font-semibold text-white border-none"
                                onClick={() => navigate("/login")}>
                            Zaloguj się
                        </button>
                        {/* <button type="button"
                                className="bg-blue-500 hover:bg-blue-400 font-semibold text-white border-none"
                                onClick={() => navigate("/register")}>
                            Zarejestruj się
                        </button> */}
                    </>
                }
            </div>
        </div>
    </nav>
}
export default Navbar