import { Outlet } from "react-router-dom";
import { Header } from "../../components/Header";

const Layout = () => (
    <>
        <Header />

        <main>
            <Outlet />
        </main>
    </>
);
export default Layout;
