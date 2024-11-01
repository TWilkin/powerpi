import { PowerPiApi } from "@powerpi/common-api";
import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { PowerPiAPIContextProvider } from "./queries/PowerPiApiContext";

const queryClient = new QueryClient();

const api = new PowerPiApi(`${window.location.origin}/api`);

type AppProps = PropsWithChildren<unknown>;

const App = ({ children }: AppProps) => (
    <QueryClientProvider client={queryClient}>
        <PowerPiAPIContextProvider api={api}>{children}</PowerPiAPIContextProvider>
    </QueryClientProvider>
);
export default App;
