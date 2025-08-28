import React from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineSearch } from "react-icons/hi";

const GlobalSearch: React.FC = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/global-search");
    };

    return (
        <button
            type="button"
            title="Wyszukiwanie globalne"
            onClick={handleClick}
            className="text-gray-800 bg-white border border-gray-300 focus:outline-none
                           hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm
                           p-2.5 mr-2 dark:bg-gray-800 dark:text-white dark:border-gray-600
                           dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        >
            <HiOutlineSearch className="w-5 h-5 text-gray-800 dark:text-gray-200" />
        </button>
    );
};

export default GlobalSearch;
