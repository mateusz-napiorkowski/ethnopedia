import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
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
                <MemoryRouter initialEntries={[
                    edit ? 
                        `/collections/${collectionData._id}/artworks/${artworkId}/edit-artwork`
                        : `/collections/${collectionData._id}/create-artwork/`
                    ]}>
                    <Routes>
                        <Route path={
                            edit ?
                                "/collections/:collectionId/artworks/:artworkId/edit-artwork"
                                : "/collections/:collectionId/create-artwork/"
                        } element={<MetadataForm initialMetadataTree={edit ? treeData : undefined} categoryPaths={edit ? undefined : ['Tytuł', 'Tytuł.Podtytuł', 'Artyści', 'Rok']} setFieldValue={() => {}}/>}/>
                    </Routes>  
                </MemoryRouter>
            </QueryClientProvider>    
        );
};

describe("EmptyCollectionMessage", () => {
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

    it("should fill and clear form fields correctly when focusing on input fields by clicking them", async () => {
        const {container, getByLabelText} = renderComponent()
        
        const titleInputField = getByLabelText("Tytuł-input")
        const subtitleInputField = getByLabelText("Podtytuł-input")
        const artistsInputField = getByLabelText("Artyści-input")
        const yearInputField = getByLabelText("Rok-input")

        await user.type(subtitleInputField, "an artwork subtitle")
        await user.type(titleInputField, "an artwork title")
        await user.type(artistsInputField, "artist name")
        await user.clear(titleInputField)
        await user.type(yearInputField, "199")

        expect(container).toMatchSnapshot()
    })

    it("should fill and clear form fields correctly when focusing on input fields by using keyboard keys", async () => {
        const {container, getByLabelText} = renderComponent()
        
        const titleInputField = getByLabelText("Tytuł-input")

        await user.click(titleInputField)
        await user.keyboard(
            "{t}{y}{t}{u}{ł}{ }{u}{t}{w}{o}{r}{u}" +
            "{enter}" +
            "{p}{o}{d}{t}{y}{t}{u}{ł}{ }{u}" +
            "{arrowdown}" +
            "{n}{a}{z}{w}{a}{ }{a}{r}{t}{y}{s}{t}{y}" +
            "{arrowup}" +
            "{t}{w}{o}{r}{u}" +
            "{tab}{tab}" +
            "{1}{9}{9}{9}"
        );
        expect(container).toMatchSnapshot()
    })

    it("should stop filling category input field when string length exceeds 100 characters", async () => {
        const {getByLabelText} = renderComponent()
        
        const titleInputField = getByLabelText("Tytuł-input")
        const veryLongString = "a".repeat(150)

        await user.type(titleInputField, veryLongString)
        
        expect(titleInputField).toHaveValue("a".repeat(100))
    })
})