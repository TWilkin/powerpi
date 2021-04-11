import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import React from "react";
import ReactDOM from "react-dom";

import Site from "./components/Site";
import "./styles/main.scss";

TimeAgo.addDefaultLocale(en);

ReactDOM.render(<Site />, document.getElementById("content"));
