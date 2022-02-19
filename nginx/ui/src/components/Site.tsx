import { faChartLine, faHistory, faHome, faPlug } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PowerPiApi } from "@powerpi/api";
import HttpStatusCodes from "http-status-codes";
import { useMemo } from "react";
import {
    BrowserRouter,
    NavLink,
    Redirect,
    Route,
    RouteComponentProps,
    Switch,
} from "react-router-dom";
import { LastLocationProvider } from "react-router-last-location";
import { useGetConfig } from "../hooks/config";
import Charts from "./Charts";
import Menu from "./Components/Menu";
import DeviceList from "./Devices";
import HistoryList from "./History";
import Home from "./Home";
import Login from "./Login";

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
            <LastLocationProvider>
                <header className="header">
                    <div className="logo">
                        <NavLink exact to="/">
                            <FontAwesomeIcon icon={faPlug} /> PowerPi
                        </NavLink>
                    </div>

                    <Menu items={menuItems} visible={!isConfigLoading && !isConfigError} />
                </header>

                <div className="content">
                    <Switch>
                        <Redirect exact from="/" to={`/${defaultPage}`} />

                        <Route path="/login">
                            <Login />
                        </Route>

                        {config?.hasFloorplan && (
                            <Route path="/home">
                                <Home api={api} />
                            </Route>
                        )}

                        {config?.hasDevices && (
                            <Route path="/devices">
                                <DeviceList api={api} />
                            </Route>
                        )}

                        {config?.hasPersistence && (
                            <>
                                <Route
                                    path="/history"
                                    render={(props: RouteComponentProps) => (
                                        <HistoryList api={api} query={props.location.search} />
                                    )}
                                />

                                <Route path="/charts">
                                    <Charts api={api} />
                                </Route>
                            </>
                        )}
                    </Switch>
                </div>
            </LastLocationProvider>
        </BrowserRouter>
    );
};
export default Site;
