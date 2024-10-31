import { PowerPiApi } from "@powerpi/common-api";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import Site from "./components/Site";
import { UserSettingsContextProvider } from "./hooks/UserSettings";
import { PowerPiAPIContextProvider } from "./hooks/api";
import "./styles/imports.scss";

const queryClient = new QueryClient();

// this is the API instance that will be used throughout
const api = new PowerPiApi(`${window.location.origin}/api`);

const PowerPi = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <PowerPiAPIContextProvider api={api}>
                <UserSettingsContextProvider>
                    <Site />
                </UserSettingsContextProvider>
            </PowerPiAPIContextProvider>
        </QueryClientProvider>
    );
};

const container = document.getElementById("content")!;
const root = createRoot(container);
root.render(<PowerPi />);
