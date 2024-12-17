import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import DialogHost from "./components/Dialog/DialogHost";
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
                    <DialogHost>{children}</DialogHost>
                </UserSettingsContextProvider>
            </NotificationContextProvider>
        </PowerPiAPIContextProvider>
    </QueryClientProvider>
);
export default App;
