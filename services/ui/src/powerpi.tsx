import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import Site from "./components/Site";
import { PowerPiAPIContextProvider } from "./hooks/api";
import "./styles/imports.scss";

const queryClient = new QueryClient();

const PowerPi = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <PowerPiAPIContextProvider>
                <Site />
            </PowerPiAPIContextProvider>
        </QueryClientProvider>
    );
};

ReactDOM.render(<PowerPi />, document.getElementById("content"));
