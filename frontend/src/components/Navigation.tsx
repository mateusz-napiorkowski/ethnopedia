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
    const location = useLocation();
    const pathSegments = decodeURIComponent(location.pathname).split("/").filter(Boolean);

    const isSearch = pathSegments[0] === "global-search";

    return (
        <nav className="flex">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                {renderNavItem("Strona główna", `/`, false)}

                {isSearch ? (
                    <>
                        {renderNavItem("Wyszukiwanie", `/global-search`)}

                        {pathSegments[1] && !["edit-artwork"].includes(pathSegments[2]) &&
                            renderNavItem("Rekord", `/global-search/${pathSegments[1]}`)
                        }

                        {pathSegments[2] === "edit-artwork" &&
                            renderNavItem("Edycja", `/global-search/${pathSegments[1]}/edit-artwork`)
                        }
                    </>
                ) : (
                    <>
                        {renderNavItem("Kolekcja", `/collections/${pathSegments[1]}/artworks`)}

                        {pathSegments[2] === "create-artwork" &&
                            renderNavItem("Dodaj nowy rekord", `/collections/${pathSegments[1]}/create-artwork`)
                        }

                        {pathSegments[2] === "artworks" && pathSegments[3] &&
                            renderNavItem("Rekord", `/collections/${pathSegments[1]}/artworks/${pathSegments[3]}`)
                        }

                        {pathSegments[4] === "edit-artwork" &&
                            renderNavItem("Edycja", `/collections/${pathSegments[1]}/artworks/${pathSegments[3]}/edit-artwork`)
                        }
                    </>
                )}
            </ol>
        </nav>
    );
};

export default Navigation;
