import { Sensor } from "@powerpi/api";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGetFloorplan } from "../../hooks/floorplan";
import useGetSensors from "../../hooks/sensors";
import Floorplan from "./Floorplan";
import Tooltip from "./Tooltip";
import styles from "./Home.module.scss";
import Menu from "../Components/Menu";

const Home = () => {
    const { floor } = useParams();
    const { floorplan } = useGetFloorplan();
    const { sensors } = useGetSensors();

    const locations = useMemo(
        () =>
            floorplan?.floors.reduce((locations, floor) => {
                locations.push(
                    ...floor.rooms.map((room) => ({
                        title: room.display_name ?? room.name,
                        location: room.name,
                        floor: floor.name,
                        sensors: sensors?.filter((sensor) => sensor.location === room.name) ?? [],
                    }))
                );

                return locations;
            }, [] as { title: string; location: string; floor: string; sensors: Sensor[] }[]),
        [floorplan, sensors]
    );

    const defaultFloor = useMemo(() => {
        if ((floorplan?.floors?.length ?? 0) > 0) {
            return floorplan?.floors[0].name;
        }

        return undefined;
    }, [floorplan]);

    return (
        <div className={styles.home}>
            {floorplan && (
                <>
                    <Menu
                        items={floorplan.floors.map((floor) => ({
                            path: `/home/${floor.name}`,
                            name: floor.display_name ?? floor.name,
                        }))}
                        visible={floorplan.floors.length > 1}
                    />

                    <Floorplan floorplan={floorplan} current={floor ?? defaultFloor} />

                    {locations?.map((location) => (
                        <Tooltip key={`${location.floor}${location.location}`} {...location} />
                    ))}
                </>
            )}
        </div>
    );
};
export default Home;
