import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, Navigate, useRouteError } from "react-router-dom";
import Route from "../routing/Route";
import RouteBuilder from "../routing/RouteBuilder";

function errorMessage(error: unknown) {
    let status: number | undefined;
    let message: string | undefined;

    if (isRouteErrorResponse(error)) {
        status = error.status;
        message = `${error.status} ${error.statusText}`;
    } else if (isAxiosError(error)) {
        status = error.response?.status;
        message = error.message;
    } else if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === "string") {
        message = error;
    } else {
        console.error(error);
        message = undefined;
    }

    return {
        status,
        message,
    };
}

const ErrorPage = () => {
    const { t } = useTranslation();

    const error = useRouteError();
    const { status, message } = errorMessage(error);

    if (status === 401) {
        return <Navigate to={RouteBuilder.build(Route.Login)} />;
    }

    return (
        <div role="alert">
            <h1>{t("pages.error.an unexpected error has occurred")}</h1>
            <p>{message ?? t("pages.error.unknown error")}</p>
        </div>
    );
};
export default ErrorPage;
