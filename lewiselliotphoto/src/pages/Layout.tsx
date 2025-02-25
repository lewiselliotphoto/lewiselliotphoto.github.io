import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

import '../components/navBar.css'
import './layout.css'

const Layout = () => {
    return (
        <>
            <NavBar />
            <div
                id="mainContent"
            >
                <div
                    id="mainContentContainer"
                >
                    <div
                        id="navBarPlaceholder"
                    >
                    </div>
                    <Outlet />
                </div>
            </div>
        </>
    );
};

export default Layout;