import Message from "../../components/Message";
import useQueryFloorplan from "../../queries/useQueryFloorPlan";
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

    return <Floorplan floorplan={floorplan} />;
};
export default HomePage;
