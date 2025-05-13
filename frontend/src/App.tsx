import { Route, BrowserRouter, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "react-query"
import LoginPage from "./pages/LoginPage"
import "./index.css"
import ArtworkPage from "./pages/artworks/ArtworkPage"
import NotFoundPage from "./pages/NotFoundPage"
import Artworks from "./pages/artworks/ArtworksListPage"
import RegisterPage from "./pages/RegisterPage"
import { UserProvider } from "./providers/UserProvider"
import CreateArtworkPage from "./pages/artworks/CreateArtworkPage"
import CreateCollectionPage from "./pages/collections/CreateCollectionPage";
import Home from "./pages/Home"
import GlobalSearchPage from "./pages/artworks/GlobalSearchPage";

const queryClient = new QueryClient()

const App = () => {
    return <div className="dark:text-white min-h-screen bg-gray-50 dark:bg-gray-900">
        <UserProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter basename="/ethnopedia">
                    <Routes>
                        <Route path="/collections/:collectionId/artworks/:artworkId" element={<ArtworkPage />} />
                        <Route path="/collections/:collectionId/create-artwork" element={<CreateArtworkPage />} />
                        <Route path="/collections/:collectionId/artworks/:artworkId/edit-artwork" element={<CreateArtworkPage />} />
                        <Route path="/create-collection" element={<CreateCollectionPage />} />
                        <Route path="/collections/:collection/edit" element={<CreateCollectionPage />} />
                        <Route path="/global-search" element={<GlobalSearchPage />} />

                        <Route path="/" element={<Home />} />
                        <Route path="/collections/:collectionId/artworks" element={<Artworks />} />

                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </BrowserRouter>
            </QueryClientProvider>
        </UserProvider>
    </div>
}

export default App
