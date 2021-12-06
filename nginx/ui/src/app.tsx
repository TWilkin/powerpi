import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { PowerPiApi } from "powerpi-common-api";
import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import Site from "./components/Site";
import "./styles/main.scss";

TimeAgo.addDefaultLocale(en);

const api = new PowerPiApi(`${window.location.origin}/api`);

const queryClient = new QueryClient();

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Site api={api} />
        </QueryClientProvider>
    );
};

ReactDOM.render(<App />, document.getElementById("content"));
