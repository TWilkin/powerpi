import { PowerPiApi } from "@powerpi/api";
import HttpStatusCodes from "http-status-codes";
import React from "react";
import { BrowserRouter, NavLink, Redirect, Route, Switch } from "react-router-dom";
import { LastLocationProvider } from "react-router-last-location";
import { useGetConfig } from "../hooks/config";
import Charts from "./Charts";
import DeviceList from "./DeviceList";
import HistoryList from "./HistoryList";
import Home from "./Home/Home";
import Login from "./Login";

interface MenuElementProps {
    path: string;
    name: string;
}

const MenuElement = ({ path, name }: MenuElementProps) => {
    return (
        <NavLink exact to={path} className="menu-element" activeClassName="active">
            {name}
        </NavLink>
    );
};

interface SiteProps {
    api: PowerPiApi;
}

const Site = ({ api }: SiteProps) => {
    // redirect to login on 401
    api.setErrorHandler((error) => {
        if (error.response.status === HttpStatusCodes.UNAUTHORIZED) {
            window.location.pathname = "/login";
        }
    });

    const { config } = useGetConfig(api);

    const defaultPage = config?.hasDevices
        ? "devices"
        : config?.hasPersistence
        ? "history"
        : "login";

    return (
        <BrowserRouter>
            <LastLocationProvider>
                <header className="header">
                    <nav className="menu">
                        <MenuElement path="/home" name="Home" />
                        {config?.hasDevices && <MenuElement path="/devices" name="Devices" />}
                        {config?.hasPersistence && (
                            <>
                                <MenuElement path="/history" name="History" />
                                <MenuElement path="/charts" name="Charts" />
                            </>
                        )}
                    </nav>
                </header>

                <div className="content">
                    <Switch>
                        <Redirect exact from="/" to={`/${defaultPage}`} />

                        <Route path="/login">
                            <Login />
                        </Route>

                        <Route path="/home">
                            <Home api={api} />
                        </Route>

                        {config?.hasDevices && (
                            <Route path="/devices">
                                <DeviceList api={api} />
                            </Route>
                        )}

                        {config?.hasPersistence && (
                            <>
                                <Route
                                    path="/history"
                                    render={(props) => (
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
