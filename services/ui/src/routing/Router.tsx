import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "../pages/ErrorPage";
import DefaultHomeRoute from "../pages/HomePage/DefaultHomeRoute";
import Layout, { configLoader } from "../pages/Layout";
import { api, queryClient } from "../queries/client";
import { devicesLoader } from "../queries/useQueryDevices";
import { floorplanLoader } from "../queries/useQueryFloorPlan";
import { sensorsLoader } from "../queries/useQuerySensors";
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
                                loader: devicesLoader(queryClient, api),
                                children: [
                                    {
                                        loader: sensorsLoader(queryClient, api),
                                        children: [
                                            {
                                                path: Routes.Home,
                                                loader: floorplanLoader(queryClient, api),
                                                children: [
                                                    {
                                                        index: true,
                                                        element: <DefaultHomeRoute />,
                                                    },
                                                    {
                                                        path: ":floor",
                                                        element: <HomePage />,
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        path: Routes.Device,
                                        element: <DevicePage />,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
]);

const Router = () => <RouterProvider router={router} />;
export default Router;
