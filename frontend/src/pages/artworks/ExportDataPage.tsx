import React, { ChangeEvent, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Navigation from '../../components/Navigation';
import LoadingPage from '../LoadingPage';
import {ExportExtent} from "../../@types/DataExport"
import { getAllCategories } from '../../api/categories';
import { getArtworksFilesArchive, getXlsxWithArtworksData } from '../../api/dataExport';

const ExportDataPage: React.FC = () => {
    
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [exportExtent, setExportExtent] = useState<ExportExtent>(ExportExtent.all)
    const [exportToExcel, setExportToExcel] = useState(true)
    const [filename, setFilename] = useState(location.state && location.state.initialFilename ? location.state.initialFilename : "metadata");
    const [exportAsCSV, setExportAsCSV] = useState(false)
    const [archiveFilename, setArchiveFilename] = useState(location.state && location.state.initialArchiveFilename ? location.state.initialArchiveFilename : "archive")
    const collectionIds = location.state && location.state.collectionIds ? location.state.collectionIds : [params.collection]
    const selectedArtworks = location.state && location.state.selectedArtworks ? location.state.selectedArtworks : []
    const searchParams = location.state && location.state.searchParams ? location.state.searchParams : {}
    const [includeIds, setIncludeIds] = useState(false)
    const [excelMenuScrollPosition, setExcelMenuScrollPosition] = useState(0)
    
    const { data: categoriesData } = useQuery({
        queryKey: ["allCategories"],
        queryFn: () => getAllCategories(collectionIds),
        enabled: !!collectionIds,
    })

    useEffect(() => {
        window.scroll(0, excelMenuScrollPosition)
    }, [exportToExcel])

    const handleExportExtentRadioInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        if((event.target.value) === "onlyChecked") {
            setExportExtent(ExportExtent.selected)
        } else if ((event.target.value) === "onlySearchResult") {
            setExportExtent(ExportExtent.searchResult)
        } else {
            setExportExtent(ExportExtent.all)
        }
    }

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        setSelectedKeys((prevSelected) => {
            const updatedKeys = checked 
                ? [...prevSelected, value] 
                : prevSelected.filter((key) => key !== value);
            
            return categoriesData.categories.filter((key: string) => updatedKeys.includes(key));
        });
    }

    const handleSelectAll = () => setSelectedKeys(categoriesData.categories);
    const handleDeselectAll = () => setSelectedKeys([]);

    const handleFilenameChange = (event: ChangeEvent<HTMLInputElement>) => setFilename(event.target.value);
    const handleArchiveFilenameChange = (event: ChangeEvent<HTMLInputElement>) => setArchiveFilename(event.target.value);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        if(exportToExcel) {
            getXlsxWithArtworksData(
                collectionIds, 
                selectedKeys,
                exportExtent,
                selectedArtworks,
                searchParams,      
                filename,
                includeIds,
                exportAsCSV
            );
        } else {
            getArtworksFilesArchive(
                collectionIds, 
                exportExtent,
                selectedArtworks,
                searchParams,      
                archiveFilename
            );
        }
    }

    if (!categoriesData) {
        return <>
            <div data-testid="loading-page-container">
                <LoadingPage />
            </div>
        </>;
    }

    return (
        <div className="min-h-screeni flex flex-col overflow-y-auto" data-testid="create-artwork-page-container">
            <Navbar />
            <div className="container px-8 mt-6 max-w-3xl mx-auto">
                <Navigation />
                <div className="mt-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-600 p-8">
                        <div className="flex items-start rounded-t border-b pb-2">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Eksportuj dane
                            </h3>
                        </div>          
                        <div className="flex flex-col text-sm border-b pb-2 mb-2">
                            <p className='my-2 text-base'>Wybierz zakres eksportowanych danych:</p>
                            <span className="py-1">
                                <input 
                                    type="radio"
                                    id="exportAll"
                                    name="exportAll"
                                    value="exportAll"
                                    onChange={handleExportExtentRadioInputChange}
                                    checked={exportExtent === ExportExtent.all}
                                />
                                <label> Eksportuj dane dotyczące wszystkich utworów kolekcji</label>
                            </span>
                            <span className="py-1">
                                <input
                                    type="radio"
                                    id="onlyChecked"
                                    name="onlyChecked"
                                    value="onlyChecked"
                                    onChange={handleExportExtentRadioInputChange}
                                    checked={exportExtent === ExportExtent.selected}
                                    />
                                <label> Eksportuj dane dotyczące zaznaczonych utworów</label>
                            </span>
                            <span className="py-1">
                                <input
                                    type="radio"
                                    id="onlySearchResult"
                                    name="onlySearchResult"
                                    value="onlySearchResult"
                                    onChange={handleExportExtentRadioInputChange}
                                    checked={exportExtent === ExportExtent.searchResult}
                                />
                                <label> Eksportuj dane dotyczące wyników wyszukiwania</label>
                            </span>
                            <p className='text-sm'>Aby wyeksportować dane zaznaczonych utworów lub wyników wyszukiwania wykonaj odpowiednie operacje na stronie
                                utworów kolekcji, a następnie wcisnij na niej przycisk "Eksportuj dane" aby wrócić do obecnego formularza i wybierz właściwą opcję.
                            </p>
                        </div>
                        <div className='my-4'>
                            <button
                                type="button"
                                onClick={() => {setExportToExcel(true)}}
                                className={`px-4 py-2 ${exportToExcel ? "color-button" : ""} rounded-r-none text-xs`}
                            >
                                Eksportuj dane do arkusza kalkulacyjnego/pliku CSV
                            </button>
                            <button
                                type="button"
                                onClick={() => {setExcelMenuScrollPosition(window.scrollY); setExportToExcel(false);}}
                                className={`px-4 py-2 ${!exportToExcel ? "color-button" : ""} rounded-l-none text-xs`}
                            >
                                Eksportuj skojarzone pliki do archiwum
                            </button>  
                        </div>
                        {
                            exportToExcel ? <>
                                <p className='text-base my-2'>Wybierz kategorie, dla których kolumny mają pojawić się w wyeksportowanym pliku:</p>
                                <ul className="flex flex-col items-start">   
                                    {categoriesData.categories.map((key: string) =>
                                        <li key={key} className='flex flex-row justify-center my-1'>
                                            <input
                                                className='m-2 hover:cursor-pointer'
                                                type="checkbox"
                                                id={key}
                                                name={key}
                                                value={key}
                                                onChange={event => handleCheckboxChange(event)}
                                                checked={selectedKeys.includes(key)}
                                            />
                                            <label className='text-sm'>{key}</label>
                                        </li>
                                    )}                 
                                </ul>
                                <div className="flex flex-row space-x-2 items-start mb-1">
                                    <button
                                        className='flex items-center p-2 text-xs'
                                        type="button"
                                        onClick={handleSelectAll}
                                    >
                                        Zaznacz wszystkie
                                    </button>
                                    <button
                                        className='flex items-center p-2 text-xs'
                                        type="button"
                                        onClick={handleDeselectAll}
                                    >
                                        Odznacz wszystkie
                                    </button>
                                </div>
                                <div className="flex flex-row items-center space-x-2 text-sm py-2">
                                    <label className="text-base">
                                        Nazwa pliku (bez rozszerzenia):
                                    </label>
                                    <input
                                        className="p-1 text-base"
                                        value={filename}
                                        onChange={handleFilenameChange}/>
                                </div>
                                <div className="flex flex-row items-center space-x-2 text-sm py-2">
                                    <label className="text-base">
                                        Typ pliku:
                                    </label>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => setExportAsCSV(false)}
                                            className={`px-4 py-2 ${!exportAsCSV ? "color-button" : ""} rounded-r-none text-xs`}
                                        >
                                            Arkusz kalkulacyjny
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setExportAsCSV(true)}
                                            className={`px-4 py-2 ${exportAsCSV ? "color-button" : ""} rounded-l-none text-xs`}
                                        >
                                            Plik CSV
                                        </button>  
                                    </div>
                                </div>
                                <div>
                                    <input className='m-2 hover:cursor-pointer'
                                        type="checkbox"
                                        onClick={() => setIncludeIds(!includeIds)}
                                        checked={includeIds}
                                    />
                                    <label className='text-sm'>Zawrzyj w pliku kolumnę z id rekordów</label>
                                </div>
                                
                                <p className='text-sm my-1'>Zaznacz tę opcję, jeśli chcesz mieć możliwość późniejszego zaimportowania wyeksportowanych danych wraz ze skojarzonymi plikami z wyeksportowanego archiwum.</p>
                            </> : <>
                                <p className='text-sm my-2'>Wyeksportowanie plików skojarzonych z wybranymi rekordami umożliwia ich późniejsze ponowne zaimportowanie wraz z arkuszem kalkulacyjnym (jako nową kolekcję lub do istniejącej kolekcji).</p>
                                <div className="flex flex-row items-center space-x-2 text-sm my-3">
                                    <label className="text-base">
                                        Nazwa archiwum (bez rozszerzenia):
                                    </label>
                                    <input
                                        className="p-1 text-base"
                                        value={archiveFilename}
                                        onChange={handleArchiveFilenameChange}/>
                                </div>                                
                            </>
                        }      
                        <form onSubmit={handleSubmit}>
                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-4 py-2 mr-2"
                                >
                                    Powrót do strony utworów kolekcji
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 color-button"
                                >
                                    Eksportuj
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportDataPage;
