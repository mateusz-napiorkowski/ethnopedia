import React, { useState } from "react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const [inputedPage, setInputedPage] = useState(currentPage)
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

    const handlePrevious = () => {
        if (currentPage > 1) onPageChange(currentPage - 1)
    }

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1)
    }

    const handleInputed = (event: any) => {
        setInputedPage(event.target.value)
    }

    const handleGoToPageButtonClick = (event: any) => {
        onPageChange(inputedPage)
    }

    return (
        <nav aria-label="Page navigation example" data-testid="pagination-menu" className="flex space-x-2">
            <span className="flex items-center justify-center text-gray-700 text-sm h-8">
                Strona
                <input type="number" className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none w-12 mx-2 text-center"
                value={inputedPage} onChange={handleInputed}></input>
                z {totalPages}
                <button className="font-normal h-6 mx-2 flex items-center justify-center px-3 leading-tight
                     text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100
                     hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700
                     dark:hover:text-white cursor-pointer"
                     onClick={handleGoToPageButtonClick}>Przejdź</button>
            </span>
            <ul className="inline-flex -space-x-px text-sm">
                <li>
                    <div onClick={handlePrevious} className="flex items-center justify-center px-3 h-8 leading-tight
                     text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100
                     hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700
                     dark:hover:text-white cursor-pointer">
                        Poprzednia strona
                    </div>
                </li>
                {
                    currentPage <= 4 &&
                    pageNumbers.slice(0, 6).map(number => (
                        <li key={number}>
                            <div onClick={() => onPageChange(number)} data-testid={`page-${number}`} className={`cursor-pointer flex items-center justify-center px-3 h-8
                             leading-tight ${currentPage === number ? "text-blue-600 bg-blue-50 border border-gray-300" :
                                "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"} 
                                dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 
                                dark:hover:text-white`}>
                                {number}
                            </div>
                        </li>
                    ))
                }
                {
                    currentPage >= 5
                    &&
                    <>
                    <li key={totalPages}>
                            <div onClick={() => onPageChange(1)} data-testid={`page-first`} className={`cursor-pointer flex items-center justify-center px-3 h-8
                    leading-tight ${currentPage === 1 ? "text-blue-600 bg-blue-50 border border-gray-300" :
                                    "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"} 
                    dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 
                    dark:hover:text-white`}>
                                {1}
                            </div>
                        </li>
                    <li>
                        <div className={`flex items-center justify-center px-3 h-8
                        leading-tight text-blue-600`}>
                            ...
                        </div>
                    </li></>
                }
                {
                5 <= currentPage && currentPage <= totalPages - 4
                &&
                pageNumbers.slice(currentPage-3, currentPage+2).map(number => (
                    <li key={number}>
                        <div onClick={() => onPageChange(number)} data-testid={`page-${number}`} className={`cursor-pointer flex items-center justify-center px-3 h-8
                         leading-tight ${currentPage === number ? "text-blue-600 bg-blue-50 border border-gray-300" :
                            "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"} 
                            dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 
                            dark:hover:text-white`}>
                            {number}
                        </div>
                    </li>
                ))}
                {
                    currentPage < totalPages - 3
                    &&
                    <><li>
                        <div className={`flex items-center justify-center px-3 h-8
                        leading-tight text-blue-600`}>
                            ...
                        </div>
                    </li><li key={totalPages}>
                            <div onClick={() => onPageChange(totalPages)} data-testid={`page-last`} className={`cursor-pointer flex items-center justify-center px-3 h-8
                    leading-tight ${currentPage === 1 ? "text-blue-600 bg-blue-50 border border-gray-300" :
                                    "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"} 
                    dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 
                    dark:hover:text-white`}>
                                {totalPages}
                            </div>
                        </li></>
                }
                {
                    currentPage >= totalPages - 3 &&
                    pageNumbers.slice(totalPages - 6, totalPages).map(number => (
                        <li key={number}>
                            <div onClick={() => onPageChange(number)} data-testid={`page-${number}`} className={`cursor-pointer flex items-center justify-center px-3 h-8
                             leading-tight ${currentPage === number ? "text-blue-600 bg-blue-50 border border-gray-300" :
                                "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"} 
                                dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 
                                dark:hover:text-white`}>
                                {number}
                            </div>
                        </li>
                    ))
                }    
                <li>
                    <div onClick={handleNext} className="flex items-center justify-center px-3 h-8 leading-tight
                     text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700
                      dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700
                      dark:hover:text-white cursor-pointer">
                        Następna strona
                    </div>
                </li>
            </ul>
        </nav>
    )
}

export default Pagination
