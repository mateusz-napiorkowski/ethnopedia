import '@testing-library/jest-dom';
import { render } from '@testing-library/react'
import Navigation from "../Navigation"
import { MemoryRouter, Routes, Route } from "react-router-dom";

interface locationState {
    categories: Array<{
        name: string,
        value: string
    }>
}

const renderComponent = (url: string, title: string | undefined = undefined, locationState: locationState | undefined = undefined) => {
    return render(
        <MemoryRouter initialEntries={[{pathname: url, state: locationState}]}>
            <Routes>
                <Route path={url} element={<Navigation artworkTitle={title} />}/>
            </Routes>  
        </MemoryRouter>
    );
};

describe("Navigation tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("component renders correctly on artworks list page", async () => {        
        const url = "/collections/example-collection/artworks/"
        const { container } = renderComponent(url)
        
        expect(container).toMatchSnapshot()
    })

    test("component renders correctly on artwork page", async () => {        
        const url = "/collections/example-collection/artworks/674386b32a2908778c0ad471"
        const { container } = renderComponent(url, 'Example artwork title')
        
        expect(container).toMatchSnapshot()
    })

    test("component renders correctly on artwork page when artwork title is undefined", async () => {        
        const url = "/collections/example-collection/artworks/674386b32a2908778c0ad471"
        const { container } = renderComponent(url)
        
        expect(container).toMatchSnapshot()
    })

    test("component renders correctly on create artwork page", async () => {        
        const url = "/collections/example-collection/create-artwork"
        const { container } = renderComponent(url)
        
        expect(container).toMatchSnapshot()
    })

    test("component renders correctly on edit artwork page", async () => {        
        const url = "/collections/example-collection/artworks/674386b32a2908778c0ad471/edit-artwork"
        const state = {categories: [{name: "Tytuł", value: 'Example artwork title'}]}
        const { container } = renderComponent(url, undefined, state)
        
        expect(container).toMatchSnapshot()
    })

    test("component renders correctly on edit artwork page when artwork title is undefined", async () => {        
        const url = "/collections/example-collection/artworks/674386b32a2908778c0ad471/edit-artwork"

        const { container } = renderComponent(url)
        
        expect(container).toMatchSnapshot()
    })
})