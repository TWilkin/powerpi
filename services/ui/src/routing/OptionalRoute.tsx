import { Navigate, Outlet, useLocation } from "react-router-dom";
import Route from "./Route";
import RouteBuilder from "./RouteBuilder";
import useOptionalRoute from "./useOptionalRoute";

const OptionalRoute = () => {
    const { pathname } = useLocation();

    const enabled = useOptionalRoute();

    if (!enabled) {
        return <></>;
    }

    if (pathname.includes(Route.Home) && enabled.home) {
        return <Outlet />;
    }

    return <Navigate to={RouteBuilder.build()} />;
};
export default OptionalRoute;
