import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage";
import Layout from "./pages/Layout";
import { api, queryClient } from "./queries/client";
import { configLoader } from "./queries/useConfig";

const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <ErrorPage />,
        loader: configLoader(queryClient, api),
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
