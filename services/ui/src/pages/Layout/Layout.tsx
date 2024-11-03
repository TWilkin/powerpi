import { Outlet } from "react-router-dom";
import Header from "../../components/Header";

const Layout = () => (
    <>
        <Header />

        <main className="p-4">
            <Outlet />
        </main>
    </>
);
export default Layout;
