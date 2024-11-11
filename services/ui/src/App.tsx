import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { PowerPiAPIContextProvider } from "./queries/PowerPiApiContext";
import { queryClient } from "./queries/client";
import { NotificationContextProvider } from "./queries/notifications/NotificationContext";

type AppProps = PropsWithChildren<unknown>;

const App = ({ children }: AppProps) => (
    <QueryClientProvider client={queryClient}>
        <PowerPiAPIContextProvider>
            <NotificationContextProvider>{children}</NotificationContextProvider>
        </PowerPiAPIContextProvider>
    </QueryClientProvider>
);
export default App;
