import { PropsWithChildren } from "react";
import { QueryClientProvider } from "react-query";
import { PowerPiAPIContextProvider } from "./queries/PowerPiApiContext";
import { queryClient } from "./queries/client";

type AppProps = PropsWithChildren<unknown>;

const App = ({ children }: AppProps) => (
    <QueryClientProvider client={queryClient}>
        <PowerPiAPIContextProvider>{children}</PowerPiAPIContextProvider>
    </QueryClientProvider>
);
export default App;
