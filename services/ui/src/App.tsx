import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { PortalHost } from "./components/PortalHost";
import UserSettingsContextProvider from "./hooks/useUserSettings/UserSettingsContextProvider";
import { PowerPiAPIContextProvider } from "./queries/PowerPiApiContext";
import { queryClient } from "./queries/client";
import { NotificationContextProvider } from "./queries/notifications";

type AppProps = PropsWithChildren<unknown>;

const App = ({ children }: AppProps) => (
    <QueryClientProvider client={queryClient}>
        <PowerPiAPIContextProvider>
            <NotificationContextProvider>
                <UserSettingsContextProvider>
                    <PortalHost>{children}</PortalHost>
                </UserSettingsContextProvider>
            </NotificationContextProvider>
        </PowerPiAPIContextProvider>
    </QueryClientProvider>
);
export default App;
