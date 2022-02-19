import { PowerPiApi } from "@powerpi/api";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import Site from "./components/Site";
import "./styles/main.scss";

const api = new PowerPiApi(`${window.location.origin}/api`);

const queryClient = new QueryClient();

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Site api={api} />
        </QueryClientProvider>
    );
};

ReactDOM.render(<App />, document.getElementById("content"));
