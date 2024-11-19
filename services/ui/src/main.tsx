import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./localisation";
import "./main.css";
import Router from "./routing/Router";

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(
        <StrictMode>
            <App>
                <Router />
            </App>
        </StrictMode>,
    );
}
