import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ReactComponent as AngleRightIcon } from "../assets/icons/angleRight.svg";

const isId = (segment: string) => {
    return /^[0-9a-f]{24}$/i.test(segment);
};

const Navigation: React.FC = () => {
    const location = useLocation();
    let pathSegments = location.pathname.split("/").filter(Boolean);

    // strona tworzenia kolekcji
    if (pathSegments[0] === "create-collection") {
        return (
            <nav className="flex">
                <ol className="inline-flex items-center space-x-1 md:space-x-2">
                    <li className="inline-flex items-center text-lg">
                        <Link
                            to="/"
                            className="inline-flex items-center font-medium text-gray-800 hover:text-blue-600"
                        >
                            Lista kolekcji
                        </Link>
                    </li>
                    <span className="self-center">
            <AngleRightIcon />
          </span>
                    <li className="inline-flex items-center text-lg">
            <span className="inline-flex items-center font-medium text-gray-800">
              Nowa kolekcja
            </span>
                    </li>
                </ol>
            </nav>
        );
    }


    return (
        <nav className="flex">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                <li className="inline-flex items-center text-lg">
                    <Link
                        to="/"
                        className="inline-flex items-center font-medium text-gray-800 hover:text-blue-600"
                    >
                        Lista kolekcji
                    </Link>
                </li>
                <span className="self-center">
          <AngleRightIcon />
        </span>
                {pathSegments.length >= 2 && (
                    <li className="inline-flex items-center text-lg">
                        <Link
                            to={`/collections/${pathSegments[1]}/artworks`}
                            className="inline-flex items-center font-medium text-gray-800 hover:text-blue-600"
                        >
                            {decodeURIComponent(pathSegments[1])}
                        </Link>
                    </li>
                )}
                {pathSegments.length >= 3 && pathSegments[pathSegments.length - 1] !== "artworks" && (
                    <>
            <span className="self-center">
              <AngleRightIcon />
            </span>
                        <li className="inline-flex items-center text-lg">
                            <Link
                                to={`/collections/${pathSegments[1]}/${pathSegments[2]}`}
                                className="inline-flex items-center font-medium text-gray-800 hover:text-blue-600"
                            >
                                Utwór
                            </Link>
                        </li>
                    </>
                )}
            </ol>
        </nav>
    );
};

export default Navigation;
