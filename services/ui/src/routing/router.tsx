import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "../pages/ErrorPage";
import Layout from "../pages/Layout";
import ProtectedRoute from "./ProtectedRoute";
import Routes from "./Route";

const LoginPage = lazy(() => import("../pages/LoginPage"));
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
                element: <LoginPage />,
            },
            {
                path: Routes.Login,
                element: <LoginPage />,
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: Routes.Home,
                        element: <Home />,
                    },
                ],
            },
        ],
    },
]);
export default router;
