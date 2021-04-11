import React from "react";
import {
  BrowserRouter,
  NavLink,
  Redirect,
  Route,
  Switch
} from "react-router-dom";

import { Api } from "../api";
import DeviceList from "./DeviceList";
import HistoryList from "./HistoryList";

const api = new Api();

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
          <Route path="/devices">
            <DeviceList api={api} />
          </Route>

          <Route path="/history">
            <HistoryList api={api} />
          </Route>

          <Route path="/">
            <Redirect to={"/devices"} />
          </Route>
        </Switch>
      </div>
    </BrowserRouter>
  );
};

export default Site;
