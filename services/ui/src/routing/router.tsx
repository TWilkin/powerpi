import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "../pages/ErrorPage";
import Layout from "../pages/Layout";
import Routes from "./Route";

const Login = lazy(() => import("../pages/LoginPage"));
const Home = lazy(() => import("../pages/Home"));

const router = createBrowserRouter([
    {
        path: Routes.Root,
        element: <Layout />,
        errorElement: <ErrorPage />,
        //loader: configLoader(queryClient, api),
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
