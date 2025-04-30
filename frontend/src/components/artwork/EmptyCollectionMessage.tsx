import { HiOutlineCollection } from "react-icons/hi";
import { useNavigate, useParams } from "react-router-dom";

type Props = {
    setShowImportOptions: (value: boolean) => void;
    jwtToken?: string;
};

const EmptyCollectionMessage = ({ setShowImportOptions, jwtToken }: Props) => {
    const navigate = useNavigate();
    const { collectionId } = useParams();

    return (
        <div className="px-4 max-w-screen-xl pt-10 pb-10 py-4 bg-white dark:bg-gray-800 shadow-md w-full rounded-lg mb-4 border border-gray-300 dark:border-gray-600 cursor-pointer text-center">
            <HiOutlineCollection className="mx-auto w-16 h-16 mb-4 text-gray-400" />
            <p className="text-xl mb-4">Ta kolekcja jest pusta.</p>
            <p className="text-md">
                {jwtToken ? (
                    <>
                        <button
                            type="button"
                            className="text-blue-600 cursor-pointer bg-transparent border-0 p-0"
                            onClick={() =>
                                navigate(`/collections/${collectionId}/create-artwork`)
                            }
                        >
                            Dodawaj nowe rekordy
                        </button>{" "}
                        ręcznie lub{" "}
                        <button
                            type="button"
                            className="text-blue-600 cursor-pointer bg-transparent border-0 p-0"
                            onClick={() => setShowImportOptions(true)}
                        >
                            zaimportuj
                        </button>{" "}
                        dane z pliku Excel, aby rozpocząć organizację swojej kolekcji.
                    </>
                ) : (
                    <span>
                        <button
                            type="button"
                            className="text-blue-600 cursor-pointer bg-transparent border-0 p-0"
                            onClick={() => navigate("/login")}
                        >
                            Zaloguj się
                        </button>{" "}
                        aby móc dodawać rekordy. Nie masz konta?{" "}
                        <button
                            type="button"
                            className="text-blue-600 cursor-pointer bg-transparent border-0 p-0"
                            onClick={() => navigate("/register")}
                        >
                            Zarejestruj się
                        </button>
                    </span>
                )}
            </p>
        </div>
    );
};

export default EmptyCollectionMessage;
