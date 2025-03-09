import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ReactComponent as AngleRightIcon } from "../assets/icons/angleRight.svg";

interface NavigationProps {
    artworkTitle?: string,
}

interface categoryData {
    name: string
    values: Array<string>
    subcategories: Array<categoryData>
}

const renderNavItem = (label: string, to: string, renderAngleRightIcon = true) => (
    <>
        {renderAngleRightIcon && 
            <span className="self-center">
                <AngleRightIcon />
            </span>
        }
        <li className="inline-flex items-center text-lg">
            <Link to={to} className="inline-flex items-center font-medium text-gray-800 hover:text-blue-600">
                {label}
            </Link>
        </li>
    </>
);

const Navigation: React.FC<NavigationProps> = ({artworkTitle}) => {
    const location = useLocation()
    const pathSegments = decodeURIComponent(location.pathname).split("/").filter(Boolean)
    const [, collectionName, , urlArtworkTitle] = pathSegments;

    const titleLabel = 
        artworkTitle || 
        location.state?.categories?.find((category: categoryData) => category.name === "Tytuł")?.values[0] ||
        "Utwór bez tytułu"

    return <nav className="flex">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
            {renderNavItem("Wszystkie kolekcje", `/`, false)}
            {renderNavItem(collectionName, `/collections/${collectionName}/artworks`)}
            {pathSegments[2] === "create-artwork" &&
                renderNavItem("Dodaj nowy rekord", `/collections/${collectionName}/create-artwork`)
            }
            {pathSegments[2] === "artworks" && pathSegments[3] && 
                renderNavItem(titleLabel, `/collections/${collectionName}/artworks/${urlArtworkTitle}`)}
            {pathSegments[4] === "edit-artwork" && 
                renderNavItem("Edytuj rekord", `/collections/${collectionName}/artworks/${urlArtworkTitle}/edit-artwork`)
            }
        </ol>
    </nav>
}

export default Navigation;
