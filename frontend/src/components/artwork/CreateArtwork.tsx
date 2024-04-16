import React, { useState } from "react";
import { useQueryClient } from "react-query";
import { Form, Formik } from "formik";
import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/Navbar";
import { useUser } from "../../providers/UserProvider";
import Navigation from "../Navigation";
import FetchDataWrapper from "../TreeWrapper";

import { Category } from "./types/ArtworkTypes";
import { createArtwork } from "../../api/artworks";
import NewArtworkStructure from "./NewArtworkStructure";


let example_data: Category[] = [
    { name: "Tytuł", values: ["tytuł utworu"], subcategories: [] },
    { name: "Wykonawca", values: ["nazwa zespołu"], subcategories: [
      { name: "Wykonawca nr 1", values: ["Imię Nazwisko 1"] },
      { name: "Wykonawca nr 2", values: ["Imię Nazwisko 2"] } ] },
    { name: "Region", values: ["Wielkopolska"], subcategories: [
      { name: "Podregion", values: ["Wielkopolska Północna"] },
      { name: "Podregion etnograficzny", values: ["Szamotulskie"] },
      { name: "Powiat", values: ["Szamotulski"]} ] }
  ]

// Function to create an empty structure based on the example_data
const createEmptyStructure = (category: Category): Category => {
    return {
      name: category.name,
      values: [''],
      subcategories: category.subcategories ? category.subcategories.map(createEmptyStructure) : undefined,
    };
};

function transformToJson(data: Category[]): { categories: Category[]; collectionName: string } {
    return { categories: data, collectionName: 'test' };  //TODO
}
  


const CreateArtwork: React.FC = () => {
    const queryClient = useQueryClient();
    const { jwtToken } = useUser();
    const navigate = useNavigate();

    // Inicjalizacja danych formularza
    const initialFormData: Category[] = example_data.map(createEmptyStructure);

    const handleSubmit = async (formDataList: Category[]) => {
        console.log("Submit");
        // Przekazanie danych formularza do funkcji createArtwork
        try {
            const mongoDBData = transformToJson(formDataList);
            console.log("dane:", mongoDBData);
            const response = await createArtwork(mongoDBData);
            console.log(response.data);
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
                                                    Dodaj nowy rekord
                                                </h3>
                                            </div>
                                            <div className="flex-grow">
                                                <NewArtworkStructure 
                                                    initialFormData={initialFormData} />
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
                                                    Utwórz
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
