import { Floorplan as IFloorplan, Sensor } from "@powerpi/api";
import { useMemo } from "react";
import useGetSensors from "../../hooks/sensors";
import Floorplan from "./Floorplan";
import Tooltip from "./Tooltip";
import styles from "./Home.module.scss";
import Menu from "../Components/Menu";

interface HomeProps {
    floorplan: IFloorplan;
}

const Home = ({ floorplan }: HomeProps) => {
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

                    <Floorplan floorplan={floorplan} />

                    {locations?.map((location) => (
                        <Tooltip key={`${location.floor}${location.location}`} {...location} />
                    ))}
                </>
            )}
        </div>
    );
};
export default Home;
