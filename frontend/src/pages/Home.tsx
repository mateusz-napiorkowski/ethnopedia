import React from "react";
import { useUser } from "../providers/UserProvider";
import CollectionsPage from "./collections/CollectionsPage";
import LandingPage from "./LandingPage";

const Home = () => {
    const { jwtToken } = useUser();
    return jwtToken ? <CollectionsPage /> : <LandingPage />;
};

export default Home;
