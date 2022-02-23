import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import Site from "./components/Site";
import "./styles/main.scss";

const queryClient = new QueryClient();

const PowerPi = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Site />
        </QueryClientProvider>
    );
};

ReactDOM.render(<PowerPi />, document.getElementById("content"));
