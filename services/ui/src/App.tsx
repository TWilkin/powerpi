import { Outlet } from "react-router";
import Routes from "./Routes";

const App = () => (
    <>
        <header>PowerPi</header>

        <main>
            <Routes />

            <Outlet />
        </main>
    </>
);
export default App;
