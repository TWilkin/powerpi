import { Outlet } from "react-router-dom";
import useConfig from "../queries/useConfig";

const Layout = () => {
    const config = useConfig();

    return (
        <>
            <header className="text-blue-500">PowerPi</header>

            <main>
                <Outlet />

                {JSON.stringify(config)}
            </main>
        </>
    );
};
export default Layout;
