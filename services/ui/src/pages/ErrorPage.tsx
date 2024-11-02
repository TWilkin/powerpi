import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";
import Route from "../routing/Route";
import RouteBuilder from "../routing/RouteBuilder";

function errorMessage(error: unknown) {
    let status: number | undefined;
    let message: string;

    if (isRouteErrorResponse(error)) {
        status = error.status;
        message = `${error.status} ${error.statusText}`;
    } else if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === "string") {
        message = error;
    } else {
        console.error(error);
        message = "Unknown error";
    }

    return {
        status,
        message,
    };
}

const ErrorPage = () => {
    const navigate = useNavigate();

    const error = useRouteError();
    const { status, message } = errorMessage(error);

    if (status === 401) {
        navigate(RouteBuilder.build(Route.Login));
    }

    return (
        <div role="alert">
            <h1>An unexpected error has occurred.</h1>
            <p>{message}</p>
        </div>
    );
};
export default ErrorPage;
