import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "../pages/ErrorPage";
import Layout, { configLoader } from "../pages/Layout";
import { api, queryClient } from "../queries/client";
import { devicesLoader } from "../queries/useQueryDevices";
import DefaultRoute from "./DefaultRoute";
import OptionalRoute from "./OptionalRoute";
import ProtectedRoute from "./ProtectedRoute";
import Routes from "./Route";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const HomePage = lazy(() => import("../pages/HomePage"));
const DevicePage = lazy(() => import("../pages/DevicePage"));

const router = createBrowserRouter([
    {
        path: Routes.Root,
        element: <Layout />,
        loader: configLoader(queryClient, api),
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <DefaultRoute />,
            },
            {
                path: Routes.Login,
                element: <LoginPage />,
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <OptionalRoute />,
                        children: [
                            {
                                path: Routes.Home,
                                element: <HomePage />,
                            },
                            {
                                path: Routes.Device,
                                element: <DevicePage />,
                                loader: devicesLoader(queryClient, api),
                            },
                        ],
                    },
                ],
            },
        ],
    },
]);
export default router;
