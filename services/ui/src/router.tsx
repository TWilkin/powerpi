import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";

const Login = lazy(() => import("./Pages/Login"));
const Home = lazy(() => import("./Pages/Home"));

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Login />,
            },
            {
                path: "login",
                index: true,
                element: <Login />,
            },
            {
                path: "home",
                element: <Home />,
            },
        ],
    },
]);
export default router;
