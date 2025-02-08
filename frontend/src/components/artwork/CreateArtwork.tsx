import React, { useState } from "react";
import { useQueryClient } from "react-query";
import { Form, Formik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import { useUser } from "../../providers/UserProvider";
import Navigation from "../Navigation";
import FetchDataWrapper from "../TreeWrapper";

import { Category } from '../../@types/Category';
import { createArtwork, editArtwork } from "../../api/artworks";
import StructureForm from "../collections/StructureForm";


let example_data: Category[] = [
    { name: "Tytuł", values: [""], subcategories: [] },
    { name: "Artyści", values: [""], subcategories: [] },
    { name: "Rok", values: [""], subcategories: []}
]

// Function to create an empty structure based on the example_data
// const createEmptyStructure = (category: Category): Category => {
//     return {
//       name: category.name,
//       values: [''],
//       subcategories: category.subcategories ? category.subcategories.map(createEmptyStructure) : undefined,
//     };
// };

// function transformToJson(data: Category[]): { categories: Category[]; collectionName: string } {
//     return { categories: data, collectionName: window.location.href.split("/")[window.location.href.split("/").length-2] };
// }



const CreateArtwork: React.FC = () => {
    const location = useLocation();
    const queryClient = useQueryClient();
    const { jwtToken } = useUser();
    const navigate = useNavigate();
    const [dataToInsert, setDataToInsert] = useState({})

    // Inicjalizacja danych formularza
    let initialFormData: Category[] = example_data
    if(location.state && location.state.categories) {
        initialFormData = location.state.categories
    }


    const handleSubmit = async (formDataList: Category[]) => {
        console.log("Submit");
        // Przekazanie danych formularza do funkcji createArtwork
        try {
            if(!location.state) {
                // dodawanie rekordu
                await createArtwork(dataToInsert, jwtToken);
            } else {
                // edycja rekordu
                const artworkID = window.location.href.split("/")[window.location.href.split("/").length-2]
                await editArtwork(dataToInsert, artworkID, jwtToken)
            }
            queryClient.invalidateQueries(["collection"]);
            navigate(-1); // Powrót do poprzedniej strony
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <FetchDataWrapper>
            {({ id, categoriesData, isSuccess }) => (
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <div className="flex flex-1 justify-center mt-2">
                        <div className="flex flex-1 flex-col max-w-screen-xl">
                            <span className="mt-2">
                                <Navigation />
                            </span>
                            <div className="flex flex-1 justify-center h-fill max-w-screen-xl w-full mt-2">
                                <Formik
                                    initialValues={{ formDataList: initialFormData }}
                                    onSubmit={(values, { setSubmitting }) => {
                                        handleSubmit(values.formDataList);
                                        setSubmitting(false);
                                    }}
                                >
                                    {({ isSubmitting }) => (
                                        <Form className="flex flex-col bg-white rounded-lg w-full dark:bg-gray-800 border shadow dark:border-gray-600">
                                            <div className="flex items-start p-4 rounded-t border-b pb-2">
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {(!location.state) ? "Dodaj nowy rekord" : "Edytuj rekord"}
                                                </h3>
                                            </div>
                                            <div className="flex-grow">
                                                {/*<StructureForm*/}
                                                {/*    initialFormData={initialFormData}*/}
                                                {/*    setDataToInsert={(dataToInsert: any) => setDataToInsert(dataToInsert)} />*/}
                                            </div>
                                            <div className="flex justify-end px-4 pb-4 border-t pt-4 h-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(-1)}
                                                    className="px-4 py-2 dark:text-white text-gray-600 font-semibold"
                                                >
                                                    Anuluj
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="ml-2 color-button"
                                                    disabled={isSubmitting}
                                                >
                                                    {(!location.state) ? "Utwórz": "Edytuj"}
                                                </button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </FetchDataWrapper>
    );
};

export default CreateArtwork;
