import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import Site from "./components/Site/Site";
import "./styles/main.scss";

const queryClient = new QueryClient();

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Site />
        </QueryClientProvider>
    );
};

ReactDOM.render(<App />, document.getElementById("content"));
