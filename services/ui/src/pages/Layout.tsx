import { Outlet } from "react-router-dom";
import useConfig from "../queries/useConfig";

const Layout = () => {
    const config = useConfig();

    return (
        <>
            <header>PowerPi</header>

            <main>
                <Outlet />

                {JSON.stringify(config)}
            </main>
        </>
    );
};
export default Layout;
