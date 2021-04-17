import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import React from "react";
import ReactDOM from "react-dom";

import { sayHello } from "powerpi-common-api";
import Site from "./components/Site";
import "./styles/main.scss";

sayHello();

TimeAgo.addDefaultLocale(en);

ReactDOM.render(<Site />, document.getElementById("content"));
