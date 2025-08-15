import { NavLink } from "react-router-dom";
import Message from "../../components/Message";
import useQueryFloorplan from "../../queries/useQueryFloorPlan";
import Route from "../../routing/Route";
import RouteBuilder from "../../routing/RouteBuilder";
import Floorplan from "./Floorplan";
import useFloor from "./useFloor";

const HomePage = () => {
    const currentFloor = useFloor();

    const { data: floorplan } = useQueryFloorplan();

    if (floorplan.floors.length === 0) {
        return <Message type="empty" translation="pages.home" />;
    }

    if (floorplan.floors.findIndex((floor) => floor.name === currentFloor) === -1) {
        return <Message type="unknown" translation="pages.home" value={currentFloor} />;
    }

    return (
        <div className="flex flex-col gap flex-1">
            {floorplan.floors.length > 1 && (
                <div className="flex flex-row gap">
                    {floorplan.floors.map((floor) => (
                        <NavLink
                            key={floor.name}
                            to={RouteBuilder.build(Route.Root, Route.Home, floor.name)}
                        >
                            {floor.display_name ?? floor.name}
                        </NavLink>
                    ))}
                </div>
            )}

            <Floorplan floorplan={floorplan} />
        </div>
    );
};
export default HomePage;
