import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const MainLayout = () => {
    return (
        <>
            <Navbar />
            <main className="main">
                <Outlet />
            </main>
            <Footer />
        </>
    );
};
