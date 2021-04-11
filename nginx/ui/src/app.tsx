import moment from "moment";
import React from "react";
import ReactDOM from "react-dom";

import Site from "./components/Site";
import "./styles/main.scss";

moment.locale("en-GB");

ReactDOM.render(<Site />, document.getElementById("content"));
