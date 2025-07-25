import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Navigation from '../../components/Navigation';
import LoadingPage from '../LoadingPage';

const ExportDataPage: React.FC = () => {
    const navigate = useNavigate();

    if (false) {
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
                        <form onSubmit={() => {}}>
                            <div className="flex justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-4 py-2 mr-2"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 color-button"
                                >
                                    Eksportuj dane
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
