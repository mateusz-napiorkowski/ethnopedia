import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ReactComponent as AngleRightIcon } from "../assets/icons/angleRight.svg";


const renderNavItem = (label: string, to: string, renderAngleRightIcon = true) => (
    <>
        {renderAngleRightIcon && 
            <span className="self-center">
                <AngleRightIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </span>
        }
        <li className="inline-flex items-center text-lg">
            <Link to={to} className="inline-flex items-center font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-600">
                {label}
            </Link>
        </li>
    </>
);

const Navigation = () => {
    const location = useLocation()
    const pathSegments = decodeURIComponent(location.pathname).split("/").filter(Boolean)
    const [, collectionName, , urlArtworkTitle] = pathSegments;

    return <nav className="flex">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
            {renderNavItem("Strona główna", `/`, false)}
            {renderNavItem("Kolekcja", `/collections/${collectionName}/artworks`)}
            {pathSegments[2] === "create-artwork" &&
                renderNavItem("Dodaj nowy rekord", `/collections/${collectionName}/create-artwork`)
            }
            {pathSegments[2] === "artworks" && pathSegments[3] && 
                renderNavItem("Rekord", `/collections/${collectionName}/artworks/${urlArtworkTitle}`)}
            {pathSegments[4] === "edit-artwork" && 
                renderNavItem("Edycja", `/collections/${collectionName}/artworks/${urlArtworkTitle}/edit-artwork`)
            }
        </ol>
    </nav>
}

export default Navigation;
