import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

type AppProps = PropsWithChildren<unknown>;

const App = ({ children }: AppProps) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
export default App;
