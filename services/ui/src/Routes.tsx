import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const Login = lazy(() => import("./Pages/Login"));
const Home = lazy(() => import("./Pages/Home"));

const AppRoutes = () => {
    return (
        <Suspense fallback={<div>Loading</div>}>
            <BrowserRouter>
                <Routes>
                    <Route index element={<Login />} />
                    <Route path="login" element={<Login />} />
                    <Route path="test" element={<Home />} />
                </Routes>
            </BrowserRouter>
        </Suspense>
    );
};
export default AppRoutes;
