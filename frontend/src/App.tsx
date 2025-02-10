import React from "react"
import { Route, BrowserRouter, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "react-query"
import LoginPage from "./pages/LoginPage"
import Home from "./pages/Home"
import "./index.css"
import ArtworkPage from "./pages/artworks/ArtworkPage"
import NotFoundPage from "./pages/NotFoundPage"
import Artworks from "./pages/artworks/ArtworksList"
import RegisterPage from "./pages/RegisterPage"
import { UserProvider } from "./providers/UserProvider"
import CreateArtwork from "./pages/artworks/CreateArtwork"
import CreateCollectionPage from "./pages/collections/CreateCollectionPage";

const queryClient = new QueryClient()

const App = () => {
    return <div className="dark:text-white min-h-screen bg-gray-50 dark:bg-gray-900">
        <UserProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/collections/:collection/artworks/:artworkId" element={<ArtworkPage />} />
                        <Route path="/collections/:collection/create-artwork" element={<CreateArtwork />} />
                        <Route path="/collections/:collection/artworks/:artworkId/edit-artwork" element={<CreateArtwork />} />
                        <Route path="/create-collection" element={<CreateCollectionPage />} />

                        <Route path="/" element={<Home />} />
                        <Route path="/collections/:collection/artworks" element={<Artworks />} />

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
