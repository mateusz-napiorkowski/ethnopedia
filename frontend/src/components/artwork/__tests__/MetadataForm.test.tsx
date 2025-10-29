import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react'
import MetadataForm from "../MetadataForm"
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();
const user = userEvent.setup()

const collectionData = {
    "_id": "675ddf8c1e6d01766fbc5b2e",
    "name": "example collection",
    "description": "example collection description",
    "categories": [
        {name: 'Tytuł', subcategories: [{name: "Podtytuł", subcategories: []}]},
        {name: 'Artyści', subcategories: []},
        {name: 'Rok', subcategories: []},
    ],
    "__v": 0
}
const artworkId = "6752ddca46e3ca48231024dc"

const treeData = [
    {
        "name": "Tytuł",
        "value": "Tytuł utworu",
        "subcategories": [
            {
                "name": "Podtytuł",
                "value": "Podtytuł utworu",
                "subcategories": []
            }
        ]
    },
    {
        "name": "Artyści",
        "value": "Nazwa Artysty",
        "subcategories": []
    },
    {
        "name": "Rok",
        "value": "1999",
        "subcategories": []
    }
]

const renderComponent = (edit = false) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter
                initialEntries={[
                    edit
                        ? `/collections/${collectionData._id}/artworks/${artworkId}/edit-artwork`
                        : `/collections/${collectionData._id}/create-artwork/`,
                ]}
            >
                <Routes>
                    <Route
                        path={
                            edit
                                ? "/collections/:collectionId/artworks/:artworkId/edit-artwork"
                                : "/collections/:collectionId/create-artwork/"
                        }
                        element={
                            <MetadataForm
                                categories={edit ? treeData : collectionData.categories.map(c => ({ ...c, value: '' }))}
                                setFieldValue={() => {}}
                                suggestionsByCategory={
                                    edit
                                        ? undefined
                                        : {
                                            'Tytuł': [],
                                            'Tytuł.Podtytuł': [],
                                            'Artyści': [],
                                            'Rok': [],
                                        }
                                }
                                filesToUpload={[]}
                                setFilesToUpload={() => {}}
                                currentFiles={[]}
                                setCurrentFiles={() => {}}
                                filesToDelete={[]}
                                setFilesToDelete={() => {}}
                                onFileFieldChange={() => {}}
                            />
                        }
                    />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    );
};


describe("MetadataForm tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render component correctly when in create mode", () => {
        const {container} = renderComponent()
        expect(container).toMatchSnapshot()
    })

    it("should render component correctly when in edit mode", () => {
        const {container} = renderComponent(true)
        expect(container).toMatchSnapshot()
    })
})