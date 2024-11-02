import { Navigate, Outlet } from "react-router";
import { useUser } from "../hooks/useUser";
import Route from "./Route";
import RouteBuilder from "./RouteBuilder";

/** Component to check if a user is authenticated or not. If they are show the page as normal,
 * otherwise redirect to the login page.
 */
const ProtectedRoute = () => {
    const user = useUser();

    if (!user) {
        return <Navigate to={RouteBuilder.build(Route.Login)} replace />;
    }

    return <Outlet />;
};
export default ProtectedRoute;
