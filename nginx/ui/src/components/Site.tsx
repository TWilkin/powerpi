import { PowerPiApi } from "powerpi-common-api";
import React from "react";
import {
  BrowserRouter,
  NavLink,
  Redirect,
  Route,
  Switch
} from "react-router-dom";
import DeviceList from "./DeviceList";
import HistoryList from "./HistoryList";

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
  return (
    <BrowserRouter>
      <header className="header">
        <nav className="menu">
          <MenuElement path="/devices" name="Devices" />
          <MenuElement path="/history" name="History" />
        </nav>
      </header>

      <div className="content">
        <Switch>
          <Redirect exact from="/" to={"/devices"} />

          <Route path="/devices">
            <DeviceList api={api} />
          </Route>

          <Route
            path="/history"
            render={(props) => (
              <HistoryList api={api} query={props.location.search} />
            )}
          />
        </Switch>
      </div>
    </BrowserRouter>
  );
};
export default Site;
