type Cause = 
    "File not found" |
    "Internal server error" |
    "Invalid file extension" |
    "File size exceeded";

const translations = {
    "File not found": "Nie znaleziono pliku do usunięcia",
    "Internal server error": "Błąd serwera",
    "Invalid file extension": "Nieprawidłowe rozszerzenie pliku",
    "File size exceeded": "Przekroczono maksymalny rozmiar pliku"
}

type Props = {
    onClose: () => void
    failedUploadsCauses: Array<{filename: string, cause: Cause}>,
    failedDeletesCauses: Array<{filename: string, cause: Cause}>
}

const FileErrorsPopup = ({ onClose, failedUploadsCauses, failedDeletesCauses }: Props) => {
    return <div id="popup-modal"
                className="overflow-y-auto flex items-center overflow-x-hidden fixed z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full ">
        <div className="fixed inset-0 bg-black opacity-50" />

        <div className="relative p-4 w-full max-w-md max-h-full ">
            <div className="relative bg-white rounded-lg shadow-md dark:bg-gray-700 border-gray-200 border">

                <hr className="border-t border-gray-200 dark:border-gray-600 w-8 self-center w-full" />

                <div className="p-4 md:p-5 text-center">
                    <h3 className="text-lg font-normal text-gray-700 font-semibold dark:text-gray-400">
                        Rekord został utworzony, lecz wystąpiły problemy z obsługą plików.
                    </h3>
                    {failedUploadsCauses &&
                        <div className="m-3">
                            <h4 className="m-2 text-base font-normal text-gray-700 font-semibold dark:text-gray-400">
                                Części plików nie udało się wgrać
                            </h4>
                            {failedUploadsCauses.map((pairs: {filename: string, cause: Cause}) => (                      
                                <span className="flex flex-row justify-between text-sm">
                                    <span>{pairs.filename}</span>
                                    <span>{translations[pairs.cause]}</span>
                                </span>     
                            ))}
                        </div>
                    }
                    {failedDeletesCauses &&
                        <div className="m-3">
                            <h4 className="m-2 text-base font-normal text-gray-700 font-semibold dark:text-gray-400">
                                Części plików nie udało się usunąć
                            </h4>
                            {failedDeletesCauses.map((pairs: {filename: string, cause: Cause}) => (                      
                                <span className="flex flex-row justify-between text-sm">
                                    <span>{pairs.filename}</span>
                                    <span>{translations[pairs.cause]}</span>
                                </span>     
                            ))}
                        </div>
                    }
                    <button type="button" onClick={onClose}
                            className="text-gray-800 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none
                            font-semibold
                            focus:ring-gray-200 rounded-lg border border-gray-300 text-sm font-medium px-5 py-2.5
                            hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500
                            dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                        Ok
                    </button>
                </div>
            </div>
        </div>
    </div>
}

export default FileErrorsPopup