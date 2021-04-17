import React from "react";
import {
  BrowserRouter,
  NavLink,
  Redirect,
  Route,
  Switch
} from "react-router-dom";
import { PowerPiApi } from "powerpi-common-api";

import DeviceList from "./DeviceList";
import HistoryList from "./HistoryList";

const api = new PowerPiApi();

interface MenuElementProps {
  path: string;
  name: string;
}

const MenuElement = ({ path, name }: MenuElementProps) => {
  return (
    <NavLink activeClassName="active" exact to={path}>
      <div className="menu-element">{name}</div>
    </NavLink>
  );
};

const Site = () => {
  return (
    <BrowserRouter>
      <div id="menu">
        <nav>
          <MenuElement path="/devices" name="Devices" />
          <MenuElement path="/history" name="History" />
        </nav>
      </div>
      <br />

      <div id="content">
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
