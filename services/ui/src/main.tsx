import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import App from "./App";
import "./localisation";
import "./main.css";
import router from "./routing/router";

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(
        <StrictMode>
            <App>
                <RouterProvider router={router} />
            </App>
        </StrictMode>,
    );
}
