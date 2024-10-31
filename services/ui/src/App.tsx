import { Outlet } from "react-router";

const App = () => (
    <>
        <header>PowerPi</header>

        <main>
            <Outlet />
        </main>
    </>
);
export default App;
