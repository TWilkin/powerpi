import { Outlet } from "react-router-dom";

const Layout = () => (
    <>
        <header>PowerPi</header>

        <main>
            <Outlet />
        </main>
    </>
);
export default Layout;
