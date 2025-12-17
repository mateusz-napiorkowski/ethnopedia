import { useEffect, useState } from "react"
import { ReactComponent as SunIcon } from "../../assets/icons/sun.svg"
import { ReactComponent as MoonIcon } from "../../assets/icons/moon.svg"

const ToggleTheme = () => {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")

    useEffect(() => {
        localStorage.setItem("theme", theme)

        if (theme === "light") {
            document.documentElement.classList.remove("dark")
        } else {
            document.documentElement.classList.add("dark")
        }
    }, [theme])

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === "light" ? "dark" : "light")
    }

    return (
        <button type="button"
                title={theme === "light" ? "Włącz tryb ciemny" : "Włącz tryb jasny"}
                className="text-gray-800 bg-white border border-gray-300 focus:outline-none
                           hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm
                           p-2.5 mr-2 dark:bg-gray-800 dark:text-white dark:border-gray-600
                           dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                onClick={toggleTheme}>
            {theme === "light" ? <MoonIcon className="w-4 h-4 m-0.5" /> : <SunIcon className="w-4 h-4 m-0.5" />}
        </button>
    )
}

export default ToggleTheme
