import { AiOutlineFileSearch } from "react-icons/ai";

const NoSearchResultMessage = () => {
    return (
        <div className="px-4 max-w-screen-xl pt-10 pb-10 py-4 bg-white dark:bg-gray-800 shadow-md w-full rounded-lg mb-4 border border-gray-300 dark:border-gray-600 text-center">
            <AiOutlineFileSearch className="mx-auto w-16 h-16 mb-4 text-gray-400" />
            <p className="text-xl mb-4">Brak wyników.</p>
            <p className="text-md text-gray-600 dark:text-gray-300">
                Nie znaleziono rekordów pasujących do Twojego wyszukiwania. Spróbuj zmienić reguły wyszukiwania.
            </p>
        </div>
    );
};

export default NoSearchResultMessage;
