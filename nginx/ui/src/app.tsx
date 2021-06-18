import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import React from "react";
import ReactDOM from "react-dom";
import { PowerPiApi } from "powerpi-common-api";

import Site from "./components/Site";
import "./styles/main.scss";

TimeAgo.addDefaultLocale(en);

const api = new PowerPiApi(`${window.location.origin}/api`);

ReactDOM.render(<Site api={api} />, document.getElementById("content"));
