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

export default class Site extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div id="menu">
          <nav>
            {this.renderMenuLink("/devices", "Devices")}
            {this.renderMenuLink("/history", "History")}
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
  }

  renderMenuLink(path: string, name: string) {
    return (
      <NavLink activeClassName="active" exact to={path}>
        <div className="menu-element">{name}</div>
      </NavLink>
    );
  }
}
