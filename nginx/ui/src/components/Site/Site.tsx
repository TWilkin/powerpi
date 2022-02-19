import { faChartLine, faHistory, faHome, faPlug } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PowerPiApi } from "@powerpi/api";
import HttpStatusCodes from "http-status-codes";
import { lazy, Suspense, useMemo } from "react";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router-dom";
import { useGetConfig } from "../../hooks/config";
import { Menu } from "../Components";
import styles from "./Site.module.scss";

const Charts = lazy(() => import("../Charts"));
const Devices = lazy(() => import("../Devices"));
const History = lazy(() => import("../History"));
const Home = lazy(() => import("../Home"));
const Login = lazy(() => import("../Login"));

interface SiteProps {
    api: PowerPiApi;
}

const Site = ({ api }: SiteProps) => {
    const { isConfigLoading, isConfigError, config } = useGetConfig(api);

    // redirect to login on 401
    api.setErrorHandler((error) => {
        if (
            error.response.status === HttpStatusCodes.UNAUTHORIZED &&
            !window.location.pathname.endsWith("/login")
        ) {
            window.location.pathname = "/login";
        }
    });

    const defaultPage = useMemo(
        () =>
            config?.hasFloorplan
                ? "home"
                : config?.hasDevices
                ? "devices"
                : config?.hasPersistence
                ? "history"
                : "login",
        [config]
    );

    const menuItems = useMemo(
        () => [
            {
                name: "Home",
                path: "/home",
                icon: faHome,
                visible: config?.hasFloorplan,
            },
            {
                name: "Devices",
                path: "/devices",
                icon: faPlug,
                visible: config?.hasDevices,
            },
            {
                name: "History",
                path: "/history",
                icon: faHistory,
                visible: config?.hasPersistence,
            },
            {
                name: "Charts",
                path: "/charts",
                icon: faChartLine,
                visible: config?.hasPersistence,
            },
        ],
        [config]
    );

    return (
        <BrowserRouter>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <NavLink to="/">
                        <FontAwesomeIcon icon={faPlug} /> PowerPi
                    </NavLink>
                </div>

                <Menu items={menuItems} visible={!isConfigLoading && !isConfigError} />
            </header>

            <div className={styles.content}>
                <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                        <Route path="/" element={<Navigate to={`/${defaultPage}`} />} />

                        <Route path="/login" element={<Login />} />

                        {config?.hasFloorplan && (
                            <Route path="/home" element={<Home api={api} />}>
                                <Route path=":floor" element={<Home api={api} />} />
                            </Route>
                        )}

                        {config?.hasDevices && (
                            <Route path="/devices" element={<Devices api={api} />} />
                        )}

                        {config?.hasPersistence && (
                            <>
                                <Route path="/history" element={<History api={api} />} />

                                <Route path="/charts" element={<Charts api={api} />} />
                            </>
                        )}
                    </Routes>
                </Suspense>
            </div>
        </BrowserRouter>
    );
};
export default Site;
