import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "../pages/ErrorPage";
import Layout, { configLoader } from "../pages/Layout";
import { api, queryClient } from "../queries/client";
import Routes from "./Route";

const Login = lazy(() => import("../pages/Login"));
const Home = lazy(() => import("../pages/Home"));

const router = createBrowserRouter([
    {
        path: Routes.Root,
        element: <Layout />,
        errorElement: <ErrorPage />,
        loader: configLoader(queryClient, api),
        children: [
            {
                index: true,
                element: <Login />,
            },
            {
                path: Routes.Login,
                index: true,
                element: <Login />,
            },
            {
                path: Routes.Home,
                element: <Home />,
            },
        ],
    },
]);
export default router;
