import { Navigate } from "react-router-dom";
import Route from "./Route";
import RouteBuilder from "./RouteBuilder";
import useOptionalRoute from "./useOptionalRoute";

/** Work out what page we should default to, and redirect there. */
const DefaultRoute = () => {
    const enabled = useOptionalRoute();

    return <Navigate to={getDefaultRoute(enabled)} replace />;
};
export default DefaultRoute;

function getDefaultRoute(enabled: ReturnType<typeof useOptionalRoute>) {
    if (enabled?.home) {
        return RouteBuilder.build(Route.Home);
    }

    if (enabled?.device) {
        return RouteBuilder.build(Route.Device);
    }

    return RouteBuilder.build(Route.Login);
}
