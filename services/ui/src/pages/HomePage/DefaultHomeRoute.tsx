import { Navigate } from "react-router-dom";
import useQueryFloorplan from "../../queries/useQueryFloorPlan";
import RouteBuilder from "../../routing/RouteBuilder";

/** Work out what floor we should default to, and redirect there. */
const DefaultHomeRoute = () => {
    const { data: floorplan } = useQueryFloorplan();

    return <Navigate to={RouteBuilder.build(floorplan.floors[0].name)} replace />;
};
export default DefaultHomeRoute;
