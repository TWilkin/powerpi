import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { PowerPiAPIContextProvider } from "./queries/PowerPiApiContext";
import { queryClient } from "./queries/client";

type AppProps = PropsWithChildren<unknown>;

const App = ({ children }: AppProps) => (
    <QueryClientProvider client={queryClient}>
        <PowerPiAPIContextProvider>{children}</PowerPiAPIContextProvider>
    </QueryClientProvider>
);
export default App;
