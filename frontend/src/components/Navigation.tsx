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
    const [, collectionName, , urlArtworkTitle] = pathSegments;

    const isSearch = pathSegments[0] === "global-search";

    return (
        <nav className="flex mb-4">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                {renderNavItem("Strona główna", `/`, false)}

                {/* Help Page */}
                {pathSegments[0] === "help" &&
                    renderNavItem("Pomoc", `/help`)
                }

                {/* Global search */}
                {isSearch && (
                    <>
                        {renderNavItem("Wyszukiwanie", `/global-search`)}

                        {pathSegments[1] && !["edit-artwork"].includes(pathSegments[2]) &&
                            renderNavItem("Rekord", `/global-search/${pathSegments[1]}`)
                        }

                        {pathSegments[2] === "edit-artwork" &&
                            renderNavItem("Edycja", `/global-search/${pathSegments[1]}/edit-artwork`)
                        }
                    </>
                )}

                {/* Kolekcje */}
                {!isSearch && pathSegments[0] !== "help" && (
                    <>
                        {pathSegments[0] === "import-collection" &&
                            renderNavItem("Importuj kolekcję", `/import-collection`)
                        }

                        {pathSegments[0] === "collections" &&
                            renderNavItem("Kolekcja", `/collections/${collectionName}/artworks`)
                        }

                        {pathSegments[2] === "create-artwork" &&
                            renderNavItem("Dodaj nowy rekord", `/collections/${collectionName}/create-artwork`)
                        }

                        {pathSegments[2] === "artworks" && pathSegments[3] &&
                            renderNavItem("Rekord", `/collections/${collectionName}/artworks/${urlArtworkTitle}`)
                        }

                        {pathSegments[2] === "export-data" &&
                            renderNavItem("Eksportuj dane", `/collections/${collectionName}/export-data`)
                        }

                        {pathSegments[4] === "edit-artwork" &&
                            renderNavItem("Edycja", `/collections/${collectionName}/artworks/${urlArtworkTitle}/edit-artwork`)
                        }

                        {/* Create/Edit Collection */}
                        {(pathSegments[0] === "create-collection" || (pathSegments[2] === "edit")) &&
                            renderNavItem(pathSegments[0] === "create-collection" ? "Nowa kolekcja" : "Edytuj kolekcję", location.pathname)
                        }
                    </>
                )}
            </ol>
        </nav>
    );
};


export default Navigation;
